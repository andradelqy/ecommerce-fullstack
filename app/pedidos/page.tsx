import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatBRL, formatDate } from '@/lib/utils'
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Meus Pedidos | NEXUS Commerce',
  description: 'Histórico e acompanhamento dos seus pedidos.',
}

export default async function PedidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/pedidos')
  }

  // Buscar pedidos do usuário
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pago
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Enviado
          </span>
        )
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Entregue
          </span>
        )
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Aguardando Pagamento
          </span>
        )
    }
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-blue-600" />
          Meus Pedidos
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Acompanhe o status e histórico de todas as suas compras.
        </p>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Você ainda não realizou nenhum pedido</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Assim que você finalizar sua primeira compra, ela aparecerá aqui com todos os detalhes de rastreamento.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const items = (order.items as any[]) || []

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                {/* Header do Pedido */}
                <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <p className="text-xs text-slate-600 font-medium">
                      Realizado em {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {formatBRL(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="p-5 space-y-4 divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://placehold.co/80x80?text=Item'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.variations?.size ? `Tam: ${item.variations.size} | ` : ''}
                            {item.variations?.color ? `Cor: ${item.variations.color} | ` : ''}
                            Qtd: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {formatBRL(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Endereço de Entrega do Pedido */}
                {order.shipping_address && (
                  <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Entregar em: {order.shipping_address.address}, {order.shipping_address.number} - {order.shipping_address.city}/{order.shipping_address.state}
                    </span>
                    <span className="font-semibold text-slate-700">{order.customer_email}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
