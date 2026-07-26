import { test, expect } from '@playwright/extension';
import {
  Booking,
  CreatedBookingResponse,
  buildBookingPayload,
  checkBookingFields,
  createAuthToken,
  deleteBookingIfExists,
  getBooking,
  postBooking,
} from '@steps';

/**
 * Exam 2a — CreateBooking (POST /booking).
 *
 * restful-booker is a shared public sandbox, so every test creates its own booking,
 * asserts only against that bookingid, and deletes what it created.
 */
test.describe('CreateBookingTests', () => {
  const createdBookingIds: number[] = [];

  test.afterEach(async ({ request }) => {
    const token = await createAuthToken(request);
    for (const id of createdBookingIds.splice(0)) {
      await deleteBookingIfExists(request, id, token);
    }
  });

  test('CreateBookingReturnsBookingIdAndAllFieldsTest @smoke', async ({ request }) => {
    const payload = await buildBookingPayload();
    let created: CreatedBookingResponse;

    await test.step('Step 1: POST /booking with a full valid payload', async () => {
      const response = await postBooking(request, payload);

      expect(response.status(), 'POST /booking should return 200').toBe(200);
      expect
        .soft(response.headers()['content-type'], 'POST /booking should respond with JSON')
        .toContain('application/json');

      created = (await response.json()) as CreatedBookingResponse;
      createdBookingIds.push(created.bookingid);
    });

    await test.step('Step 2: Assert every response field (bookingid + all booking fields)', async () => {
      expect.soft(typeof created.bookingid, 'bookingid should be a number').toBe('number');
      expect.soft(created.bookingid, 'bookingid should be a positive integer').toBeGreaterThan(0);
      expect.soft(Number.isInteger(created.bookingid), 'bookingid should be an integer').toBe(true);
      expect
        .soft(Object.keys(created).sort(), 'response should contain exactly bookingid and booking')
        .toEqual(['booking', 'bookingid']);

      checkBookingFields(created.booking, payload, 'POST /booking response');
    });

    await test.step('Step 3: GET the new booking to confirm it was persisted with the same fields', async () => {
      const response = await getBooking(request, created.bookingid);

      expect(response.status(), 'GET /booking/:id after create should return 200').toBe(200);
      checkBookingFields((await response.json()) as Booking, payload, 'GET after create');
    });
  });

  test('CreateBookingWithZeroPriceAndDepositUnpaidTest', async ({ request }) => {
    // Boundary values: zero price and false deposit must be echoed, not dropped or defaulted.
    const payload = await buildBookingPayload({ totalprice: 0, depositpaid: false, additionalneeds: '' });

    await test.step('Step 1: POST /booking with boundary values', async () => {
      const response = await postBooking(request, payload);
      expect(response.status(), 'POST /booking should return 200').toBe(200);

      const created = (await response.json()) as CreatedBookingResponse;
      createdBookingIds.push(created.bookingid);

      checkBookingFields(created.booking, payload, 'POST /booking boundary response');
    });
  });

  /**
   * DEFECT: a non-numeric totalprice is accepted with 200 and silently stored as
   * null, where a 400 Bad Request is the correct response.
   * Verified live on 2026-07-26. The test pins the observed behaviour.
   */
  test('CreateBookingNonNumericPriceStoredAsNullTest', async ({ request }) => {
    await test.step('Step 1: POST /booking with a string totalprice', async () => {
      const payload = { ...(await buildBookingPayload()), totalprice: 'not-a-number' };
      const response = await postBooking(request, payload);

      expect(
        response.status(),
        'Observed defect: invalid totalprice type is accepted with 200 (expected 400)',
      ).toBe(200);

      const created = (await response.json()) as CreatedBookingResponse;
      createdBookingIds.push(created.bookingid);

      expect
        .soft(created.booking.totalprice, 'Observed defect: invalid totalprice is silently stored as null')
        .toBeNull();
    });
  });

  /**
   * DEFECT: the API returns 500 Internal Server Error for a payload missing required
   * fields, where a 400 Bad Request is the correct response.
   * The test pins the observed behaviour so a future fix surfaces as a test failure.
   */
  test('CreateBookingMissingRequiredFieldsReturns500Test', async ({ request }) => {
    await test.step('Step 1: POST /booking with only a firstname', async () => {
      const response = await postBooking(request, { firstname: 'MissingEverythingElse' });

      expect(response.status(), 'Observed defect: missing required fields returns 500 (expected 400)').toBe(500);
      expect.soft(await response.text(), 'Error body should be the plain-text server error').toContain(
        'Internal Server Error',
      );
    });

    await test.step('Step 2: POST /booking with an empty payload', async () => {
      const response = await postBooking(request, {});

      expect(response.status(), 'Observed defect: empty payload returns 500 (expected 400)').toBe(500);
    });
  });
});
