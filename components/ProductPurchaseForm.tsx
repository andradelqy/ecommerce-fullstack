'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'
import { formatBRL } from '@/lib/utils'
import {
  ShoppingBag,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react'

interface ProductProps {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number | null
  images: string[]
  stock: number
  variations?: {
    sizes?: string[]
    colors?: string[]
  }
}

export default function ProductPurchaseForm({ product }: { product: ProductProps }) {
  const router = useRouter()
  const { addItem, setIsDrawerOpen } = useCart()

  const sizes = product.variations?.sizes || []
  const colors = product.variations?.colors || []

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '')
  const [quantity, setQuantity] = useState<number>(1)
  const [addedAnimation, setAddedAnimation] = useState(false)

  // Frete simulado
  const [cep, setCep] = useState('')
  const [shippingResult, setShippingResult] = useState<{
    calculated: boolean
    price: number
    days: string
  } | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) return

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
        variations: {
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        },
      },
      quantity
    )

    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
        variations: {
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        },
      },
      quantity
    )

    setIsDrawerOpen(false)
    router.push('/checkout')
  }

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault()
    if (cep.length < 8) return

    setShippingLoading(true)
    setTimeout(() => {
      setShippingLoading(false)
      setShippingResult({
        calculated: true,
        price: 0, // Grátis na promoção
        days: '2 a 5 dias úteis',
      })
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Variação de Tamanhos */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tamanho: <span className="text-blue-600 font-semibold">{selectedSize}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-w-[48px] h-11 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedSize === size
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Variação de Cores */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cor: <span className="text-blue-600 font-semibold">{selectedColor}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  selectedColor === color
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {selectedColor === color && <Check className="w-3.5 h-3.5 text-blue-600" />}
                <span>{color}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantidade e Estoque */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quantidade
          </span>
          {isOutOfStock ? (
            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Esgotado
            </span>
          ) : product.stock <= 5 ? (
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Apenas {product.stock} em estoque!
            </span>
          ) : (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Em Estoque ({product.stock} unidades)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              disabled={quantity <= 1 || isOutOfStock}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= product.stock || isOutOfStock}
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Total do item: <strong className="text-slate-900">{formatBRL(product.price * quantity)}</strong>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-md ${
            addedAnimation
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-5 h-5" />
              <span>Adicionado ao Carrinho!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>Adicionar ao Carrinho</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-blue-500/25 disabled:opacity-50"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Comprar Agora</span>
        </button>
      </div>

      {/* Calculadora de Frete Simulado */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Calcular Prazo e Frete</span>
        </div>
        <form onSubmit={handleCalculateShipping} className="flex gap-2">
          <input
            type="text"
            maxLength={9}
            value={cep}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
            placeholder="Digite seu CEP (ex: 01310100)"
            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={shippingLoading || cep.length < 8}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 disabled:opacity-50 transition"
          >
            {shippingLoading ? 'Calculando...' : 'Calcular'}
          </button>
        </form>

        {shippingResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between items-center font-bold text-emerald-900">
              <span>Entrega Expressa Nacional</span>
              <span className="text-emerald-700">GRÁTIS</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              Prazo estimado: <strong>{shippingResult.days}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Selo de Garantia */}
      <div className="flex items-center gap-3 pt-2 text-slate-500 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Garantia de 30 dias com devolução grátis e sem burocracia</span>
      </div>
    </div>
  )
}
