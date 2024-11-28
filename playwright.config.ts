import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
//   testDir: './tests', // Specify the directory containing your test files
  timeout: 0,
  expect: {
    timeout: 0,
  },
  fullyParallel: true,
  retries: 1,
  workers: 5,
  //reporter: [
  
  //],
  reporter: [['list']],
  use: {
    // trace: 'on-first-retry',
    // baseURL: 'http://localhost:3000',
    // Add other configuration options here
  },
  projects: [
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
   {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});