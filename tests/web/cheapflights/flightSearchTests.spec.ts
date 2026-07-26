import { test, expect } from '@playwright/extension';
import { generateFutureDate } from '@util';

/**
 * Exam 1b — searching flights.
 *
 * Route facts verified live: searching Sydney -> Melbourne lands on
 * /flight-search/SYD-MEL/<checkin>/<checkout> in the same tab once the
 * "Compare vs Cheapflights" partner boxes are unticked.
 */
const ORIGIN = { query: 'Sydney', optionName: 'Sydney, New South Wales, Australia', code: 'SYD' };
const DESTINATION = { query: 'Melbourne', optionName: 'Melbourne, Victoria, Australia', code: 'MEL' };

test.describe('CheapFlightsFlightSearchTests', () => {
  test.beforeEach(async ({ cheapFlightsHomePage }) => {
    await test.step('Step 1: Open the cheapflights homepage', async () => {
      await cheapFlightsHomePage.open();
    });
  });

  test('FlightSearchNavigatesToResultsTest @smoke', async ({ cheapFlightsHomePage, flightResultsPage }) => {
    const checkinDate = await generateFutureDate(30);
    const checkoutDate = await generateFutureDate(37);

    await test.step(`Step 2: Search flights ${ORIGIN.code} -> ${DESTINATION.code}, ${checkinDate} to ${checkoutDate}`, async () => {
      await cheapFlightsHomePage.searchFlights({
        originQuery: ORIGIN.query,
        originOptionName: ORIGIN.optionName,
        destinationQuery: DESTINATION.query,
        destinationOptionName: DESTINATION.optionName,
        checkinDate,
        checkoutDate,
      });
    });

    await test.step('Step 3: Assert the results URL encodes the searched route and dates', async () => {
      await flightResultsPage.checkUrlMatchesSearch(ORIGIN.code, DESTINATION.code, checkinDate, checkoutDate);
    });

    await test.step('Step 4: Assert the live search produces result cards', async () => {
      await flightResultsPage.waitForResults();
    });
  });

  test('FlightSearchEmptyOriginShowsValidationErrorTest', async ({ cheapFlightsHomePage, page }) => {
    await test.step('Step 2: Clear the pre-filled origin and set only a destination', async () => {
      await cheapFlightsHomePage.clearPrefilledLocations();
      await cheapFlightsHomePage.setDestination(DESTINATION.query, DESTINATION.optionName);
    });

    await test.step('Step 3: Submit and assert the From-airport validation alert', async () => {
      await cheapFlightsHomePage.submitSearch();
      await cheapFlightsHomePage.checkEmptyOriginValidationError();
    });

    await test.step('Step 4: Assert no navigation to a results page happened', async () => {
      await expect
        .poll(() => page.url(), { message: 'Rejected search should stay on the homepage' })
        .not.toContain('/flight-search/');
    });
  });
});
