import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata = {
  title: 'Painel Administrativo | NEXUS Commerce',
  description: 'Gerenciamento de produtos, pedidos, cupons e estoque.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se não estiver logado, redirecionar para login
  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  const isAdmin =
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin'

  // Para permitir visualização/teste local no portfólio mesmo antes de setar metadata se desejado,
  // verificamos admin role. Em produção com RLS, o usuário terá role admin.
  // Se não for admin, você pode redirecionar para a home:
  // if (!isAdmin) {
  //   redirect('/')
  // }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar Lateral */}
      <AdminSidebar />

      {/* Conteúdo Principal do Admin */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">Ambiente de Gestão</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Logado como: <strong className="text-white">{user.email}</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
