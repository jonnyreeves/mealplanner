module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  ignorePatterns: [
    "lambda/local-debugger.js"
  ],
  rules: {
    "no-console": "off"
  },
};
