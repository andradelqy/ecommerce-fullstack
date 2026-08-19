import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatBRL, formatDate } from '@/lib/utils'
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Buscar todos os pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  // Buscar todos os produtos
  const { data: products } = await supabase
    .from('products')
    .select('*')

  const totalOrders = orders?.length || 0

  // Faturamento apenas de pedidos pagos/enviados/entregues
  const paidOrders = orders?.filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status)) || []
  const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.total || 0), 0)

  const totalProducts = products?.length || 0
  const lowStockProducts = products?.filter((p) => p.stock <= 5) || []

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Visão Geral & Métricas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe o desempenho de vendas e inventário da loja em tempo real.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Faturamento */}
        <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Total</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatBRL(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{paidOrders.length} pedidos confirmados</span>
          </div>
        </div>

        {/* Card 2: Total Pedidos */}
        <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalOrders}</div>
          <div className="text-xs text-slate-400">
            {orders?.filter((o) => o.status === 'pending').length || 0} aguardando pagamento
          </div>
        </div>

        {/* Card 3: Produtos Cadastrados */}
        <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Produtos Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalProducts}</div>
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
          >
            + Cadastrar Produto
          </Link>
        </div>

        {/* Card 4: Alerta de Estoque Baixo */}
        <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Estoque Crítico</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {lowStockProducts.length}
          </div>
          <div className="text-xs text-slate-400">
            Itens com 5 ou menos unidades restantes
          </div>
        </div>
      </div>

      {/* Grid: Pedidos Recentes + Alertas de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pedidos Recentes (8 cols) */}
        <div className="lg:col-span-8 bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Pedidos Recentes</h2>
              <p className="text-xs text-slate-400">Últimas transações registradas na loja</p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Nenhum pedido realizado ainda.</p>
          ) : (
            <div className="divide-y divide-slate-700/60">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-slate-400">({order.customer_email})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatDate(order.created_at)} • {(order.items as any[])?.length || 0} itens
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs font-black text-white">{formatBRL(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerta de Estoque (4 cols) */}
        <div className="lg:col-span-4 bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 space-y-4">
          <div className="border-b border-slate-700 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alerta de Estoque
            </h2>
            <p className="text-xs text-slate-400">Produtos que precisam de reposição</p>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">Tudo em dia!</p>
              <p className="text-[11px] text-slate-500">Nenhum produto com estoque crítico.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{prod.category}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-black rounded-lg border border-red-500/30 whitespace-nowrap">
                    {prod.stock} un
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
