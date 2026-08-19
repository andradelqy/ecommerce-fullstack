import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { productId, userName, rating, comment } = await req.json()

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const numericRating = Number(rating)
    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: 'A nota deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user?.id || null,
        user_name: userName,
        rating: numericRating,
        comment,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar avaliação:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Erro na rota de avaliação:', error)
    return NextResponse.json({ error: 'Erro interno ao salvar avaliação' }, { status: 500 })
  }
}
