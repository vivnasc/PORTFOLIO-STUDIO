export const PayPalConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
}

export async function createSubscription(planId: string): Promise<string> {
  const response = await fetch('/api/payments/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  })

  const data = await response.json()
  return data.subscriptionId
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await fetch('/api/payments/cancel-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriptionId }),
  })
}

export async function getSubscriptionStatus(subscriptionId: string) {
  const response = await fetch(`/api/payments/subscription-status?id=${subscriptionId}`)
  return response.json()
}
