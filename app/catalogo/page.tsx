import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard, { Product } from '@/components/ProductCard'
import {
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  PackageSearch,
} from 'lucide-react'

interface CatalogoProps {
  searchParams: Promise<{
    q?: string
    categoria?: string
    ordenar?: string
    pagina?: string
    emEstoque?: string
  }>
}

export const metadata = {
  title: 'Catálogo de Produtos | NEXUS Commerce',
  description: 'Explore nossa coleção completa com filtros de tamanho, cor, categoria e preço.',
}

export default async function CatalogoPage({ searchParams }: CatalogoProps) {
  const params = await searchParams
  const supabase = await createClient()

  const q = params.q || ''
  const categoria = params.categoria || ''
  const ordenar = params.ordenar || 'recentes'
  const pagina = parseInt(params.pagina || '1', 10)
  const emEstoque = params.emEstoque === 'true'

  const pageSize = 12
  const from = (pagina - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('products').select('*', { count: 'exact' })

  // Filtro de busca textual
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Filtro de categoria
  if (categoria) {
    query = query.eq('category', categoria)
  }

  // Filtro de estoque
  if (emEstoque) {
    query = query.gt('stock', 0)
  }

  // Ordenação
  if (ordenar === 'preco-asc') {
    query = query.order('price', { ascending: true })
  } else if (ordenar === 'preco-desc') {
    query = query.order('price', { ascending: false })
  } else if (ordenar === 'avaliacao') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Paginação
  query = query.range(from, to)

  const { data: products, count, error } = await query

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const categories = [
    { name: 'Todas', value: '' },
    { name: 'Camisetas', value: 'camisetas' },
    { name: 'Calçados', value: 'calcados' },
    { name: 'Jaquetas', value: 'jaquetas' },
    { name: 'Calças', value: 'calcas' },
    { name: 'Acessórios', value: 'acessorios' },
    { name: 'Eletrônicos', value: 'eletronicos' },
  ]

  // Helper para construir URLs com parâmetros
  const buildFilterUrl = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams()
    if (q) current.set('q', q)
    if (categoria) current.set('categoria', categoria)
    if (ordenar && ordenar !== 'recentes') current.set('ordenar', ordenar)
    if (emEstoque) current.set('emEstoque', 'true')

    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '') {
        current.delete(k)
      } else {
        current.set(k, v)
      }
    })

    const str = current.toString()
    return `/catalogo${str ? `?${str}` : ''}`
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-slate-900 transition">
              Início
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Catálogo</span>
            {categoria && (
              <>
                <span>/</span>
                <span className="text-blue-600 font-bold uppercase">{categoria}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {categoria
              ? categories.find((c) => c.value === categoria)?.name || 'Catálogo'
              : 'Todos os Produtos'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mostrando {products?.length || 0} de {totalCount} produtos encontrados
          </p>
        </div>

        {/* Search Input inline */}
        <form action="/catalogo" method="GET" className="flex items-center gap-2">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          {ordenar && <input type="hidden" name="ordenar" value={ordenar} />}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar no catálogo..."
              className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isActive = categoria === cat.value
            return (
              <Link
                key={cat.value}
                href={buildFilterUrl({ categoria: cat.value || undefined, pagina: '1' })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>

        {/* Sort & Quick Filter Dropdowns */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Ordenar por:</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={buildFilterUrl({
                ordenar: ordenar === 'preco-asc' ? undefined : 'preco-asc',
                pagina: '1',
              })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                ordenar === 'preco-asc'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Menor Preço
            </Link>

            <Link
              href={buildFilterUrl({
                ordenar: ordenar === 'preco-desc' ? undefined : 'preco-desc',
                pagina: '1',
              })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                ordenar === 'preco-desc'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Maior Preço
            </Link>

            <Link
              href={buildFilterUrl({
                ordenar: ordenar === 'avaliacao' ? undefined : 'avaliacao',
                pagina: '1',
              })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                ordenar === 'avaliacao'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Mais Bem Avaliados
            </Link>
          </div>
        </div>
      </div>

      {/* Active Filters Tag Bar */}
      {(q || categoria || emEstoque || (ordenar && ordenar !== 'recentes')) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Filtros ativos:</span>
          {q && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              Busca: &ldquo;{q}&rdquo;
              <Link href={buildFilterUrl({ q: undefined })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </Link>
            </span>
          )}
          {categoria && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              Categoria: {categoria}
              <Link href={buildFilterUrl({ categoria: undefined })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </Link>
            </span>
          )}
          {ordenar && ordenar !== 'recentes' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              Ordenação: {ordenar}
              <Link href={buildFilterUrl({ ordenar: undefined })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </Link>
            </span>
          )}
          <Link
            href="/catalogo"
            className="text-blue-600 hover:underline font-bold ml-2 text-xs"
          >
            Limpar todos
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Não encontramos produtos correspondentes aos filtros selecionados. Tente buscar com outros termos ou limpar os filtros.
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200">
          <Link
            href={buildFilterUrl({ pagina: String(Math.max(1, pagina - 1)) })}
            className={`p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition ${
              pagina <= 1 ? 'pointer-events-none opacity-40' : ''
            }`}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1
            const isCurrent = pageNum === pagina
            return (
              <Link
                key={pageNum}
                href={buildFilterUrl({ pagina: String(pageNum) })}
                className={`w-10 h-10 rounded-xl text-xs font-bold flex items-center justify-center transition border ${
                  isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </Link>
            )
          })}

          <Link
            href={buildFilterUrl({ pagina: String(Math.min(totalPages, pagina + 1)) })}
            className={`p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition ${
              pagina >= totalPages ? 'pointer-events-none opacity-40' : ''
            }`}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </main>
  )
}
