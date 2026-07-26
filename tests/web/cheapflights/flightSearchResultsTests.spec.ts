import { test } from '@playwright/extension';
import { generateFutureDate } from '@util';

/**
 * Exam 1c — assertions on flight search results.
 *
 * Melbourne searches can return both MEL (Tullamarine) and AVV (Avalon) legs,
 * so destination assertions accept either airport code.
 */
const ORIGIN = { query: 'Sydney', optionName: 'Sydney, New South Wales, Australia', code: 'SYD', city: 'Sydney' };
const DESTINATION = {
  query: 'Melbourne',
  optionName: 'Melbourne, Victoria, Australia',
  code: 'MEL',
  city: 'Melbourne',
  legPattern: /MEL|AVV/,
};
const MINIMUM_EXPECTED_CARDS = 3;
const CARDS_TO_INSPECT = 4;

test.describe('CheapFlightsFlightSearchResultsTests', () => {
  let checkinDate: string;
  let checkoutDate: string;

  test.beforeEach(async ({ cheapFlightsHomePage }) => {
    checkinDate = await generateFutureDate(30);
    checkoutDate = await generateFutureDate(37);

    await test.step('Step 1: Open the homepage and search SYD -> MEL', async () => {
      await cheapFlightsHomePage.open();
      await cheapFlightsHomePage.searchFlights({
        originQuery: ORIGIN.query,
        originOptionName: ORIGIN.optionName,
        destinationQuery: DESTINATION.query,
        destinationOptionName: DESTINATION.optionName,
        checkinDate,
        checkoutDate,
      });
    });
  });

  test('FlightSearchResultsContentAssertionsTest @smoke', async ({ flightResultsPage }) => {
    await test.step('Step 2: Assert URL and a meaningful number of result cards', async () => {
      await flightResultsPage.checkUrlMatchesSearch(ORIGIN.code, DESTINATION.code, checkinDate, checkoutDate);
      await flightResultsPage.checkResultsListPopulated(MINIMUM_EXPECTED_CARDS);
    });

    // Asserted immediately after landing: late-appearing overlays (price-alert nudges)
    // can drop the header form out of the accessibility tree if this runs minutes in.
    await test.step('Step 3: Assert the header form retained the searched criteria', async () => {
      await flightResultsPage.checkSearchSummaryRetained(ORIGIN.city, DESTINATION.city, checkinDate, checkoutDate);
    });

    await test.step('Step 4: Assert each inspected card shows the searched route and a price', async () => {
      await flightResultsPage.checkCardsShowRouteAndPrice(
        new RegExp(ORIGIN.code),
        DESTINATION.legPattern,
        CARDS_TO_INSPECT,
      );
    });

    await test.step('Step 5: Assert the sort tabs advertise live prices', async () => {
      await flightResultsPage.checkSortOptionsShowPrices();
    });
  });

  test('FlightSearchResultsPositionAssertionsTest', async ({ flightResultsPage }) => {
    await test.step('Step 2: POSITION — results render below the header search form', async () => {
      await flightResultsPage.checkResultsBelowSearchForm();
    });

    await test.step('Step 3: POSITION — result cards stack without overlapping', async () => {
      await flightResultsPage.checkCardsDoNotOverlap(CARDS_TO_INSPECT);
    });
  });
});
