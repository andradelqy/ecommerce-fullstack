'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import {
  Package,
  ArrowLeft,
  Upload,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react'

export default function NovoProdutoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('camisetas')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('20')
  const [description, setDescription] = useState('')
  const [featured, setFeatured] = useState(false)

  // Variações
  const [sizeInput, setSizeInput] = useState('')
  const [sizes, setSizes] = useState<string[]>(['P', 'M', 'G', 'GG'])
  const [colorInput, setColorInput] = useState('')
  const [colors, setColors] = useState<string[]>(['Preto', 'Branco'])

  // Imagens
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(slugify(val))
  }

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()])
      setSizeInput('')
    }
  }

  const handleRemoveSize = (s: string) => {
    setSizes(sizes.filter((item) => item !== s))
  }

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()])
      setColorInput('')
    }
  }

  const handleRemoveColor = (c: string) => {
    setColors(colors.filter((item) => item !== c))
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim() && !images.includes(imageUrlInput.trim())) {
      setImages([...images, imageUrlInput.trim()])
      setImageUrlInput('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { data, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadErr) {
        throw uploadErr
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setImages((prev) => [...prev, publicUrlData.publicUrl])
    } catch (err: any) {
      setError(`Erro no upload de imagem: ${err.message || 'Verifique se o bucket "products" foi criado no Supabase.'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !slug) {
      setError('Preencha os campos obrigatórios (Nome, Preço e Slug).')
      return
    }

    setLoading(true)
    setError('')

    const productData = {
      name,
      slug,
      category,
      price: parseFloat(price.replace(',', '.')),
      compare_at_price: comparePrice ? parseFloat(comparePrice.replace(',', '.')) : null,
      stock: parseInt(stock, 10) || 0,
      description,
      featured,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'],
      variations: {
        sizes,
        colors,
      },
      rating: 5.0,
      review_count: 0,
    }

    const { error: insertErr } = await supabase.from('products').insert(productData)

    if (insertErr) {
      setError(`Erro ao cadastrar: ${insertErr.message}`)
      setLoading(false)
      return
    }

    router.push('/admin/produtos')
    router.refresh()
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/produtos"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Cadastrar Novo Produto</h1>
          <p className="text-xs text-slate-400">Preencha os dados técnicos e imagens do item.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações Básicas */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            1. Informações Principais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Tênis Air Max Urbano"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slug (URL Amigável) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: tenis-air-max-urbano"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="camisetas">Camisetas</option>
                <option value="calcados">Calçados</option>
                <option value="jaquetas">Jaquetas</option>
                <option value="calcas">Calças</option>
                <option value="acessorios">Acessórios</option>
                <option value="eletronicos">Eletrônicos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299.90"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preço Comparativo / De (R$)
              </label>
              <input
                type="text"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="399.90"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantidade em Estoque *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Destacar na página inicial da loja
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição Detalhada
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva tecidos, modelagem, especificações técnicas..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Variações */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            2. Variações do Produto (Tamanhos e Cores)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tamanhos */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Tamanhos Disponíveis
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: P, M, 40, Único"
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(s)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Cores Disponíveis
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Ex: Preto, Azul Marinho"
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-200"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Imagens */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            3. Fotos do Produto
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adicionar por URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Adicionar por URL da Imagem
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Upload direto para Supabase Storage */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload para Supabase Storage (Bucket &apos;products&apos;)
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 border border-dashed border-slate-600 hover:border-blue-500 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{uploading ? 'Enviando foto...' : 'Escolher arquivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview das imagens */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group"
                  >
                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/produtos"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Salvando Produto...' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}