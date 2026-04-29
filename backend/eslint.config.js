const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);