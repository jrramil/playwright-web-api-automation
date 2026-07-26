import type { Route } from '@playwright/test';
// Sub-path imports, not the '@playwright/extension' barrel — see AR-NO-BARREL-IN-PAGES.
import { Locator } from '@playwright/extension/locatorExtension';
import { expect } from '@playwright/extension/expectExtension';
import { BasePage } from '@pages';
import { getPortalUrl } from '@config';
import { formatDateAsCalendarCellLabel, formatDateAsCalendarMonthLabel, formatDateAsDayMonthShort } from '@util';

export interface FlightSearchCriteria {
  originQuery: string;
  originOptionName: string;
  destinationQuery: string;
  destinationOptionName: string;
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
}

/**
 * POM for the cheapflights.com.au homepage (Kayak platform).
 *
 * DOM facts verified live on 2026-07-26 via playwright-cli:
 * - The origin field is multi-value and arrives pre-filled with a geo-detected city,
 *   so flows must remove existing chips before entering their own origin.
 * - "Compare vs Cheapflights" partner checkboxes are ticked by default and hijack the
 *   current tab to a partner site on Search; they are unticked to keep a single-tab flow.
 * - Searching with an empty origin opens a dialog with role=alert validation text.
 */
export class CheapFlightsHomePage extends BasePage {
  /** How long to wait for the compare-partner widget to (re)mount before assuming it is absent. */
  private static readonly PARTNER_WIDGET_MOUNT_TIMEOUT_MS = 10_000;

  /** Site header landmark. */
  headerBanner(): Locator {
    return this.getByRole('banner').describe('CheapFlights Header');
  }

  /** Brand logo link in the header. */
  logoLink(): Locator {
    return this.getByRole('link', { name: 'Go to the cheapflights homepage' }).describe('CheapFlights Logo Link');
  }

  /** Sign in (login) button in the header. */
  signInButton(): Locator {
    return this.getByRole('button', { name: 'Sign in' }).describe('CheapFlights Sign In Button');
  }

  /** Flight search form landmark. */
  searchForm(): Locator {
    return this.getByRole('search').describe('CheapFlights Flight Search Form');
  }

  /** Origin airport combobox. */
  originCombobox(): Locator {
    return this.getByRole('combobox', { name: 'Origin location' }).describe('Origin Location Combobox');
  }

  /** Destination airport combobox. */
  destinationCombobox(): Locator {
    return this.getByRole('combobox', { name: 'Destination location' }).describe('Destination Location Combobox');
  }

  /** Origin field container, holds the selected-location chips. */
  originInputContainer(): Locator {
    return this.getByLabel('Flight origin input').describe('Flight Origin Input Container');
  }

  /** Destination field container, holds the selected-location chips. */
  destinationInputContainer(): Locator {
    return this.getByLabel('Flight destination input').describe('Flight Destination Input Container');
  }

  /** Autocomplete suggestion by visible name, e.g. 'Sydney, New South Wales, Australia'. */
  locationOption(name: string): Locator {
    return this.getByRole('option', { name }).describe(`Location Option: ${name}`);
  }

  /** Departure date opener in the search form. */
  departureDateButton(): Locator {
    return this.getByRole('button', { name: 'Departure date' }).describe('Departure Date Button');
  }

  /** Return date opener in the search form. */
  returnDateButton(): Locator {
    return this.getByRole('button', { name: 'Return date' }).describe('Return Date Button');
  }

  /** Calendar month grid, e.g. 'August 2026'. */
  calendarMonthGrid(monthLabel: string): Locator {
    return this.getByRole('grid', { name: monthLabel }).describe(`Calendar Grid: ${monthLabel}`);
  }

  /** Calendar day cell, e.g. 'August 20 2026'. */
  calendarDayCell(cellLabel: string): Locator {
    return this.getByRole('gridcell', { name: cellLabel }).describe(`Calendar Day: ${cellLabel}`);
  }

  /** Advances the calendar view by one month. */
  nextMonthButton(): Locator {
    return this.getByRole('button', { name: 'Next month' }).describe('Calendar Next Month Button');
  }

  /** Search submit button. */
  searchButton(): Locator {
    return this.getByRole('button', { name: 'Search', exact: true }).describe('Flight Search Button');
  }

  /**
   * "Compare vs Cheapflights" partner checkboxes inside the search form.
   * CSS fallback is justified here: the checkbox's accessible name is the rotating
   * partner brand (e.g. "Trip.com") and its input name is partner-specific; the only
   * stable hook is the `pres-default-` prefix. (CD-NO-RAW-CSS-WHEN-SEMANTIC-EXISTS)
   */
  comparePartnerCheckboxes(): Locator {
    return this.locator('[role="search"] input[name^="pres-default-"]').describe('Compare Partner Checkboxes');
  }

  /**
   * Validation message shown when the search form is submitted incomplete.
   * Filtered by message because an empty form raises several alerts at once
   * (From airport, Depart date, Return date).
   */
  searchValidationAlert(message: string | RegExp): Locator {
    return new Locator(this.getByRole('alert').filter({ hasText: message })).describe('Search Validation Alert');
  }

  /** Dismiss button on the validation dialog. */
  validationDialogDismissButton(): Locator {
    return this.getByRole('button', { name: 'Dismiss' }).describe('Validation Dialog Dismiss Button');
  }

  /** Navigate to the homepage and wait until the search form is usable. */
  async open(): Promise<void> {
    // Kayak arms "Compare vs Cheapflights" partner clickthroughs that steal the tab when
    // Search is clicked, sending it to a partner site while the real results open in a
    // popup. Unticking the partner boxes is necessary but cannot be sufficient: the widget
    // remounts pre-ticked on every criteria change, so a box can arm itself between the
    // last untick and the click. Blocking the clickthrough endpoint closes that race
    // deterministically. This suppresses a third-party redirect only — the flight search
    // request and its results are untouched.
    await this.page.route('**/s/clickthrough.jsp*', (route: Route) => route.abort());

    // Defensive: Kayak properties sometimes present a cookie/consent dialog. Auto-accept
    // it whenever it blocks an action, without slowing runs where it never appears.
    await this.page.addLocatorHandler(
      this.page
        .getByRole('dialog')
        .getByRole('button', { name: /accept( all)?( cookies)?$/i })
        .first(),
      async (acceptButton) => {
        await acceptButton.click();
      },
      { times: 3 },
    );

    await this.page.goto(getPortalUrl('CheapFlights_Web'), { waitUntil: 'domcontentloaded' });
    await expect(this.searchForm(), 'Flight search form should be visible after navigation').toBeVisible();
    await expect(this.originCombobox(), 'Origin combobox should be visible after navigation').toBeVisible();
  }

  /** Remove geo-detected pre-filled chips from both location fields. */
  async clearPrefilledLocations(): Promise<void> {
    for (const container of [this.originInputContainer(), this.destinationInputContainer()]) {
      const removeButtons = container.getByRole('button', { name: 'Remove value' });
      const initialCount = await removeButtons.count();
      for (let remaining = initialCount; remaining > 0; remaining--) {
        await removeButtons.first().click();
        await expect(removeButtons, 'Location chip should disappear after removal').toHaveCount(remaining - 1);
      }
    }
  }

  /** Type into the origin combobox and pick the given suggestion. */
  async setOrigin(query: string, optionName: string): Promise<void> {
    await this.originCombobox().fill(query);
    await this.locationOption(optionName).first().click();
    await expect(
      this.originInputContainer().getByRole('button', { name: 'Remove value' }),
      'Origin should hold exactly one selected location chip',
    ).toHaveCount(1);
  }

  /** Type into the destination combobox and pick the given suggestion. */
  async setDestination(query: string, optionName: string): Promise<void> {
    await this.destinationCombobox().fill(query);
    await this.locationOption(optionName).first().click();
    await expect(
      this.destinationInputContainer().getByRole('button', { name: 'Remove value' }),
      'Destination should hold exactly one selected location chip',
    ).toHaveCount(1);
  }

  /** Open the calendar and select the departure and return dates (ISO YYYY-MM-DD). */
  async pickDates(checkinDate: string, checkoutDate: string): Promise<void> {
    await this.departureDateButton().click();

    for (const isoDate of [checkinDate, checkoutDate]) {
      const monthGrid = this.calendarMonthGrid(formatDateAsCalendarMonthLabel(isoDate));

      // The calendar opens on the current month; advance until the target month is shown.
      for (let advances = 0; advances < 12 && !(await monthGrid.isVisible()); advances++) {
        await this.nextMonthButton().click();
      }
      await expect(monthGrid, 'Target calendar month should be visible').toBeVisible();
      await this.calendarDayCell(formatDateAsCalendarCellLabel(isoDate)).click();
    }

    // The pickers echo the chosen dates as e.g. 'Thu 20/8'.
    await expect(
      this.departureDateButton(),
      'Departure date button should echo the selected day',
    ).toContainText(formatDateAsDayMonthShort(checkinDate));
    await expect(
      this.returnDateButton(),
      'Return date button should echo the selected day',
    ).toContainText(formatDateAsDayMonthShort(checkoutDate));
  }

  /**
   * Unticks every currently-mounted partner checkbox and reports how many were ticked.
   * Returns -1 when the widget re-rendered mid-pass, so callers can run another pass.
   */
  private async untickMountedComparePartners(): Promise<number> {
    try {
      let ticked = 0;
      for (const checkbox of await this.comparePartnerCheckboxes().raw.all()) {
        if (await checkbox.isChecked()) {
          ticked++;
          // The input sits inside a custom-styled wrapper; `force` keeps a late re-render
          // from failing the actionability check and leaving the box armed.
          await checkbox.uncheck({ force: true });
        }
      }
      return ticked;
    } catch {
      return -1;
    }
  }

  /** Poll until a full pass finds no ticked partner box. Throws if it cannot be achieved. */
  private async ensureComparePartnersUnticked(timeoutMs: number): Promise<void> {
    await expect
      .poll(() => this.untickMountedComparePartners(), {
        message: 'All compare-partner checkboxes should be unticked before submitting',
        timeout: timeoutMs,
      })
      .toBe(0);
  }

  /**
   * Untick every "Compare vs Cheapflights" partner box so Search stays in this tab.
   *
   * The widget re-renders whenever search criteria change, and an unmounted widget matches
   * zero locators — indistinguishable from "nothing is ticked". A poll that starts during a
   * remount therefore passes on an empty set, after which the widget mounts pre-ticked and
   * hijacks Search to the partner site (observed: the tab landed on flightcentre.com.au
   * while the real results opened in a popup). So wait for the widget to mount first, then
   * poll until a full pass finds nothing ticked.
   */
  async disableComparePartners(): Promise<void> {
    // Bounded and tolerant: some variants ship no partner widget at all, so a timeout here
    // means "nothing to untick", not a failure.
    await expect
      .poll(() => this.comparePartnerCheckboxes().raw.count(), {
        message: 'Compare-partner widget should mount',
        timeout: CheapFlightsHomePage.PARTNER_WIDGET_MOUNT_TIMEOUT_MS,
      })
      .toBeGreaterThan(0)
      .catch(() => undefined);

    await this.ensureComparePartnersUnticked(15_000);
  }

  /**
   * Submit the search form.
   *
   * Re-checks the partner boxes immediately before clicking: `expect.poll` exits on its
   * first success, so a box that re-ticks between `disableComparePartners()` and this click
   * would still hijack the tab. This gate also protects flows that never call
   * `disableComparePartners()`, such as the empty-origin negative test.
   */
  async submitSearch(): Promise<void> {
    await this.ensureComparePartnersUnticked(10_000);
    await this.searchButton().click();
  }

  /** Full happy-path search flow: clear pre-fills, set route and dates, search. */
  async searchFlights(criteria: FlightSearchCriteria): Promise<void> {
    await this.clearPrefilledLocations();
    await this.setOrigin(criteria.originQuery, criteria.originOptionName);
    await this.setDestination(criteria.destinationQuery, criteria.destinationOptionName);
    await this.pickDates(criteria.checkinDate, criteria.checkoutDate);
    await this.disableComparePartners();
    await this.submitSearch();
  }

  /** Exam 1a: logo and login button are displayed. */
  async checkLogoAndSignInDisplayed(): Promise<void> {
    await expect.soft(this.logoLink(), 'Logo should be visible in the header').toBeVisible();
    await expect.soft(this.signInButton(), 'Sign in button should be visible in the header').toBeVisible();
    await expect.soft(this.signInButton(), 'Sign in button should be enabled').toBeEnabled();
  }

  /**
   * POSITION ASSERTIONS (exam must-have): real geometry via boundingBox.
   * - logo and Sign in button both sit inside the header band
   * - logo is left of the Sign in button; Sign in hugs the right edge
   * - both are fully inside the viewport
   */
  async checkHeaderElementPositions(): Promise<void> {
    await expect(this.logoLink(), 'Logo must be visible before measuring').toBeVisible();
    await expect(this.signInButton(), 'Sign in must be visible before measuring').toBeVisible();

    const [logoBox, signInBox, headerBox, viewport] = await Promise.all([
      this.logoLink().boundingBox(),
      this.signInButton().boundingBox(),
      this.headerBanner().boundingBox(),
      this.viewportSize(),
    ]);

    expect(logoBox, 'Logo should have a bounding box').toBeTruthy();
    expect(signInBox, 'Sign in button should have a bounding box').toBeTruthy();
    expect(headerBox, 'Header should have a bounding box').toBeTruthy();
    if (!logoBox || !signInBox || !headerBox) return;

    // Both elements sit vertically inside the header band.
    expect.soft(logoBox.y, 'Logo top should be inside the header').toBeGreaterThanOrEqual(headerBox.y);
    expect
      .soft(logoBox.y + logoBox.height, 'Logo bottom should be inside the header')
      .toBeLessThanOrEqual(headerBox.y + headerBox.height);
    expect.soft(signInBox.y, 'Sign in top should be inside the header').toBeGreaterThanOrEqual(headerBox.y);
    expect
      .soft(signInBox.y + signInBox.height, 'Sign in bottom should be inside the header')
      .toBeLessThanOrEqual(headerBox.y + headerBox.height);

    // Logo left, Sign in right.
    expect
      .soft(logoBox.x + logoBox.width, 'Logo should be positioned left of the Sign in button')
      .toBeLessThan(signInBox.x);
    expect
      .soft(signInBox.x, 'Sign in button should sit in the right half of the viewport')
      .toBeGreaterThan(viewport.width / 2);

    // Fully inside the viewport.
    expect.soft(logoBox.x, 'Logo should not overflow the left viewport edge').toBeGreaterThanOrEqual(0);
    expect
      .soft(signInBox.x + signInBox.width, 'Sign in button should not overflow the right viewport edge')
      .toBeLessThanOrEqual(viewport.width);
    expect.soft(logoBox.y, 'Logo should not overflow the top viewport edge').toBeGreaterThanOrEqual(0);
  }

  /** POSITION ASSERTION (exam must-have): the search form renders below the header. */
  async checkSearchFormBelowHeader(): Promise<void> {
    const [headerBox, formBox] = await Promise.all([
      this.headerBanner().boundingBox(),
      this.searchForm().boundingBox(),
    ]);

    expect(headerBox, 'Header should have a bounding box').toBeTruthy();
    expect(formBox, 'Search form should have a bounding box').toBeTruthy();
    if (!headerBox || !formBox) return;

    expect(
      formBox.y,
      'Search form top edge should start below the header bottom edge',
    ).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  }

  /** Negative path: incomplete search surfaces the 'From airport' validation alert. */
  async checkEmptyOriginValidationError(): Promise<void> {
    const fromAirportAlert = this.searchValidationAlert("Please enter a 'From' airport.");

    await expect(fromAirportAlert, 'Submitting with no origin should raise a validation alert').toBeVisible();

    await this.validationDialogDismissButton().click();
    await expect(fromAirportAlert, 'Validation alert should close on dismiss').toBeHidden();
  }
}
