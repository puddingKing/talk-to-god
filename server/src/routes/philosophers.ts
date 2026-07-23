import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { philosophers, conversations, messages, users } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { mapPhilosopher } from "../services/philosopher.js";
import { v4 as uuidv4 } from "uuid";

function getOrCreateGuestUser(guestId: string) {
  let user = db.select().from(users).where(eq(users.guestId, guestId)).get();
  if (!user) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.insert(users).values({ id, guestId, createdAt: now }).run();
    user = { id, guestId, createdAt: now };
  }
  return user;
}

export async function philosopherRoutes(app: FastifyInstance) {
  app.get("/api/philosophers", async (request) => {
    const { era, region, q } = request.query as { era?: string; region?: string; q?: string };
    let rows = db.select().from(philosophers).all();

    if (era) rows = rows.filter((r) => r.era === era);
    if (region) rows = rows.filter((r) => r.region === region);
    if (q) {
      const keyword = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          (r.nameEn?.toLowerCase().includes(keyword) ?? false) ||
          (r.tagline?.toLowerCase().includes(keyword) ?? false) ||
          JSON.parse(r.keyConcepts).some((c: string) => c.toLowerCase().includes(keyword))
      );
    }

    return rows.map((r) => mapPhilosopher(r));
  });

  app.get("/api/philosophers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(philosophers).where(eq(philosophers.id, id)).get();
    if (!row) return reply.status(404).send({ error: "哲学家不存在" });
    return mapPhilosopher(row);
  });
}

export async function conversationRoutes(app: FastifyInstance) {
  app.get("/api/conversations", async (request) => {
    const guestId = (request.headers["x-guest-id"] as string) || "anonymous";
    const user = getOrCreateGuestUser(guestId);

    const convs = db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt))
      .all();

    return convs.map((c) => {
      const phil = db.select().from(philosophers).where(eq(philosophers.id, c.philosopherId)).get();
      const lastMsg = db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .orderBy(desc(messages.createdAt))
        .get();

      return {
        id: c.id,
        philosopherId: c.philosopherId,
        philosopherName: phil?.name ?? "",
        philosopherAvatar: phil?.avatarUrl ?? undefined,
        title: c.title ?? undefined,
        lastMessage: lastMsg?.content?.slice(0, 80),
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
      };
    });
  });

  app.post("/api/conversations", async (request, reply) => {
    const guestId = (request.headers["x-guest-id"] as string) || "anonymous";
    const user = getOrCreateGuestUser(guestId);
    const { philosopherId } = request.body as { philosopherId: string };

    const phil = db.select().from(philosophers).where(eq(philosophers.id, philosopherId)).get();
    if (!phil) return reply.status(404).send({ error: "哲学家不存在" });

    const now = new Date().toISOString();
    const convId = uuidv4();

    db.insert(conversations).values({
      id: convId,
      userId: user.id,
      philosopherId,
      title: `与${phil.name}的对话`,
      createdAt: now,
      updatedAt: now,
    }).run();

    if (phil.openingLine) {
      db.insert(messages).values({
        id: uuidv4(),
        conversationId: convId,
        role: "assistant",
        content: phil.openingLine,
        createdAt: now,
      }).run();
    }

    return { id: convId, philosopherId, openingLine: phil.openingLine };
  });

  app.get("/api/conversations/:id/messages", async (request, reply) => {
    const { id } = request.params as { id: string };
    const guestId = (request.headers["x-guest-id"] as string) || "anonymous";
    const user = getOrCreateGuestUser(guestId);

    const conv = db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, user.id))).get();
    if (!conv) return reply.status(404).send({ error: "会话不存在" });

    const msgs = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt)
      .all();

    return msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  });

  app.delete("/api/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const guestId = (request.headers["x-guest-id"] as string) || "anonymous";
    const user = getOrCreateGuestUser(guestId);

    const conv = db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, user.id))).get();
    if (!conv) return reply.status(404).send({ error: "会话不存在" });

    db.delete(messages).where(eq(messages.conversationId, id)).run();
    db.delete(conversations).where(eq(conversations.id, id)).run();
    return { ok: true };
  });
}
