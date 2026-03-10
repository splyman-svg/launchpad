import Stripe from 'stripe'

// Use fetch-based HTTP client for Vercel serverless compatibility
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
    httpClient: Stripe.createFetchHttpClient(),
  })
}
