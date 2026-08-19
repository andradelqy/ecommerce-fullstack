'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { createClient } from '@/lib/supabase/client'
import { formatBRL } from '@/lib/utils'
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, total, appliedCoupon } = useCart()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Formulário de Entrega
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zip: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
  })

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFormData((prev) => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.name || '',
        }))
      }
    }
    loadUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCEPBlur = async () => {
    const cleanCep = formData.zip.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }))
        }
      } catch (e) {
        console.error('Erro ao consultar CEP', e)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      router.push('/carrinho')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      // Chamar backend para criar sessão do Stripe com validação de preços segura
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            variations: i.variations,
          })),
          customerEmail: formData.email,
          customerName: formData.name,
          shippingAddress: {
            address: formData.address,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
          couponCode: appliedCoupon?.code || null,
          userId: user?.id || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao processar checkout.')
        setLoading(false)
        return
      }

      // Redirecionar para o Stripe Checkout seguro
      if (data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage('URL de pagamento não retornada.')
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMessage('Falha ao conectar com o gateway de pagamento.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Seu carrinho está vazio</h2>
          <p className="text-xs text-slate-500">Adicione produtos antes de ir para o checkout.</p>
          <Link
            href="/catalogo"
            className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Ir para o Catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto border-b border-slate-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-600" />
            Checkout Seguro
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preencha seus dados de entrega para prosseguir ao pagamento.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente Criptografado SSL</span>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-5xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Formulário + Resumo */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Entrega (Esquerda) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dados Pessoais */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Carlos Eduardo da Silva"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Confirmação *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>2. Endereço de Entrega</span>
              <span className="text-[11px] text-blue-600 font-normal">Preenchimento automático via CEP</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CEP *
                </label>
                <input
                  type="text"
                  name="zip"
                  required
                  maxLength={9}
                  value={formData.zip}
                  onChange={handleChange}
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rua / Logradouro *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. Paulista"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  name="number"
                  required
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleChange}
                  placeholder="Apto 42"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="Bela Vista"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="São Paulo"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  name="state"
                  maxLength={2}
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="SP"
                  className="w-full px-3.5 py-2.5 text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Pedido & Ação (Direita) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Itens do Pedido ({items.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.variations?.size ? `Tam: ${item.variations.size} | ` : ''}
                        Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatBRL(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto ({appliedCoupon?.code})</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="text-emerald-600 font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total a Pagar</span>
                <span className="text-blue-600 text-lg">{formatBRL(total)}</span>
              </div>
            </div>

            {/* Botão de Pagamento Seguro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Preparando Pagamento...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar com Stripe / Pix</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
              <p>Você será redirecionado para o ambiente seguro do Stripe.</p>
              <p className="font-semibold text-slate-700">Aceitamos Pix, Cartão de Crédito e Boleto.</p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}
