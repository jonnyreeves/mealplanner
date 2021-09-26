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
    'class-methods-use-this': 'off',
    'max-classes-per-file': 'off',
  },
  ignorePatterns: ['Code.js', 'Menu.js', 'ShoppingList.js'],
};
