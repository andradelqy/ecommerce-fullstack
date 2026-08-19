'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatBRL, formatDate } from '@/lib/utils'
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  Filter,
} from 'lucide-react'

export default function AdminPedidosPage() {
  const supabase = createClient()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    }
    setUpdatingId(null)
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-500" />
          Gestão de Pedidos
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe pagamentos, altere status de envio e visualize endereços de entrega.
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, e-mail ou nome..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { label: 'Todos', value: 'all' },
            { label: 'Pendentes', value: 'pending' },
            { label: 'Pagos', value: 'paid' },
            { label: 'Enviados', value: 'shipped' },
            { label: 'Entregues', value: 'delivered' },
            { label: 'Cancelados', value: 'canceled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 bg-slate-800/60 rounded-2xl border border-slate-700 text-center text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-600" />
            <p>Nenhum pedido encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const items = (order.items as any[]) || []

            return (
              <div
                key={order.id}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 space-y-4 shadow-sm"
              >
                {/* Header do Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {order.customer_name || 'Cliente'} ({order.customer_email})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Criado em {formatDate(order.created_at)} • Stripe Session:{' '}
                      <span className="font-mono text-slate-400">
                        {order.stripe_session_id ? order.stripe_session_id.slice(0, 16) + '...' : 'Pendente'}
                      </span>
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-white">{formatBRL(order.total)}</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        order.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : order.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : order.status === 'delivered'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : order.status === 'canceled'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <option value="pending" className="bg-slate-900 text-white">
                        Pendente
                      </option>
                      <option value="paid" className="bg-slate-900 text-white">
                        Pago
                      </option>
                      <option value="shipped" className="bg-slate-900 text-white">
                        Enviado
                      </option>
                      <option value="delivered" className="bg-slate-900 text-white">
                        Entregue
                      </option>
                      <option value="canceled" className="bg-slate-900 text-white">
                        Cancelado
                      </option>
                    </select>
                  </div>
                </div>

                {/* Itens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-700/60"
                    >
                      <img
                        src={item.image || 'https://placehold.co/60x60?text=Item'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                      />
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.variations?.size ? `Tam: ${item.variations.size} • ` : ''}
                          Qtd: {item.quantity} • {formatBRL(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Endereço de Entrega */}
                {order.shipping_address && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-700/40 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-300">Entrega:</strong>{' '}
                      {order.shipping_address.address}, {order.shipping_address.number}{' '}
                      {order.shipping_address.complement ? `(${order.shipping_address.complement})` : ''} -{' '}
                      {order.shipping_address.neighborhood}, {order.shipping_address.city}/
                      {order.shipping_address.state} - CEP: {order.shipping_address.zip}
                    </span>
                    {order.coupon_code && (
                      <span className="text-emerald-400 font-semibold">
                        Cupom: {order.coupon_code} (-{formatBRL(order.discount)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
