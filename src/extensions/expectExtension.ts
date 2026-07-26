import { test, expect as baseExpect, Locator as BaseLocator } from '@playwright/test';
import { Locator } from '@playwright/extension/locatorExtension';
import { getCurrentTestName } from './testContext';

let passedCount = 0;
let failedCount = 0;

export function getAssertionSummary() {
  return { passed: passedCount, failed: failedCount };
}

export function resetAssertionSummary() {
  passedCount = 0;
  failedCount = 0;
}

test.beforeEach(async () => {
  resetAssertionSummary();
});

test.afterEach(async () => {
  const testName = getCurrentTestName();
  const summary = getAssertionSummary();
  const timestamp = `[${new Date().toISOString()}]`;
  const message = `Assertions summary: ${summary.passed} passed, ${summary.failed} failed`;
  let symbol = '✅';
  let colorStart = '\x1b[32m';
  const colorEnd = '\x1b[0m';

  if (summary.failed > 0) {
    symbol = '❌';
    colorStart = '\x1b[31m';
  }

  console.log(`${colorStart} ${timestamp} ${symbol} ${testName} > ${message} ${colorEnd}`);
});

// Convert custom extension locators into native Playwright locators for assertions.
function unwrapTarget(target: BaseLocator | Locator) {
  if (target instanceof Locator) {
    return target.raw;
  }

  return target;
}

function getDescription(target: BaseLocator | Locator): string {
  if (target instanceof Locator) {
    return target.description?.() ?? '';
  }

  // if native locator has no custom description, just return empty
  return '';
}

function formatMessage(target: BaseLocator | Locator, message?: string): string {
  const description = getDescription(target).trim();
  const msg = (message ?? '').trim();

  if (description && msg) return `${description} | ${msg}`;
  if (description) return description;
  return msg;
}

function logAssertion(
  status: 'PASS' | 'FAIL',
  matcherName: string,
  target: BaseLocator | Locator,
  message?: string,
  error?: unknown,
) {
  const description = getDescription(target);
  const finalMessage = formatMessage(target, message);
  const timestamp = `[${new Date().toISOString()}]`;
  const testName = getCurrentTestName();
  const logEntry = `[ASSERT ${status}] ${testName} > ${matcherName}${description ? ` | ${description}` : ''}${finalMessage ? ` | ${finalMessage}` : ''}`;

  if (status === 'PASS') {
    const symbol = '✔';
    const colorStart = '\x1b[32m';
    const colorEnd = '\x1b[0m';

    console.log(colorStart + timestamp + ' ' + symbol + ' ' + logEntry + colorEnd);
    passedCount++;
    return;
  }

  if (status === 'FAIL') {
    const symbol = '✖';
    const colorStart = '\x1b[31m';
    const colorEnd = '\x1b[0m';

    const errorMessage = error instanceof Error ? error.message : String(error);
    const ErrorLog = logEntry + ' ' + `${errorMessage}`;

    console.error(colorStart + timestamp + ' ' + symbol + ' ' + ErrorLog + colorEnd);
    failedCount++;
    return;
  }
}

function wrapMatchers<T extends object>(matchers: T, target: BaseLocator | Locator, message?: string): T {
  return new Proxy(matchers, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);

      // Support chained properties like .not
      if (value && typeof value === 'object') {
        return wrapMatchers(value, target, message);
      }

      if (typeof value !== 'function') {
        return value;
      }

      return (...args: unknown[]) => {
        const matcherName = String(prop);

        try {
          const result = value.apply(obj, args);

          // Async matcher
          if (result && typeof result.then === 'function') {
            return result
              .then((res: unknown) => {
                logAssertion('PASS', matcherName, target, message);
                return res;
              })
              .catch((err: unknown) => {
                logAssertion('FAIL', matcherName, target, message, err);
                throw err;
              });
          }

          // Sync matcher
          logAssertion('PASS', matcherName, target, message);
          return result;
        } catch (err) {
          logAssertion('FAIL', matcherName, target, message, err);
          throw err;
        }
      };
    },
  });
}

type WrappedExpect = typeof baseExpect & {
  (target: BaseLocator | Locator, message?: string): ReturnType<typeof baseExpect>;
};

const wrappedExpect = ((target: BaseLocator | Locator, message?: string) => {
  const matcher = baseExpect(unwrapTarget(target), formatMessage(target, message));
  return wrapMatchers(matcher, target, message);
}) as WrappedExpect;

wrappedExpect.soft = ((target: BaseLocator | Locator, message?: string) => {
  const matcher = baseExpect.soft(unwrapTarget(target), formatMessage(target, message));
  return wrapMatchers(matcher, target, message);
}) as typeof baseExpect.soft;

// preserve Playwright expect members
wrappedExpect.poll = baseExpect.poll;
wrappedExpect.extend = baseExpect.extend;
wrappedExpect.configure = baseExpect.configure;
wrappedExpect.getState = baseExpect.getState;
wrappedExpect.not = baseExpect.not;

export const expect = wrappedExpect;
