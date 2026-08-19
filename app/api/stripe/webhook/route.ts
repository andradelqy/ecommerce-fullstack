import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura do Stripe ausente no cabeçalho.' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET não configurado.')
      return NextResponse.json(
        { error: 'Webhook secret não configurado no servidor.' },
        { status: 500 }
      )
    }

    let event
    const stripe = getStripe()
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error(`⚠️ Falha na verificação de assinatura do Webhook: ${err.message}`)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Processar evento de checkout concluído
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const orderId = session.metadata?.orderId

      if (orderId) {
        // 1. Buscar o pedido correspondente no Supabase
        const { data: order, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (fetchError || !order) {
          console.error(`Pedido ${orderId} não encontrado no banco.`)
        } else if (order.status !== 'paid') {
          // 2. Atualizar status do pedido para 'paid'
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          // 3. Decrementar estoque dos produtos comprados atomicamente via RPC
          const items = (order.items as any[]) || []
          for (const item of items) {
            try {
              await supabaseAdmin.rpc('decrement_stock', {
                p_product_id: item.id,
                p_quantity: item.quantity,
              })
            } catch (stockErr) {
              console.error(`Erro ao dar baixa no estoque do item ${item.id}:`, stockErr)
            }
          }

          // 4. Incrementar uso do cupom (se utilizado)
          if (order.coupon_code) {
            try {
              await supabaseAdmin.rpc('increment_coupon_use', {
                p_coupon_code: order.coupon_code,
              })
            } catch (couponErr) {
              console.error('Erro ao incrementar uso do cupom:', couponErr)
            }
          }

          // 5. Enviar e-mail de confirmação de compra via Resend
          try {
            await sendOrderConfirmationEmail({
              id: order.id,
              customer_name: order.customer_name || 'Cliente',
              customer_email: order.customer_email,
              total: Number(order.total),
              subtotal: Number(order.subtotal),
              discount: Number(order.discount),
              shipping: Number(order.shipping),
              items: items,
              shipping_address: order.shipping_address,
            })
          } catch (emailErr) {
            console.error('Erro ao disparar e-mail de confirmação:', emailErr)
          }

          console.log(`✅ Pedido #${orderId} aprovado, estoque atualizado e e-mail enviado.`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no processamento do Webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno no webhook' },
      { status: 500 }
    )
  }
}