import type { Philosopher, Conversation, Message, AuthUser, AuthResponse, GuestQuota } from "@talk-to-god/shared";
import { getGuestId } from "./guest";
import { getToken } from "./auth";
import { apiUrl } from "./paths";

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Guest-Id": getGuestId(),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const err = await res.json().catch(() => ({ error: fallback }));
  throw new Error(err.error || fallback);
}

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
  const res = await fetch(apiUrl(`/api/philosophers${qs ? `?${qs}` : ""}`));
  if (!res.ok) throw new Error("获取哲学家列表失败");
  return res.json();
}

export async function fetchPhilosopher(id: string): Promise<Philosopher> {
  const res = await fetch(apiUrl(`/api/philosophers/${id}`));
  if (!res.ok) throw new Error("获取哲学家详情失败");
  return res.json();
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(apiUrl("/api/conversations"), { headers: apiHeaders() });
  if (!res.ok) throw new Error("获取会话列表失败");
  return res.json();
}

export async function createConversation(philosopherId: string): Promise<{
  id: string;
  philosopherId: string;
  openingLine?: string;
}> {
  const res = await fetch(apiUrl("/api/conversations"), {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ philosopherId }),
  });
  if (!res.ok) throw new Error("创建会话失败");
  return res.json();
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(apiUrl(`/api/conversations/${conversationId}/messages`), {
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error("获取消息失败");
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/conversations/${id}`), {
    method: "DELETE",
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error("删除会话失败");
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) await parseError(res, "登录失败");
  return res.json();
}

export async function register(
  phone: string,
  password: string,
  nickname?: string
): Promise<AuthResponse> {
  const res = await fetch(apiUrl("/api/auth/register"), {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ phone, password, nickname }),
  });
  if (!res.ok) await parseError(res, "注册失败");
  return res.json();
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await fetch(apiUrl("/api/auth/me"), { headers: apiHeaders() });
  if (!res.ok) await parseError(res, "未登录");
  return res.json();
}

export async function fetchGuestQuota(): Promise<GuestQuota> {
  const res = await fetch(apiUrl("/api/auth/guest-quota"), { headers: apiHeaders() });
  if (!res.ok) throw new Error("获取游客额度失败");
  return res.json();
}

export async function sendMessageStream(
  conversationId: string,
  content: string,
  onToken: (token: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(apiUrl(`/api/chat/${conversationId}`), {
    method: "POST",
    headers: apiHeaders(),
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
