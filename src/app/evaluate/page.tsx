import { PageHeader } from "@/components/PageHeader";
import { EvaluateForm } from "@/components/EvaluateForm";

export default function EvaluatePage() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="这个产品怎么样"
        subtitle="采集数据 → 计算核心因子 → 看多/看空辩论 → 上架/观察/不上架结论"
      />
      <EvaluateForm />
    </main>
  );
}
