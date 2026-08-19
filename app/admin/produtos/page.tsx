'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatBRL } from '@/lib/utils'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export default function AdminProdutosPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setFeedback({ type: 'error', text: 'Erro ao carregar produtos.' })
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      setFeedback({ type: 'error', text: `Erro ao excluir: ${error.message}` })
    } else {
      setFeedback({ type: 'success', text: `Produto "${name}" removido com sucesso.` })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            Gestão de Produtos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre, edite fotos, gerencie preços e controle o estoque dos itens.
          </p>
        </div>

        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto por nome ou categoria..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-600" />
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-4 py-4">Categoria</th>
                  <th className="px-4 py-4">Preço</th>
                  <th className="px-4 py-4">Estoque</th>
                  <th className="px-4 py-4">Avaliação</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={
                          product.images?.[0] ||
                          'https://placehold.co/80x80?text=Produto'
                        }
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-xs">{product.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">/{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 capitalize">{product.category}</td>
                    <td className="px-4 py-4 font-bold text-white">
                      {formatBRL(product.price)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          product.stock > 5
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : product.stock > 0
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {product.stock} em estoque
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-amber-400">
                      ★ {Number(product.rating || 5.0).toFixed(1)} ({product.review_count || 0})
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/produto/${product.slug}`}
                        target="_blank"
                        className="p-1.5 inline-block text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                        title="Ver na loja"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 inline-block text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}