# Landing Page Rework — Chrome & Safari Extensions

**Date:** 2026-02-07
**Status:** Ready for planning

## What We're Building

A comprehensive rework of the Coolection landing page (`app/page.tsx`) to communicate that Coolection works across web, Chrome, and Safari — showing the full ecosystem, not hard-selling installs.

**Current state:** The landing page is a single hero section ("Superhuman for bookmarking") with a sign-in button and footer. No mention of extensions, features, or self-hosting.

**Target state:** A multi-section landing page with:
1. Hero — tagline + subtitle + CTA
2. Ecosystem — "Save from anywhere" showing Chrome, Safari, and Web
3. Features — what Coolection does (save, organize, retrieve)
4. Product screenshot/preview
5. Self-hosting callout
6. Footer

## Why This Approach

**Goal:** Communicate capability, not drive installs. Users should understand Coolection works across platforms.

**Design direction:** Slightly elevated from current minimal aesthetic. Same gray palette and Inter font, but with better visual hierarchy, bolder sections, and more visual interest. Inspired by:
- [sfcompute.com](https://sfcompute.com) — clean centered column, serif/sans-serif combo, neutral palette, technical but accessible
- [lintrule.com](https://www.lintrule.com) — progressive narrative flow, code/product demos inline, minimal copy

**Layout:** Vertical scroll with distinct sections (Approach A). Single-column, centered, max-width constrained. Each section is a self-contained component.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Vertical scroll sections | Clean narrative flow, mobile-friendly, matches reference sites |
| Design tone | Slightly elevated minimal | Same palette but better hierarchy, subtle animations |
| Extension presentation | Ecosystem section, not install CTAs | Goal is showing capability |
| Page scope | Full rework (5-6 sections) | Current page is too bare for the product's capabilities |
| Copy style | Minimal, no-fluff | Match SF Compute / Lintrule tone |

## Section Details

### 1. Hero
- Keep serif heading style (matches current)
- Tagline: refine "Superhuman for bookmarking" or similar
- Subtitle: brief value prop
- Primary CTA: Sign in / Get started
- Background: keep or evolve the grid pattern

### 2. Ecosystem ("Save from anywhere")
- Three items: Chrome, Safari, Web
- Simple icons or illustrations for each
- Brief one-liner per platform
- Not download buttons — just showing where it works

### 3. Features
- 3 compact feature cards or rows
- Save, Organize, Retrieve (the core value props)
- Short copy, possibly with small icons (lucide-react)

### 4. Product Preview
- Screenshot or styled mockup of the app
- Could be a browser frame with the home/dashboard view
- Shows the actual product UI

### 5. Self-hosting
- Brief callout: "Self-host on your own infrastructure"
- Link to GitHub repo
- Matches the open-source positioning

### 6. Footer
- Keep existing footer pattern (copyright + GitHub link)
- Possibly add extension doc links

## Open Questions

- Should we include actual product screenshots, or use a stylized/simplified illustration?
- Exact copy for each section (can be refined during implementation)
- Whether to add subtle scroll animations (intersection observer) or keep static

## References

- Current landing: `app/page.tsx`
- Current footer: `app/components/footer.tsx`
- Settings page (token UI): `app/settings/page.tsx`
- Chrome extension: `chrome-extension/`
- Safari extension: `ios/CoolectionSafari/`
- Design inspiration: sfcompute.com, lintrule.com
