import { Bot } from "lucide-react";
import type { ReactNode } from "react";

export function BotText({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Bot size={13} strokeWidth={2.25} />
      </span>
      <div className="max-w-[85%] rounded-lg rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

export function UserText({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-accent-tint px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}
