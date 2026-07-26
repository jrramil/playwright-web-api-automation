// Sub-path imports, not the '@playwright/extension' barrel — see AR-NO-BARREL-IN-PAGES.
import { Locator } from '@playwright/extension/locatorExtension';
import { expect } from '@playwright/extension/expectExtension';
import { BasePage } from '@pages';
import { formatDateAsDayMonthShort } from '@util';

/**
 * POM for the cheapflights.com.au flight results page
 * (/flight-search/<ORIG>-<DEST>/<checkin>/<checkout>).
 *
 * DOM facts verified live on 2026-07-26 via playwright-cli:
 * - Result cards are role=group elements named "Result item <n>".
 * - A thin role=progressbar stays in the DOM even after results render, so readiness
 *   is detected by the first result card appearing, never by the progressbar leaving.
 * - Results keep streaming in for a while; searches can take tens of seconds.
 */
export class FlightResultsPage extends BasePage {
  /** Generous window for the live fare search to produce its first result. */
  private static readonly RESULTS_TIMEOUT_MS = 90_000;

  /** Site header landmark (retained from the homepage). */
  headerBanner(): Locator {
    return this.getByRole('banner').describe('Results Header');
  }

  /** Brand logo link in the results header. */
  logoLink(): Locator {
    return this.getByRole('link', { name: 'Go to the cheapflights homepage' }).describe('Results Logo Link');
  }

  /** Sign in button in the results header. */
  signInButton(): Locator {
    return this.getByRole('button', { name: 'Sign in' }).describe('Results Sign In Button');
  }

  /** All flight result cards. */
  resultCards(): Locator {
    return this.getByRole('group', { name: /^Result item \d+$/ }).describe('Flight Result Cards');
  }

  /** First flight result card. */
  firstResultCard(): Locator {
    return new Locator(this.resultCards().first()).describe('First Flight Result Card');
  }

  /**
   * Sort tab, e.g. Cheapest / Best / Quickest. The Best tab nests a "Best option tooltip"
   * button whose name also starts with "Best", so the locator additionally filters on the
   * live price text ($…) that only the outer sort tab carries.
   */
  sortButton(sortName: 'Cheapest' | 'Best' | 'Quickest'): Locator {
    return new Locator(
      this.getByRole('button', { name: new RegExp(`^${sortName}`) }).filter({ hasText: /\$\d/ }),
    ).describe(`Sort Button: ${sortName}`);
  }

  /** Collapsed origin summary in the results header form. */
  originSummaryButton(): Locator {
    return this.getByRole('button', { name: /^Flight origin input/ }).describe('Results Origin Summary');
  }

  /** Collapsed destination summary in the results header form. */
  destinationSummaryButton(): Locator {
    return this.getByRole('button', { name: /^Flight destination input/ }).describe('Results Destination Summary');
  }

  /**
   * Date summary in the results header form, matched by the date it displays.
   *
   * The header has two live-observed variants: separate "Departure date Tue 25/8" and
   * "Return date Tue 1/9" buttons, or a single combined "Departure date Tue 25/8 – Tue 1/9"
   * button. Matching any date-summary button that carries the expected date text works
   * for both.
   */
  dateSummaryButton(dateLabel: string): Locator {
    return new Locator(
      this.getByRole('button', { name: /^(Departure|Return) date/ }).filter({ hasText: dateLabel }).first(),
    ).describe(`Results Date Summary: ${dateLabel}`);
  }

  /** Search button in the results header form (bottom anchor of the form region). */
  headerSearchButton(): Locator {
    return this.getByRole('button', { name: 'Search', exact: true }).describe('Results Header Search Button');
  }

  /** Wait until the live fare search yields its first result card. */
  async waitForResults(): Promise<void> {
    await expect(this.firstResultCard(), 'At least one flight result card should appear').toBeVisible({
      timeout: FlightResultsPage.RESULTS_TIMEOUT_MS,
    });
  }

  /** Exam 1c: the URL encodes exactly the searched route and dates. */
  async checkUrlMatchesSearch(
    originCode: string,
    destinationCode: string,
    checkinDate: string,
    checkoutDate: string,
  ): Promise<void> {
    const expectedPath = `/flight-search/${originCode}-${destinationCode}/${checkinDate}/${checkoutDate}`;
    await expect
      .poll(() => this.page.url(), { message: `URL should contain ${expectedPath}` })
      .toContain(expectedPath);
  }

  /** Exam 1c: a meaningful number of result cards rendered. */
  async checkResultsListPopulated(minimumCards: number): Promise<void> {
    await this.waitForResults();
    const cardCount = await this.resultCards().count();
    expect(cardCount, `At least ${minimumCards} result cards should render`).toBeGreaterThanOrEqual(minimumCards);
  }

  /**
   * Exam 1c: each inspected card shows the searched route (airport codes in its legs)
   * and a lead-in price in $ currency.
   */
  async checkCardsShowRouteAndPrice(
    originCodePattern: RegExp,
    destinationCodePattern: RegExp,
    cardsToInspect: number,
  ): Promise<void> {
    const inspected = Math.min(cardsToInspect, await this.resultCards().count());

    for (let i = 0; i < inspected; i++) {
      const card = this.resultCards().nth(i);

      await expect
        .soft(card, `Card ${i} should reference the searched origin airport`)
        .toContainText(originCodePattern);
      await expect
        .soft(card, `Card ${i} should reference the searched destination airport`)
        .toContainText(destinationCodePattern);

      // Ad cards expose the exact price as a button, organic cards as a link — accept either role.
      const priceControl = card
        .getByRole('button', { name: /^\$[\d,]+$/ })
        .or(card.getByRole('link', { name: /^\$[\d,]+$/ }));
      await expect.soft(priceControl.first(), `Card ${i} should show a $ price`).toBeVisible();
    }
  }

  /** Exam 1c: sort tabs are present and each advertises a live price. */
  async checkSortOptionsShowPrices(): Promise<void> {
    for (const sortName of ['Cheapest', 'Best', 'Quickest'] as const) {
      await expect.soft(this.sortButton(sortName), `${sortName} sort tab should be visible`).toBeVisible();
      await expect
        .soft(this.sortButton(sortName), `${sortName} sort tab should advertise a $ price`)
        .toContainText(/\$\d/);
    }
  }

  /** Exam 1c: the header form still shows the searched criteria after navigation. */
  async checkSearchSummaryRetained(
    originName: string,
    destinationName: string,
    checkinDate: string,
    checkoutDate: string,
  ): Promise<void> {
    await expect
      .soft(this.originSummaryButton(), 'Origin summary should retain the searched city')
      .toContainText(originName);
    await expect
      .soft(this.destinationSummaryButton(), 'Destination summary should retain the searched city')
      .toContainText(destinationName);
    await expect
      .soft(this.dateSummaryButton(formatDateAsDayMonthShort(checkinDate)), 'Departure summary should retain the searched date')
      .toBeVisible();
    await expect
      .soft(this.dateSummaryButton(formatDateAsDayMonthShort(checkoutDate)), 'Return summary should retain the searched date')
      .toBeVisible();
  }

  /**
   * POSITION ASSERTIONS (exam must-have): results render below the header search form,
   * and cards stack vertically without overlapping each other.
   */
  async checkResultsBelowSearchForm(): Promise<void> {
    await this.waitForResults();

    const [headerBox, searchButtonBox, firstCardBox] = await Promise.all([
      this.headerBanner().boundingBox(),
      this.headerSearchButton().boundingBox(),
      this.firstResultCard().boundingBox(),
    ]);

    expect(headerBox, 'Header should have a bounding box').toBeTruthy();
    expect(searchButtonBox, 'Header search button should have a bounding box').toBeTruthy();
    expect(firstCardBox, 'First result card should have a bounding box').toBeTruthy();
    if (!headerBox || !searchButtonBox || !firstCardBox) return;

    expect
      .soft(firstCardBox.y, 'First result card should start below the header band')
      .toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    expect
      .soft(firstCardBox.y, 'First result card should start below the search form controls')
      .toBeGreaterThanOrEqual(searchButtonBox.y + searchButtonBox.height);
  }

  /** POSITION ASSERTIONS (exam must-have): inspected cards do not overlap one another. */
  async checkCardsDoNotOverlap(cardsToInspect: number): Promise<void> {
    await this.waitForResults();

    const inspected = Math.min(cardsToInspect, await this.resultCards().count());
    expect(inspected, 'Need at least two cards to check stacking').toBeGreaterThanOrEqual(2);

    const boxes = [];
    for (let i = 0; i < inspected; i++) {
      const box = await this.resultCards().nth(i).boundingBox();
      expect(box, `Card ${i} should have a bounding box`).toBeTruthy();
      if (!box) return;
      boxes.push(box);
    }

    const viewport = await this.viewportSize();
    for (let i = 0; i < boxes.length; i++) {
      if (i < boxes.length - 1) {
        expect
          .soft(
            boxes[i].y + boxes[i].height,
            `Card ${i} bottom edge should sit above card ${i + 1} top edge (no overlap)`,
          )
          .toBeLessThanOrEqual(boxes[i + 1].y + 1); // 1px rendering tolerance
      }
      expect.soft(boxes[i].x, `Card ${i} should not overflow the left viewport edge`).toBeGreaterThanOrEqual(0);
      expect
        .soft(boxes[i].x + boxes[i].width, `Card ${i} should not overflow the right viewport edge`)
        .toBeLessThanOrEqual(viewport.width);
    }
  }
}
