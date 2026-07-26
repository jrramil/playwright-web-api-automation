import { test as base } from '@playwright/test';
import { CheapFlightsHomePage, FlightResultsPage } from '@pages';
import { getCurrentTestName } from './testContext';

// Page objects available as test fixtures.
// Add one entry per page object; keep the property name camelCase and matching the class.
type PagesFixtures = {
  cheapFlightsHomePage: CheapFlightsHomePage;
  flightResultsPage: FlightResultsPage;
};

// Internal diagnostics fixtures.
//
// `browserLogBuffer` and `failureDiagnostics` deliberately declare NO dependency on
// `page`. An `auto` fixture that destructures `page` forces Playwright to build a
// browser for every test in the project — including API tests that never open one.
// Browser listeners are instead attached by overriding the `page` fixture below, which
// Playwright resolves lazily: only tests that actually use a page pay for a browser.
type InternalFixtures = {
  browserLogBuffer: string[];
  failureDiagnostics: void;
};

// Unified fixture contract consumed by the extended Playwright test object.
type Fixtures = PagesFixtures;

const MAX_LOG_ENTRIES = 400;

export const test = base.extend<Fixtures & InternalFixtures>({
  // Per-test sink for browser console/error output. No `page` dependency, so requesting
  // it never launches a browser; it simply stays empty for non-browser tests.
  browserLogBuffer: async ({}, use) => {
    await use([]);
  },

  // Overrides Playwright's `page` to record console/pageerror/requestfailed output.
  // Because this is an override rather than an `auto` fixture, it runs only when a test
  // (or a page-object fixture) actually asks for a page.
  page: async ({ page, browserLogBuffer }, use) => {
    const append = (entry: string) => {
      const stamped = `[${new Date().toISOString()}] ${entry}`;
      if (browserLogBuffer.length >= MAX_LOG_ENTRIES) {
        browserLogBuffer.shift();
      }
      browserLogBuffer.push(stamped);
    };

    const onConsole = (message: { type: () => string; text: () => string }) => {
      append(`console.${message.type()}: ${message.text()}`);
    };

    const onPageError = (error: Error) => {
      append(`pageerror: ${error.stack ?? error.message}`);
    };

    const onRequestFailed = (request: {
      method: () => string;
      url: () => string;
      failure: () => { errorText?: string } | null;
    }) => {
      append(
        `requestfailed: ${request.method()} ${request.url()} - ${request.failure()?.errorText ?? 'unknown error'}`,
      );
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('requestfailed', onRequestFailed);

    await use(page);

    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('requestfailed', onRequestFailed);
  },

  // Emits failure diagnostics for every test, browser-backed or not. Any browser output
  // captured by the `page` override above is folded in; API tests simply report none.
  failureDiagnostics: [
    async ({ browserLogBuffer }, use, testInfo) => {
      await use();

      if (testInfo.status === testInfo.expectedStatus) {
        return;
      }

      const logBuffer = browserLogBuffer;

      const failureText = testInfo.errors
        .map((error, index) => {
          return `Error ${index + 1}\nmessage: ${error.message ?? 'n/a'}\nstack: ${error.stack ?? 'n/a'}`;
        })
        .join('\n\n');

      const diagnostics = [
        `title: ${testInfo.title}`,
        `project: ${testInfo.project.name}`,
        `status: ${testInfo.status}`,
        `expectedStatus: ${testInfo.expectedStatus}`,
        '',
        'errors:',
        failureText || 'n/a',
        '',
        'capturedBrowserLogs:',
        logBuffer.length ? logBuffer.join('\n') : 'no browser logs captured',
      ].join('\n');

      console.log('\n[FAILURE_DIAGNOSTICS_BEGIN]\n' + diagnostics + '\n[FAILURE_DIAGNOSTICS_END]\n');
      await testInfo.attach('failure-diagnostics', { body: diagnostics, contentType: 'text/plain' });
    },
    { auto: true },
  ],

  // Creates the CheapFlights homepage page object from the current Playwright page fixture.
  cheapFlightsHomePage: async ({ page }, use) => {
    const cheapFlightsHomePage = new CheapFlightsHomePage(page);
    await use(cheapFlightsHomePage);
  },

  // Creates the flight results page object from the current Playwright page fixture.
  flightResultsPage: async ({ page }, use) => {
    const flightResultsPage = new FlightResultsPage(page);
    await use(flightResultsPage);
  },
});

const originalStep = test.step.bind(test);

const stepWithLogging = Object.assign(
  async function <T>(
    title: string,
    body: (step: any) => T | Promise<T>,
    options?: Parameters<typeof originalStep>[2],
  ): Promise<T> {
    const startedAt = Date.now();
    const timestamp = new Date().toISOString();
    const testName = getCurrentTestName();

    console.log(`\x1b[36m[${timestamp}] ▶ [STEP START] ${testName} > ${title}\x1b[0m`);

    try {
      const result = await originalStep<T>(title, body, options);
      const endedAt = new Date().toISOString();
      const durationMs = Date.now() - startedAt;

      console.log(`\x1b[32m[${endedAt}] ✔ [STEP PASS] ${testName} > ${title} (${durationMs}ms)\x1b[0m`);
      return result;
    } catch (error) {
      const endedAt = new Date().toISOString();
      const durationMs = Date.now() - startedAt;

      console.log(`\x1b[31m[${endedAt}] ✖ [STEP FAIL] ${testName} > ${title} (${durationMs}ms)\x1b[0m`);
      throw error;
    }
  },
  {
    skip: test.step.skip.bind(test.step),
  },
) as typeof test.step;

test.step = stepWithLogging;
