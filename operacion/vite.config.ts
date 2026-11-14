import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  // Tailwind entra por su plugin de Vite. Se fija PostCSS aquí para que no herede el postcss.config.js del sitio,
  // que está una carpeta arriba y es de otra versión de Tailwind.
  css: { postcss: { plugins: [] } },
  server: { port: 5173, proxy: { "/api": "http://localhost:3100" } },
  build: { outDir: "../dist", emptyOutDir: true },
});
