'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from './CartContext'
import { formatBRL } from '@/lib/utils'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2 } from 'lucide-react'

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeItem,
    updateQuantity,
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

  if (!isDrawerOpen) return null

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
        setCouponSuccess(`Cupom ${data.coupon.code} aplicado!`)
        setCouponInput('')
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900">Seu Carrinho</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Seu carrinho está vazio</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Explore nossas coleções e descubra produtos incríveis para você.
                </p>
                <Link
                  href="/catalogo"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition"
                >
                  <img
                    src={item.image || 'https://placehold.co/100x100?text=Produto'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-white border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produto/${item.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition line-clamp-1"
                    >
                      {item.name}
                    </Link>

                    {(item.variations?.size || item.variations?.color) && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        {item.variations.size && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Tam: {item.variations.size}
                          </span>
                        )}
                        {item.variations.color && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Cor: {item.variations.color}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-slate-900">
                        {formatBRL(item.price)}
                      </span>

                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Cupom e Totais */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              {/* Cupom */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Cupom <strong>{appliedCoupon.code}</strong> aplicado (
                      {appliedCoupon.discount_percent
                        ? `${appliedCoupon.discount_percent}% OFF`
                        : formatBRL(appliedCoupon.discount_amount || 0)}
                      )
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-red-600 font-bold ml-2 underline"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Cupom (ex: DESCONTO10)"
                        className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}
                </form>
              )}

              {/* Detalhes de Preço */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatBRL(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto</span>
                    <span>-{formatBRL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="text-emerald-600 font-semibold">Grátis</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-blue-600">{formatBRL(total)}</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition active:scale-[0.99]"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/carrinho"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full block text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Ver carrinho completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
