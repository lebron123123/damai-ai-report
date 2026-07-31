import { StatusBar } from "@/components/StatusBar";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
      </div>
      <StatusBar />
    </div>
  );
}
