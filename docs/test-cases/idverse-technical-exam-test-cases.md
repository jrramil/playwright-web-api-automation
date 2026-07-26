# IDVerse Technical Exam — Test Cases

Drafted by `test-case-author` on 2026-07-26 against live-verified behaviour of
https://www.cheapflights.com.au and https://restful-booker.herokuapp.com.
Format per [docs/onboarding/test-case-template.md](../onboarding/test-case-template.md).

## Index

| Case ID | Title | Automation Mapping |
|---|---|---|
| CF-TC-001 | CheapFlights Web – Homepage – Header Branding Display – Logo and Sign In Visible and Correctly Positioned - Positive | `tests/web/cheapflights/logoAndLoginDisplayTests.spec.ts` — `HomeLogoAndLoginButtonDisplayedTest`, `HomeLogoAndLoginButtonPositionTest` |
| CF-TC-002 | CheapFlights Web – Flight Search – SYD to MEL Search Submission – Navigates to Results URL for Route and Dates - Positive | `tests/web/cheapflights/flightSearchTests.spec.ts` — `FlightSearchNavigatesToResultsTest` |
| CF-TC-003 | CheapFlights Web – Flight Search – Search Submitted with Empty Origin – From-Airport Validation Alert Displayed - Negative | `tests/web/cheapflights/flightSearchTests.spec.ts` — `FlightSearchEmptyOriginShowsValidationErrorTest` |
| CF-TC-004 | CheapFlights Web – Flight Search Results – SYD to MEL Results Rendering – Cards Show Route, Price and Correct Layout - Positive | `tests/web/cheapflights/flightSearchResultsTests.spec.ts` — `FlightSearchResultsContentAssertionsTest`, `FlightSearchResultsPositionAssertionsTest` |
| RB-TC-001 | Restful Booker API – Authentication – POST /auth with Valid Credentials – Token Issued - Positive | `tests/api/booker/authTokenTests.spec.ts` — `AuthTokenIssuedForValidCredentialsTest` |
| RB-TC-002 | Restful Booker API – Authentication – POST /auth with Invalid Credentials – Bad Credentials Reason Returned - Negative | `tests/api/booker/authTokenTests.spec.ts` — `AuthBadCredentialsReturns200WithReasonTest` |
| RB-TC-003 | Restful Booker API – Booking Creation – POST /booking with Full Valid Payload – Booking Created and Persisted with All Fields - Positive | `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingReturnsBookingIdAndAllFieldsTest` |
| RB-TC-004 | Restful Booker API – Booking Creation – POST /booking with Boundary Values – Zero Price and Unpaid Deposit Echoed Correctly - Positive | `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingWithZeroPriceAndDepositUnpaidTest` |
| RB-TC-005 | Restful Booker API – Booking Creation – POST /booking with Missing Required Fields – Server Error Returned - Negative | `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingMissingRequiredFieldsReturns500Test` |
| RB-TC-006 | Restful Booker API – Booking Retrieval – GET Booking by Id and by Filtered List – Created Booking Returned with All Fields - Positive | `tests/api/booker/getBookingTests.spec.ts` — `GetBookingReturnsAllFieldsTest`, `GetBookingListContainsCreatedBookingTest` |
| RB-TC-007 | Restful Booker API – Booking Retrieval – GET Booking with Nonexistent or Invalid Id – Not Found Returned - Negative | `tests/api/booker/getBookingTests.spec.ts` — `GetBookingNonexistentIdReturns404Test`, `GetBookingInvalidIdFormatReturns404Test` |
| RB-TC-008 | Restful Booker API – Booking Update – PUT Booking with Valid Token – Booking Fully Replaced and Persisted - Positive | `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPutReplacesAllFieldsTest` |
| RB-TC-009 | Restful Booker API – Booking Update – PATCH Booking with Valid Token – Only Sent Fields Updated - Positive | `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPatchChangesOnlySentFieldsTest` |
| RB-TC-010 | Restful Booker API – Booking Update – PUT Booking without Valid Token or on Nonexistent Id – Update Rejected - Negative | `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingWithoutTokenReturns403Test`, `UpdateBookingWithInvalidTokenReturns403Test`, `UpdateBookingNonexistentIdReturns405Test` |
| RB-TC-011 | Restful Booker API – Booking Deletion – DELETE Booking with Valid Token – Booking Removed - Positive | `tests/api/booker/deleteBookingTests.spec.ts` — `DeleteBookingRemovesBookingTest` |
| RB-TC-012 | Restful Booker API – Booking Deletion – DELETE Booking without Valid Token or on Nonexistent Id – Deletion Rejected - Negative | `tests/api/booker/deleteBookingTests.spec.ts` — `DeleteBookingWithoutTokenReturns403Test`, `DeleteBookingNonexistentIdReturns405Test` |
| RB-TC-013 | Restful Booker API – Booking Creation – POST /booking with Non-Numeric Price – Invalid Type Accepted and Stored as Null - Negative | `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingNonNumericPriceStoredAsNullTest` |
| RB-TC-014 | Restful Booker API – Booking Update – PATCH Booking without Valid Token – Update Rejected - Negative | `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPatchWithoutTokenReturns403Test` |

---

## Test Case: CF-TC-001

**Title:** `CheapFlights Web – Homepage – Header Branding Display – Logo and Sign In Visible and Correctly Positioned - Positive`

**Suite Placement:**
```
CheapFlights Web
 → Regression Suite (Scenario-based)
   → Homepage
     → Header Branding Display and Position Validation
```

**Area Path:** `IDVerse Technical Exam\CheapFlights Web\Homepage` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- No prerequisite test data — public marketing site, no account or login required.

**Negative variant:** N/A — static header rendering takes no user input that could produce a failure state; negative coverage for this page is owned by CF-TC-003 (form misuse).

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the CheapFlights homepage (https://www.cheapflights.com.au) | Flight search form (role=search) and Origin location combobox are visible |
| 2 | Locate the header banner landmark | Header banner (role=banner) is present and visible |
| 3 | Inspect the brand logo link ("Go to the cheapflights homepage") | Logo link is visible |
| 4 | Inspect the Sign in button | Sign in button is visible and enabled |
| 5 | POSITION — measure the Logo bounding box against the Header bounding box | Logo top edge (y) ≥ Header top edge, and Logo bottom edge (y + height) ≤ Header bottom edge |
| 6 | POSITION — measure the Sign in button bounding box against the Header bounding box | Sign in top edge (y) ≥ Header top edge, and Sign in bottom edge (y + height) ≤ Header bottom edge |
| 7 | POSITION — compare Logo and Sign in horizontal placement | Logo's right edge (x + width) is left of Sign in's left edge (x), and Sign in's left edge (x) is greater than half the viewport width |
| 8 | POSITION — verify neither element overflows the viewport | Logo.x ≥ 0, Logo.y ≥ 0, and Sign in right edge (x + width) ≤ viewport width |
| 9 | POSITION — measure the Search Form bounding box against the Header bounding box | Search form top edge (y) ≥ Header bottom edge (Header.y + Header.height) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/web/cheapflights/logoAndLoginDisplayTests.spec.ts` — `HomeLogoAndLoginButtonDisplayedTest`, `HomeLogoAndLoginButtonPositionTest`

---

## Test Case: CF-TC-002

**Title:** `CheapFlights Web – Flight Search – SYD to MEL Search Submission – Navigates to Results URL for Route and Dates - Positive`

**Suite Placement:**
```
CheapFlights Web
 → Regression Suite (Scenario-based)
   → Flight Search
     → SYD-MEL Search Submission Validation
```

**Area Path:** `IDVerse Technical Exam\CheapFlights Web\Flight Search` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- No prerequisite test data — public marketing site, no account or login required.
- Origin field arrives pre-filled with a geo-detected city and must be cleared before use.
- "Compare vs Cheapflights" partner checkboxes arrive pre-ticked and must be unticked, otherwise Search hijacks the tab to a partner site instead of navigating to results.

**Parameters:**

| Parameter | Values |
|---|---|
| @originQuery | Sydney |
| @originOption | Sydney, New South Wales, Australia |
| @destinationQuery | Melbourne |
| @destinationOption | Melbourne, Victoria, Australia |
| @checkinDate | Today + 30 days (system-generated) |
| @checkoutDate | Today + 37 days (system-generated) |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the CheapFlights homepage | Flight search form is visible |
| 2 | Remove any pre-filled location chips from both the origin and destination fields | Both fields show zero selected location chips |
| 3 | Enter @originQuery in the origin combobox and select the @originOption suggestion | Origin field holds exactly one selected location chip |
| 4 | Enter @destinationQuery in the destination combobox and select the @destinationOption suggestion | Destination field holds exactly one selected location chip |
| 5 | Click the Departure date button | Calendar dialog opens showing month grids with named day cells |
| 6 | Select @checkinDate in the calendar (advancing months as needed) | Departure date button echoes @checkinDate (short day/month format) |
| 7 | Select @checkoutDate in the calendar (advancing months as needed) | Return date button echoes @checkoutDate (short day/month format) |
| 8 | Untick every "Compare vs Cheapflights" partner checkbox | Zero partner checkboxes remain ticked |
| 9 | Click Search | Browser stays in the current tab (no partner-site hijack) and navigation begins |
| 10 | Assert the resulting URL | Current URL contains `/flight-search/SYD-MEL/@checkinDate/@checkoutDate` |
| 11 | Wait for the results list to populate | At least one "Result item N" card becomes visible within 90 seconds |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/web/cheapflights/flightSearchTests.spec.ts` — `FlightSearchNavigatesToResultsTest`

---

## Test Case: CF-TC-003

**Title:** `CheapFlights Web – Flight Search – Search Submitted with Empty Origin – From-Airport Validation Alert Displayed - Negative`

**Suite Placement:**
```
CheapFlights Web
 → Regression Suite (Scenario-based)
   → Flight Search
     → Empty Origin Validation
```

**Area Path:** `IDVerse Technical Exam\CheapFlights Web\Flight Search` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- No prerequisite test data — public marketing site, no account or login required.
- Origin field arrives pre-filled with a geo-detected city and must be cleared to reach a genuinely empty-origin state.

**Parameters:**

| Parameter | Values |
|---|---|
| @destinationQuery | Melbourne |
| @destinationOption | Melbourne, Victoria, Australia |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the CheapFlights homepage | Flight search form is visible |
| 2 | Remove any pre-filled location chips from both the origin and destination fields | Both fields show zero selected location chips |
| 3 | Enter @destinationQuery in the destination combobox and select the @destinationOption suggestion, leaving origin empty | Destination field holds exactly one selected location chip; origin field remains empty |
| 4 | Click Search without providing an origin | A validation dialog opens |
| 5 | Inspect the validation alerts raised | A role=alert element with the exact text "Please enter a 'From' airport." is visible |
| 6 | Click Dismiss on the validation dialog | The From-airport alert becomes hidden |
| 7 | Inspect the current page URL | URL does not contain `/flight-search/` (no navigation occurred) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/web/cheapflights/flightSearchTests.spec.ts` — `FlightSearchEmptyOriginShowsValidationErrorTest`

---

## Test Case: CF-TC-004

**Title:** `CheapFlights Web – Flight Search Results – SYD to MEL Results Rendering – Cards Show Route, Price and Correct Layout - Positive`

**Suite Placement:**
```
CheapFlights Web
 → Regression Suite (Scenario-based)
   → Flight Search Results
     → SYD-MEL Results Content and Position Validation
```

**Area Path:** `IDVerse Technical Exam\CheapFlights Web\Flight Search Results` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- No prerequisite test data — public marketing site, no account or login required.
- A completed SYD → MEL search (per CF-TC-002 setup flow) is the entry point into this scenario.
- Melbourne searches may legitimately return either MEL (Tullamarine) or AVV (Avalon) as the destination leg; both are acceptable.

**Continuation case (template §5 exception):** this case validates the results page produced by the CF-TC-002 flow. The search setup is deliberately referenced, not restated, so the two cases stay independently reportable; Step 1 executes that flow verbatim.

**Parameters:**

| Parameter | Values |
|---|---|
| @originCode | SYD |
| @destinationCodePattern | MEL or AVV |
| @minimumExpectedCards | 3 |
| @cardsToInspect | 4 |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Perform the SYD → MEL search flow (clear pre-fills, set origin/destination, pick dates, untick partner checkboxes, submit) | Results page loads |
| 2 | Assert the resulting URL | Current URL contains `/flight-search/SYD-MEL/<checkin>/<checkout>` for the searched dates |
| 3 | Count the rendered result cards | At least @minimumExpectedCards (3) "Result item N" cards are rendered |
| 4 | Inspect the first @cardsToInspect (4) cards for route text | Each inspected card's text contains the origin code pattern "SYD" and the destination code pattern "MEL" or "AVV" |
| 5 | Inspect the first @cardsToInspect (4) cards for a price control | Each inspected card exposes a visible $-formatted price (button or link matching `^\$[\d,]+$`) |
| 6 | Inspect the Cheapest, Best, and Quickest sort tabs | Each tab is visible and displays text matching a live price pattern (`\$\d`) |
| 7 | Inspect the collapsed header search summary | Origin summary shows "Sydney", destination summary shows "Melbourne", departure and return date summaries show the searched dates (short day/month format) |
| 8 | POSITION — measure the Header, Header Search button, and first result card bounding boxes | First card's top edge (y) is greater than or equal to both the header's bottom edge and the header search button's bottom edge |
| 9 | POSITION — measure the bounding boxes of the first @cardsToInspect (4) result cards | Each card's bottom edge (y + height) is at or above the next card's top edge (1px tolerance) — no vertical overlap |
| 10 | POSITION — verify no inspected card overflows the viewport | Each card's x ≥ 0 and (x + width) ≤ viewport width |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/web/cheapflights/flightSearchResultsTests.spec.ts` — `FlightSearchResultsContentAssertionsTest`, `FlightSearchResultsPositionAssertionsTest`

---

## Test Case: RB-TC-001

**Title:** `Restful Booker API – Authentication – POST /auth with Valid Credentials – Token Issued - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Authentication
     → Token Issuance
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Authentication` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials (Username/Password) are available via test configuration.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Send `POST /auth` with the configured valid username and password | Response status code is 200 |
| 2 | Inspect the response Content-Type header | Header contains `application/json` |
| 3 | Inspect the response body shape | Body contains exactly one field: `token` |
| 4 | Inspect the token value | Token is a 15-character lowercase hexadecimal string matching `^[a-f0-9]{15}$` |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/authTokenTests.spec.ts` — `AuthTokenIssuedForValidCredentialsTest`

---

## Test Case: RB-TC-002

**Title:** `Restful Booker API – Authentication – POST /auth with Invalid Credentials – Bad Credentials Reason Returned - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Authentication
     → Bad Credentials Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Authentication` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- A valid configured username and a deliberately incorrect password value are available for the negative path.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Send `POST /auth` with the configured valid username and an incorrect password | Response status code is 200. **KNOWN DEFECT — correct behaviour would be 401 Unauthorized.** |
| 2 | Inspect the response body | Body contains exactly one field: `reason`, equal to `"Bad credentials"` |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/authTokenTests.spec.ts` — `AuthBadCredentialsReturns200WithReasonTest`

---

## Test Case: RB-TC-003

**Title:** `Restful Booker API – Booking Creation – POST /booking with Full Valid Payload – Booking Created and Persisted with All Fields - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Creation
     → Full Payload Creation
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Creation` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Parameters:**

| Parameter | Values |
|---|---|
| @firstname / @lastname | Unique per run (e.g. `Fn-<random8>` / `Ln-<random8>`) |
| @totalprice | 1234 |
| @depositpaid | true |
| @checkin | Today + 30 days |
| @checkout | Today + 37 days |
| @additionalneeds | Breakfast |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload with @firstname, @lastname, @totalprice, @depositpaid, @checkin, @checkout, @additionalneeds | Payload assembled with unique firstname/lastname for this run |
| 2 | Send `POST /booking` with the payload | Response status code is 200 |
| 3 | Inspect the response Content-Type header | Header contains `application/json` |
| 4 | Inspect the response body shape | Body contains exactly two top-level fields: `bookingid` and `booking` |
| 5 | Inspect the `bookingid` value | `bookingid` is a positive integer |
| 6 | Inspect every field of the `booking` object | `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, and `additionalneeds` each echo the sent payload exactly, with no extra/renamed fields |
| 7 | Send `GET /booking/:id` for the new `bookingid` | Response status code is 200 |
| 8 | Inspect every field of the GET response | All fields match the original payload exactly (booking was persisted, not just echoed) |
| 9 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingReturnsBookingIdAndAllFieldsTest`

---

## Test Case: RB-TC-004

**Title:** `Restful Booker API – Booking Creation – POST /booking with Boundary Values – Zero Price and Unpaid Deposit Echoed Correctly - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Creation
     → Boundary Value Creation
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Creation` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Parameters:**

| Parameter | Values |
|---|---|
| @totalprice | 0 (minimum boundary) |
| @depositpaid | false |
| @additionalneeds | "" (empty string) |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload with @totalprice = 0, @depositpaid = false, @additionalneeds = "" | Payload assembled with the boundary values |
| 2 | Send `POST /booking` with the boundary payload | Response status code is 200 |
| 3 | Inspect the boundary fields of the response | `totalprice` = 0 (number, not dropped), `depositpaid` = false (boolean, not defaulted to true), `additionalneeds` = "" (empty string, not omitted) |
| 4 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingWithZeroPriceAndDepositUnpaidTest`

**Related negative boundary:** invalid-type totalprice is covered by RB-TC-013 (non-numeric price accepted and stored as null — KNOWN DEFECT).

---

## Test Case: RB-TC-005

**Title:** `Restful Booker API – Booking Creation – POST /booking with Missing Required Fields – Server Error Returned - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Creation
     → Missing Required Fields Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Creation` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Restful Booker is a shared public sandbox — no booking is created in this scenario, so no cleanup is required.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Send `POST /booking` with a payload containing only `{ firstname: "MissingEverythingElse" }` | Response status code is 500. **KNOWN DEFECT — correct behaviour would be 400 Bad Request.** |
| 2 | Inspect the error response body | Plain-text body contains "Internal Server Error" |
| 3 | Send `POST /booking` with a completely empty payload `{}` | Response status code is 500. **KNOWN DEFECT — correct behaviour would be 400 Bad Request.** |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingMissingRequiredFieldsReturns500Test`

---

## Test Case: RB-TC-006

**Title:** `Restful Booker API – Booking Retrieval – GET Booking by Id and by Filtered List – Created Booking Returned with All Fields - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Retrieval
     → Retrieval by Id and Filtered List
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Retrieval` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload and send `POST /booking` to create a booking to read back | Response status code is 200; `bookingid` is captured |
| 2 | Send `GET /booking/:id` for the created booking | Response status code is 200 |
| 3 | Inspect the response Content-Type header | Header contains `application/json` |
| 4 | Inspect the returned booking object (no `bookingid` wrapper) | Every field matches the original payload exactly |
| 5 | Send `GET /booking` filtered by the created booking's unique `firstname` and `lastname` query params | Response status code is 200 and body is an array |
| 6 | Inspect the filtered list | Array length is 1; the single entry's `bookingid` equals the created `bookingid`; the entry contains only the `bookingid` field |
| 7 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/getBookingTests.spec.ts` — `GetBookingReturnsAllFieldsTest`, `GetBookingListContainsCreatedBookingTest`

---

## Test Case: RB-TC-007

**Title:** `Restful Booker API – Booking Retrieval – GET Booking with Nonexistent or Invalid Id – Not Found Returned - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Retrieval
     → Nonexistent or Invalid Id Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Retrieval` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the setup deletion.
- Restful Booker is a shared public sandbox — no booking remains after this scenario; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Create a booking, then delete it with a valid token to obtain a guaranteed-nonexistent `bookingid` | Setup `DELETE` returns 201 Created; id confirmed removed |
| 2 | Send `GET /booking/:id` using the deleted (nonexistent numeric) id | Response status code is 404 |
| 3 | Inspect the 404 response body | Plain-text body contains "Not Found" |
| 4 | Send `GET /booking/:id` using a non-numeric id value (e.g. `"not-a-valid-id"`) | Response status code is 404 |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/getBookingTests.spec.ts` — `GetBookingNonexistentIdReturns404Test`, `GetBookingInvalidIdFormatReturns404Test`

---

## Test Case: RB-TC-008

**Title:** `Restful Booker API – Booking Update – PUT Booking with Valid Token – Booking Fully Replaced and Persisted - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Update
     → Full Replacement (PUT)
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Update` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the write token and cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Parameters:**

| Parameter | Values |
|---|---|
| @updatedTotalprice | 4321 |
| @updatedDepositpaid | false |
| @updatedAdditionalneeds | Late checkout |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble an original unique booking payload and send `POST /booking` to create a booking to update | Response status code is 200; `bookingid` is captured |
| 2 | Authenticate via `POST /auth` to obtain a valid token, then assemble an updated payload (@updatedTotalprice, @updatedDepositpaid, @updatedAdditionalneeds) | Token obtained; updated payload assembled |
| 3 | Send `PUT /booking/:id` with the updated payload and `Cookie: token=<token>` | Response status code is 200 |
| 4 | Inspect the response Content-Type header | Header contains `application/json` |
| 5 | Inspect every field of the PUT response | All fields (`firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`, `additionalneeds`) match the updated payload exactly |
| 6 | Send `GET /booking/:id` to confirm persistence | Response status code is 200 and every field matches the updated payload exactly |
| 7 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPutReplacesAllFieldsTest`

---

## Test Case: RB-TC-009

**Title:** `Restful Booker API – Booking Update – PATCH Booking with Valid Token – Only Sent Fields Updated - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Update
     → Partial Update (PATCH)
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Update` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the write token and cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Parameters:**

| Parameter | Values |
|---|---|
| @patchedFirstname | PatchedFirstname |
| @patchedTotalprice | 999 |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble an original unique booking payload and send `POST /booking` to create a booking to partially update | Response status code is 200; `bookingid` is captured |
| 2 | Authenticate via `POST /auth` to obtain a valid token, then assemble a partial payload `{ firstname: @patchedFirstname, totalprice: @patchedTotalprice }` | Token obtained; partial payload assembled |
| 3 | Send `PATCH /booking/:id` with the partial payload and `Cookie: token=<token>` | Response status code is 200 |
| 4 | Inspect the merged response body | `firstname` = @patchedFirstname and `totalprice` = @patchedTotalprice are updated, while `lastname`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`, and `additionalneeds` remain identical to the original payload |
| 5 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPatchChangesOnlySentFieldsTest`

---

## Test Case: RB-TC-010

**Title:** `Restful Booker API – Booking Update – PUT Booking without Valid Token or on Nonexistent Id – Update Rejected - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Update
     → Unauthorized or Nonexistent Update Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Update` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the setup deletion and cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble an original unique booking payload and send `POST /booking` to create a booking to protect | Response status code is 200; `bookingid` is captured |
| 2 | Send `PUT /booking/:id` with a new valid payload but no `Cookie`/token header | Response status code is 403 |
| 3 | Inspect the 403 response body | Plain-text body contains "Forbidden" |
| 4 | Send `GET /booking/:id` to confirm the booking was not modified | Response status code is 200 and every field still matches the original payload exactly |
| 5 | Send `PUT /booking/:id` with a new valid payload and an invalid/bogus token (e.g. `invalidtoken1234`) | Response status code is 403 |
| 6 | Create a second booking, then delete it with a valid token to obtain a guaranteed-nonexistent `bookingid` | Setup `DELETE` returns 201 Created; id confirmed removed |
| 7 | Send `PUT /booking/:id` using the nonexistent id with a valid token and a new payload | Response status code is 405 |
| 8 | Inspect the 405 response body | Plain-text body contains "Method Not Allowed" |
| 9 | Cleanup: send `DELETE /booking/:id` with a valid token for the booking created in Step 1 | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingWithoutTokenReturns403Test`, `UpdateBookingWithInvalidTokenReturns403Test`, `UpdateBookingNonexistentIdReturns405Test`

---

## Test Case: RB-TC-011

**Title:** `Restful Booker API – Booking Deletion – DELETE Booking with Valid Token – Booking Removed - Positive`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Deletion
     → Successful Deletion
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Deletion` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`
- `Smoke`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the write token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload and send `POST /booking` to create a booking to delete | Response status code is 200; `bookingid` is captured |
| 2 | Authenticate via `POST /auth` to obtain a valid token | Token obtained (15-character hex) |
| 3 | Send `DELETE /booking/:id` with `Cookie: token=<token>` | Response status code is 201 Created. **KNOWN QUIRK — correct behaviour would be 200 OK or 204 No Content for a successful delete.** |
| 4 | Inspect the delete response body | Plain-text body contains "Created" |
| 5 | Send `GET /booking/:id` for the deleted id | Response status code is 404 |
| 6 | Send `GET /booking` filtered by the deleted booking's unique `firstname` and `lastname` | Response status code is 200 and the returned array does not contain an entry with the deleted `bookingid` |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/deleteBookingTests.spec.ts` — `DeleteBookingRemovesBookingTest`

---

## Test Case: RB-TC-012

**Title:** `Restful Booker API – Booking Deletion – DELETE Booking without Valid Token or on Nonexistent Id – Deletion Rejected - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Deletion
     → Unauthorized or Nonexistent Deletion Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Deletion` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the setup deletion and cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload and send `POST /booking` to create a booking to protect | Response status code is 200; `bookingid` is captured |
| 2 | Send `DELETE /booking/:id` with no `Cookie`/token header | Response status code is 403 |
| 3 | Inspect the 403 response body | Plain-text body contains "Forbidden" |
| 4 | Send `GET /booking/:id` to confirm the booking still exists | Response status code is 200 and every field still matches the original payload exactly |
| 5 | Create a second booking, then delete it with a valid token to obtain a guaranteed-nonexistent `bookingid` | Setup `DELETE` returns 201 Created; id confirmed removed |
| 6 | Send `DELETE /booking/:id` again using the same (now nonexistent) id, with a valid token | Response status code is 405 |
| 7 | Inspect the 405 response body | Plain-text body contains "Method Not Allowed" |
| 8 | Cleanup: send `DELETE /booking/:id` with a valid token for the booking created in Step 1 | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/deleteBookingTests.spec.ts` — `DeleteBookingWithoutTokenReturns403Test`, `DeleteBookingNonexistentIdReturns405Test`

---

## Test Case: RB-TC-013

**Title:** `Restful Booker API – Booking Creation – POST /booking with Non-Numeric Price – Invalid Type Accepted and Stored as Null - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Creation
     → Invalid Field Type Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Creation` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Parameters:**

| Parameter | Values |
|---|---|
| @totalprice | "not-a-number" (string, invalid type) |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload with @totalprice as a non-numeric string | Payload assembled with the invalid-type value |
| 2 | Send `POST /booking` with the invalid-type payload | Response status code is 200. **KNOWN DEFECT — correct behaviour would be 400 Bad Request for an invalid field type.** |
| 3 | Inspect the `totalprice` field of the response | `totalprice` is `null`. **KNOWN DEFECT — the invalid value is silently discarded and stored as null instead of being rejected.** |
| 4 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/createBookingTests.spec.ts` — `CreateBookingNonNumericPriceStoredAsNullTest`

---

## Test Case: RB-TC-014

**Title:** `Restful Booker API – Booking Update – PATCH Booking without Valid Token – Update Rejected - Negative`

**Suite Placement:**
```
Restful Booker API
 → Regression Suite (Scenario-based)
   → Booking Update
     → Unauthorized Partial Update Handling
```

**Area Path:** `IDVerse Technical Exam\Restful Booker API\Booking Update` (suggested — confirm with team)

**Iteration Path:** `IDVerse Technical Exam\Test Automation\Sprint 2026.07` (placeholder — fill with current sprint)

**Tags:**
- `Regression - Development`
- `Regression - QA`
- `Regression - Staging`

**Pre-requisites:**
- Valid Restful Booker sandbox credentials are available via test configuration for the cleanup token.
- Restful Booker is a shared public sandbox — the test must create its own unique booking data and clean up afterward; it must not assert on pre-existing records or record counts.

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Assemble a unique booking payload and send `POST /booking` to create a booking to protect | Response status code is 200; `bookingid` is captured |
| 2 | Send `PATCH /booking/:id` with a partial payload but no `Cookie`/token header | Response status code is 403 |
| 3 | Inspect the 403 response body | Plain-text body contains "Forbidden" |
| 4 | Send `GET /booking/:id` to confirm the booking was not modified | Response status code is 200 and every field still matches the original payload exactly |
| 5 | Cleanup: send `DELETE /booking/:id` with a valid token | Booking is removed (201 Created, or 405 if already absent) |

**DB Validation:**
N/A — public sandbox API / third-party website; no database access available.

**Automation Mapping:** `tests/api/booker/updateBookingTests.spec.ts` — `UpdateBookingPatchWithoutTokenReturns403Test`
