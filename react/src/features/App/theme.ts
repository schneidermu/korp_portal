import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {
        gray: {
          1: { value: "#C4C4C4" },
          2: { value: "#656565" },
          3: { value: "#8C8C8C" },
        },
        blue: {
          1: { value: "#2F80ED" },
          2: { value: "#2164BE" },
          3: { value: "#DBEAFF" },
        },
      },
      spacing: {
        DEFAULT: { value: "0" },
      },
      radii: {
        1: { value: "8px" },
        2: { value: "10px" },
        small: { value: "5px" },
      },
      fontSizes: {
        smaller: { value: "0.9375rem" }, // 15px
        larger: { value: "1.0625rem" }, // 17px
      },
      fonts: {
        heading: { value: "SF UI Display" },
        body: { value: "SF UI Display" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
