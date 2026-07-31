import { PageHeader } from "@/components/PageHeader";
import { RecommendForm } from "@/components/RecommendForm";

export default function RecommendPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="我应该上架卖什么"
        subtitle="候选池召回 → 批量因子打分 → 选品委员会横向对比 → 推荐排名"
      />
      <RecommendForm />
    </main>
  );
}
