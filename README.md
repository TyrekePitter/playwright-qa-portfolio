# Playwright QA Portfolio

Automated browser tests written in TypeScript with Playwright. This repo is a
work in progress — the sections below describe what is actually built and
verified today, not what is planned.

**Current state:** 9 tests, 13 cases, 3 browsers, 39 passing in 33.9s.
No CI yet (Week 5). No `waitForTimeout` anywhere, and there won't be.

## Running it

```bash
npm install
npx playwright install
npm test
```

## Coverage

**Browser E2E — authentication flows against saucedemo.com**

Nine tests covering the happy path and every failure path: locked-out user,
wrong password, nonexistent user, and three empty-field permutations. Assertions
are on exact error text rather than styling, because all four visual error
signals (red underline, ✕ icon, red labels, banner) can change without the
behavior changing. Text is the contract.

Two of the nine pin behavioral properties that came out of a manual exploration
session, not out of reading the page source:

**No user enumeration.** A nonexistent username and a real username with the
wrong password return an identical error string. That sameness is a deliberate
security property — differing messages would let an attacker harvest valid
usernames by watching which error comes back, which is the reconnaissance step
before credential stuffing. A developer improving the error copy would split
them and open that channel without noticing. This test fails the moment that
happens.

**Validation precedence.** An empty username submitted with a password filled
in still reports the username as required, so the validator short-circuits on
username and never evaluates the password. A separate test proves empty input
is rejected; this one proves the *order*. A refactor to a collect-all-errors
validator leaves every other test green and breaks only this one.

## Locator strategy

Test IDs, via `getByTestId` with `testIdAttribute: "data-test"`.

Playwright's own documentation ranks role-based locators above test IDs, and
that ranking is right in general. It does not survive contact with this DOM:
`<input type="password">` has no implicit ARIA role, so `getByRole("textbox")`
cannot reach the password field. Verified against the live DOM before choosing.
Saucedemo publishes `data-test` as an automation contract, so the rule bent to
the application rather than the reverse.

## Verification notes

Two moments worth recording, because a passing suite proves less than it looks
like it does.

**A config change proved itself by failing.** Setting `testIdAttribute` turned
the existing smoke test red across all three browsers with `element(s) not
found`. That failure *was* the proof the setting had taken effect — if it
hadn't, the smoke test would have stayed green and told me nothing. One-word
fix, back to green. Red → change → green is a stronger read than green alone.

**A one-character mutation discriminated.** Deleting a character from an
expected string (`Username` → `sername`) turned exactly three cases red and
left 33 green. Predicted before the run, matched exactly, and matched for the
stated reason. An all-red result would have meant the tests were coupled;
all-green would have meant they weren't asserting.

## Stack

Playwright, TypeScript, `tsconfig` strict mode. Chromium, Firefox, WebKit.

## Not built yet

Page Object Model refactor, fixtures, API tests, CI, and the flaky-test
investigation are Weeks 2–6. This README will say so until they exist.