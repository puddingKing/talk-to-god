import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  normalizePhone,
  isValidPhone,
  isValidPassword,
} from "../services/auth.js";
import {
  getGuestId,
  mergeGuestIntoUser,
  resolveCurrentUser,
  toAuthUser,
} from "../services/user.js";
import { getGuestQuota } from "../services/guest-limit.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/register", async (request, reply) => {
    const { phone, password, nickname } = request.body as {
      phone?: string;
      password?: string;
      nickname?: string;
    };

    const normalizedPhone = normalizePhone(phone || "");
    if (!isValidPhone(normalizedPhone)) {
      return reply.status(400).send({ error: "请输入有效的 11 位手机号" });
    }
    if (!isValidPassword(password || "")) {
      return reply.status(400).send({ error: "密码至少 6 位" });
    }

    const existing = db.select().from(users).where(eq(users.phone, normalizedPhone)).get();
    if (existing) {
      return reply.status(409).send({ error: "该手机号已注册" });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    db.insert(users)
      .values({
        id,
        phone: normalizedPhone,
        passwordHash: hashPassword(password!),
        nickname: nickname?.trim() || `用户${normalizedPhone.slice(-4)}`,
        createdAt: now,
      })
      .run();

    mergeGuestIntoUser(getGuestId(request), id);

    const user = db.select().from(users).where(eq(users.id, id)).get()!;
    return { token: signToken(id), user: toAuthUser(user) };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const { phone, password } = request.body as { phone?: string; password?: string };
    const normalizedPhone = normalizePhone(phone || "");

    const user = db.select().from(users).where(eq(users.phone, normalizedPhone)).get();
    if (!user?.passwordHash || !verifyPassword(password || "", user.passwordHash)) {
      return reply.status(401).send({ error: "手机号或密码错误" });
    }

    mergeGuestIntoUser(getGuestId(request), user.id);

    return { token: signToken(user.id), user: toAuthUser(user) };
  });

  app.get("/api/auth/me", async (request, reply) => {
    const user = resolveCurrentUser(request);
    if (!user.phone) {
      return reply.status(401).send({ error: "未登录" });
    }
    return toAuthUser(user);
  });

  app.post("/api/auth/logout", async () => ({ ok: true }));

  app.get("/api/auth/guest-quota", async (request) => {
    const user = resolveCurrentUser(request);
    return getGuestQuota(user);
  });
}
