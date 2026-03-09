'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, MessageCircle } from 'lucide-react'
import type { ChatMessage } from '@/types'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (message: string) => Promise<void>
  isLoading: boolean
  firstName: string
  hustleName: string
}

export default function ChatPanel({ messages, onSend, isLoading, firstName, hustleName }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const msg = input.trim()
    setInput('')
    await onSend(msg)
  }

  const QUICK_PROMPTS = [
    "What should I focus on today?",
    "I'm feeling stuck, help me out",
    "Give me a pep talk!",
    "How am I doing overall?",
  ]

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors"
      >
        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold text-dark font-sans">AI Coach</p>
          <p className="text-xs text-primary/50 font-sans">
            Your personal {hustleName} guide
          </p>
        </div>
        <MessageCircle className={`w-5 h-5 text-primary/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable chat area */}
      {isExpanded && (
        <div className="border-t border-primary/10">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-white/30">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-accent/30 mx-auto mb-3" />
                <p className="text-sm text-dark/60 font-sans mb-1">
                  Hey {firstName}! I&apos;m your AI coach.
                </p>
                <p className="text-xs text-primary/40 font-sans">
                  Ask me anything about your {hustleName} journey!
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-accent text-background rounded-br-md'
                      : 'bg-white border border-primary/10 text-dark rounded-bl-md'
                  }`}
                >
                  <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-primary/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-accent/40 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (only show when no messages) */}
          {messages.length === 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                  className="text-xs bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-full font-sans transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-primary/10 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything..."
              disabled={isLoading}
              className="flex-1 bg-white/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-dark font-sans focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-primary/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-accent hover:bg-dark disabled:opacity-30 text-background p-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
