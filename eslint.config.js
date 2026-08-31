import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },

  // Frontend (browser, React)
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
    },
  },
  // Frontend tests: Vitest globals on top of the browser rules above
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test-setup.js'],
    languageOptions: {
      // `global` is available too: Vitest polyfills it even in the jsdom environment.
      globals: { ...globals.browser, ...globals.es2021, ...globals.vitest, global: 'readonly' },
    },
  },

  // Backend (Node: serverless functions, scripts, dev server)
  {
    files: ['api/**/*.js', 'scripts/**/*.js', 'dev-server.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['api/**/*.test.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021, ...globals.vitest },
    },
  },
];
