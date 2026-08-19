'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Package,
  Sparkles,
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const { itemCount, toggleDrawer } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const adminRole =
          user.app_metadata?.role === 'admin' ||
          user.user_metadata?.role === 'admin'
        setIsAdmin(!!adminRole)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const adminRole =
          session.user.app_metadata?.role === 'admin' ||
          session.user.user_metadata?.role === 'admin'
        setIsAdmin(!!adminRole)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setUserDropdownOpen(false)
    router.refresh()
  }

  const categories = [
    { name: 'Catálogo Completo', href: '/catalogo' },
    { name: 'Camisetas', href: '/catalogo?categoria=camisetas' },
    { name: 'Calçados', href: '/catalogo?categoria=calcados' },
    { name: 'Jaquetas', href: '/catalogo?categoria=jaquetas' },
    { name: 'Acessórios', href: '/catalogo?categoria=acessorios' },
    { name: 'Eletrônicos', href: '/catalogo?categoria=eletronicos' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Frete Grátis acima de R$ 199 | Use o cupom <strong>PRIMEIRACOMPRA</strong> para 15% OFF!
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm">
            E
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            NEXUS<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md relative items-center"
        >
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por produtos, marcas e categorias..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin shortcut */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Painel Admin</span>
            </Link>
          )}

          {/* User Profile / Auth */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectado como</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 hover:bg-amber-50 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Painel Administrativo
                      </Link>
                    )}
                    <Link
                      href="/pedidos"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-500" />
                      Meus Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={toggleDrawer}
            className="relative p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition active:scale-95 shadow-sm flex items-center gap-2"
            aria-label="Ver Carrinho"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">Carrinho</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Nav Links (Desktop) */}
      <nav className="hidden md:block border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 flex items-center gap-8 overflow-x-auto py-2.5 text-sm font-medium text-slate-600">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="hover:text-blue-600 transition whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 shadow-lg">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </form>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Categorias
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 rounded-lg"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Painel Administrativo
              </Link>
            )}
            <Link
              href="/pedidos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <Package className="w-4 h-4 text-slate-500" />
              Meus Pedidos
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
