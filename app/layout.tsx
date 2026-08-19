import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'NEXUS | E-commerce Moderno & Moda Urbana',
  description:
    'Loja virtual de alta performance com roupas, calçados, jaquetas e eletrônicos. Pagamento seguro com Stripe e entrega para todo o Brasil.',
  keywords: ['ecommerce', 'moda urbana', 'tenis', 'camisetas', 'jaquetas', 'nextjs', 'stripe'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <div className="flex-1">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
