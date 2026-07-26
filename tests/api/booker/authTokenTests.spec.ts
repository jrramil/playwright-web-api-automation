import { test, expect } from '@playwright/extension';
import { getApiAuth } from '@config';
import { postAuth } from '@steps';

/**
 * Supporting coverage — POST /auth issues the token that UpdateBooking and
 * DeleteBooking require. Not one of the four exam endpoints, but the auth
 * contract underpins 2b and 2d, and the negative path exposes a defect.
 */
test.describe('AuthTokenTests', () => {
  test('AuthTokenIssuedForValidCredentialsTest @smoke', async ({ request }) => {
    await test.step('Step 1: POST /auth with the configured credentials', async () => {
      const { Username, Password } = getApiAuth('RestfulBooker');
      const response = await postAuth(request, Username, Password);

      expect(response.status(), 'POST /auth with valid credentials should return 200').toBe(200);
      expect
        .soft(response.headers()['content-type'], 'POST /auth should respond with JSON')
        .toContain('application/json');

      const body = (await response.json()) as { token: string };
      expect.soft(Object.keys(body), 'Auth success body should contain only a token field').toEqual(['token']);
      expect
        .soft(body.token, 'Token should be a 15-character lowercase hex string')
        .toMatch(/^[a-f0-9]{15}$/);
    });
  });

  /**
   * DEFECT: bad credentials return HTTP 200 with a `reason` body instead of
   * 401 Unauthorized. The test pins the observed behaviour.
   */
  test('AuthBadCredentialsReturns200WithReasonTest', async ({ request }) => {
    await test.step('Step 1: POST /auth with a wrong password', async () => {
      const { Username } = getApiAuth('RestfulBooker');
      const response = await postAuth(request, Username, 'definitely-wrong-password');

      expect(
        response.status(),
        'Observed defect: bad credentials return 200 with a reason body (expected 401)',
      ).toBe(200);

      const body = (await response.json()) as { reason: string };
      expect.soft(body.reason, 'Failure body should carry the Bad credentials reason').toBe('Bad credentials');
      expect.soft(Object.keys(body), 'Failure body should contain only the reason field').toEqual(['reason']);
    });
  });
});
