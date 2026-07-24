import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { philosophers } from "../../db/schema.js";
import { requireAdmin } from "../../middleware/admin-auth.js";
import {
  mapPhilosopherAdmin,
  parsePhilosopherBody,
  philosopherInputToDbValues,
  validatePhilosopherInput,
} from "../../services/philosopher-admin.js";

export async function adminPhilosopherRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAdmin);

  app.get("/api/admin/philosophers", async () => {
    const rows = db.select().from(philosophers).all();
    return rows.map((row) => mapPhilosopherAdmin(row));
  });

  app.get("/api/admin/philosophers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(philosophers).where(eq(philosophers.id, id)).get();
    if (!row) return reply.status(404).send({ error: "哲学家不存在" });
    return mapPhilosopherAdmin(row);
  });

  app.post("/api/admin/philosophers", async (request, reply) => {
    const input = parsePhilosopherBody(request.body as Record<string, unknown>);
    const error = validatePhilosopherInput(input);
    if (error) return reply.status(400).send({ error });

    const existing = db.select().from(philosophers).where(eq(philosophers.id, input.id)).get();
    if (existing) return reply.status(409).send({ error: "该 ID 已存在" });

    db.insert(philosophers).values(philosopherInputToDbValues(input)).run();
    const row = db.select().from(philosophers).where(eq(philosophers.id, input.id)).get()!;
    return mapPhilosopherAdmin(row);
  });

  app.put("/api/admin/philosophers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(philosophers).where(eq(philosophers.id, id)).get();
    if (!row) return reply.status(404).send({ error: "哲学家不存在" });

    const input = parsePhilosopherBody({ ...(request.body as Record<string, unknown>), id });
    const error = validatePhilosopherInput(input);
    if (error) return reply.status(400).send({ error });

    const values = philosopherInputToDbValues(input);
    db.update(philosophers).set(values).where(eq(philosophers.id, id)).run();
    const updated = db.select().from(philosophers).where(eq(philosophers.id, id)).get()!;
    return mapPhilosopherAdmin(updated);
  });

  app.delete("/api/admin/philosophers/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(philosophers).where(eq(philosophers.id, id)).get();
    if (!row) return reply.status(404).send({ error: "哲学家不存在" });

    db.delete(philosophers).where(eq(philosophers.id, id)).run();
    return { ok: true };
  });
}
