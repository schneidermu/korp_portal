import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const conf = {
    base: "/vite/",
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };

  if (mode === "development") return conf;

  return {
    ...conf,
    base: "/o/korp-portal-portlet/dist/",
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "index.js",
          assetFileNames: "[name].[ext]",
        },
      },
    },
  };
});
