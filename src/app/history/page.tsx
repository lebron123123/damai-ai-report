import { PageHeader } from "@/components/PageHeader";
import { HistoryList } from "@/components/HistoryList";
import { listHistory } from "@/lib/history/store";

// Reads mutable SQLite state at request time — without this, Next.js's static
// analysis prerenders the page once at build time and every visitor gets
// whatever history existed during the build, frozen forever.
export const dynamic = "force-dynamic";

export default function HistoryPage() {
  const records = listHistory();

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <PageHeader title="我的记录" subtitle="每次AI报告都会自动存下来,刷新不丢" />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <HistoryList initialRecords={records} />
      </div>
    </main>
  );
}
