import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['tests/**', 'dist/**', 'coverage/**', 'node_modules/**', '*.js.map'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_|error' }],
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with @typescript-eslint version
      'no-undef': 'off', // TypeScript handles this
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/tests/**/*.ts', '**/tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },
];
