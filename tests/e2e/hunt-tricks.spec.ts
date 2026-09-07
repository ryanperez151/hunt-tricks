import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

test("scope and temporal filters survive navigation and reset together", async ({ page }) => {
  await page.goto("/hunts/?scope=identity&temporal=low-and-slow");
  const scope = page.getByRole("listbox", { name: "Scope", exact: true });
  const temporal = page.getByRole("listbox", { name: "Temporal pattern", exact: true });
  await expect(scope).toHaveValues(["identity"]);
  await expect(temporal).toHaveValues(["low-and-slow"]);
  await expect(page.locator(".hunt-card").first()).toBeVisible();

  await scope.selectOption("ai-systems");
  await expect(page).toHaveURL(/scope=ai-systems/);
  await expect(temporal).toHaveValues(["low-and-slow"]);
  await page.goBack();
  await expect(scope).toHaveValues(["identity"]);
  await page.getByRole("button", { name: "Clear all filters", exact: true }).click();
  await expect(page).toHaveURL(/\/hunts\/$/);
  await expect(scope).toHaveValues([]);
  await expect(temporal).toHaveValues([]);
});

test("an AI hunt exposes source evidence that resolves in the research library", async ({ page }) => {
  await page.goto("/hunts/?scope=ai-systems");
  await page.locator(".hunt-card__link").first().click();
  await expect(page.locator("h1")).toBeVisible();
  const evidenceLink = page.locator('main a[href^="/research/#"]').first();
  await expect(evidenceLink).toBeVisible();
  const href = await evidenceLink.getAttribute("href");
  await evidenceLink.click();
  await expect(page).toHaveURL(new RegExp(href!.split("#")[1] + "$"));
  const record = page.locator(`[id="${href!.split("#")[1]}"]`);
  await expect(record).toBeVisible();
  await expect(record.locator('a[href^="https://"]').first()).toHaveAttribute("rel", /noopener/);
});

test("automation comparison can be changed with the keyboard", async ({ page }) => {
  await page.goto("/methodology/velocity/");
  const timeline = page.locator(".automation-timeline");
  const scriptSteps = await timeline.locator("ol").innerText();
  const agent = timeline.getByRole("button", { name: "Autonomous agent", exact: true });
  await agent.focus();
  await page.keyboard.press("Enter");
  await expect(agent).toHaveAttribute("aria-pressed", "true");
  await expect(timeline.locator("ol")).not.toHaveText(scriptSteps);
  await expect(timeline.getByRole("button", { name: "Fixed script", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("search opens an expanded hunt with a copyable query", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("ControlOrMeta+K");
  const search = page.getByRole("combobox");
  await expect(search).toBeFocused();
  await search.fill("Agent Tool Scope Expands After a Denial");
  await page.getByRole("option", { name: /HUNT Agent Tool Scope Expands After a Denial/ }).click();
  await expect(page).toHaveURL(/\/hunts\/agent-tool-scope-escalation\/$/);
  const query = page.locator(".code-block").first();
  const expected = await query.locator("code").innerText();
  await query.getByRole("button", { name: /copy query/i }).click();
  await expect(query.getByRole("status")).toContainText("Copied");
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n"))
    .toBe(expected.replaceAll("\r\n", "\n"));
});

test("new workbench pages fit the viewport and produce review screenshots", async ({ page }, testInfo) => {
  const directory = resolve("test-results", "hunt-tricks-screenshots");
  mkdirSync(directory, { recursive: true });
  for (const [name, route] of [
    ["home", "/"],
    ["identity", "/hunts/?scope=identity"],
    ["velocity", "/methodology/velocity/"],
    ["ai-autonomy", "/methodology/ai-autonomy/"],
    ["ai-hunt", "/hunts/agent-tool-scope-escalation/"],
    ["research", "/research/"],
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(page.viewportSize()!.width);
    await page.screenshot({ path: resolve(directory, `${testInfo.project.name}-${name}.png`), fullPage: true, animations: "disabled" });
  }
});

test("query library filters survive a link out and back", async ({ page }) => {
  await page.goto("/queries/");
  await page.getByRole("listbox", { name: "Platform", exact: true }).selectOption("zeek");
  await expect(page).toHaveURL(/\/queries\/\?platform=zeek$/);

  const filteredCount = await page.getByTestId("query-card").count();
  expect(filteredCount).toBeGreaterThan(0);

  await page.getByTestId("query-card").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/hunts\/[a-z0-9-]+\/$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/queries\/\?platform=zeek$/);
  await expect(page.getByRole("listbox", { name: "Platform", exact: true })).toHaveValues(["zeek"]);
  await expect(page.getByTestId("query-card")).toHaveCount(filteredCount);
});
