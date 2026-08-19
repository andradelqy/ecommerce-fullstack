import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-20">
      {/* Guarantees Bar */}
      <div className="border-b border-slate-900 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Frete Rápido</h4>
              <p className="text-xs text-slate-400">Entregamos para todo o Brasil</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Compra 100% Segura</h4>
              <p className="text-xs text-slate-400">Criptografia SSL de ponta a ponta</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Devolução Grátis</h4>
              <p className="text-xs text-slate-400">Até 30 dias após o recebimento</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Até 12x Sem Juros</h4>
              <p className="text-xs text-slate-400">Pix com 5% de desconto extra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
              E
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              NEXUS<span className="text-blue-500">.</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma de comércio eletrônico full stack de alta performance, desenvolvida com Next.js, Supabase, Stripe e Tailwind CSS.
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-400 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              ⚡ Next.js 15+
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              🔒 Stripe Verified
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Navegação
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalogo" className="hover:text-white transition">
                Todos os Produtos
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=camisetas" className="hover:text-white transition">
                Camisetas & Moda
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=calcados" className="hover:text-white transition">
                Tênis & Calçados
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=eletronicos" className="hover:text-white transition">
                Eletrônicos & Áudio
              </Link>
            </li>
            <li>
              <Link href="/catalogo?categoria=jaquetas" className="hover:text-white transition">
                Jaquetas Térmicas
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Atendimento
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/pedidos" className="hover:text-white transition">
                Rastrear Meu Pedido
              </Link>
            </li>
            <li>
              <Link href="/carrinho" className="hover:text-white transition">
                Meu Carrinho
              </Link>
            </li>
            <li>
              <span className="text-slate-400">Política de Privacidade</span>
            </li>
            <li>
              <span className="text-slate-400">Termos de Serviço</span>
            </li>
            <li>
              <span className="text-slate-400">Trocas e Devoluções</span>
            </li>
          </ul>
        </div>

        {/* Contact & Payments */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Contato & Pagamento
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>contato@nexuscommerce.com.br</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>(11) 99999-8888</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900">
            <p className="text-[11px] text-slate-500 mb-2 font-medium">Formas de Pagamento:</p>
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 font-semibold text-emerald-400">
                PIX
              </span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
                Cartão de Crédito
              </span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
                Boleto Bancário
              </span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
                Stripe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} NEXUS E-commerce. Projeto de Portfólio Full Stack.</p>
      </div>
    </footer>
  )
}
