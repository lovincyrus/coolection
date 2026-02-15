---
date: 2026-02-12
topic: playwright-e2e-setup
---

# Playwright E2E Testing Setup

## What We're Building

End-to-end testing infrastructure using Playwright with Clerk authentication. Tests will cover full authenticated user journeys: sign-in, adding items, searching, managing lists, and verifying page rendering on refresh.

## Why This Approach

### Considered Approaches

1. **`@clerk/testing` + `clerk.signIn()` (Chosen)** — Official Clerk package that handles bot detection, authenticates via API, saves `storageState` for reuse across tests.
2. **API token bypass** — Use existing `Bearer coolection_` tokens. Only works for API routes, not UI tests (ClerkProvider still sees user as unauthenticated).
3. **Vanilla Playwright UI sign-in** — Fill in Clerk's `<SignIn>` form directly. Fragile (relies on Clerk's internal DOM), blocked by bot detection in CI.

### Why `@clerk/testing`

- Official, maintained by Clerk team
- `clerkSetup()` transparently bypasses bot detection
- `clerk.signIn()` handles auth without UI interaction
- `storageState` means sign-in happens once per test suite
- Works with existing `@clerk/nextjs` patterns in the codebase

## Key Decisions

- **Auth strategy**: Enable password auth in Clerk dev dashboard (alongside existing Google OAuth) for a dedicated test user
- **Test runner**: `@playwright/test` (not Vitest browser mode) for true browser E2E
- **Auth reuse**: Global setup signs in once, saves `storageState`, all tests reuse it
- **Dev server**: Playwright's `webServer` config starts Next.js dev server automatically
- **Test location**: `e2e/` directory (separate from existing `tests/` unit tests)

## Open Questions

- Should we run Playwright in CI (GitHub Actions)? If so, need to add Clerk env vars as secrets
- Should we add visual regression testing (screenshots) or stick to functional E2E?
- Test database: use the same local dev DB or a separate test DB?

## Next Steps

-> `/workflows:plan` for implementation details
