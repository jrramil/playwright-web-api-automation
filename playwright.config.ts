import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

// -------------------------------------
// Timeout Configuration
// -------------------------------------
const testTimeoutMs = Number(process.env.TEST_TIMEOUT_MS ?? 300_000); // 5 minutes
const expectTimeoutMs = Number(process.env.EXPECT_TIMEOUT_MS ?? 60_000); // 1 minute
const actionTimeoutMs = Number(process.env.ACTION_TIMEOUT_MS ?? 10_000); // 10 seconds
const navigationTimeoutMs = Number(process.env.NAVIGATION_TIMEOUT_MS ?? 30_000); // 30 seconds

// -------------------------------------
// Browser Switch Logic
// -------------------------------------
const browserEnv = (process.env.BROWSER ?? 'chromium').toLowerCase();
const maximized = (process.env.MAXIMIZED ?? '').toLowerCase() === 'true';

function getProjects(): PlaywrightTestConfig['projects'] {
  const allProjects = [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(maximized
          ? { viewport: null, deviceScaleFactor: undefined, launchOptions: { args: ['--start-maximized'] } }
          : {}),
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ];

  if (browserEnv === 'all') return allProjects;

  const selected = allProjects.find((p) => p.name === browserEnv);

  if (!selected) {
    throw new Error(`Invalid BROWSER value: "${browserEnv}". Allowed values: chromium | firefox | webkit | all`);
  }

  return [selected];
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  timeout: testTimeoutMs,
  expect: {
    timeout: expectTimeoutMs,
  },
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: actionTimeoutMs,
    navigationTimeout: navigationTimeoutMs,
    viewport: maximized ? null : { width: 1920, height: 1080 },
    permissions: ['clipboard-read', 'clipboard-write'],
    // storageState: 'auth.json',
  },
  projects: getProjects(),
});
