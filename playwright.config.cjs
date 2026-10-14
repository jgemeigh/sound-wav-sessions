const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/browser', timeout: 30000, workers: 1,
  outputDir: 'node_modules/.cache/soundwav-results',
  use: { channel: 'chrome', baseURL: process.env.SOUNDWAV_TEST_URL || 'http://127.0.0.1:4187', headless: true },
  webServer: process.env.SOUNDWAV_TEST_URL ? undefined : {
    command: 'node tests/browser/server.cjs', url: 'http://127.0.0.1:4187', reuseExistingServer: false
  }
});
