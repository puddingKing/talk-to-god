import type { Philosopher, Conversation, Message } from "@talk-to-god/shared";
import { getGuestId } from "./guest";

const headers = () => ({
  "Content-Type": "application/json",
  "X-Guest-Id": getGuestId(),
});

export async function fetchPhilosophers(params?: {
  era?: string;
  region?: string;
  q?: string;
}): Promise<Philosopher[]> {
  const search = new URLSearchParams();
  if (params?.era) search.set("era", params.era);
  if (params?.region) search.set("region", params.region);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString();
  const res = await fetch(`/api/philosophers${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("获取哲学家列表失败");
  return res.json();
}

export async function fetchPhilosopher(id: string): Promise<Philosopher> {
  const res = await fetch(`/api/philosophers/${id}`);
  if (!res.ok) throw new Error("获取哲学家详情失败");
  return res.json();
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/conversations", { headers: headers() });
  if (!res.ok) throw new Error("获取会话列表失败");
  return res.json();
}

export async function createConversation(philosopherId: string): Promise<{
  id: string;
  philosopherId: string;
  openingLine?: string;
}> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ philosopherId }),
  });
  if (!res.ok) throw new Error("创建会话失败");
  return res.json();
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("获取消息失败");
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("删除会话失败");
}

export async function sendMessageStream(
  conversationId: string,
  content: string,
  onToken: (token: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(`/api/chat/${conversationId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "请求失败" }));
    onError(err.error || "请求失败");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("无法读取响应流");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === "token") onToken(event.content);
        else if (event.type === "done") onDone(event.messageId);
        else if (event.type === "error") onError(event.content);
      } catch {
        // skip
      }
    }
  }
}
