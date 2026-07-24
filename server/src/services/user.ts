import type { FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { conversations, users } from "../db/schema.js";
import { verifyToken } from "./auth.js";

export type DbUser = typeof users.$inferSelect;

export function toAuthUser(user: DbUser) {
  return {
    id: user.id,
    phone: user.phone ?? undefined,
    nickname: user.nickname ?? undefined,
    isGuest: !user.phone,
  };
}

export function getGuestId(request: FastifyRequest): string {
  return (request.headers["x-guest-id"] as string) || "anonymous";
}

export function getBearerToken(request: FastifyRequest): string | null {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function getOrCreateGuestUser(guestId: string): DbUser {
  let user = db.select().from(users).where(eq(users.guestId, guestId)).get();
  if (!user) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.insert(users).values({ id, guestId, createdAt: now }).run();
    user = db.select().from(users).where(eq(users.id, id)).get()!;
  }
  return user;
}

export function resolveCurrentUser(request: FastifyRequest): DbUser {
  const token = getBearerToken(request);
  if (token) {
    const userId = verifyToken(token);
    if (userId) {
      const user = db.select().from(users).where(eq(users.id, userId)).get();
      if (user) return user;
    }
  }
  return getOrCreateGuestUser(getGuestId(request));
}

export function mergeGuestIntoUser(guestId: string, targetUserId: string) {
  const guest = db.select().from(users).where(eq(users.guestId, guestId)).get();
  if (!guest || guest.id === targetUserId) return;

  db.update(conversations)
    .set({ userId: targetUserId })
    .where(eq(conversations.userId, guest.id))
    .run();
}
