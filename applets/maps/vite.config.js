import { defineConfig } from "vite";

export default defineConfig({
  base: "/maps",
  define: {
    "%VITE_GOOGLE_MAPS_API_KEY%": JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
  }
});
