import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      items,
      customerEmail,
      customerName,
      shippingAddress,
      couponCode,
      userId,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio ou formato inválido.' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'E-mail do cliente é obrigatório.' },
        { status: 400 }
      )
    }

    // 1. BUSCAR PRODUTOS DIRETAMENTE NO SUPABASE (SEGURANÇA CRÍTICA)
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts, error: prodError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds)

    if (prodError || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: 'Produtos não encontrados no catálogo.' },
        { status: 404 }
      )
    }

    // 2. VALIDAR ESTOQUE E CALCULAR SUBTOTAL REAL
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.id)
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Produto ${item.id} não disponível.` },
          { status: 400 }
        )
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente para "${dbProduct.name}". Disponível: ${dbProduct.stock}`,
          },
          { status: 400 }
        )
      }

      const itemTotal = Number(dbProduct.price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        price: Number(dbProduct.price),
        quantity: item.quantity,
        image: dbProduct.images?.[0] || '',
        variations: item.variations || {},
      })
    }

    // 3. VALIDAR CUPOM DE DESCONTO (SE HOUVER)
    let discount = 0
    let validatedCouponCode: string | null = null

    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .ilike('code', couponCode.trim())
        .single()

      if (
        coupon &&
        coupon.active &&
        (!coupon.valid_until || new Date(coupon.valid_until) > new Date()) &&
        (!coupon.max_uses || coupon.used_count < coupon.max_uses)
      ) {
        validatedCouponCode = coupon.code
        if (coupon.discount_percent) {
          discount = (subtotal * coupon.discount_percent) / 100
        } else if (coupon.discount_amount) {
          discount = Math.min(Number(coupon.discount_amount), subtotal)
        }
      }
    }

    const shipping = 0 // Frete grátis nacional
    const total = Math.max(0, subtotal - discount + shipping)

    // 4. CRIAR REGISTRO DE PEDIDO PENDENTE NO SUPABASE
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId || null,
        customer_email: customerEmail,
        customer_name: customerName || null,
        status: 'pending',
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        total: Number(total.toFixed(2)),
        items: orderItems,
        shipping_address: shippingAddress || {},
        coupon_code: validatedCouponCode,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Erro ao salvar pedido inicial:', orderError)
      return NextResponse.json(
        { error: 'Falha ao registrar pedido.' },
        { status: 500 }
      )
    }

    // 5. MONTAR LINE ITEMS PARA O STRIPE
    const discountRatio = subtotal > 0 ? (subtotal - discount) / subtotal : 1

    const stripeLineItems = orderItems.map((item) => {
      const effectiveUnitAmount = Math.max(
        50, // Mínimo de 50 centavos por item
        Math.round(item.price * discountRatio * 100)
      )

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: item.variations?.size
              ? `Tamanho: ${item.variations.size}${
                  item.variations.color ? ` | Cor: ${item.variations.color}` : ''
                }`
              : undefined,
          },
          unit_amount: effectiveUnitAmount,
        },
        quantity: item.quantity,
      }
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // 6. CRIAR SESSÃO NO STRIPE VIA GETSTRIPE()
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${siteUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/carrinho`,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
      },
    })

    // Atualizar o pedido com o stripe_session_id
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url, orderId: order.id })
  } catch (error: any) {
    console.error('Erro no Stripe Checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno no processamento de pagamento' },
      { status: 500 }
    )
  }
}