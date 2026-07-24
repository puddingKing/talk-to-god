import type { FastifyInstance } from "fastify";
import { hashPassword, isValidPassword } from "../../services/auth.js";
import { requireAdmin } from "../../middleware/admin-auth.js";
import {
  deleteUserAdmin,
  getUserAdmin,
  listUsersAdmin,
  mapUserAdmin,
  updateUserAdmin,
  countConversations,
} from "../../services/user-admin.js";

export async function adminUserRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAdmin);

  app.get("/api/admin/users", async () => listUsersAdmin());

  app.get("/api/admin/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getUserAdmin(id);
    if (!user) return reply.status(404).send({ error: "用户不存在" });
    return user;
  });

  app.put("/api/admin/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { nickname?: string; password?: string };

    const existing = getUserAdmin(id);
    if (!existing) return reply.status(404).send({ error: "用户不存在" });

    if (body.password !== undefined && body.password !== "") {
      if (!isValidPassword(body.password)) {
        return reply.status(400).send({ error: "密码至少 6 位" });
      }
      if (existing.isGuest) {
        return reply.status(400).send({ error: "游客账号无法设置密码" });
      }
    }

    const updated = updateUserAdmin(id, {
      nickname: body.nickname,
      passwordHash:
        body.password && body.password.length > 0 ? hashPassword(body.password) : undefined,
    });

    if (!updated) return reply.status(404).send({ error: "用户不存在" });
    return mapUserAdmin(updated, countConversations(id));
  });

  app.delete("/api/admin/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const ok = deleteUserAdmin(id);
    if (!ok) return reply.status(404).send({ error: "用户不存在" });
    return { ok: true };
  });
}
