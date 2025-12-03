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
        "@legacy": path.resolve(__dirname, "./src/legacy/"),
        "@styled-system": path.resolve(__dirname, "./styled-system/"),
        "@app": path.resolve(__dirname, "./src/app/"),
        "@api": path.resolve(__dirname, "./src/api/"),
        "@view": path.resolve(__dirname, "./src/view/"),
        "@ui": path.resolve(__dirname, "./src/ui/"),
        "@util": path.resolve(__dirname, "./src/util/"),
        "@page": path.resolve(__dirname, "./src/page/"),
      },
    },
  };

  if (mode === "development") return conf;

  return {
    ...conf,
    base: "/o/korp-portal-portlet/dist/",
  };
});
