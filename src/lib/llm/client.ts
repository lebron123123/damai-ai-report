import OpenAI from "openai";

/**
 * Thin wrapper around any OpenAI-compatible chat endpoint (DeepSeek, 通义千问,
 * 智谱GLM, or OpenAI itself all speak this protocol). Configure via env:
 *   LLM_API_KEY   - required to enable real calls
 *   LLM_BASE_URL  - e.g. https://api.deepseek.com/v1, https://dashscope.aliyuncs.com/compatible-mode/v1
 *   LLM_MODEL     - e.g. deepseek-chat, qwen-plus, glm-4
 * If LLM_API_KEY is unset, isLLMConfigured() is false and callers should use
 * their own rule-based fallback — the app must keep working with zero keys.
 */

let cachedClient: OpenAI | null = null;

export function isLLMConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

function getClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || undefined,
    });
  }
  return cachedClient;
}

function getModel(): string {
  return process.env.LLM_MODEL || "deepseek-chat";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string | null> {
  if (!isLLMConfigured()) return null;
  try {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: getModel(),
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 800,
    });
    return res.choices[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("[llm] chatComplete failed, falling back to rule-based text:", err);
    return null;
  }
}

/** Same as chatComplete but asks the model to return strict JSON and parses it. */
export async function chatCompleteJSON<T>(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<T | null> {
  if (!isLLMConfigured()) return null;
  try {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: getModel(),
      messages: [
        ...messages,
        { role: "system", content: "只输出合法JSON,不要包含markdown代码块标记或多余文字。" },
      ],
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 900,
      response_format: { type: "json_object" },
    });
    const raw = res.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("[llm] chatCompleteJSON failed, falling back to rule-based output:", err);
    return null;
  }
}
