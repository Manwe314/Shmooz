/* eslint-env node */

/** Flat config for ESLint v9+ with Angular + TS + template linting */
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

const simpleImportSort = require('eslint-plugin-simple-import-sort');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '**/*.min.js',
      '**/*.map',
    ],
  },

  // TypeScript + Angular rules (and inline template extraction)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false, // keep false unless you need type-aware rules
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angular,
      'simple-import-sort': simpleImportSort,
      'unused-imports': require('eslint-plugin-unused-imports'),
    },
    processor: angularTemplate.processors['extract-inline-html'],
    rules: {
      // Sort imports/exports (nice polish)
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    
      // Auto-remove unused imports
      'unused-imports/no-unused-imports': 'error',
    
      // For variables/params: warn, and allow _prefix to intentionally ignore
      '@typescript-eslint/no-unused-vars': 'off', // disable to avoid duplication
      'unused-imports/no-unused-vars': ['warn', {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      }],
  
      // Angular naming rules (keep as you prefer)
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
    },
  },

  // Standalone Angular template files (*.html)
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'warn',
      '@angular-eslint/template/eqeqeq': 'warn',
      '@angular-eslint/template/no-call-expression': 'off',
    },
  },
];
