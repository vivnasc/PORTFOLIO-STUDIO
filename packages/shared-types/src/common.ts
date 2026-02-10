export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  product_id: string
  plan: 'free' | 'starter' | 'pro'
  status: 'active' | 'cancelled' | 'past_due'
  paypal_subscription_id?: string
  current_period_start: string
  current_period_end: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  domain: string
  description: string
  pricing: {
    free: { price: 0; features: string[] }
    starter: { price: number; features: string[] }
    pro: { price: number; features: string[] }
  }
}
