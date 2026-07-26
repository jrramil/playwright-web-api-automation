import { Locator as BaseLocator, expect } from '@playwright/test';

export interface Locator extends BaseLocator {}

export class Locator {
  constructor(private readonly _locator: BaseLocator) {
    // Proxy unknown members to the underlying Playwright locator so native APIs remain available.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        const value = (target._locator as any)[prop];

        if (typeof value === 'function') {
          return value.bind(target._locator);
        }

        return value;
      },
    }) as Locator;
  }

  get raw(): BaseLocator {
    return this._locator;
  }

  get expect() {
    // Provide locator-scoped expect helpers for concise test code.
    const fn = (message?: string) => expect(this._locator, message);
    fn.soft = (message?: string) => expect.soft(this._locator, message);
    return fn;
  }

  describe(description: string): Locator {
    return new Locator(this._locator.describe(description));
  }

  // Write custom extensions here

  async hasText(expected: string): Promise<boolean> {
    // Return false instead of throwing when locator lookup fails.
    const text = await this._locator.innerText().catch(() => '');
    return text?.includes(expected) ?? false;
  }

  async hasValue(expected: string): Promise<boolean> {
    // Return false instead of throwing when locator lookup fails.
    const value = await this._locator.inputValue().catch(() => '');
    return value?.includes(expected) ?? false;
  }

  async isVisible(): Promise<boolean> {
    return await this._locator.isVisible().catch(() => false);
  }

  async isEnabled(): Promise<boolean> {
    return await this._locator.isEnabled().catch(() => false);
  }

  async getElementTextAndConvertToNumber(): Promise<number> {
    // Strip non-digits to normalize values such as "$1,234" before numeric comparisons.
    const text = await this._locator.innerText();
    const elementNumber = text.replace(/\D/g, '');
    return Number(elementNumber);
  }

  async getElementValueAndConvertToNumber(): Promise<number> {
    // Strip non-digits to normalize values such as "$1,234" before numeric comparisons.
    const text = await this._locator.inputValue();
    const elementNumber = text.replace(/\D/g, '');
    return Number(elementNumber);
  }
}
