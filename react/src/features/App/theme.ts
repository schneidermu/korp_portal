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
          4: { value: "#C1C2C8" },
          5: { value: "#E5F0FF" },
          6: { value: "#AFAFAF" },
          7: { value: "#DADADA" },
          8: { value: "#E0E0E0" },
          9: { value: "#F8F8F8" },
          10: { value: "#616161" },
          11: { value: "#272727" },
        },
        blue: {
          1: { value: "#2F80ED" },
          2: { value: "#2164BE" },
          3: { value: "#DBEAFF" },
          4: { value: "#0E3C7A" },
          5: { value: "#1956A8" },
          6: { value: "#BAD4F6" },
          7: { value: "#014096" },
          8: { value: "#83B8FF" },
          9: { value: "#2F80ED" },
        },
        red: {
          1: { value: "#CF2020" },
          2: { value: "#D10000" },
        },
        orange: {
          1: { value: "#FF7B02" },
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
