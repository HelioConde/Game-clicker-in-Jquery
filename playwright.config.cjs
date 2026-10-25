const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.browser.spec.cjs",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name:"desktop-chromium", use:{...devices["Desktop Chrome"],viewport:{width:1440,height:900}} },
    { name:"mobile-chromium", use:{...devices["Pixel 7"],isMobile:true} }
  ],
  webServer: {
    command:"python3 -m http.server 4173 --bind 127.0.0.1",
    url:"http://127.0.0.1:4173",
    reuseExistingServer:!process.env.CI,
    timeout:30000
  }
});
