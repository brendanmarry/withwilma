module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript"],
  parserOptions: {
    project: true,
  },
  rules: {
    "@next/next/no-img-element": "off",
  },
};
