import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatBRL } from '@/lib/utils'
import ProductPurchaseForm from '@/components/ProductPurchaseForm'
import ReviewSection from '@/components/ReviewSection'
import ProductCard, { Product } from '@/components/ProductCard'
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

interface ProdutoProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProdutoProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, price')
    .eq('slug', slug)
    .single()

  if (!product) {
    return {
      title: 'Produto Não Encontrado | NEXUS Commerce',
    }
  }

  return {
    title: `${product.name} | NEXUS Commerce`,
    description: product.description || `Compre ${product.name} na NEXUS com o melhor preço e frete rápido.`,
    openGraph: {
      title: product.name,
      description: product.description || `Compre ${product.name} na NEXUS`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProdutoPage({ params }: ProdutoProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar produto
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    notFound()
  }

  // Buscar avaliações do produto
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  // Buscar produtos relacionados da mesma categoria
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4)

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : 0

  return (
    <main className="container mx-auto px-4 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition">
          Início
        </Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-slate-900 transition">
          Catálogo
        </Link>
        <span>/</span>
        <Link
          href={`/catalogo?categoria=${product.category}`}
          className="hover:text-slate-900 transition capitalize"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Galeria de Fotos (Esquerda) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
              }
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:border-blue-600 transition"
                >
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações de Compra (Direita) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-800">{Number(product.rating || 5.0).toFixed(1)}</span>
                <span className="text-slate-400 font-normal">
                  ({product.review_count || 0} avaliações)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Preço */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-slate-400 line-through">
                De {formatBRL(product.compare_at_price)}
              </span>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                {formatBRL(product.price)}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                no Pix com 5% de desconto
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ou até <strong>10x de {formatBRL(product.price / 10)}</strong> sem juros no cartão
            </p>
          </div>

          {/* Formulário Interativo de Variações e Compra */}
          <ProductPurchaseForm product={product} />

          {/* Descrição do Produto */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Sobre o Produto</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description || 'Produto de alta qualidade com fabricação nacional e garantia.'}
            </p>
          </div>

          {/* Destaques de Benefícios */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Envio em 24 horas</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
              <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Troca grátis em 30 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Avaliações */}
      <ReviewSection
        productId={product.id}
        reviews={reviews || []}
        averageRating={Number(product.rating || 5.0)}
        reviewCount={product.review_count || 0}
      />

      {/* Produtos Relacionados */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Quem viu este produto também gostou</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel as Product} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
