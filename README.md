# Web & API Test Automation

Playwright + TypeScript suites for the two case studies:

- **Web** — [cheapflights.com.au](https://www.cheapflights.com.au/): `tests/web/cheapflights/` (6 tests)
- **API** — [restful-booker](https://restful-booker.herokuapp.com): `tests/api/booker/` (19 tests)

Manual test cases, each mapped to the spec that automates it: [docs/test-cases/](docs/test-cases/idverse-technical-exam-test-cases.md)

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test              # everything — API in parallel, then web
npm run test:api      # API suite only (no browser)
npm run test:web      # web suite only
npm run test:smoke    # @smoke-tagged subset
npm run test:headed   # visible browser
npm run report        # open the HTML report from the last run
npx tsc --noEmit      # type check
```

The web suite runs on a single worker: concurrent live fare searches degrade cheapflights' own responses. There are no retries and no fixed waits anywhere in the suite.

Browser via `BROWSER=chromium|firefox|webkit|all`; environment via `ENVIRONMENT=qa|development|staging|production` (default `qa`). Base URLs and API credentials come from `config/configsettings.<env>.json` — nothing is hardcoded in specs.

## Notes on the API

Four defects were found in restful-booker and are pinned to the **observed** behaviour so the suite runs green, each flagged in a comment on the test that covers it:

| Observed | Expected |
|---|---|
| `POST /booking` missing required fields → `500` | `400 Bad Request` |
| `POST /auth` bad credentials → `200` with `{"reason":"Bad credentials"}` | `401 Unauthorized` |
| `POST /booking` non-numeric `totalprice` → `200`, stored as `null` | `400 Bad Request` |
| `DELETE /booking/:id` success → `201 Created` | `200 OK` / `204 No Content` |

restful-booker is a shared public sandbox, so every test creates its own booking, asserts only against that `bookingid`, and deletes what it created. No test asserts on pre-existing data or record counts.
