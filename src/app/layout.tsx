import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HustlUp — Find Your Perfect Side Hustle',
  description: 'Answer 10 questions and get a personalized AI-powered side hustle coach in minutes.',
  openGraph: {
    title: 'HustlUp — Find Your Perfect Side Hustle',
    description: 'Answer 10 questions and get a personalized AI-powered side hustle coach in minutes.',
    type: 'website',
    siteName: 'HustlUp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HustlUp — Find Your Perfect Side Hustle',
    description: 'Answer 10 questions and get a personalized AI-powered side hustle coach in minutes.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
