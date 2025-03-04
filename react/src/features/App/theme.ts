import { defineConfig } from "@chakra-ui/react";

// https://stackoverflow.com/questions/75402955/chakra-ui-theme-not-rendering

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      spacing: {
        header: { value: "40px" },
      },
      colors: {
        red: {
          DEFAULT: { value: "#0f0" },
          200: { value: "#00f" },
        },
      },
    },
  },
});

export default config;
