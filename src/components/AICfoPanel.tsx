import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, Brain, AlertTriangle, CheckCircle2, Info, AlertOctagon, type LucideIcon } from "lucide-react";
import type { FinanceState, AIInsight } from "../lib/types";
import { answerQuestion, generateInsights } from "../lib/aiCfo";

interface Props {
  state: FinanceState;
}

interface ChatMsg {
  role: "user" | "cfo";
  text: string;
  ts: number;
}

const toneIcon: Record<AIInsight["tone"], LucideIcon> = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  danger: AlertOctagon,
};

const toneColor: Record<AIInsight["tone"], string> = {
  positive: "text-accent-400 bg-accent-500/10 border-accent-500/20",
  warning: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  info: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
  danger: "text-pink-300 bg-pink-500/10 border-pink-500/20",
};

const SUGGESTIONS = [
  "How much did I save this month?",
  "Am I over any budget?",
  "What's my biggest category?",
  "How much did I spend today?",
];

export default function AICfoPanel({ state }: Props) {
  const insights = useMemo(() => generateInsights(state), [state]);
  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "cfo",
      text: "Hey — I'm your CFO. I've already reviewed your books. Ask me anything, or tap a suggestion below.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  function ask(q: string) {
    if (!q.trim()) return;
    setChat((c) => [...c, { role: "user", text: q, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    const a = answerQuestion(state, q);
    setTimeout(() => {
      setChat((c) => [...c, { role: "cfo", text: a, ts: Date.now() }]);
      setTyping(false);
    }, 550);
  }

  return (
    <div className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-glow-violet to-glow-cyan grid place-items-center">
          <Brain size={17} className="text-white" />
        </div>
        <div>
          <div className="font-semibold leading-tight flex items-center gap-1.5">
            AI CFO <Sparkles size={13} className="text-accent-400" />
          </div>
          <div className="text-[11px] text-slate-400">Always on. Always reading your books.</div>
        </div>
        <span className="ml-auto pill bg-accent-500/10 text-accent-400">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" /> Live
        </span>
      </div>

      <div className="mt-4">
        <div className="label mb-2">Today's insights</div>
        <div className="space-y-2 max-h-44 overflow-auto pr-1">
          {insights.length === 0 && (
            <div className="text-xs text-slate-400">All quiet on the financial front.</div>
          )}
          {insights.map((it) => {
            const Icon = toneIcon[it.tone];
            return (
              <div
                key={it.id}
                className={`p-3 rounded-xl border ${toneColor[it.tone]} flex gap-2.5`}
              >
                <Icon size={14} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold">{it.title}</div>
                  <div className="text-[11.5px] text-slate-300 mt-0.5 leading-relaxed">{it.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex-1 flex flex-col min-h-0">
        <div className="label mb-2">Chat with your CFO</div>
        <div className="flex-1 overflow-auto space-y-2 pr-1 min-h-[120px]">
          {chat.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] text-[13px] px-3 py-2 rounded-2xl leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent-500 text-ink-950 rounded-br-md"
                    : "bg-white/[0.05] border border-white/5 text-slate-200 rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex">
              <div className="bg-white/[0.05] border border-white/5 text-slate-300 text-[13px] px-3 py-2 rounded-2xl rounded-bl-md typing">
                Thinking
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-300"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your CFO anything..."
            className="input"
          />
          <button type="submit" className="btn-primary px-3">
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
