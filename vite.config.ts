import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:15889",
        changeOrigin: true,
        rewrite: (path) => {
          console.log("rewrite ", path);
          return path;
        },
      },
    },
  },
  plugins: [react()],
});
