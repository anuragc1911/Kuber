'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { AtSign, Paperclip, SendHorizontal, Stethoscope, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ShiningText } from '@/components/ui/shining-text'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'how is the business doing right now?',
  'which product is killing my margin?',
  'how much runway do I have?',
  'am I GST compliant this quarter?',
  'where am I leaking money?',
]

const CONTEXTS: { id: string; label: string; description: string }[] = [
  { id: 'dashboard', label: 'dashboard', description: 'top-line snapshot' },
  { id: 'alerts', label: 'alerts', description: 'active issues + suggestions' },
  { id: 'cash', label: 'cash position', description: '60-day cash flow + runway' },
  { id: 'sku', label: 'SKU profitability', description: 'per-SKU margins after ads/returns' },
  { id: 'leaks', label: 'money leaks', description: 'where the burn is hiding' },
  { id: 'gst', label: 'GST status', description: 'liability + filing' },
  { id: 'cohorts', label: 'customer cohorts', description: 'retention + LTV' },
  { id: 'kpis', label: 'KPIs', description: 'all 12 board metrics' },
  { id: 'reminders', label: 'reminders', description: 'upcoming due dates' },
]

const DIAGNOSTIC_PROMPT =
  'run a full diagnostic. review revenue, runway, gross margin, burn, SKU profitability, money leaks, GST, customer cohorts, and recent alerts. flag anything critical or trending wrong. then propose three concrete actions to take this week, ranked by impact.'

export function ChatPanel() {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [contextId, setContextId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const ctx = CONTEXTS.find((c) => c.id === contextId)
  const expanded = hover || pinned

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  // Listen for global "kuber:ask" events (e.g. from cards: ask Kuber about X).
  // Pin the panel so it stays expanded while Kuber answers.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === 'string' && detail.trim()) {
        setPinned(true)
        sendMessage({ text: detail })
      }
    }
    window.addEventListener('kuber:ask', handler)
    return () => window.removeEventListener('kuber:ask', handler)
  }, [sendMessage])

  // Close context picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [pickerOpen])

  function submit(text: string) {
    const t = text.trim()
    if (!t || status !== 'ready') return
    const prefix = ctx ? `[focus: ${ctx.label}] ` : ''
    setPinned(true)
    sendMessage({ text: prefix + t })
    setInput('')
    setFiles([])
    setContextId(null)
  }

  function runDiagnostic() {
    if (status !== 'ready') return
    setPinned(true)
    sendMessage({ text: DIAGNOSTIC_PROMPT })
  }

  function close() {
    setPinned(false)
    setHover(false)
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5))
  }

  return (
    <div className="relative w-14 shrink-0">
      <aside
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        className={cn(
          'absolute inset-y-0 right-0 z-30 border-l border-white/10 bg-black flex flex-col transition-[width] duration-200 ease-out overflow-hidden',
          expanded ? 'w-[380px] shadow-[-8px_0_24px_rgba(0,0,0,0.6)]' : 'w-14',
        )}
      >
        {/* header — only renders when expanded */}
        {expanded && (
          <div className="h-14 flex items-center justify-between border-b border-white/10 shrink-0 px-4">
            <div className="leading-tight">
              <div className="text-sm text-white">war room</div>
              <div className="text-[10px] text-emerald-300/80 uppercase tracking-wider">● online</div>
            </div>
            {pinned && (
              <button
                onClick={close}
                className="size-7 inline-flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5"
                aria-label="close war room"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        {!expanded && (
          <div className="flex-1 flex flex-col items-center gap-3 py-4 text-[#B0C4DE]/55">
            <Stethoscope className="size-5" title="run full diagnostic" />
            {messages.length > 0 && (
              <span
                className="text-[10px] font-mono rounded-full size-5 flex items-center justify-center bg-[#B0C4DE]/15 text-[#B0C4DE]"
                title={`${messages.length} messages`}
              >
                {messages.length}
              </span>
            )}
          </div>
        )}

        {expanded && (
          <>
      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-sm text-white/70 leading-relaxed">
              ask anything about your business — runway, margins, taxes, leaks. drop a CSV or invoice
              and I&apos;ll analyze it.
            </div>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left w-full text-xs text-white/65 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:text-white transition-colors"
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
            <ShiningText text="Kuber is reading your numbers…" className="text-xs" />
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-300/80 border border-rose-400/20 bg-rose-400/[0.05] rounded-lg p-3">
            {error.message}
          </div>
        )}
      </div>

      {/* attached files */}
      {files.length > 0 && (
        <div className="px-4 pb-2 space-y-1.5 shrink-0">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs"
            >
              <Paperclip className="size-3 text-[#B0C4DE]" />
              <span className="flex-1 truncate text-white/80">{f.name}</span>
              <span className="text-white/40 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
              <button
                type="button"
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="text-white/40 hover:text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* quick actions — sit just above the input */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={runDiagnostic}
          disabled={status !== 'ready'}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-[#B0C4DE]/30 bg-[#B0C4DE]/[0.08] text-[#B0C4DE] hover:bg-[#B0C4DE]/15 disabled:opacity-50"
        >
          <Stethoscope className="size-3.5" />
          run full diagnostic
        </button>
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className={cn(
              'inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors',
              ctx
                ? 'border-[#B0C4DE]/30 bg-[#B0C4DE]/[0.08] text-[#B0C4DE]'
                : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            <AtSign className="size-3.5" />
            {ctx ? ctx.label : 'add context'}
          </button>
          {pickerOpen && (
            <div className="absolute left-0 bottom-full mb-1 w-64 z-20 rounded-lg border border-white/15 bg-[rgba(10,12,20,0.96)] backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.5)] py-1 max-h-[360px] overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/30">
                focus the conversation on…
              </div>
              {CONTEXTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setContextId(c.id)
                    setPickerOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 hover:bg-white/5 transition-colors',
                    contextId === c.id && 'bg-white/[0.04]',
                  )}
                >
                  <div className="text-xs text-white">{c.label}</div>
                  <div className="text-[10px] text-white/45 mt-0.5">{c.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {ctx && (
          <button
            type="button"
            onClick={() => setContextId(null)}
            className="text-white/40 hover:text-white"
            aria-label="clear context"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="border-t border-white/10 p-3 shrink-0 space-y-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit(input)
            }
          }}
          rows={2}
          placeholder="ask Kuber anything…"
          disabled={status !== 'ready'}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#B0C4DE]/40 resize-none disabled:opacity-50"
        />
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="size-7 inline-flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/5"
            title="attach file"
          >
            <Paperclip className="size-3.5" />
          </button>
          <span className="text-[10px] text-white/30 flex-1 truncate">
            ↵ to send · shift+↵ for newline
          </span>
          <button
            type="submit"
            disabled={status !== 'ready' || (!input.trim() && files.length === 0)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#B0C4DE] text-black font-medium hover:bg-[#B0C4DE]/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            send <SendHorizontal className="size-3" />
          </button>
        </div>
      </form>
          </>
        )}
      </aside>
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
          'size-6 shrink-0 rounded-full flex items-center justify-center text-[10px]',
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
                  'inline-block text-xs leading-relaxed whitespace-pre-wrap',
                  isUser
                    ? 'bg-white/[0.06] text-white px-3 py-2 rounded-xl rounded-tr-sm max-w-full text-left'
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
                className="inline-flex items-center gap-1.5 text-[10px] text-white/40 font-mono border border-white/10 rounded-full px-2 py-0.5"
              >
                <span
                  className={cn(
                    'size-1 rounded-full',
                    isDone ? 'bg-emerald-400/60' : 'bg-amber-300/60 animate-pulse',
                  )}
                />
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
