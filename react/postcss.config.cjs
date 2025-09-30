module.exports = {
  plugins: {
    "@pandacss/dev/postcss": {},
    ...(process.env.VITE_LIFERAY_EMBED === "true" && {
      "@csstools/postcss-cascade-layers": {},
    }),
  },
};

