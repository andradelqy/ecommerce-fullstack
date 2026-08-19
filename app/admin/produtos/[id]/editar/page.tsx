'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  ArrowLeft,
  Upload,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('camisetas')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('0')
  const [description, setDescription] = useState('')
  const [featured, setFeatured] = useState(false)

  // Variações
  const [sizeInput, setSizeInput] = useState('')
  const [sizes, setSizes] = useState<string[]>([])
  const [colorInput, setColorInput] = useState('')
  const [colors, setColors] = useState<string[]>([])

  // Imagens
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Produto não encontrado.')
      } else {
        setName(data.name || '')
        setSlug(data.slug || '')
        setCategory(data.category || 'camisetas')
        setPrice(String(data.price || ''))
        setComparePrice(data.compare_at_price ? String(data.compare_at_price) : '')
        setStock(String(data.stock || 0))
        setDescription(data.description || '')
        setFeatured(!!data.featured)
        setImages(data.images || [])
        setSizes(data.variations?.sizes || [])
        setColors(data.variations?.colors || [])
      }
      setLoading(false)
    }

    loadProduct()
  }, [id])

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

      const { error: uploadErr } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadErr) throw uploadErr

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setImages((prev) => [...prev, publicUrlData.publicUrl])
    } catch (err: any) {
      setError(`Erro no upload: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !slug) {
      setError('Preencha os campos obrigatórios.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const updatedData = {
      name,
      slug,
      category,
      price: parseFloat(price.replace(',', '.')),
      compare_at_price: comparePrice ? parseFloat(comparePrice.replace(',', '.')) : null,
      stock: parseInt(stock, 10) || 0,
      description,
      featured,
      images,
      variations: {
        sizes,
        colors,
      },
      updated_at: new Date().toISOString(),
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update(updatedData)
      .eq('id', id)

    if (updateErr) {
      setError(`Erro ao atualizar: ${updateErr.message}`)
    } else {
      setSuccess('Produto atualizado com sucesso!')
      setTimeout(() => {
        router.push('/admin/produtos')
        router.refresh()
      }, 1000)
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Carregando produto...</div>
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
          <h1 className="text-2xl font-black text-white tracking-tight">Editar Produto</h1>
          <p className="text-xs text-slate-400">Atualize preços, variações e estoque.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Principais */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            Informações do Produto
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
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Slug (URL) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preço Comparativo (R$)
              </label>
              <input
                type="text"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estoque *
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
                Destacar na vitrine da loja
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Variações */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            Variações
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Tamanhos</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: P, M, 42"
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
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
                    <button type="button" onClick={() => handleRemoveSize(s)} className="text-slate-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Cores</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Ex: Preto, Branco"
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
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
                    <button type="button" onClick={() => handleRemoveColor(c)} className="text-slate-500 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-3">
            Fotos do Produto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="URL da foto..."
                className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Adicionar
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 border border-dashed border-slate-600 text-slate-300 rounded-xl text-xs font-medium cursor-pointer">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{uploading ? 'Enviando...' : 'Upload de arquivo'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group">
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

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/produtos"
            className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Atualizando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
