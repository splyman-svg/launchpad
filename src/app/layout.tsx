import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LaunchPad — Find Your Perfect Side Hustle',
  description: 'Answer 10 questions and get a personalized AI-powered side hustle roadmap in minutes.',
  openGraph: {
    title: 'LaunchPad — Find Your Perfect Side Hustle',
    description: 'Answer 10 questions and get a personalized AI-powered side hustle roadmap in minutes.',
    type: 'website',
    siteName: 'LaunchPad',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchPad — Find Your Perfect Side Hustle',
    description: 'Answer 10 questions and get a personalized AI-powered side hustle roadmap in minutes.',
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
