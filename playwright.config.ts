import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';
import { getEnvironment } from './config/env';
import { type EnvironmentProject } from './config/types/types';

const env = getEnvironment();

type PlaywrightProject = NonNullable<PlaywrightTestConfig['projects']>[number];

const availableProjects: Record<EnvironmentProject, PlaywrightProject> = {
  chromium: {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], headless: env.headless },
  },
  firefox: {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'], headless: env.headless },
  },
  webkit: {
    name: 'webkit',
    use: { ...devices['Desktop Safari'], headless: env.headless },
  },
  'mobile-chrome': {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 10 Pro'], headless: env.headless },
  },
  'mobile-safari': {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 17'], headless: env.headless },
  },
};

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
    testIdAttribute: 'data-test',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Run API tests once and other tests in the selected browser projects. */
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.baseApiURL },
    },
    ...env.projects.map((projectName) => ({
      ...availableProjects[projectName],
      testIgnore: '**/tests/api/**',
    })),
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
