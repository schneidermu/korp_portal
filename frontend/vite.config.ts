import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/o/korp-portal-portlet/dist/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
