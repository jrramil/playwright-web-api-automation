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
  patchBooking,
  putBooking,
  sendWithFreshTokenRetry,
} from '@steps';

/**
 * Exam 2b — UpdateBooking (PUT /booking/:id full update, PATCH /booking/:id partial update).
 *
 * Both verbs require a token issued by POST /auth, sent as `Cookie: token=<token>`.
 * Every test creates its own booking and cleans it up afterwards.
 */
test.describe('UpdateBookingTests', () => {
  const createdBookingIds: number[] = [];

  test.afterEach(async ({ request }) => {
    const token = await createAuthToken(request);
    for (const id of createdBookingIds.splice(0)) {
      await deleteBookingIfExists(request, id, token);
    }
  });

  test('UpdateBookingPutReplacesAllFieldsTest @smoke', async ({ request }) => {
    const originalPayload = await buildBookingPayload();
    const updatedPayload = await buildBookingPayload({
      totalprice: 4321,
      depositpaid: false,
      additionalneeds: 'Late checkout',
    });
    let bookingId: number;

    await test.step('Step 1: Create a booking to update', async () => {
      const created = await createBookingForTest(request, originalPayload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: PUT /booking/:id with a full replacement payload and a valid token', async () => {
      const response = await sendWithFreshTokenRetry(request, (token) =>
        putBooking(request, bookingId, updatedPayload, token),
      );

      expect(response.status(), 'PUT /booking/:id with valid token should return 200').toBe(200);
      expect
        .soft(response.headers()['content-type'], 'PUT /booking/:id should respond with JSON')
        .toContain('application/json');

      checkBookingFields((await response.json()) as Booking, updatedPayload, 'PUT response');
    });

    await test.step('Step 3: GET the booking to confirm the update persisted', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'GET after PUT should return 200').toBe(200);
      checkBookingFields((await response.json()) as Booking, updatedPayload, 'GET after PUT');
    });
  });

  test('UpdateBookingPatchChangesOnlySentFieldsTest', async ({ request }) => {
    const originalPayload = await buildBookingPayload();
    const partialUpdate = { firstname: 'PatchedFirstname', totalprice: 999 };
    let bookingId: number;

    await test.step('Step 1: Create a booking to partially update', async () => {
      const created = await createBookingForTest(request, originalPayload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: PATCH /booking/:id with two fields and assert the merged body', async () => {
      const response = await sendWithFreshTokenRetry(request, (token) =>
        patchBooking(request, bookingId, partialUpdate, token),
      );

      expect(response.status(), 'PATCH /booking/:id with valid token should return 200').toBe(200);

      // The response must contain the two patched values and leave every other field untouched.
      const expectedAfterPatch: Booking = { ...originalPayload, ...partialUpdate };
      checkBookingFields((await response.json()) as Booking, expectedAfterPatch, 'PATCH response');
    });
  });

  test('UpdateBookingWithoutTokenReturns403Test', async ({ request }) => {
    const originalPayload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking to protect', async () => {
      const created = await createBookingForTest(request, originalPayload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: PUT without a token and expect 403', async () => {
      const response = await putBooking(request, bookingId, await buildBookingPayload());

      expect(response.status(), 'PUT /booking/:id without a token should return 403').toBe(403);
      expect.soft(await response.text(), '403 body should be the plain-text Forbidden').toContain('Forbidden');
    });

    await test.step('Step 3: GET the booking to confirm it was not modified', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'GET after rejected PUT should return 200').toBe(200);
      checkBookingFields((await response.json()) as Booking, originalPayload, 'GET after rejected PUT');
    });
  });

  test('UpdateBookingPatchWithoutTokenReturns403Test', async ({ request }) => {
    const originalPayload = await buildBookingPayload();
    let bookingId: number;

    await test.step('Step 1: Create a booking to protect', async () => {
      const created = await createBookingForTest(request, originalPayload);
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: PATCH without a token and expect 403', async () => {
      const response = await patchBooking(request, bookingId, { firstname: 'NoAuthPatch' });

      expect(response.status(), 'PATCH /booking/:id without a token should return 403').toBe(403);
      expect.soft(await response.text(), '403 body should be the plain-text Forbidden').toContain('Forbidden');
    });

    await test.step('Step 3: GET the booking to confirm it was not modified', async () => {
      const response = await getBooking(request, bookingId);

      expect(response.status(), 'GET after rejected PATCH should return 200').toBe(200);
      checkBookingFields((await response.json()) as Booking, originalPayload, 'GET after rejected PATCH');
    });
  });

  test('UpdateBookingWithInvalidTokenReturns403Test', async ({ request }) => {
    let bookingId: number;

    await test.step('Step 1: Create a booking to protect', async () => {
      const created = await createBookingForTest(request, await buildBookingPayload());
      bookingId = created.bookingid;
      createdBookingIds.push(bookingId);
    });

    await test.step('Step 2: PUT with a bogus token and expect 403', async () => {
      const response = await putBooking(request, bookingId, await buildBookingPayload(), 'invalidtoken1234');

      expect(response.status(), 'PUT /booking/:id with an invalid token should return 403').toBe(403);
    });
  });

  test('UpdateBookingNonexistentIdReturns405Test', async ({ request }) => {
    let deletedId: number;

    await test.step('Step 1: Create and delete a booking to obtain a guaranteed-nonexistent id', async () => {
      const created = await createBookingForTest(request, await buildBookingPayload());
      const deleteResponse = await sendWithFreshTokenRetry(request, (token) =>
        deleteBooking(request, created.bookingid, token),
      );
      expect(deleteResponse.status(), 'Setup: DELETE should succeed').toBe(201);
      deletedId = created.bookingid;
    });

    await test.step('Step 2: PUT the deleted id with a valid token and expect 405', async () => {
      const payload = await buildBookingPayload();
      const response = await sendWithFreshTokenRetry(request, (token) =>
        putBooking(request, deletedId, payload, token),
      );

      expect(response.status(), 'PUT /booking/:id for a nonexistent id should return 405').toBe(405);
      expect
        .soft(await response.text(), '405 body should be the plain-text Method Not Allowed')
        .toContain('Method Not Allowed');
    });
  });
});
