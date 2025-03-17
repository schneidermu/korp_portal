import { defineConfig, createSystem } from "@chakra-ui/react";

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {},
    },
  },
});

export const system = createSystem(config);
