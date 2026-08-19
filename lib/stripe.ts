import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build'
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-03-25.acacia' as any,
      appInfo: {
        name: 'ecommerce-fullstack',
        version: '1.0.0',
      },
    })
  }
  return stripeInstance
}