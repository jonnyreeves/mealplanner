module.exports = {
  env: {
    'googleappsscript/googleappsscript': true,
  },
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'script',
  },
  plugins: [
    'googleappsscript',
  ],
  rules: {
    'no-use-before-define': 'off',
  },
  ignorePatterns: ['Code.js', 'Menu.js', 'ShoppingList.js'],
};
