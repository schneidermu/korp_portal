/** @type {import('tailwindcss').Config} */
export default {
  important: ".korp-portal-portlet",
  safelist: ["text-excel", "text-word"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontWeight: {
      extralight: 300,
      light: 400,
      normal: 500,
      medium: 600,
    },
    colors: {
      white: "#ffffff",
      blue: "#004199",
      "light-blue": "#2F80ED",
      "light-gray": "#F3F3F3",
      "medium-gray": "#C4C4C4",
      gray: "#656565",
      "dark-gray": "#8C8C8C",
      word: "#2F80ED",
      excel: "#5AC75C",
    },
    borderRadius: {
      none: "0",
      photo: "5px",
      DEFAULT: "10px",
    },
    extend: {},
  },
  plugins: [],
};
