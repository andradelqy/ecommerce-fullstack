import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `products/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      console.error('Erro no upload Supabase Storage:', uploadErr)
      return NextResponse.json(
        {
          error:
            uploadErr.message ||
            'Erro ao fazer upload. Verifique se o bucket "products" público existe no Supabase.',
        },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(filePath)

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl })
  } catch (error: any) {
    console.error('Erro na API de upload:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no upload.' }, { status: 500 })
  }
}
