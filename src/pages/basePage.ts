import { Page } from '@playwright/test';
// Sub-path import, not the '@playwright/extension' barrel. The barrel re-exports the
// fixture module, which imports '@pages' — importing it here would close a cycle.
// See .github/instructions/modules/02-architecture-and-coding.md (AR-NO-BARREL-IN-PAGES).
import { Locator } from '@playwright/extension/locatorExtension';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected locator(selector: string): Locator {
    return new Locator(this.page.locator(selector));
  }

  protected getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return new Locator(this.page.getByRole(role, options));
  }

  protected getByLabel(text: string | RegExp, options?: Parameters<Page['getByLabel']>[1]): Locator {
    return new Locator(this.page.getByLabel(text, options));
  }

  protected getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]): Locator {
    return new Locator(this.page.getByText(text, options));
  }

  protected getByTestId(testId: string | RegExp): Locator {
    return new Locator(this.page.getByTestId(testId));
  }

  /**
   * Viewport dimensions for geometry/position assertions.
   *
   * `page.viewportSize()` returns null when the browser runs maximized — MAXIMIZED=true
   * sets `viewport: null` in playwright.config.ts — so fall back to the live window size.
   * Always use this instead of `page.viewportSize()` so position assertions hold in both
   * fixed-viewport and maximized runs.
   */
  protected async viewportSize(): Promise<{ width: number; height: number }> {
    const configuredViewport = this.page.viewportSize();
    if (configuredViewport) {
      return configuredViewport;
    }

    return this.page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  }
}
