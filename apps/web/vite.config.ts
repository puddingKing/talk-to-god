import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/";

  return {
    base,
    plugins: [react()],
    server: {
      port: 5180,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3002",
          changeOrigin: true,
        },
      },
    },
  };
});
