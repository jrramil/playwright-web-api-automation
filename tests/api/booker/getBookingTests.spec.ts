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
 * Exam 2c — GetBooking (GET /booking/:id and GET /booking).
 *
 * Every test creates its own booking first; nothing asserts against pre-existing
 * sandbox data or total record counts (other users mutate this API constantly).
 */
test.describe('GetBookingTests', () => {
  const createdBookingIds: number[] = [];

  test.afterEach(async ({ request }) => {
    const token = await createAuthToken(request);
    for (const id of createdBookingIds.splice(0)) {
      await deleteBookingIfExists(request, id, token);
    }
  });

  test('GetBookingReturnsAllFieldsTest @smoke', async ({ request }) => {
    const payload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking to read back', async () => {
      const created = await createBookingForTest(request, payload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: GET /booking/:id and assert every field', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'GET /booking/:id should return 200').toBe(200);
      expect
        .soft(response.headers()['content-type'], 'GET /booking/:id should respond with JSON')
        .toContain('application/json');

      // GET returns the booking object directly — no bookingid wrapper.
      checkBookingFields((await response.json()) as Booking, payload, 'GET /booking/:id response');
    });
  });

  test('GetBookingListContainsCreatedBookingTest', async ({ request }) => {
    const payload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking with unique names', async () => {
      const created = await createBookingForTest(request, payload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: GET /booking filtered by the unique names', async () => {
      const response = await getBookingIds(request, {
        firstname: payload.firstname,
        lastname: payload.lastname,
      });

      expect(response.status(), 'GET /booking should return 200').toBe(200);

      const ids = (await response.json()) as Array<{ bookingid: number }>;
      expect(Array.isArray(ids), 'GET /booking should return an array').toBe(true);
      expect.soft(ids.length, 'Filter on unique names should match exactly the created booking').toBe(1);
      expect.soft(ids[0]?.bookingid, 'List entry should carry the created bookingid').toBe(bookingId);
      expect
        .soft(
          ids.every((entry) => Object.keys(entry).length === 1 && Number.isInteger(entry.bookingid)),
          'Every list entry should be exactly { bookingid: <int> }',
        )
        .toBe(true);
    });
  });

  test('GetBookingNonexistentIdReturns404Test', async ({ request }) => {
    let deletedId: number;

    await test.step('Step 1: Create and delete a booking to obtain a guaranteed-nonexistent id', async () => {
      const created = await createBookingForTest(request, await buildBookingPayload());
      const deleteResponse = await sendWithFreshTokenRetry(request, (token) =>
        deleteBooking(request, created.bookingid, token),
      );
      expect(deleteResponse.status(), 'Setup: DELETE should succeed').toBe(201);
      deletedId = created.bookingid;
    });

    await test.step('Step 2: GET the deleted id and expect 404', async () => {
      const response = await getBooking(request, deletedId);

      expect(response.status(), 'GET /booking/:id for a nonexistent id should return 404').toBe(404);
      expect.soft(await response.text(), '404 body should be the plain-text Not Found').toContain('Not Found');
    });
  });

  test('GetBookingInvalidIdFormatReturns404Test', async ({ request }) => {
    await test.step('Step 1: GET /booking/:id with a non-numeric id', async () => {
      const response = await getBooking(request, 'not-a-valid-id');

      expect(response.status(), 'GET /booking/:id with a non-numeric id should return 404').toBe(404);
    });
  });
});
