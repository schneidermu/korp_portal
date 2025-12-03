import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const conf = {
    base: "/vite/",
    plugins: [react(), tsconfigPaths()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests.ts",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@styled-system": path.resolve(__dirname, "./styled-system/"),
        "@app": path.resolve(__dirname, "./src/v2/app"),
        "@api": path.resolve(__dirname, "./src/v2/api"),
        "@view": path.resolve(__dirname, "./src/v2/view"),
        "@ui": path.resolve(__dirname, "./src/v2/ui/"),
        "@util": path.resolve(__dirname, "./src/v2/util"),
        "@page": path.resolve(__dirname, "./src/v2/page"),
      },
    },
  };

  if (mode === "development") return conf;

  return {
    ...conf,
    base: "/o/korp-portal-portlet/dist/",
  };
});
