import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8083",
      "/ws": {
        target: "ws://localhost:8083",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../backend/src/main/resources/static",
    emptyOutDir: true,
  },
});

