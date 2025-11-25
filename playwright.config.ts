import { defineConfig, devices } from '@playwright/test';

// Use environment variable for base URL (Docker sets PLAYWRIGHT_BASE_URL)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['list']] : 'html',
  
  // Global timeout settings - generous for CI/Docker
  timeout: 60000,
  expect: {
    // Web-first assertions auto-retry, so this is the max wait time
    timeout: 15000,
  },
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video on failure helps debug CI issues
    video: process.env.CI ? 'on-first-retry' : 'off',
    // Action timeout for clicks, fills, etc.
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Allow HTTP connections in Docker (non-localhost hostname)
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable web security for Docker testing with non-localhost URLs
        launchOptions: {
          args: ['--disable-web-security', '--allow-running-insecure-content'],
        },
      },
    },
  ],

  // Start webServer for local testing (skipped when PLAYWRIGHT_BASE_URL is set, i.e. Docker)
  ...(process.env.PLAYWRIGHT_BASE_URL ? {} : {
    webServer: {
      command: 'npm run build:test && npm run start',
      url: 'http://localhost:3000/solacheck',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
    },
  }),
});
