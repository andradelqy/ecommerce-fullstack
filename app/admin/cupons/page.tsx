'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatBRL, formatDate } from '@/lib/utils'
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react'

export default function AdminCuponsPage() {
  const supabase = createClient()

  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form de criação
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCoupons = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setCoupons(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountValue) return

    setSaving(true)
    setFeedback(null)

    const val = parseFloat(discountValue.replace(',', '.'))
    const couponData = {
      code: code.trim().toUpperCase(),
      discount_percent: discountType === 'percent' ? Math.round(val) : null,
      discount_amount: discountType === 'amount' ? val : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      active: true,
    }

    const { data, error } = await supabase.from('coupons').insert(couponData).select().single()

    if (error) {
      setFeedback({ type: 'error', text: `Erro ao criar cupom: ${error.message}` })
    } else {
      setFeedback({ type: 'success', text: `Cupom ${code.toUpperCase()} criado com sucesso!` })
      setCoupons([data, ...coupons])
      setShowCreateModal(false)
      setCode('')
      setDiscountValue('')
      setValidUntil('')
      setMaxUses('')
    }

    setSaving(false)
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ active: !currentActive })
      .eq('id', id)

    if (!error) {
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !currentActive } : c)))
    }
  }

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Deseja excluir o cupom "${couponCode}"?`)) return

    const { error } = await supabase.from('coupons').delete().eq('id', id)

    if (!error) {
      setCoupons(coupons.filter((c) => c.id !== id))
      setFeedback({ type: 'success', text: `Cupom ${couponCode} excluído.` })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-500" />
            Gestão de Cupons
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Crie cupons promocionais em porcentagem ou valor fixo para impulsionar vendas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Cupom</span>
        </button>
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

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Criar Novo Cupom</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: PROMO20"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Desconto
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="amount">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {discountType === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percent' ? '15' : '50.00'}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Validade Até
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Limite de Usos
                  </label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Sem limite"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  {saving ? 'Criando...' : 'Salvar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de Cupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">
            Carregando cupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full p-12 bg-slate-800/60 rounded-2xl border border-slate-700 text-center text-xs text-slate-400 space-y-2">
            <Ticket className="w-8 h-8 mx-auto text-slate-600" />
            <p>Nenhum cupom cadastrado ainda.</p>
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition space-y-3 ${
                c.active
                  ? 'bg-slate-800/80 border-slate-700/80'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg font-mono font-black text-sm">
                  {c.code}
                </div>
                <button
                  onClick={() => handleToggleActive(c.id, c.active)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                    c.active
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  {c.active ? 'Ativo' : 'Pausado'}
                </button>
              </div>

              <div className="text-xl font-black text-white">
                {c.discount_percent
                  ? `${c.discount_percent}% OFF`
                  : `${formatBRL(c.discount_amount)} OFF`}
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Usado <strong>{c.used_count || 0}</strong> {c.max_uses ? `/ ${c.max_uses}` : 'vezes'}
                  </span>
                </div>
                {c.valid_until && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Válido até {formatDate(c.valid_until).split(' ')[0]}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                  title="Excluir cupom"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
