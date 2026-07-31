"use client";

import { Compass, Scale, type LucideIcon } from "lucide-react";
import { INTENT_OPTIONS, type Intent } from "@/lib/chat/flow";

const ICONS: Record<Intent, LucideIcon> = { recommend: Compass, evaluate: Scale };

export function IntentPicker({
  onSelect,
  disabled,
}: {
  onSelect: (intent: Intent) => void;
  disabled?: boolean;
}) {
  return (
    <div className="ml-[34px] flex flex-col gap-2 sm:flex-row">
      {INTENT_OPTIONS.map((opt) => {
        const Icon = ICONS[opt.intent];
        return (
          <button
            key={opt.intent}
            disabled={disabled}
            onClick={() => onSelect(opt.intent)}
            className="flex flex-1 items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-text" />
            <span>
              <span className="block text-[13.5px] font-medium text-foreground">{opt.label}</span>
              <span className="block text-[12px] text-muted">{opt.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
