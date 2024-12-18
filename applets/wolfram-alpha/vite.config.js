import { defineConfig } from "vite";

export default defineConfig({
  base: "/wolfram-alpha",
  server: {
    proxy: {
      "/api/wolfram": {
        target: "https://api.wolframalpha.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wolfram/, "")
      }
    }
  }
});
