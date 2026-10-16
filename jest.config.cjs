/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch:       ['**/tests/unit/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: { lines: 80 },
  },
};
