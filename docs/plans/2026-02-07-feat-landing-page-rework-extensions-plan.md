---
title: Landing Page Rework with Chrome & Safari Extension Sections
type: feat
date: 2026-02-07
---

# Landing Page Rework with Chrome & Safari Extension Sections

## Overview

Rework the Coolection landing page (`app/page.tsx`) from a single hero section into a multi-section page that communicates the full ecosystem: web, Chrome extension, and Safari extension. Goal is showing capability, not driving installs.

**Design direction:** Slightly elevated minimal — same gray palette and Inter font, but with better visual hierarchy and bolder sections. Inspired by [sfcompute.com](https://sfcompute.com) and [lintrule.com](https://www.lintrule.com).

## Current State

`app/page.tsx` is a single hero with:
- "Superhuman for bookmarking" serif heading
- Subtitle with `react-wrap-balancer`
- Sign-in CTA (rounded-full black button → `/sign-in`)
- "Available online or self-hosted" footnote
- SVG grid background + gradient overlay
- Footer (copyright + GitHub link)

## Proposed Solution

Replace the single hero with 6 vertically-stacked sections in a single server component. Each section is a self-contained `<section>` element within the same `app/page.tsx` file — no new component files needed unless a section becomes complex enough to warrant extraction.

### Section 1: Hero

Keep the existing hero structure but tighten the copy and visual presence.

```
┌──────────────────────────────────┐
│         (grid background)        │
│                                  │
│    Superhuman for bookmarking    │  ← serif, 4xl/5xl/6xl
│                                  │
│   Save, organize, and retrieve   │  ← Inter, gray-600, balanced
│   your bookmarks from anywhere.  │
│                                  │
│        [ Get started → ]         │  ← rounded-full, bg-black/80
│                                  │
└──────────────────────────────────┘
```

- Keep existing SVG grid pattern + gradient overlay
- CTA links to `/sign-in` (existing behavior)
- Change button text from "Sign in" to "Get started" (more inviting for new users)
- Remove "Available online or self-hosted" footnote (gets its own section now)

### Section 2: Ecosystem — "Save from anywhere"

Three items showing where Coolection works. Purely illustrative — not clickable.

```
┌──────────────────────────────────┐
│        Save from anywhere        │  ← serif, 2xl/3xl
│                                  │
│  🌐 Web    🧩 Chrome   🧭 Safari │
│  App       Extension   Extension │
│                                  │
└──────────────────────────────────┘
```

- Section heading: serif, centered
- Three items in a horizontal row (stacks on mobile)
- Each item: icon + label + one-line description
- Icons: Use lucide-react icons (`Globe`, `Puzzle`, `Compass` or similar)
- No hover states, no links — these are informational
- Background: white, separated by generous whitespace (`py-20 md:py-28`)
- `text-gray-600` for descriptions, `text-gray-900` for labels

### Section 3: Features — Save, Organize, Retrieve

Three feature cards showing core value.

```
┌──────────────────────────────────┐
│                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Save │ │Organize│ │Search│    │
│  │      │ │       │ │      │    │
│  │ desc │ │ desc  │ │ desc │    │
│  └──────┘ └──────┘ └──────┘    │
│                                  │
└──────────────────────────────────┘
```

- Three cards in a horizontal grid (`grid grid-cols-1 md:grid-cols-3 gap-6`)
- Card style: `bg-gray-50 rounded-lg p-6` (matches app's card pattern)
- Each card: lucide icon + heading + 1-2 sentence description
- Icons: `Bookmark`, `FolderOpen`, `Search` from lucide-react
- No dashed borders here — clean cards with subtle background
- `text-gray-900` headings, `text-gray-600` descriptions

Feature copy:
- **Save**: "One click to save. Use browser extensions or the web app to capture any link instantly."
- **Organize**: "Collections that make sense. Group bookmarks into lists and find them when you need them."
- **Search**: "Find anything fast. Full-text search across all your saved links and metadata."

### Section 4: Product Preview

A styled browser frame showing the dashboard.

```
┌──────────────────────────────────┐
│                                  │
│   ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐   │
│   │    (product screenshot)  │   │
│   │    /home dashboard view  │   │
│   └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘   │
│                                  │
└──────────────────────────────────┘
```

- Use a CSS browser frame (rounded corners, gray title bar with dots)
- Inside: `<Image>` component with actual screenshot of `/home`
- Screenshot needs to be captured and saved to `public/` (e.g., `public/screenshot-dashboard.png`)
- `next/image` with `loading="lazy"`, responsive sizing
- Frame styling: `rounded-xl border border-gray-200 overflow-hidden shadow-sm`
- Title bar: small gray bar with 3 colored dots (red/yellow/green, 6px circles)
- Max-width: `max-w-4xl` (wider than text sections for visual impact)

**Open question:** Screenshot needs to be captured manually. Plan will use a placeholder until a real screenshot is provided.

### Section 5: Self-hosting

Brief callout.

```
┌──────────────────────────────────┐
│                                  │
│     Open source & self-hosted    │  ← serif, 2xl/3xl
│                                  │
│  Run Coolection on your own      │
│  infrastructure. Fully open      │
│  source.                         │
│                                  │
│     [ View on GitHub → ]         │  ← outline button
│                                  │
└──────────────────────────────────┘
```

- Serif heading, centered
- 1-2 sentence description in `text-gray-600`
- Outline button linking to GitHub repo (`target="_blank" rel="noopener noreferrer"`)
- Use `variant="outline"` from existing button component, or style inline
- Background: `bg-gray-50` to differentiate from surrounding white sections

### Section 6: Footer

Keep existing `Footer` component with `type="root"`.

No changes needed — it already has copyright + GitHub link.

## Technical Approach

### Architecture

**Single file edit.** The entire landing page stays in `app/page.tsx` as one server component. No new component files — the page is simple enough to keep inline. If any section exceeds ~50 lines, extract it to `app/components/landing/` at that point.

**No new dependencies.** Everything uses existing packages:
- `lucide-react` for icons (already installed)
- `next/image` for screenshot (already available)
- `react-wrap-balancer` for text (already installed)
- `next-view-transitions/Link` for navigation (already installed)

**No new API routes.** Purely presentational page.

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/page.tsx` | Edit | Rework from single hero to 6 sections |
| `public/screenshot-dashboard.png` | Add | Product screenshot (placeholder initially) |

### Implementation Phases

#### Phase 1: Structure & Content

1. Refactor `app/page.tsx` with 6 `<section>` elements
2. Implement Hero (keep existing grid background, update copy/CTA)
3. Implement Ecosystem section with 3 platform items
4. Implement Features section with 3 cards
5. Implement Self-hosting section
6. Keep existing Footer

#### Phase 2: Product Preview

7. Create CSS browser frame component inline
8. Add placeholder image or capture real screenshot
9. Wire up with `next/image` and lazy loading

#### Phase 3: Responsive & Polish

10. Verify mobile layout (sections stack, text scales)
11. Ensure consistent spacing (`py-20 md:py-28` between sections)
12. Test on common viewport widths (375px, 768px, 1024px, 1440px)

### Layout & Spacing

- Container: `max-w-2xl mx-auto px-4` for text sections (matches current)
- Product Preview: `max-w-4xl mx-auto px-4` (wider for visual impact)
- Section spacing: `py-20 md:py-28` between sections
- Hero: `min-h-[80dvh]` (slightly less than full viewport, encourages scroll)
- No section dividers — whitespace only

### Typography

- H1 (Hero): `font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900`
- H2 (Section headings): `font-serif text-2xl sm:text-3xl font-bold text-gray-900`
- Body: Inter (inherited), `text-gray-600` for descriptions
- Labels: `text-sm font-medium text-gray-900`
- Serif = Tailwind default `font-serif` (system serif stack, already used in current hero)

### Semantic HTML

```
<main>
  <section aria-label="Hero">...</section>
  <section aria-label="Platforms">...</section>
  <section aria-label="Features">...</section>
  <section aria-label="Preview">...</section>
  <section aria-label="Self-hosting">...</section>
  <Footer type="root" />
</main>
```

Single `<h1>` in Hero. All section headings are `<h2>`.

### SEO & Meta

No changes needed to `app/layout.tsx` metadata — existing title ("Coolection · A better way to organize your favorite links") and description are fine. OG image (`/og-image.jpg`) already exists.

## Acceptance Criteria

- [x] Landing page has 6 distinct sections: Hero, Ecosystem, Features, Preview, Self-hosting, Footer
- [x] Hero shows tagline, subtitle, and "Get started" CTA linking to `/sign-in`
- [x] Ecosystem section shows Chrome, Safari, and Web with icons and labels
- [x] Features section shows 3 cards: Save, Organize, Search
- [x] Product Preview shows screenshot in a browser frame
- [x] Self-hosting section has GitHub link opening in new tab
- [x] Page is responsive (mobile stacks to single column, desktop uses grid)
- [x] Typography uses serif for h1/h2, Inter for body
- [x] Color palette stays within existing grays (50/100/200/500/600/800/900)
- [x] Page remains a server component (no "use client")
- [x] No new npm dependencies added
- [x] Footer unchanged

## References

### Internal
- Current landing: `app/page.tsx`
- Footer component: `app/components/footer.tsx`
- Button component: `app/components/ui/button.tsx`
- Font config: `lib/fonts.ts`
- Global styles: `app/globals.css`
- Settings page (design reference): `app/settings/page.tsx`
- Chrome extension: `chrome-extension/manifest.json`
- Safari extension: `ios/CoolectionSafari/`

### External
- Design inspiration: [sfcompute.com](https://sfcompute.com), [lintrule.com](https://www.lintrule.com)
- Brainstorm: `docs/brainstorms/2026-02-07-landing-page-rework-brainstorm.md`
