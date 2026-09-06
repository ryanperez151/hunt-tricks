import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

const screenshotDirectory = resolve("test-results", "task-11-screenshots");

async function capture(page: Page, testInfo: TestInfo, name: string, fullPage = true) {
  mkdirSync(screenshotDirectory, { recursive: true });
  await page.screenshot({
    animations: "disabled",
    fullPage,
    path: resolve(screenshotDirectory, `${testInfo.project.name}-${name}.png`),
  });
}

async function expectNoDocumentOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))).toEqual({ clientWidth: page.viewportSize()!.width, scrollWidth: page.viewportSize()!.width });
}

async function expectLocalScroller(scroller: Locator) {
  await expect(scroller).toBeVisible();
  const dimensions = await scroller.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThanOrEqual(dimensions.clientWidth);
  await expect(scroller).toHaveAttribute("tabindex", "0");
  await expect(scroller).toHaveAttribute("role", "region");
  await expect(scroller).toHaveAccessibleName(/scroll horizontally/i);
}

test("required pages contain overflow locally and produce release-review screenshots", async ({ page }, testInfo) => {
  await page.goto("/");
  await expectNoDocumentOverflow(page);
  await capture(page, testInfo, "home");

  await page.goto("/hunts/");
  await expectNoDocumentOverflow(page);
  await capture(page, testInfo, "hunt-catalog");

  await page.goto("/hunts/snmp-fan-out/");
  await expectNoDocumentOverflow(page);
  await expectLocalScroller(page.locator(".code-block__source").first());
  await expectLocalScroller(page.locator(".network-flow__canvas").first());
  await capture(page, testInfo, "flagship-hunt");

  await page.goto("/protocols/snmp/");
  await expectNoDocumentOverflow(page);
  await expectLocalScroller(page.locator(".network-flow__canvas").first());
  await capture(page, testInfo, "protocol-snmp");

  await page.goto("/telemetry/");
  await expectNoDocumentOverflow(page);
  const tableScroller = page.locator(".telemetry-matrix-scroll");
  await expectLocalScroller(tableScroller);
  const firstDisclosure = tableScroller.getByRole("button").first();
  await expect(firstDisclosure).toHaveAttribute("aria-expanded", "false");
  await firstDisclosure.click();
  await expect(firstDisclosure).toHaveAttribute("aria-expanded", "true");
  await expect(tableScroller.getByRole("region", { name: /collection and investigation guidance/i })).toBeVisible();
  await capture(page, testInfo, "telemetry");

  await page.goto("/queries/");
  await expectNoDocumentOverflow(page);
  await expectLocalScroller(page.locator(".code-block__source").first());
  await capture(page, testInfo, "query-library");
  await capture(page, testInfo, "query-library-viewport", false);

  await page.getByRole("button", { name: "Search guide" }).click();
  await expect(page.getByRole("combobox", { name: "Search guide" })).toBeFocused();
  await capture(page, testInfo, "search-dialog");
  await capture(page, testInfo, "search-dialog-viewport", false);
});

test("mobile navigation restores focus and filter controls meet touch sizing", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only assertions");
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const navigationDialog = page.getByRole("dialog", { name: "Navigation" });
  await expect(navigationDialog).toBeVisible();
  await expect(navigationDialog.getByRole("button", { name: "Close navigation" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigationDialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await navigationDialog.getByRole("link", { name: "Hunts", exact: true }).click();
  await expect(page).toHaveURL(/\/hunts\/$/);
  await page.getByText("Infrastructure and advanced filters", { exact: true }).click();
  await page.getByRole("listbox", { name: "Protocol", exact: true }).selectOption("SNMP");

  for (const button of [
    page.getByRole("button", { name: "Remove protocol SNMP filter" }),
    page.getByRole("button", { name: "Clear all filters" }),
  ]) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("desktop navigation and comparison retain their wide layout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop-only assertions");
  await page.goto("/hunts/snmp-fan-out/");

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
  const flows = page.locator(".behavior-comparison__flow");
  await expect(flows).toHaveCount(2);
  const expectedBox = await flows.nth(0).boundingBox();
  const suspiciousBox = await flows.nth(1).boundingBox();
  expect(expectedBox).not.toBeNull();
  expect(suspiciousBox).not.toBeNull();
  expect(Math.abs(expectedBox!.y - suspiciousBox!.y)).toBeLessThan(2);
  expect(suspiciousBox!.x).toBeGreaterThan(expectedBox!.x + expectedBox!.width - 2);

  await page.goto("/protocols/snmp/");
  const normalFlow = page.locator(".protocol-detail__flows .network-flow").first();
  const canvasBox = await normalFlow.locator(".network-flow__canvas").boundingBox();
  const nodes = normalFlow.locator('[data-testid="flow-node"]');
  const firstNodeBox = await nodes.first().boundingBox();
  const lastNodeBox = await nodes.last().boundingBox();
  expect(canvasBox).not.toBeNull();
  expect(firstNodeBox).not.toBeNull();
  expect(lastNodeBox).not.toBeNull();
  expect(firstNodeBox!.x).toBeGreaterThanOrEqual(canvasBox!.x);
  expect(lastNodeBox!.x + lastNodeBox!.width).toBeLessThanOrEqual(canvasBox!.x + canvasBox!.width);
});

test("reduced motion removes meaningful transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const transitionSeconds = await page.getByRole("article", { name: /SNMP Fan-Out/ }).evaluate((card) => (
    getComputedStyle(card).transitionDuration
      .split(",")
      .map((duration) => Number.parseFloat(duration) * (duration.endsWith("ms") ? 0.001 : 1))
  ));
  expect(Math.max(...transitionSeconds)).toBeLessThanOrEqual(0.001);
});
