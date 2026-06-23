'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ShiningText } from '@/components/ui/shining-text'
import { DEFAULT_PROFILE, useWealthProfile } from '@/lib/wealth-store'

const SUGGESTIONS = [
  'when can I retire?',
  'will I have a crore by 35?',
  'what if I invest ₹10k more each month?',
  'should I prepay my home loan or invest?',
  'where am I quietly leaking money?',
  'how does my savings rate compare?',
]

export function ChatClient() {
  const params = useSearchParams()
  const [input, setInput] = useState('')
  const seededRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { profile, hydrated } = useWealthProfile()
  const activeProfile = profile ?? DEFAULT_PROFILE

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, profile: activeProfile },
        }),
      }),
    [activeProfile],
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  useEffect(() => {
    const q = params.get('q')
    if (q && !seededRef.current && hydrated) {
      seededRef.current = true
      sendMessage({ text: q })
    }
  }, [params, sendMessage, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submit(text: string) {
    const t = text.trim()
    if (!t || status !== 'ready') return
    sendMessage({ text: t })
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
          {messages.length === 0 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">· your coach</div>
                <div className="text-3xl font-medium text-white">
                  ask <span className="kuber-serif">Kuber</span> anything about your money.
                </div>
                <div className="text-sm text-white/50 mt-2">
                  retirement, what-ifs, savings rate, leaks — every answer is computed from your real numbers, not guessed.
                </div>
              </div>
              {hydrated && !profile && (
                <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-4">
                  <div className="text-sm text-white">no trajectory saved yet.</div>
                  <div className="text-xs text-white/55 mt-1">
                    Kuber will use a sample profile until you{' '}
                    <Link href="/start/setup" className="text-[#B0C4DE] underline-offset-4 hover:underline">
                      enter your numbers
                    </Link>
                    .
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-left text-sm text-white/70 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}

          {(status === 'submitted' || status === 'streaming') && (
            <div className="flex items-center gap-3 pl-11">
              <ShiningText text="Kuber is doing the math…" className="text-sm" />
            </div>
          )}

          {error && <div className="text-sm text-rose-300/80">error: {error.message}</div>}
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/30 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="max-w-3xl mx-auto px-6 py-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="ask Kuber anything about your wealth…"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#B0C4DE]/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="px-5 py-3 rounded-full bg-[#B0C4DE] text-black text-sm font-medium hover:bg-[#B0C4DE]/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            send
          </button>
        </form>
      </div>
    </div>
  )
}

type ChatMessage = ReturnType<typeof useChat>['messages'][number]

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'size-7 shrink-0 rounded-full flex items-center justify-center text-xs',
          isUser ? 'bg-white/10 text-white/70' : 'bg-[#B0C4DE]/20 text-[#B0C4DE] kuber-serif',
        )}
      >
        {isUser ? 'you' : 'K'}
      </div>
      <div className={cn('flex-1 min-w-0 space-y-2', isUser && 'text-right')}>
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <div
                key={i}
                className={cn(
                  'inline-block text-sm leading-relaxed whitespace-pre-wrap',
                  isUser
                    ? 'bg-white/[0.06] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-full text-left'
                    : 'text-white/85',
                )}
              >
                {part.text}
              </div>
            )
          }
          if (part.type.startsWith('tool-')) {
            const toolName = part.type.replace('tool-', '')
            // @ts-expect-error - state is on tool parts at runtime
            const state = part.state as string | undefined
            const isDone = state === 'output-available' || state === 'result'
            return (
              <div
                key={i}
                className="inline-flex items-center gap-2 text-[11px] text-white/40 font-mono border border-white/10 rounded-full px-2.5 py-1"
              >
                <span className={cn('size-1.5 rounded-full', isDone ? 'bg-emerald-400/60' : 'bg-amber-300/60 animate-pulse')} />
                {toolName}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
