import { PageHeader } from "@/components/PageHeader";
import { FactorLookupForm } from "@/components/FactorLookupForm";

export default function FactorsPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <PageHeader title="因子分析" subtitle="只算因子打分,不跑AI辩论/决策,查得更快" />
      <FactorLookupForm />
    </main>
  );
}
