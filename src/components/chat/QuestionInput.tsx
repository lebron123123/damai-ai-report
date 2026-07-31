"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { SlotDef } from "@/lib/chat/flow";

export function QuestionInput({
  slot,
  onSubmit,
  onSkip,
  disabled,
}: {
  slot: SlotDef;
  onSubmit: (value: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={submit} className="ml-[34px] flex gap-2">
      <input
        autoFocus
        disabled={disabled}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={slot.placeholder}
        type={slot.inputType === "number" ? "number" : "text"}
        className="flex-1 rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2.5 text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        <ArrowRight size={15} />
      </button>
      {!slot.required && (
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3.5 py-2.5 text-[13.5px] text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-60"
        >
          跳过
        </button>
      )}
    </form>
  );
}
