import { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/extension';
import { getApiAuth, getPortalUrl } from '@config';
import { generateFutureDate, generateRandomString } from '@util';

/**
 * Reusable request steps for the restful-booker API (https://restful-booker.herokuapp.com).
 *
 * Design notes:
 * - restful-booker is a shared public sandbox: every spec creates its own booking and
 *   asserts only against that bookingid. Nothing here reads or asserts pre-existing data.
 * - Steps return raw APIResponse objects so specs own the status/body assertions;
 *   the only exception is `createBookingForTest`, a setup helper that hard-fails
 *   early when the sandbox is unavailable.
 */

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

export interface CreatedBookingResponse {
  bookingid: number;
  booking: Booking;
}

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

// Heroku free dynos sleep when idle; the first request after a cold start can exceed
// Playwright's 30s default request timeout, so every step allows a generous window.
const REQUEST_TIMEOUT_MS = 60_000;

function baseUrl(): string {
  return getPortalUrl('RestfulBooker_Api');
}

/** Unique, recognisable payload per test so parallel runs never collide on the shared sandbox. */
export async function buildBookingPayload(overrides: Partial<Booking> = {}): Promise<Booking> {
  const unique = await generateRandomString(8);
  return {
    firstname: `Fn-${unique}`,
    lastname: `Ln-${unique}`,
    totalprice: 1234,
    depositpaid: true,
    bookingdates: {
      checkin: await generateFutureDate(30),
      checkout: await generateFutureDate(37),
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

/** POST /auth with credentials from config. Returns the raw response. */
export async function postAuth(request: APIRequestContext, username: string, password: string): Promise<APIResponse> {
  return request.post(`${baseUrl()}/auth`, {
    headers: JSON_HEADERS,
    data: { username, password },
    timeout: REQUEST_TIMEOUT_MS,
  });
}

/** POST /auth with the configured admin credentials and return the issued token. */
export async function createAuthToken(request: APIRequestContext): Promise<string> {
  const { Username, Password } = getApiAuth('RestfulBooker');
  const response = await postAuth(request, Username, Password);
  expect(response.status(), 'POST /auth with valid credentials should return 200').toBe(200);

  const body = (await response.json()) as { token?: string };
  expect(body.token, 'POST /auth response should contain a token').toBeTruthy();
  return body.token as string;
}

/** POST /booking. Returns the raw response; specs assert status and body. */
export async function postBooking(request: APIRequestContext, payload: unknown): Promise<APIResponse> {
  return request.post(`${baseUrl()}/booking`, { headers: JSON_HEADERS, data: payload, timeout: REQUEST_TIMEOUT_MS });
}

/** GET /booking/:id. Accepts string ids so specs can also probe invalid id formats. */
export async function getBooking(request: APIRequestContext, bookingId: number | string): Promise<APIResponse> {
  return request.get(`${baseUrl()}/booking/${bookingId}`, { headers: { Accept: 'application/json' }, timeout: REQUEST_TIMEOUT_MS });
}

/** GET /booking (list of {bookingid}), optionally filtered by query params. */
export async function getBookingIds(
  request: APIRequestContext,
  params?: Record<string, string>,
): Promise<APIResponse> {
  return request.get(`${baseUrl()}/booking`, { headers: { Accept: 'application/json' }, params, timeout: REQUEST_TIMEOUT_MS });
}

/** PUT /booking/:id. Token optional so specs can exercise the missing-auth path. */
export async function putBooking(
  request: APIRequestContext,
  bookingId: number,
  payload: unknown,
  token?: string,
): Promise<APIResponse> {
  return request.put(`${baseUrl()}/booking/${bookingId}`, {
    headers: { ...JSON_HEADERS, ...(token ? { Cookie: `token=${token}` } : {}) },
    data: payload,
    timeout: REQUEST_TIMEOUT_MS,
  });
}

/** PATCH /booking/:id. Token optional so specs can exercise the missing-auth path. */
export async function patchBooking(
  request: APIRequestContext,
  bookingId: number,
  payload: unknown,
  token?: string,
): Promise<APIResponse> {
  return request.patch(`${baseUrl()}/booking/${bookingId}`, {
    headers: { ...JSON_HEADERS, ...(token ? { Cookie: `token=${token}` } : {}) },
    data: payload,
    timeout: REQUEST_TIMEOUT_MS,
  });
}

/** DELETE /booking/:id. Token optional so specs can exercise the missing-auth path. */
export async function deleteBooking(
  request: APIRequestContext,
  bookingId: number,
  token?: string,
): Promise<APIResponse> {
  return request.delete(`${baseUrl()}/booking/${bookingId}`, {
    headers: token ? { Cookie: `token=${token}` } : {},
    timeout: REQUEST_TIMEOUT_MS,
  });
}

/**
 * Positive-path helper: run an authenticated request with a freshly issued token,
 * re-authenticating and retrying ONCE if the sandbox rejects the fresh token.
 *
 * Why: restful-booker keeps tokens in memory on a single free-tier Heroku dyno; a dyno
 * cycle between POST /auth and the write call invalidates a just-issued token and
 * produces a spurious 403. Negative tests (no/invalid token) never use this helper,
 * so deliberate 403 assertions stay untouched.
 */
export async function sendWithFreshTokenRetry(
  request: APIRequestContext,
  action: (token: string) => Promise<APIResponse>,
): Promise<APIResponse> {
  let response = await action(await createAuthToken(request));
  if (response.status() === 403) {
    console.warn(
      'Received 403 with a freshly issued token (known restful-booker in-memory token flake) — re-authenticating and retrying once.',
    );
    response = await action(await createAuthToken(request));
  }
  return response;
}

/** Setup helper: create a booking and fail fast if the sandbox rejects it. */
export async function createBookingForTest(
  request: APIRequestContext,
  payload: Booking,
): Promise<CreatedBookingResponse> {
  const response = await postBooking(request, payload);
  expect(response.status(), 'Setup: POST /booking should return 200').toBe(200);

  const body = (await response.json()) as CreatedBookingResponse;
  expect(typeof body.bookingid, 'Setup: POST /booking should return a numeric bookingid').toBe('number');
  return body;
}

/** Teardown helper: best-effort delete that tolerates bookings already removed by the test. */
export async function deleteBookingIfExists(
  request: APIRequestContext,
  bookingId: number,
  token: string,
): Promise<void> {
  const response = await deleteBooking(request, bookingId, token);
  // 201 = deleted; 405 = restful-booker's response for an id that no longer exists.
  if (![201, 405].includes(response.status())) {
    console.warn(`Cleanup: DELETE /booking/${bookingId} returned unexpected status ${response.status()}`);
  }
}

/**
 * Field-by-field comparison of a booking body against the expected payload.
 * Soft assertions so every mismatched field is reported in a single run.
 */
export function checkBookingFields(actual: Booking, expected: Booking, context: string): void {
  expect.soft(typeof actual.firstname, `${context}: firstname should be a string`).toBe('string');
  expect.soft(actual.firstname, `${context}: firstname should echo the sent value`).toBe(expected.firstname);

  expect.soft(typeof actual.lastname, `${context}: lastname should be a string`).toBe('string');
  expect.soft(actual.lastname, `${context}: lastname should echo the sent value`).toBe(expected.lastname);

  expect.soft(typeof actual.totalprice, `${context}: totalprice should be a number`).toBe('number');
  expect.soft(actual.totalprice, `${context}: totalprice should echo the sent value`).toBe(expected.totalprice);

  expect.soft(typeof actual.depositpaid, `${context}: depositpaid should be a boolean`).toBe('boolean');
  expect.soft(actual.depositpaid, `${context}: depositpaid should echo the sent value`).toBe(expected.depositpaid);

  expect.soft(actual.bookingdates, `${context}: bookingdates should be an object`).toBeTruthy();
  expect
    .soft(actual.bookingdates?.checkin, `${context}: bookingdates.checkin should echo the sent value`)
    .toBe(expected.bookingdates.checkin);
  expect
    .soft(actual.bookingdates?.checkout, `${context}: bookingdates.checkout should echo the sent value`)
    .toBe(expected.bookingdates.checkout);

  expect.soft(typeof actual.additionalneeds, `${context}: additionalneeds should be a string`).toBe('string');
  expect
    .soft(actual.additionalneeds, `${context}: additionalneeds should echo the sent value`)
    .toBe(expected.additionalneeds);

  // Guard against extra/renamed fields sneaking into the contract.
  expect
    .soft(Object.keys(actual).sort(), `${context}: body should contain exactly the six booking fields`)
    .toEqual(['additionalneeds', 'bookingdates', 'depositpaid', 'firstname', 'lastname', 'totalprice']);
}
