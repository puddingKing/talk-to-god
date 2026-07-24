import type { FastifyRequest, FastifyReply } from "fastify";
import { getConfig } from "../config.js";

export function verifyAdminKey(request: FastifyRequest): boolean {
  const secret = getConfig().adminSecret;
  if (!secret) return false;

  const headerKey = request.headers["x-admin-key"] as string | undefined;
  const auth = request.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const key = headerKey || bearer;
  return Boolean(key && key === secret);
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!getConfig().adminSecret) {
    return reply.status(503).send({ error: "后台未配置，请在 .env 中设置 ADMIN_SECRET" });
  }
  if (!verifyAdminKey(request)) {
    return reply.status(401).send({ error: "无效的管理员密钥" });
  }
}
