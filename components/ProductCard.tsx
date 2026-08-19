'use client'

import React from 'react'
import Link from 'next/link'
import { formatBRL } from '@/lib/utils'
import { Star, ShoppingBag, Eye } from 'lucide-react'

export interface Product {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compare_at_price?: number | null
  images: string[]
  category: string
  stock: number
  variations?: {
    sizes?: string[]
    colors?: string[]
  }
  rating?: number
  review_count?: number
  featured?: boolean
}

export default function ProductCard({ product }: { product: Product }) {
  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        )
      : 0

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'

  const installmentValue = product.price / 10

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 block"
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Destaque
            </span>
          )}
        </div>

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Ver Detalhes
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 text-xs">
                {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({product.review_count || 0})
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/produto/${product.slug}`}
            className="font-bold text-slate-900 hover:text-blue-600 transition line-clamp-2 text-sm leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-slate-400 line-through block">
                {formatBRL(product.compare_at_price)}
              </span>
            )}
            <div className="text-base sm:text-lg font-black text-slate-900">
              {formatBRL(product.price)}
            </div>
            <p className="text-[10px] text-slate-500">
              ou 10x de {formatBRL(installmentValue)} sem juros
            </p>
          </div>

          <Link
            href={`/produto/${product.slug}`}
            className="p-2.5 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition shadow-sm active:scale-95 flex items-center justify-center"
            title="Comprar produto"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
