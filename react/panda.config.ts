import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      tokens: {
        colors: {
          "Corporate/Accent": { value: "#2164BE" },
          "Grayscale/Black": { value: "#1A141F" },
          "Grayscale/Border": { value: "#ABA7AF" },
          "Grayscale/Disabled": { value: "#D4D2D5" },
          "Grayscale/SpacerLight": { value: "#E5E0EB" },
          "Informing/Link": { value: "#0F0BAB" },
          "Complementary/Blue": { value: "#EBF6FF" },
        },
        fontSizes: {
          "Body/XS": { value: "0.75rem" /* 12px */ },
          "Body/S": { value: "0.875rem" /* 14px */ },
          "Body/M": { value: "1rem" /* 16px */ },
          "Body/L": { value: "1.125rem" /* 18px */ },
          "Headline/H4": { value: "1.125rem" /* 18px */ },
          "Headline/H3": { value: "1.5rem" /* 24px */ },
          "Headline/H2": { value: "2rem" /* 32px */ },
          "Headline/H1": { value: "2.25rem" /* 36px */ },
        },
        radii: {
          Button: { value: "150px" },
        },
        shadows: {
          S: { value: "0 8px 16px 0 rgba(62, 19, 77, 0.07)" },
          M: { value: "0 15px 30px 0 rgba(62, 19, 77, 0.09)" },
          L: { value: "0 10px 30px 0 rgba(62, 19, 77, 0.47)" },
          Sidebar: { value: "8px 0 30px 0 rgba(62, 19, 77, 0.09)" },
        },
      },
    },
  },
  jsxFramework: "react",
  outdir: "styled-system",
});
