import { test, expect } from '@playwright/extension';
import {
  Booking,
  buildBookingPayload,
  checkBookingFields,
  createAuthToken,
  createBookingForTest,
  deleteBooking,
  deleteBookingIfExists,
  getBooking,
  getBookingIds,
  sendWithFreshTokenRetry,
} from '@steps';

/**
 * Exam 2d — DeleteBooking (DELETE /booking/:id).
 *
 * Requires a token issued by POST /auth (Cookie: token=<token>).
 * Every test creates its own booking; nothing touches pre-existing sandbox data.
 */
test.describe('DeleteBookingTests', () => {
  const createdBookingIds: number[] = [];

  test.afterEach(async ({ request }) => {
    const token = await createAuthToken(request);
    for (const id of createdBookingIds.splice(0)) {
      await deleteBookingIfExists(request, id, token);
    }
  });

  /**
   * API QUIRK: a successful DELETE returns 201 Created instead of 200 OK /
   * 204 No Content. The test pins the observed
   * behaviour so a future contract change surfaces as a failure.
   */
  test('DeleteBookingRemovesBookingTest @smoke', async ({ request }) => {
    const payload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking to delete', async () => {
      const created = await createBookingForTest(request, payload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: DELETE /booking/:id with a valid token and assert the observed 201', async () => {
      const response = await sendWithFreshTokenRetry(request, (token) => deleteBooking(request, bookingId, token));

      expect(response.status(), 'Observed API quirk: successful DELETE returns 201 Created').toBe(201);
      expect.soft(await response.text(), 'DELETE success body should be the plain-text Created').toContain('Created');
    });

    await test.step('Step 3: GET the deleted id and expect 404', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'GET after DELETE should return 404').toBe(404);
    });

    await test.step('Step 4: Confirm the filtered booking list no longer contains the id', async () => {
      const response = await getBookingIds(request, {
        firstname: payload.firstname,
        lastname: payload.lastname,
      });

      expect(response.status(), 'GET /booking should return 200').toBe(200);
      const ids = (await response.json()) as Array<{ bookingid: number }>;
      expect(
        ids.some((entry) => entry.bookingid === bookingId),
        'Deleted bookingid should no longer appear in the filtered list',
      ).toBe(false);
    });
  });

  test('DeleteBookingWithoutTokenReturns403Test', async ({ request }) => {
    const payload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking to protect', async () => {
      const created = await createBookingForTest(request, payload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: DELETE without a token and expect 403', async () => {
      const response = await deleteBooking(request, bookingId);

      expect(response.status(), 'DELETE /booking/:id without a token should return 403').toBe(403);
      expect.soft(await response.text(), '403 body should be the plain-text Forbidden').toContain('Forbidden');
    });

    await test.step('Step 3: GET the booking to confirm it still exists with all fields intact', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'Booking should survive an unauthorised DELETE').toBe(200);
      checkBookingFields((await response.json()) as Booking, payload, 'GET after rejected DELETE');
    });
  });

  test('DeleteBookingNonexistentIdReturns405Test', async ({ request }) => {
    let deletedId: number;

    await test.step('Step 1: Create and delete a booking to obtain a guaranteed-nonexistent id', async () => {
      const created = await createBookingForTest(request, await buildBookingPayload());
      const deleteResponse = await sendWithFreshTokenRetry(request, (token) =>
        deleteBooking(request, created.bookingid, token),
      );
      expect(deleteResponse.status(), 'Setup: DELETE should succeed').toBe(201);
      deletedId = created.bookingid;
    });

    await test.step('Step 2: DELETE the same id again with a valid token and expect 405', async () => {
      const response = await sendWithFreshTokenRetry(request, (token) => deleteBooking(request, deletedId, token));

      expect(response.status(), 'DELETE /booking/:id for a nonexistent id should return 405').toBe(405);
      expect
        .soft(await response.text(), '405 body should be the plain-text Method Not Allowed')
        .toContain('Method Not Allowed');
    });
  });
});
