const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const globals = require('globals');

/**
 * Backend ESLint configuration.
 *
 * How it fits:
 * - Used by `npm run lint --prefix backend` (and CI).
 * - Treats backend test files as Jest tests so `describe/test/expect` are valid globals.
 */
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