import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';
import { getEnvironment } from './config/env';
import { type EnvironmentProject } from './config/types/types';

const env = getEnvironment();

type PlaywrightProject = NonNullable<PlaywrightTestConfig['projects']>[number];

const availableProjects: Record<EnvironmentProject, PlaywrightProject> = {
  chromium: {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  firefox: {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  webkit: {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  'mobile-chrome': {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 10 Pro'] },
  },
  'mobile-safari': {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 17'] },
  },
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: env.timeout,
  metadata: {
    baseApiURL: env.baseApiURL,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: env.retries,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* UI base URL to use in actions like `await page.goto('')`. */
    baseURL: env.baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for the selected environment */
  projects: env.projects.map((projectName) => availableProjects[projectName]),

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
