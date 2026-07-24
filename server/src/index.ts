import Fastify from "fastify";
import cors from "@fastify/cors";
import { getConfig } from "./config.js";
import { initDatabase } from "./db/index.js";
import { philosopherRoutes, conversationRoutes } from "./routes/philosophers.js";
import { chatRoutes } from "./routes/chat.js";
import { authRoutes } from "./routes/auth.js";

const { port: PORT, corsOrigin } = getConfig();

async function main() {
  initDatabase();

  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: corsOrigin || true,
    credentials: true,
  });

  app.get("/api/health", async () => ({ status: "ok", service: "talk-to-god-api" }));

  await app.register(philosopherRoutes);
  await app.register(conversationRoutes);
  await app.register(chatRoutes);
  await app.register(authRoutes);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`API 服务已启动: http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
