import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código de cupom inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'Este cupom foi desativado' }, { status: 400 })
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ error: 'Este cupom expirou' }, { status: 400 })
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Limite de uso do cupom atingido' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        discount_amount: coupon.discount_amount,
      },
    })
  } catch (error) {
    console.error('Erro na validação de cupom:', error)
    return NextResponse.json({ error: 'Erro interno ao validar cupom' }, { status: 500 })
  }
}
