"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { BotText, UserText } from "@/components/chat/MessageBubble";
import { IntentPicker } from "@/components/chat/IntentPicker";
import { QuestionInput } from "@/components/chat/QuestionInput";
import { EvaluateReportView } from "@/components/EvaluateReportView";
import { RecommendReportView } from "@/components/RecommendReportView";
import { FLOWS, INTENT_OPTIONS, introLineFor, type Intent, type SlotDef } from "@/lib/chat/flow";
import type { EvaluateReport } from "@/lib/pipeline/evaluate";
import type { RecommendReport } from "@/lib/pipeline/recommend";

type Msg =
  | { id: string; kind: "bot-text"; text: string }
  | { id: string; kind: "user-text"; text: string }
  | { id: string; kind: "intent-picker" }
  | { id: string; kind: "question"; slot: SlotDef }
  | { id: string; kind: "loading" }
  | { id: string; kind: "evaluate-report"; report: EvaluateReport }
  | { id: string; kind: "recommend-report"; report: RecommendReport }
  | { id: string; kind: "error"; text: string };

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `m${idCounter}`;
}

const WELCOME = "你好,我是大麦AI选品助手。你想先做哪件事?";

function initialMessages(): Msg[] {
  return [
    { id: nextId(), kind: "bot-text", text: WELCOME },
    { id: nextId(), kind: "intent-picker" },
  ];
}

export function ChatShell() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [slotIdx, setSlotIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function append(msg: Msg) {
    setMessages((prev) => [...prev, msg]);
  }

  function handleIntentSelect(chosen: Intent) {
    const label = INTENT_OPTIONS.find((o) => o.intent === chosen)!.label;
    setIntent(chosen);
    setSlotIdx(0);
    append({ id: nextId(), kind: "user-text", text: label });
    append({ id: nextId(), kind: "bot-text", text: introLineFor(chosen) });
    append({ id: nextId(), kind: "question", slot: FLOWS[chosen][0] });
  }

  async function runPipeline(finalAnswers: Record<string, string>, chosenIntent: Intent) {
    setBusy(true);
    append({ id: nextId(), kind: "loading" });
    try {
      const endpoint = chosenIntent === "recommend" ? "/api/recommend" : "/api/evaluate";
      const body =
        chosenIntent === "recommend"
          ? { query: finalAnswers.query, category: finalAnswers.category || undefined }
          : {
              query: finalAnswers.query,
              costPrice: finalAnswers.costPrice ? Number(finalAnswers.costPrice) : undefined,
            };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setMessages((prev) => [
        ...prev.filter((m) => m.kind !== "loading"),
        chosenIntent === "recommend"
          ? { id: nextId(), kind: "recommend-report" as const, report: data as RecommendReport }
          : { id: nextId(), kind: "evaluate-report" as const, report: data as EvaluateReport },
        { id: nextId(), kind: "bot-text", text: "还想再看点别的吗?点右上角「重新开始」就能问下一个。" },
      ]);
    } catch (err) {
      const text = err instanceof Error ? err.message : "生成失败";
      setMessages((prev) => [...prev.filter((m) => m.kind !== "loading"), { id: nextId(), kind: "error" as const, text }]);
    } finally {
      setBusy(false);
    }
  }

  function advance(nextAnswers: Record<string, string>, slots: SlotDef[]) {
    const next = slotIdx + 1;
    if (next < slots.length) {
      setSlotIdx(next);
      append({ id: nextId(), kind: "question", slot: slots[next] });
    } else if (intent) {
      runPipeline(nextAnswers, intent);
    }
  }

  const answersRef = useRef<Record<string, string>>({});

  function handleAnswer(value: string) {
    if (!intent) return;
    const slots = FLOWS[intent];
    const slot = slots[slotIdx];
    append({ id: nextId(), kind: "user-text", text: value });
    answersRef.current = { ...answersRef.current, [slot.key]: value };
    advance(answersRef.current, slots);
  }

  function handleSkip() {
    if (!intent) return;
    const slots = FLOWS[intent];
    const slot = slots[slotIdx];
    append({ id: nextId(), kind: "user-text", text: "(跳过)" });
    answersRef.current = { ...answersRef.current, [slot.key]: "" };
    advance(answersRef.current, slots);
  }

  function reset() {
    setIntent(null);
    setSlotIdx(0);
    answersRef.current = {};
    setMessages(initialMessages());
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-8 sm:py-5">
        <div>
          <h1 className="text-[15px] font-semibold text-foreground">AI选品助手</h1>
          <p className="mt-0.5 text-[13px] text-muted">聊几句,我来决定跑哪条流水线</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          <RotateCcw size={13} />
          重新开始
        </button>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6 sm:px-8">
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          switch (m.kind) {
            case "bot-text":
              return <BotText key={m.id}>{m.text}</BotText>;
            case "user-text":
              return <UserText key={m.id}>{m.text}</UserText>;
            case "intent-picker":
              return <IntentPicker key={m.id} onSelect={handleIntentSelect} disabled={intent !== null} />;
            case "question":
              return (
                <div key={m.id} className="space-y-2">
                  <BotText>{m.slot.prompt}</BotText>
                  <QuestionInput slot={m.slot} onSubmit={handleAnswer} onSkip={handleSkip} disabled={busy || !isLast} />
                </div>
              );
            case "loading":
              return (
                <BotText key={m.id}>
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    正在采集数据、算因子、生成报告…
                  </span>
                </BotText>
              );
            case "evaluate-report":
              return (
                <div key={m.id} className="rounded-lg border border-border bg-card p-4">
                  <EvaluateReportView report={m.report} />
                </div>
              );
            case "recommend-report":
              return (
                <div key={m.id} className="rounded-lg border border-border bg-card p-4">
                  <RecommendReportView report={m.report} />
                </div>
              );
            case "error":
              return (
                <div
                  key={m.id}
                  className="rounded-md border border-negative-border bg-negative-tint px-3.5 py-2.5 text-[13px] text-negative"
                >
                  {m.text}
                </div>
              );
            default:
              return null;
          }
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
