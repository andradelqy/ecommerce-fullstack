'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  id: string // product id
  cartItemId: string // unique: `${id}-${size || 'default'}-${color || 'default'}`
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  stock: number
  variations?: {
    size?: string
    color?: string
  }
}

export interface AppliedCoupon {
  code: string
  discount_percent?: number | null
  discount_amount?: number | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
    stock: number
    variations?: {
      size?: string
      color?: string
    }
  }, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  subtotal: number
  discount: number
  total: number
  itemCount: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'ecommerce_cart_v1'
const COUPON_STORAGE_KEY = 'ecommerce_coupon_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Carregar do localStorage após montagem (evita mismatch de hidratação)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY)
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon))
      }
    } catch (e) {
      console.error('Erro ao ler carrinho do localStorage', e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Salvar no localStorage quando o carrinho mudar
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Erro ao salvar carrinho no localStorage', e)
    }
  }, [items, appliedCoupon, isHydrated])

  const addItem = (
    product: {
      id: string
      name: string
      slug: string
      price: number
      image: string
      stock: number
      variations?: {
        size?: string
        color?: string
      }
    },
    quantity: number = 1
  ) => {
    const sizeKey = product.variations?.size || 'default'
    const colorKey = product.variations?.color || 'default'
    const cartItemId = `${product.id}-${sizeKey}-${colorKey}`

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId)
      if (existingIndex > -1) {
        const updated = [...prev]
        const currentItem = updated[existingIndex]
        const newQty = Math.min(currentItem.quantity + quantity, product.stock || 99)
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
        }
        return updated
      }

      return [
        ...prev,
        {
          id: product.id,
          cartItemId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity: Math.min(quantity, product.stock || 99),
          image: product.image,
          stock: product.stock,
          variations: product.variations,
        },
      ]
    })

    setIsDrawerOpen(true)
  }

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId === cartItemId) {
          const validQty = Math.min(quantity, i.stock || 99)
          return { ...i, quantity: validQty }
        }
        return i
      })
    )
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(COUPON_STORAGE_KEY)
  }

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev)

  // Cálculos
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  let discount = 0
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discount_percent) {
      discount = (subtotal * appliedCoupon.discount_percent) / 100
    } else if (appliedCoupon.discount_amount) {
      discount = Math.min(appliedCoupon.discount_amount, subtotal)
    }
  }

  const total = Math.max(0, subtotal - discount)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        total,
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}