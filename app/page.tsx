import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard, { Product } from '@/components/ProductCard'
import {
  ArrowRight,
  Sparkles,
  Flame,
  Truck,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
} from 'lucide-react'

export const revalidate = 60 // Revalida a cada 60 segundos (ISR)

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4)

  const { data: latestProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  const categories = [
    {
      name: 'Camisetas',
      slug: 'camisetas',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      count: 'Coleção Streetwear',
    },
    {
      name: 'Calçados',
      slug: 'calcados',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      count: 'Tênis & Sneakers',
    },
    {
      name: 'Jaquetas',
      slug: 'jaquetas',
      image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=600&auto=format&fit=crop',
      count: 'Puffers & Corta-vento',
    },
    {
      name: 'Eletrônicos',
      slug: 'eletronicos',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      count: 'Áudio & Gadgets',
    },
  ]

  return (
    <main className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24">
        {/* Background glow & mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLEÇÃO OUTONO / INVERNO 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Estilo Urbano com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">Alta Performance</span>.
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Descubra peças exclusivas desenvolvidas com materiais nobres, caimento premium e design contemporâneo. Pague em até 12x ou com Pix com desconto.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalogo"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/catalogo?categoria=calcados"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <span>Ver Calçados</span>
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-900 text-center sm:text-left">
              <div>
                <p className="text-2xl font-black text-white">+5.000</p>
                <p className="text-xs text-slate-500">Clientes Satisfeitos</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.9/5.0</p>
                <p className="text-xs text-slate-500">Avaliação Média</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-500">Entrega Garantida</p>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop"
                alt="Destaque da Coleção"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">
                    Mais Vendido
                  </span>
                  <h3 className="text-sm font-bold text-white">Nike Air Max Pulse</h3>
                  <p className="text-xs text-slate-400">R$ 699,90</p>
                </div>
                <Link
                  href="/produto/tenis-nike-air-max-pulse"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Ver Produto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Categorias em Destaque
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Encontre exatamente o que procura nas melhores categorias.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogo?categoria=${category.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 hover:shadow-lg transition duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                  {category.count}
                </p>
                <h3 className="text-base sm:text-lg font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">
              Seleção Especial
            </span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Produtos em Destaque
            </h2>
            <Link
              href="/catalogo"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner / Cupom */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider">
              Oferta de Boas-Vindas
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ganhe 15% OFF na sua Primeira Compra
            </h3>
            <p className="text-sm text-blue-100">
              Use o cupom <strong className="text-amber-300 font-mono text-base">PRIMEIRACOMPRA</strong> no carrinho e aproveite frete grátis em todo o Brasil.
            </p>
            <div className="pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-extrabold transition shadow-md active:scale-95"
              >
                <span>Aproveitar Desconto</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Lançamentos & Novidades
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Peças recém-chegadas para renovar seu guarda-roupa.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver todos ({latestProducts?.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestProducts && latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Catálogo em Configuração</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Execute o script <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">supabase/seed.sql</code> no seu painel do Supabase para popular a loja com produtos incríveis!
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
