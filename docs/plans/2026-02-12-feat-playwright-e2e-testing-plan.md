---
title: "feat: Set up Playwright E2E testing with Clerk auth"
type: feat
date: 2026-02-12
---

# Set up Playwright E2E Testing with Clerk Auth

## Overview

Add end-to-end testing infrastructure using Playwright with `@clerk/testing` for authenticated test flows. Tests will cover full user journeys: homepage rendering, item management, list management, and search.

## Problem Statement

No E2E tests exist. Recent homepage rendering bugs (duplicate keys, `forwardRef` missing, provider remount) were only caught by manual testing. Playwright tests would catch these regressions automatically on every push.

## Proposed Solution

Use `@clerk/testing` (Clerk's official Playwright integration) with a dedicated test user that has password auth enabled. Auth state is captured once via `storageState` and reused across all tests.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth library | `@clerk/testing` | Official, handles bot detection, no UI interaction needed |
| Test user | Single shared user, pre-seeded in DB | Simple, avoids webhook dependency |
| Database | Shared dev DB with cleanup hooks | Matches existing dev workflow |
| Browser | Chromium only (initially) | Fast, sufficient for regression catching |
| Code style | Direct Playwright API (no POM) | Simple, refactor later if needed |
| CI | Deferred to phase 2 | Get local tests working first |

## Implementation

### Phase 1: Infrastructure

#### 1.1 Install dependencies

```bash
pnpm add -D @playwright/test @clerk/testing
npx playwright install chromium
```

#### 1.2 Create `playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Serial for now — shared test user
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

#### 1.3 Create `e2e/auth.setup.ts`

Global setup that signs in once and saves session state.

```typescript
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

setup("global setup", async ({}) => {
  await clerkSetup();
});

setup("authenticate", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
  await page.waitForURL("/home");
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
```

#### 1.4 Create test user seed script

`e2e/seed-test-user.ts` — ensures the test user exists in the local database (bypasses Clerk webhook dependency).

```typescript
import prisma from "../lib/prisma";

const TEST_CLERK_ID = process.env.E2E_CLERK_USER_ID!;

async function seedTestUser() {
  await prisma.user.upsert({
    where: { clerkId: TEST_CLERK_ID },
    update: {},
    create: { clerkId: TEST_CLERK_ID },
  });
}

seedTestUser();
```

#### 1.5 Environment variables

Add to `.env` (already gitignored):

```
E2E_CLERK_USER_USERNAME=test@coolection.co
E2E_CLERK_USER_PASSWORD=<strong-password>
E2E_CLERK_USER_ID=user_<clerk-user-id>
```

#### 1.6 Update `.gitignore`

```
# Playwright
e2e/.auth/
test-results/
playwright-report/
```

#### 1.7 Add scripts to `package.json`

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed"
```

### Phase 2: Core Tests

#### 2.1 `e2e/homepage.spec.ts` — Homepage rendering & items

- [x] Page loads without error on fresh navigation
- [x] Page loads without error on refresh (regression: the bug we just fixed)
- [x] Items are visible (not empty state)
- [x] Search filters results, clearing search restores items
- [x] "Load More" button fetches next page (pagination uses button + intersection observer)

#### 2.2 `e2e/add-item.spec.ts` — Adding items

- [x] Open "Add item" dialog
- [x] Submit a valid URL
- [x] New item appears in the list
- [x] Invalid URL shows error

#### 2.3 `e2e/lists.spec.ts` — List management

- [x] Create a new list
- [x] Add an item to the list via context menu
- [x] Navigate to the list, verify item is there
- [x] Remove item from list
- [x] Delete the list

#### 2.4 `e2e/settings.spec.ts` — Settings page

- [x] Settings page loads
- [x] API tokens section is visible

### Phase 3: CI & Polish (Future)

- GitHub Actions workflow with PostgreSQL service container
- Clerk test credentials as GitHub secrets
- Multi-browser (add WebKit for Safari parity)
- Mobile viewport tests
- Screenshot comparison for visual regression

## Acceptance Criteria

- [x] `pnpm test:e2e` runs Playwright tests against local dev server
- [x] Auth setup signs in via `@clerk/testing` and reuses session
- [x] Homepage test catches the "items not loading on refresh" regression
- [x] Tests clean up after themselves (no orphaned data)
- [x] `e2e/.auth/`, `test-results/`, `playwright-report/` are gitignored

## One-Time Manual Setup (Before First Run)

1. **Clerk dashboard** (dev instance): Enable "Password" as additional auth strategy
2. **Clerk dashboard**: Create test user with email + password
3. **Local `.env`**: Add `E2E_CLERK_USER_USERNAME`, `E2E_CLERK_USER_PASSWORD`, `E2E_CLERK_USER_ID`
4. **Local DB**: Run seed script to create test user record

## File Structure

```
e2e/
├── .auth/
│   └── user.json          # Saved auth state (gitignored)
├── auth.setup.ts           # Global auth setup
├── seed-test-user.ts       # DB seed for test user
├── homepage.spec.ts        # Homepage tests
├── add-item.spec.ts        # Add item tests
├── lists.spec.ts           # List management tests
└── settings.spec.ts        # Settings page tests
playwright.config.ts        # Playwright configuration
```

## References

- Brainstorm: `docs/brainstorms/2026-02-12-playwright-e2e-setup-brainstorm.md`
- Clerk Playwright docs: https://clerk.com/docs/guides/development/testing/playwright/overview
- `@clerk/testing` npm: https://www.npmjs.com/package/@clerk/testing
- Clerk example repo: https://github.com/clerk/clerk-playwright-nextjs
- Existing middleware: `middleware.ts:8-12` (protected routes)
- Existing providers: `app/providers.tsx` (SWR + Clerk setup)
