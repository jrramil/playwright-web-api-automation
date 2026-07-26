import { test } from '@playwright/extension';

/**
 * Exam 1a — the logo and login (Sign in) button are displayed.
 *
 * Includes the exam must-have location/position assertions: real boundingBox
 * geometry, not just visibility.
 */
test.describe('CheapFlightsLogoAndLoginTests', () => {
  test.beforeEach(async ({ cheapFlightsHomePage }) => {
    await test.step('Step 1: Open the cheapflights homepage', async () => {
      await cheapFlightsHomePage.open();
    });
  });

  test('HomeLogoAndLoginButtonDisplayedTest @smoke', async ({ cheapFlightsHomePage }) => {
    await test.step('Step 2: Assert the logo and Sign in button are displayed', async () => {
      await cheapFlightsHomePage.checkLogoAndSignInDisplayed();
    });
  });

  test('HomeLogoAndLoginButtonPositionTest', async ({ cheapFlightsHomePage }) => {
    await test.step('Step 2: POSITION — logo and Sign in geometry inside the header', async () => {
      // boundingBox assertions: both inside the header band, logo left of Sign in,
      // Sign in in the right half, nothing overflowing the viewport.
      await cheapFlightsHomePage.checkHeaderElementPositions();
    });

    await test.step('Step 3: POSITION — search form renders below the header', async () => {
      await cheapFlightsHomePage.checkSearchFormBelowHeader();
    });
  });
});
