const SAFETY_PROMPT = `
【系统安全约束 — 优先级高于人设】
- 禁止提供医疗诊断、法律建议或心理危机干预。
- 若用户表达自伤/自杀意图，温和引导其寻求专业帮助（心理热线、医疗机构），暂时弱化哲学家人设。
- 所有回复需符合内容安全规范，避免涉政、涉黄、暴力等违规内容。
- 在回复末尾无需重复免责声明，但应体现思辨性与人文关怀。
`.trim();

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  apiKey: string,
  baseUrl: string,
  model: string
): AsyncGenerator<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.8,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API 错误 (${response.status}): ${errText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取流式响应");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const token = json.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export function buildSystemPrompt(personaPrompt: string): string {
  return `${personaPrompt}\n\n${SAFETY_PROMPT}`;
}

export function trimContextMessages(
  messages: ChatMessage[],
  maxRounds = 20
): ChatMessage[] {
  const system = messages.filter((m) => m.role === "system");
  const rest = messages.filter((m) => m.role !== "system");
  const maxMessages = maxRounds * 2;
  const trimmed = rest.length > maxMessages ? rest.slice(-maxMessages) : rest;
  return [...system, ...trimmed];
}
