'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  Mail,
  Home,
} from 'lucide-react'

export default function SucessoPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Limpar o carrinho após compra realizada com sucesso
    clearCart()
  }, [])

  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Animated Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Pagamento Confirmado
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Obrigado pelo seu pedido! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Seu pagamento foi aprovado com sucesso e nosso time de expedição já iniciou a separação dos produtos.
          </p>
        </div>

        {/* Status Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">E-mail de Confirmação</p>
              <p className="text-slate-500">Enviamos todos os detalhes do pedido para seu e-mail cadastrado.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Prazo de Entrega</p>
              <p className="text-slate-500">Estimado entre 2 a 5 dias úteis com código de rastreio.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pedidos"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Acompanhar Meus Pedidos</span>
          </Link>
          <Link
            href="/catalogo"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar para a Loja</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
