'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { formatBRL } from '@/lib/utils'
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from 'lucide-react'

export default function CarrinhoPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    setCouponLoading(true)
    setCouponError('')
    setCouponSuccess('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error || 'Cupom inválido')
      } else {
        applyCoupon(data.coupon)
        setCouponSuccess(`Cupom ${data.coupon.code} aplicado com sucesso!`)
        setCouponInput('')
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Seu carrinho está vazio</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Parece que você ainda não adicionou nenhum item ao seu carrinho. Explore nossos produtos e encontre novidades incríveis!
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-md"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Carrinho de Compras
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revise seus itens e prossiga para o pagamento seguro.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Esvaziar Carrinho</span>
        </button>
      </div>

      {/* Grid: Tabela de Itens + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Itens (Esquerda) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition line-clamp-1"
                  >
                    {item.name}
                  </Link>

                  {(item.variations?.size || item.variations?.color) && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {item.variations.size && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          Tamanho: {item.variations.size}
                        </span>
                      )}
                      {item.variations.color && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          Cor: {item.variations.color}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 font-medium">
                    Valor unitário: {formatBRL(item.price)}
                  </div>
                </div>
              </div>

              {/* Quantidade e Subtotal */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-slate-900 block">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition"
                  title="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo do Pedido (Direita) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900">Resumo do Pedido</h2>

            {/* Cupom */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Cupom <strong>{appliedCoupon.code}</strong> ativo
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-red-600 font-bold underline ml-2"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Possui Cupom de Desconto?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Ex: PRIMEIRACOMPRA"
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}
              </form>
            )}

            {/* Linhas de Valores */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                <span className="font-semibold text-slate-900">{formatBRL(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto de Cupom</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" /> Frete Nacional
                </span>
                <span className="text-emerald-600 font-bold">Grátis</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total</span>
                <span className="text-blue-600 text-lg">{formatBRL(total)}</span>
              </div>
            </div>

            {/* CTA Checkout */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 active:scale-[0.99]"
            >
              <span>Continuar para o Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ambiente 100% criptografado e seguro</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
