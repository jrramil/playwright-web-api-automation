import { expect, Page, Locator } from "@playwright/test";

const LONG_TIMEOUT = 70_000;
const SHORT_TIMEOUT = 30_000;

export async function clickAndWait(
  page: Page,
  locator: Locator
): Promise<void> {
  await expect(locator).toBeVisible({ timeout: LONG_TIMEOUT });
  await expect(locator).toBeEnabled({ timeout: LONG_TIMEOUT });

  await Promise.all([locator.click()]);
}

export async function safeFill(
  locator: Locator,
  value: string
): Promise<void> {
  await expect(locator).toBeVisible({ timeout: LONG_TIMEOUT });
  await expect(locator).toBeEnabled({ timeout: LONG_TIMEOUT });

  await locator.fill(value);
}

export async function safeClick(
  locator: Locator
): Promise<void> {
  await expect(locator).toBeVisible({ timeout: SHORT_TIMEOUT });
  await expect(locator).toBeEnabled({ timeout: SHORT_TIMEOUT });

  await locator.click();
}

export async function waitForVisibleText(
  page: Page,
  text: string | RegExp,
  timeout: number = LONG_TIMEOUT
) {
  await expect(
    page.getByText(text)
  ).toBeVisible({ timeout });
}

export async function safeFillAndAssert(
  locator: Locator,
  value: string,
  maxRetries = 5
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await locator.click();
    await locator.fill("");
    await locator.type(value, { delay: 50 });

    await locator.press("Tab");

    try {
      await expect(locator).toHaveValue(new RegExp(`^${value}`), {
        timeout: 1000,
      });
      return;
    } catch {
      console.log(`⚠️ Attempt ${attempt} failed, retrying...`);
    }
  }

  throw new Error(
    `❌ Unable to fill field with "${value}" after ${maxRetries} attempts`
  );
  
}
