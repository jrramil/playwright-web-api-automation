import { test } from '@playwright/test';

/**
 * Current test name, formatted for log lines.
 *
 * Deliberately a leaf module: it imports nothing but `@playwright/test`.
 * `expectExtension` and `testFixtureExtension` both need it, and
 * `testFixtureExtension` depends on `@pages`. Were this function to live in
 * `testFixtureExtension`, page objects importing `expect` would pull the fixture
 * module back in and close an import cycle (pages → extensions → pages).
 */
export const getCurrentTestName = (): string => {
  try {
    const info = test.info();
    const rawTitlePath = (info as { titlePath?: string[] | (() => string[]) }).titlePath;
    const titlePath = typeof rawTitlePath === 'function' ? rawTitlePath() : (rawTitlePath ?? []);
    return titlePath.length > 1 ? titlePath.slice(1).join(' > ') : info.title;
  } catch {
    return 'unknown test';
  }
};
