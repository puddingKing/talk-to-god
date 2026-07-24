import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { conversations, messages, users } from "../db/schema.js";
import type { DbUser } from "./user.js";

export function mapUserAdmin(user: DbUser, conversationCount: number) {
  return {
    id: user.id,
    phone: user.phone ?? undefined,
    nickname: user.nickname ?? undefined,
    guestId: user.guestId ?? undefined,
    isGuest: !user.phone,
    createdAt: user.createdAt,
    conversationCount,
  };
}

export function countConversations(userId: string): number {
  return db.select().from(conversations).where(eq(conversations.userId, userId)).all().length;
}

export function listUsersAdmin() {
  const rows = db.select().from(users).all();
  return rows
    .map((user) => mapUserAdmin(user, countConversations(user.id)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserAdmin(id: string) {
  const user = db.select().from(users).where(eq(users.id, id)).get();
  if (!user) return null;
  return mapUserAdmin(user, countConversations(id));
}

export function deleteUserAdmin(id: string): boolean {
  const user = db.select().from(users).where(eq(users.id, id)).get();
  if (!user) return false;

  const convs = db.select().from(conversations).where(eq(conversations.userId, id)).all();
  for (const conv of convs) {
    db.delete(messages).where(eq(messages.conversationId, conv.id)).run();
  }
  db.delete(conversations).where(eq(conversations.userId, id)).run();
  db.delete(users).where(eq(users.id, id)).run();
  return true;
}

export function updateUserAdmin(
  id: string,
  data: { nickname?: string; passwordHash?: string }
): DbUser | null {
  const user = db.select().from(users).where(eq(users.id, id)).get();
  if (!user) return null;

  const updates: Partial<typeof users.$inferInsert> = {};
  if (data.nickname !== undefined) {
    updates.nickname = data.nickname.trim() || null;
  }
  if (data.passwordHash !== undefined) {
    updates.passwordHash = data.passwordHash;
  }

  if (Object.keys(updates).length > 0) {
    db.update(users).set(updates).where(eq(users.id, id)).run();
  }

  return db.select().from(users).where(eq(users.id, id)).get() ?? null;
}
