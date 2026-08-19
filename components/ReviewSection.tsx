'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MessageSquare, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export default function ReviewSection({
  productId,
  reviews = [],
  averageRating = 5.0,
  reviewCount = 0,
}: {
  productId: string
  reviews: Review[]
  averageRating: number
  reviewCount: number
}) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      setMessage({ type: 'error', text: 'Preencha seu nome e comentário.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userName: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar avaliação.' })
      } else {
        setMessage({ type: 'success', text: 'Avaliação enviada com sucesso!' })
        setName('')
        setComment('')
        router.refresh()
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão ao enviar avaliação.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-8 pt-10 border-t border-slate-200">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Avaliações de Clientes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Opiniões reais de quem comprou e testou este produto.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-3xl font-black text-slate-900">
            {Number(averageRating).toFixed(1)}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Com base em {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Formulário + Lista de Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulário de Envio */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Deixe sua avaliação</h3>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Seleção de Estrelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sua Nota:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seu Nome:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            {/* Comentário */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seu Comentário:
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte o que achou do acabamento, tamanho, conforto..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Enviando...' : 'Publicar Avaliação'}</span>
            </button>
          </form>
        </div>

        {/* Lista de Avaliações */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60 p-6">
              <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Seja o primeiro a avaliar este produto!</p>
              <p className="text-xs text-slate-400 mt-1">
                Compartilhe sua experiência com outros compradores.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {rev.user_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.user_name}</h4>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Compra Verificada
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  {rev.comment}
                </p>

                <div className="text-[10px] text-slate-400 pl-10">
                  {formatDate(rev.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
