# Safari Extension for Coolection

**Date:** 2026-02-06
**Status:** Brainstorm complete

## What We're Building

A native Safari App Extension for iOS that lets users save the current tab to coolection with a single tap on a toolbar icon. The extension authenticates via an API token (generated in coolection's web settings) and calls the existing `POST /api/item/create` endpoint.

## Why This Approach

- **Safari Extension over Share Extension:** User wants dedicated toolbar presence in Safari rather than living in the share sheet. Single-tap UX is faster than share sheet (2 taps).
- **Native Swift over Web Extension:** Chose native Safari App Extension for a more polished, native feel. Requires Swift but produces a higher-quality result for eventual App Store distribution.
- **API token auth:** Stateless, simple, no dependency on browser cookies or complex OAuth flows. User generates a token in coolection web settings, pastes it into the extension's preferences once.
- **iOS first:** Start with iOS Safari. macOS can come later with the same Xcode project structure.

## Key Decisions

1. **Extension type:** Native Safari App Extension (Swift/SwiftUI), not a Safari Web Extension
2. **Interaction model:** One-tap save — tap toolbar icon, URL is saved immediately, brief confirmation animation
3. **Authentication:** API token generated in coolection web settings, stored in extension preferences
4. **Platform:** iOS Safari only (macOS later)
5. **Distribution:** Personal use first, designed for eventual App Store release

## Scope

### Backend changes (coolection web app)
- New API token system: generate, store, revoke tokens per user
- New auth middleware that accepts `Authorization: Bearer <token>` alongside existing Clerk sessions
- Settings page UI for managing API tokens

### iOS / Xcode project
- Container iOS app (minimal — just onboarding/settings for token entry)
- Safari App Extension target with toolbar button
- Extension handler: get active tab URL → POST to API → show confirmation
- Error states: not authenticated, duplicate item, network failure
- Extension preferences for API token storage (Keychain)

## Open Questions

- **Confirmation UX:** What does the "saved" confirmation look like? Badge on icon? Brief popover? Haptic feedback?
- **Duplicate handling:** If item already exists (409), should it silently succeed or notify the user?
- **Token format:** Simple random string? JWT? Expiring or permanent?
- **Container app:** How minimal? Just a "paste your token" screen, or also show recent saves?

## Next Steps

Run `/workflows:plan` to design the implementation — backend token system first, then Xcode project setup.
