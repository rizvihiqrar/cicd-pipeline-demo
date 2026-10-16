import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir:       './tests/integration',
  timeout:       15000,
  fullyParallel: false,
  retries:       0,
  use: {
    baseURL: 'http://localhost:3001',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  webServer: {
    command:             'node server.js',
    url:                 'http://localhost:3001/health',
    reuseExistingServer: !process.env.CI,
    timeout:             10000,
  },
});
