import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const conf = {
    plugins: [react()],
  } as UserConfig;

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
