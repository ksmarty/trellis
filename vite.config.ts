import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Vite 6 rejects requests with an unknown Host header by default; the
    // preview sidecar reaches the dev server through a proxied origin.
    allowedHosts: true,
    strictPort: false,
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
