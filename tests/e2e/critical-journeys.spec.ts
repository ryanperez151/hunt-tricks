import { expect, test } from "@playwright/test";

test("home to filtered hunt to copied query to related hunt", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Hunts" }).click();
  await page.getByText("Infrastructure and advanced filters", { exact: true }).click();

  const protocolFilter = page.getByRole("listbox", { name: "Protocol", exact: true });
  await protocolFilter.selectOption("SNMP");
  await expect(page).toHaveURL(/\/hunts\/\?protocol=SNMP$/);
  await expect(page.getByRole("link", { name: "SNMP Fan-Out", exact: true })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/hunts\/$/);
  await expect(protocolFilter).toHaveValues([]);

  await page.goForward();
  await expect(page).toHaveURL(/\/hunts\/\?protocol=SNMP$/);
  await expect(protocolFilter).toHaveValues(["SNMP"]);

  await page.getByRole("link", { name: "SNMP Fan-Out", exact: true }).click();
  const firstQuery = page.locator(".code-block").first();
  const expectedClipboardValue = await firstQuery.locator("code").textContent();
  expect(expectedClipboardValue).toBeTruthy();

  await firstQuery.getByRole("button", { name: /copy query/i }).click();
  await expect(firstQuery.getByRole("status")).toContainText("Copied");
  const normalizeLineEndings = (value: string) => value.replaceAll("\r\n", "\n");
  await expect.poll(async () => normalizeLineEndings(await page.evaluate(() => navigator.clipboard.readText())))
    .toBe(normalizeLineEndings(expectedClipboardValue!));

  await page.getByRole("link", { name: /related hunt/i }).first().click();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page).toHaveURL(/\/hunts\/[a-z0-9-]+\/$/);
});

test("global search keeps its active result visible and opens SNMP", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("ControlOrMeta+K");

  const search = page.getByRole("combobox", { name: /search guide/i });
  await expect(search).toBeFocused();
  await search.fill("infrastructure");

  const results = page.getByRole("listbox", { name: "Search results" });
  await expect(results.getByRole("option")).toHaveCount(12);
  for (let index = 0; index < 11; index += 1) await search.press("ArrowDown");

  const activeOptionId = await search.getAttribute("aria-activedescendant");
  expect(activeOptionId).toBeTruthy();
  const activeOption = page.locator(`#${activeOptionId}`);
  await expect(activeOption).toHaveAttribute("aria-selected", "true");
  expect(await activeOption.evaluate((option) => {
    const optionRect = option.getBoundingClientRect();
    const listboxRect = option.closest('[role="listbox"]')!.getBoundingClientRect();
    return optionRect.top >= listboxRect.top - 1 && optionRect.bottom <= listboxRect.bottom + 1;
  })).toBe(true);
  await expect(search).toBeFocused();

  await search.fill("SNMP");
  await page.getByRole("option", { name: /HUNT SNMP Fan-Out/ }).click();
  await expect(page).toHaveURL(/\/hunts\/snmp-fan-out\/$/);
});
