import { expect, Page, test } from '@playwright/test';

/**
 * Runtime coverage for the library. The unit tests cover the DOM helper that
 * replaced jQuery in v8.0.0; these drive the real thing in a real browser,
 * which is the only way to catch a regression in the scroll maths or in the
 * shadow-DOM lookups the services rely on.
 */

/** Vertical translation currently applied to an element, in px (negative = moved up). */
const translateY = async (page: Page, selector: string): Promise<number> => {
	return page.evaluate(sel => {
		const el = document.querySelector(sel);
		if (!el) {
			throw new Error(`no element for ${sel}`);
		}
		const transform = getComputedStyle(el).transform;
		if (!transform || transform === 'none') {
			return 0;
		}
		// matrix(a, b, c, d, tx, ty) | matrix3d(... , tx, ty, tz, 1)
		const parts = transform.replace(/^matrix(3d)?\(/, '').replace(/\)$/, '').split(',').map(Number);
		return parts.length === 16 ? parts[13] : parts[5];
	}, selector);
};

/** Scroll an ion-content via its own API so Ionic emits real ionScroll events. */
const scrollTo = async (page: Page, testId: string, y: number): Promise<void> => {
	await page.evaluate(
		async ({ testId, y }) => {
			const content = document.querySelector(`ion-content[data-testid="${testId}"]`) as any;
			await content.componentOnReady?.();
			await content.scrollToPoint(0, y, 250);
		},
		{ testId, y }
	);
	// Let the library's rAF / timeout-driven updates settle.
	await page.waitForTimeout(600);
};

test.describe('demo index', () => {
	test('the package name links to the repository', async ({ page }) => {
		await page.goto('/');

		const link = page.locator('[data-testid="repo-link"]');
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', 'https://github.com/almothafar/ionic-hidenav');
	});
});

test.describe('library: hide header on scroll', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/#/hide-on-scroll');
		await expect(page.locator('[data-testid="library-header"]')).toBeVisible();
		// The directives resolve their pairing asynchronously via MutationObserver.
		await page.waitForTimeout(600);
	});

	test('header starts fully visible', async ({ page }) => {
		expect(await translateY(page, '[data-testid="library-header"]')).toBe(0);
	});

	test('header moves up when scrolling down', async ({ page }) => {
		await scrollTo(page, 'library-content', 400);

		const offset = await translateY(page, '[data-testid="library-header"]');
		expect(offset, 'header should have translated upward').toBeLessThan(0);
	});

	test('header comes back when scrolling to the top', async ({ page }) => {
		await scrollTo(page, 'library-content', 400);
		expect(await translateY(page, '[data-testid="library-header"]')).toBeLessThan(0);

		await scrollTo(page, 'library-content', 0);

		const offset = await translateY(page, '[data-testid="library-header"]');
		expect(offset, 'header should be restored at the top').toBe(0);
	});

	test('never hides more than its own height', async ({ page }) => {
		const height = await page
			.locator('[data-testid="library-header"]')
			.evaluate(el => (el as HTMLElement).clientHeight);

		await scrollTo(page, 'library-content', 2000);

		const offset = await translateY(page, '[data-testid="library-header"]');
		expect(Math.abs(offset)).toBeLessThanOrEqual(height + 1);
	});
});

test.describe('library: stretch header', () => {
	/** Rendered height of the <hidenav-stretchheader> host, which is what the library clamps. */
	const hostHeight = async (page: Page): Promise<number> =>
		(await page.locator('[data-testid="stretch-header"]').boundingBox())?.height ?? 0;

	test.beforeEach(async ({ page }) => {
		await page.goto('/#/stretch-header');
		await expect(page.locator('[data-testid="stretch-header"]')).toBeVisible();
		await page.waitForTimeout(800);
	});

	test('renders the projected shrink/expand and static content', async ({ page }) => {
		await expect(page.locator('[data-testid="stretch-header"] .demo-hero')).toBeVisible();
		await expect(page.locator('[data-testid="stretch-header"] .demo-static-title')).toBeVisible();
	});

	test('starts collapsed at the configured header-height', async ({ page }) => {
		// The host is clamped to `header-height` + the --ion-safe-area-top inset,
		// and clips the taller hero inside it. If that sum ever evaluates to NaN
		// no height is applied and the host falls back to the hero's own 220px.
		expect(await hostHeight(page)).toBeCloseTo(56, 0);
	});

	test('the back button navigates home', async ({ page }) => {
		// The stretch header replaces ion-toolbar entirely, so the back button has
		// to live in the projected #static bar — which the library absolutely-
		// positions over the hero, and which the demo marks pointer-events: none.
		await page.locator('[data-testid="stretch-back"]').click();

		await expect(page.locator('[data-testid="link-stretch-header"]')).toBeVisible();
		expect(new URL(page.url()).hash).toBe('#/');
	});

	test('expand() grows the header and shrink() restores it', async ({ page }) => {
		const collapsed = await hostHeight(page);

		await page.locator('[data-testid="btn-expand"]').click();
		await page.waitForTimeout(600);
		const expanded = await hostHeight(page);
		expect(expanded, 'expand() should grow the header').toBeGreaterThan(collapsed);

		await page.locator('[data-testid="btn-shrink"]').click();
		await page.waitForTimeout(600);
		expect(await hostHeight(page), 'shrink() should collapse it again').toBeLessThan(expanded);
	});
});

test.describe('modern replacement directive', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/#/modern');
		await expect(page.locator('[data-testid="modern-header"]')).toBeVisible();
		await page.waitForTimeout(400);
	});

	test('hides the header on scroll down and restores it on scroll up', async ({ page }) => {
		expect(await translateY(page, '[data-testid="modern-header"]')).toBe(0);

		await scrollTo(page, 'modern-content', 400);
		expect(await translateY(page, '[data-testid="modern-header"]')).toBeLessThan(0);

		await scrollTo(page, 'modern-content', 0);
		expect(await translateY(page, '[data-testid="modern-header"]')).toBe(0);
	});

	test('clamps to the header height', async ({ page }) => {
		const height = await page
			.locator('[data-testid="modern-header"]')
			.evaluate(el => (el as HTMLElement).clientHeight);

		await scrollTo(page, 'modern-content', 3000);

		expect(Math.abs(await translateY(page, '[data-testid="modern-header"]')))
			.toBeLessThanOrEqual(height + 1);
	});
});
