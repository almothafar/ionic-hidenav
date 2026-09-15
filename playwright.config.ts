import { defineConfig, devices } from '@playwright/test';

/**
 * The demo app is the only place this library's runtime behaviour is actually
 * exercised, so these specs double as the project's e2e suite.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'list' : 'line',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry',
	},
	projects: [
		// The library targets mobile Ionic, so drive it as a touch device.
		{
			name: 'mobile-chromium',
			use: {
				...devices['Pixel 5'],
				// Sandboxes without a matching Playwright browser build can point at a
				// preinstalled Chromium; CI uses the one `playwright install` fetches.
				launchOptions: process.env.CHROMIUM_PATH
					? { executablePath: process.env.CHROMIUM_PATH }
					: {},
			},
		},
	],
	webServer: {
		command: 'npx http-server dist/demo -p 4173 -s --proxy "http://127.0.0.1:4173?"',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
