'use strict';

const js      = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files:           ['src/**/*.js', 'server.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console':     'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files:           ['tests/unit/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
    rules: {
      'no-console':     'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
