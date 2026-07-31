export type Intent = "recommend" | "evaluate";

export interface SlotDef {
  key: string;
  prompt: string;
  placeholder: string;
  required: boolean;
  inputType?: "text" | "number";
}

export interface IntentOption {
  intent: Intent;
  label: string;
  description: string;
}

// The guided-questionnaire flow, chosen deliberately over a free-form
// tool-calling agent: the intent choice and question order are fixed, so a
// seller who "doesn't know what to sell" never faces a blank input box —
// they pick one of two buttons, then answer one short question at a time.
export const INTENT_OPTIONS: IntentOption[] = [
  {
    intent: "recommend",
    label: "帮我看看该卖什么",
    description: "描述一个方向,AI从候选池里横向对比,给你推荐排名",
  },
  {
    intent: "evaluate",
    label: "帮我判断这个商品能不能上架",
    description: "给一个具体商品,AI给出上架 / 观察 / 不上架的结论",
  },
];

export const FLOWS: Record<Intent, SlotDef[]> = {
  recommend: [
    {
      key: "query",
      prompt: "想找什么方向的商品?品类、目标人群、市场都可以说,越具体推荐越准",
      placeholder: "例如:适合墨西哥市场的户外露营小家电",
      required: true,
    },
    {
      key: "category",
      prompt: "有没有想限定的具体类目?不确定的话可以跳过,我会自动召回候选池",
      placeholder: "可选,比如:厨房小电",
      required: false,
    },
  ],
  evaluate: [
    {
      key: "query",
      prompt: "想评估哪个商品?填商品名称就行(接入Mercado Libre后也可以直接填商品ID)",
      placeholder: "例如:充电式电钻套装",
      required: true,
    },
    {
      key: "costPrice",
      prompt: "知道这个商品的进货成本吗?填了能算出真实毛利率,不知道也可以跳过",
      placeholder: "可选,比如:35",
      required: false,
      inputType: "number",
    },
  ],
};

export function introLineFor(intent: Intent): string {
  return intent === "recommend"
    ? "好,我来帮你找该卖什么。先问你几个问题。"
    : "好,我来帮你判断这个商品值不值得上架。先问你几个问题。";
}
