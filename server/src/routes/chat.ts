import type { FastifyInstance } from "fastify";
import { getConfig } from "../config.js";
import { db } from "../db/index.js";
import { philosophers, conversations, messages, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  streamChatCompletion,
  buildSystemPrompt,
  trimContextMessages,
  type ChatMessage,
} from "../services/llm.js";

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

export async function chatRoutes(app: FastifyInstance) {
  app.post("/api/chat/:conversationId", async (request, reply) => {
    const { conversationId } = request.params as { conversationId: string };
    const { content } = request.body as { content: string };
    const guestId = (request.headers["x-guest-id"] as string) || "anonymous";

    if (!content?.trim()) {
      return reply.status(400).send({ error: "消息内容不能为空" });
    }

    const { apiKey, baseUrl, model } = getConfig().llm;
    if (!apiKey) {
      return reply.status(503).send({ error: "LLM API 未配置，请在 .env 中设置 LLM_API_KEY" });
    }

    const user = getOrCreateGuestUser(guestId);
    const conv = db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)))
      .get();

    if (!conv) return reply.status(404).send({ error: "会话不存在" });

    const phil = db.select().from(philosophers).where(eq(philosophers.id, conv.philosopherId)).get();
    if (!phil) return reply.status(404).send({ error: "哲学家不存在" });

    const now = new Date().toISOString();
    const userMsgId = uuidv4();
    db.insert(messages).values({
      id: userMsgId,
      conversationId,
      role: "user",
      content: content.trim(),
      createdAt: now,
    }).run();

    const history = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)
      .all();

    const chatMessages: ChatMessage[] = trimContextMessages([
      { role: "system", content: buildSystemPrompt(phil.personaPrompt) },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]);

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": getConfig().corsOrigin || "*",
    });

    const assistantMsgId = uuidv4();
    let fullContent = "";

    try {
      for await (const token of streamChatCompletion(chatMessages, apiKey, baseUrl, model)) {
        fullContent += token;
        reply.raw.write(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`);
      }

      const assistantNow = new Date().toISOString();
      db.insert(messages).values({
        id: assistantMsgId,
        conversationId,
        role: "assistant",
        content: fullContent,
        createdAt: assistantNow,
      }).run();

      db.update(conversations)
        .set({ updatedAt: assistantNow })
        .where(eq(conversations.id, conversationId))
        .run();

      reply.raw.write(
        `data: ${JSON.stringify({ type: "done", messageId: assistantMsgId })}\n\n`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "未知错误";
      reply.raw.write(`data: ${JSON.stringify({ type: "error", content: message })}\n\n`);
    }

    reply.raw.end();
  });
}
