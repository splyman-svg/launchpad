'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/pro/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="text-sm text-primary/50 hover:text-accent transition-colors font-sans inline-flex items-center gap-2"
    >
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      Manage subscription
    </button>
  )
}
