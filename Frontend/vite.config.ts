import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 6768,
    allowedHosts: ["khoakomlem-internal.ddns.net"],
    proxy: {
      "/auth-api": {
        target: "http://localhost:1510",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ""),
      },
      "/legacy-api": {
        target: "http://localhost:1515",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/legacy-api/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
