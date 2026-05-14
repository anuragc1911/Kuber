import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, ArrowUpRight } from "lucide-react";
import type { AIInsight, FinanceState } from "../lib/types";
import { answerQuestion, generateInsights } from "../lib/aiCfo";

interface Props {
  state: FinanceState;
}

interface ChatMsg {
  role: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "How much did I save this month?",
  "Am I over any budget?",
  "What's my biggest expense?",
  "How long does my cash last?",
];

const toneDot: Record<AIInsight["tone"], string> = {
  positive: "bg-accent",
  warning: "bg-warn",
  info: "bg-info",
  danger: "bg-danger",
};

export default function ClaudePanel({ state }: Props) {
  const insights = useMemo(() => generateInsights(state), [state]);
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi — I've looked through your books. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  function ask(q: string) {
    if (!q.trim()) return;
    setChat((c) => [...c, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    const a = answerQuestion(state, q);
    setTimeout(() => {
      setChat((c) => [...c, { role: "ai", text: a }]);
      setTyping(false);
    }, 500);
  }

  return (
    <div className="card p-5 flex flex-col h-full min-h-[420px]">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-elev border border-line grid place-items-center">
          <Sparkles size={13} className="text-accent" />
        </div>
        <div className="text-[13px] font-medium">Claude</div>
        <span className="text-sub text-[11px]">· personal assistant</span>
        <span className="ml-auto label">live</span>
      </div>

      <div className="mt-4">
        <div className="label mb-2">Today</div>
        <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
          {insights.length === 0 && (
            <div className="text-[12px] text-sub">Nothing unusual.</div>
          )}
          {insights.slice(0, 4).map((it) => (
            <div key={it.id} className="flex items-start gap-2 text-[12.5px] leading-snug">
              <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${toneDot[it.tone]}`} />
              <div>
                <span className="text-text">{it.title}.</span>{" "}
                <span className="text-dim">{it.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-4 divider" />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto space-y-2 pr-1 min-h-[80px]">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] text-[12.5px] leading-relaxed px-3 py-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-text text-bg"
                    : "bg-elev border border-line text-text"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="text-[12.5px] text-sub px-1">
              <span className="inline-block w-1 h-1 rounded-full bg-sub animate-pulse mr-1" />
              thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-[11px] px-2 py-1 rounded-md bg-elev border border-line text-dim hover:text-text hover:border-muted transition-colors"
            >
              {s}
              <ArrowUpRight size={9} className="inline ml-0.5 -mt-0.5" />
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
            placeholder="Ask Claude…"
            className="input"
          />
          <button type="submit" className="btn-primary px-3">
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
