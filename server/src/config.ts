import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

export function normalizeBaseUrl(baseUrl: string): string {
  const url = baseUrl.replace(/\/$/, "");
  return url.endsWith("/v1") ? url : `${url}/v1`;
}

export function getConfig() {
  return {
    port: Number(process.env.PORT) || 3001,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    databaseUrl: process.env.DATABASE_URL || "./data/talk-to-god.db",
    llm: {
      apiKey: process.env.LLM_API_KEY || "",
      baseUrl: normalizeBaseUrl(process.env.LLM_BASE_URL || "https://api.deepseek.com"),
      model: process.env.LLM_MODEL || "deepseek-v4-flash",
    },
  };
}
