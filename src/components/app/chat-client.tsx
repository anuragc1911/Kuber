'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { SendHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShiningText } from '@/components/ui/shining-text'
import { DEFAULT_PROFILE, useWealthProfile } from '@/lib/wealth-store'

const SUGGESTIONS = [
  'when can I retire?',
  'will I have a crore by 35?',
  'what if I invest ₹10k more each month?',
  'prepay home loan or invest?',
  'how does my savings rate compare?',
  'where am I quietly leaking money?',
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
    <div className="flex flex-col h-[calc(100dvh-3.5rem-6rem-env(safe-area-inset-bottom))]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-4 sm:-mx-5">
        <div className="px-4 sm:px-5 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] text-[#B0C4DE] uppercase tracking-[0.18em] mb-2">
                  · your coach
                </div>
                <div className="text-[24px] font-semibold tracking-tight leading-tight text-white">
                  ask <span className="kuber-serif">Kuber</span> anything about your money.
                </div>
                <div className="text-[13px] text-white/50 mt-2 leading-relaxed">
                  retirement, what-ifs, savings rate — every answer is computed from your real numbers.
                </div>
              </div>
              {hydrated && !profile && (
                <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-4">
                  <div className="text-[13px] text-white">no trajectory saved yet.</div>
                  <div className="text-[12px] text-white/55 mt-1 leading-relaxed">
                    using a sample profile until you{' '}
                    <Link href="/start/setup" className="text-[#B0C4DE] underline-offset-4 underline">
                      enter your numbers
                    </Link>
                    .
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="block w-full text-left text-[14px] text-white/75 px-4 py-3 min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.02] active:bg-white/[0.06] transition"
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
            <div className="pl-9">
              <ShiningText text="Kuber is doing the math…" className="text-[13px]" />
            </div>
          )}

          {error && (
            <div className="text-[12px] text-rose-300/80 rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-3">
              error: {error.message}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="shrink-0 -mx-4 sm:-mx-5 px-4 sm:px-5 pt-3 pb-2 border-t border-white/10 bg-black/85 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="ask Kuber…"
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-full h-12 px-5 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-[#B0C4DE]/40 disabled:opacity-50"
            inputMode="text"
            enterKeyHint="send"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="size-12 shrink-0 rounded-full bg-[#B0C4DE] text-black inline-flex items-center justify-center active:scale-95 transition disabled:opacity-40"
            aria-label="send"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

type ChatMessage = ReturnType<typeof useChat>['messages'][number]

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'size-7 shrink-0 rounded-full flex items-center justify-center text-[11px]',
          isUser ? 'bg-white/10 text-white/70' : 'bg-[#B0C4DE]/20 text-[#B0C4DE] kuber-serif',
        )}
      >
        {isUser ? 'you' : 'K'}
      </div>
      <div className={cn('flex-1 min-w-0 space-y-1.5', isUser && 'text-right')}>
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <div
                key={i}
                className={cn(
                  'inline-block text-[14px] leading-relaxed whitespace-pre-wrap',
                  isUser
                    ? 'bg-white/[0.07] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-md max-w-[85%] text-left'
                    : 'text-white/90 max-w-full',
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
                className="inline-flex items-center gap-1.5 text-[10px] text-white/40 font-mono border border-white/10 rounded-full px-2 py-0.5"
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
