import { eq, and, sql } from "drizzle-orm";
import { getConfig } from "../config.js";
import { db } from "../db/index.js";
import { conversations, messages } from "../db/schema.js";
import type { DbUser } from "./user.js";

export function isRegisteredUser(user: DbUser): boolean {
  return Boolean(user.phone);
}

export function getGuestMessageLimit(): number {
  return getConfig().guestMessageLimit;
}

export function countGuestUserMessages(userId: string): number {
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(and(eq(conversations.userId, userId), eq(messages.role, "user")))
    .get();

  return Number(row?.count ?? 0);
}

export function getGuestQuota(user: DbUser) {
  const limit = getGuestMessageLimit();
  if (isRegisteredUser(user)) {
    return { isGuest: false, used: 0, limit, remaining: limit };
  }

  const used = countGuestUserMessages(user.id);
  return {
    isGuest: true,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export function checkGuestCanSend(user: DbUser): { allowed: boolean; message?: string } {
  if (isRegisteredUser(user)) return { allowed: true };

  const { used, limit } = getGuestQuota(user);
  if (used >= limit) {
    return {
      allowed: false,
      message: `您处于游客模式，最多只能发送 ${limit} 条消息，请登录后继续对话`,
    };
  }
  return { allowed: true };
}
