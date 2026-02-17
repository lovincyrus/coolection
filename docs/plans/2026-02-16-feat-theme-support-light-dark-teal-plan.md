---
title: "feat: Add light/dark/teal theme support"
type: feat
date: 2026-02-16
---

# feat: Add light/dark/teal theme support

## Overview

Add three-theme support to Coolection: **Light** (current), **Dark** (gray-950 bg), and **Teal** (dark bg with teal accents). Uses CSS custom properties as semantic color tokens, switched via `next-themes` for system preference detection, localStorage persistence, and SSR flash prevention. Theme picker lives on the settings page.

## Problem Statement / Motivation

The app is light-only with hardcoded white/gray colors across ~23 files (122 color class occurrences). Personal preference for dark and teal modes. The existing shadcn UI components already reference undefined CSS variable tokens (`bg-background`, `text-foreground`, etc.) — this work also fixes that gap.

## Proposed Solution

**CSS variables + `next-themes` + Tailwind semantic colors.**

1. Define semantic color tokens as CSS variables in `globals.css`, scoped per theme via `[data-theme]` selectors
2. Map those variables to Tailwind color names in `tailwind.config.ts`
3. Replace all hardcoded gray/white classes with semantic Tailwind classes
4. Use `next-themes` (`attribute="data-theme"`) for theme switching, system detection, and persistence
5. Add a 4-option theme picker (System, Light, Dark, Teal) to settings page

## Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme switching mechanism | `data-theme` attribute on `<html>` | Cleaner than class-based for 3+ themes; CSS selectors `[data-theme="dark"]` are explicit |
| Color system | CSS variables only (no `dark:` prefix) | `dark:` variant only handles 2 states; CSS vars scale to N themes from one source of truth |
| Theme library | `next-themes` | ~2KB, handles SSR flash, system detection, localStorage + cookie persistence |
| Tailwind `darkMode` | Not used | Redundant when using CSS variables exclusively |
| Picker options | System / Light / Dark / Teal | "System" lets users revert to automatic OS detection after manual override |
| Persistence | Client-side only (localStorage + cookie) | Cross-device sync is a future enhancement |
| Landing page | Themed | Dark-OS users shouldn't see blinding white on first visit |
| Theme transition | Instant (no animation) | Simpler; `disableTransitionOnChange: true` |

## Semantic Color Token Design

### Token Vocabulary

| Token | Purpose | Light | Dark | Teal |
|-------|---------|-------|------|------|
| `--color-bg` | Page background | `#ffffff` | `#030712` (gray-950) | `#030712` |
| `--color-bg-surface` | Cards, sidebar, dialogs | `#f9fafb` (gray-50) | `#111827` (gray-900) | `#111827` |
| `--color-bg-surface-hover` | Hover on surfaces | `#f3f4f6` (gray-100) | `#1f2937` (gray-800) | `#1f2937` |
| `--color-bg-surface-active` | Active/selected states | `#f3f4f6` (gray-100) | `#1f2937` (gray-800) | `rgba(45,212,191,0.1)` (teal-400/10) |
| `--color-bg-input` | Search bar, form inputs | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.05)` |
| `--color-bg-overlay` | Dialog backdrop | `rgba(255,255,255,0.3)` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.5)` |
| `--color-bg-skeleton` | Loading placeholders | `#f3f4f6` (gray-100) | `#1f2937` (gray-800) | `#1f2937` |
| `--color-bg-highlight` | Search term highlights | `#e2e8f0` (slate-200) | `#334155` (slate-700) | `#134e4a` (teal-900) |
| `--color-bg-inverted` | Inverted buttons (CTA) | `rgba(0,0,0,0.8)` | `rgba(255,255,255,0.9)` | `#2dd4bf` (teal-400) |
| `--color-text-primary` | Headings, strong content | `#111827` (gray-900) | `#f3f4f6` (gray-100) | `#f3f4f6` |
| `--color-text-secondary` | Body text | `#374151` (gray-700) | `#d1d5db` (gray-300) | `#d1d5db` |
| `--color-text-tertiary` | Muted, metadata | `#6b7280` (gray-500) | `#9ca3af` (gray-400) | `#9ca3af` |
| `--color-text-quaternary` | Disabled, placeholder | `#9ca3af` (gray-400) | `#6b7280` (gray-500) | `#6b7280` |
| `--color-text-inverted` | Text on inverted bg | `#ffffff` | `#111827` | `#030712` |
| `--color-text-accent` | Links, interactive elements | inherit | inherit | `#2dd4bf` (teal-400) |
| `--color-border` | Standard borders | `#e5e7eb` (gray-200) | `#374151` (gray-700) | `#374151` |
| `--color-border-strong` | Emphasis borders | `#d1d5db` (gray-300) | `#4b5563` (gray-600) | `#0d9488` (teal-600) |
| `--color-icon-default` | Default icon color | `#6b7280` (gray-500) | `#9ca3af` (gray-400) | `#9ca3af` |
| `--color-spinner` | Spinner animation | `rgba(0,0,0,0.85)` | `rgba(255,255,255,0.85)` | `#2dd4bf` |

**Unchanged (not tokenized):** `text-amber-400` (stars), `text-sky-400` (Twitter), `text-red-600` (destructive) — these are semantic accent colors that stay constant across themes.

### Tailwind Mapping

```ts
// tailwind.config.ts
extend: {
  colors: {
    bg: "var(--color-bg)",
    surface: "var(--color-bg-surface)",
    "surface-hover": "var(--color-bg-surface-hover)",
    "surface-active": "var(--color-bg-surface-active)",
    "input-bg": "var(--color-bg-input)",
    overlay: "var(--color-bg-overlay)",
    skeleton: "var(--color-bg-skeleton)",
    highlight: "var(--color-bg-highlight)",
    inverted: "var(--color-bg-inverted)",
    "text-primary": "var(--color-text-primary)",
    "text-secondary": "var(--color-text-secondary)",
    "text-tertiary": "var(--color-text-tertiary)",
    "text-quaternary": "var(--color-text-quaternary)",
    "text-inverted": "var(--color-text-inverted)",
    "text-accent": "var(--color-text-accent)",
    border: "var(--color-border)",
    "border-strong": "var(--color-border-strong)",
    "icon-default": "var(--color-icon-default)",
    spinner: "var(--color-spinner)",
  },
}
```

Usage: `bg-surface` → `var(--color-bg-surface)`, `text-text-primary` → `var(--color-text-primary)`, `border-border` → `var(--color-border)`.

## Implementation Phases

### Phase 1: Foundation (infrastructure, no visual changes)

**Files:**

- `package.json` — install `next-themes`
- `app/globals.css` — define CSS variable tokens for all 3 themes + remove hardcoded body background
- `tailwind.config.ts` — add semantic color mappings via `extend.colors`
- `app/layout.tsx` — add `suppressHydrationWarning` to `<html>`, configure viewport `themeColor` array
- `app/providers.tsx` — add `ThemeProvider` from `next-themes` wrapping children

**Steps:**

1. `pnpm add next-themes`

2. **`app/globals.css`** — Replace existing variables with theme-scoped tokens:
   ```css
   :root, [data-theme="light"] {
     --color-bg: #ffffff;
     --color-bg-surface: #f9fafb;
     /* ... all light values ... */
     color-scheme: light;
   }
   [data-theme="dark"] {
     --color-bg: #030712;
     --color-bg-surface: #111827;
     /* ... all dark values ... */
     color-scheme: dark;
   }
   [data-theme="teal"] {
     --color-bg: #030712;
     --color-bg-surface: #111827;
     /* ... teal values with teal accents ... */
     color-scheme: dark;
   }
   body {
     background: var(--color-bg);
     color: var(--color-text-primary);
   }
   ```
   Remove the commented-out dark media query, old variable definitions, hardcoded `#ffffff` body background.
   Replace global `button { @apply hover:bg-gray-50 }` with `button { @apply hover:bg-surface-hover }`.
   Replace `.simple-bg` hardcoded gradient with variable-based version.

3. **`tailwind.config.ts`** — Add `extend.colors` mapping tokens (as shown above). Do NOT add `darkMode` — not needed.

4. **`app/layout.tsx`** — Add `suppressHydrationWarning` to `<html>`. Update viewport export:
   ```ts
   export const viewport: Viewport = {
     themeColor: [
       { media: "(prefers-color-scheme: light)", color: "#ffffff" },
       { media: "(prefers-color-scheme: dark)", color: "#030712" },
     ],
   };
   ```

5. **`app/providers.tsx`** — Wrap with `ThemeProvider`:
   ```tsx
   import { ThemeProvider } from "next-themes";

   // Inside Providers component:
   <ClerkProvider appearance={clerkAppearance}>
     <ThemeProvider attribute="data-theme" defaultTheme="system" disableTransitionOnChange>
       <SWRConfig ...>
         <GlobalsProvider>
           {children}
         </GlobalsProvider>
       </SWRConfig>
     </ThemeProvider>
   </ClerkProvider>
   ```
   Also synchronize Clerk appearance with the active theme. `ClerkProvider` wraps `ThemeProvider` (Clerk doesn't need to know about themes; instead, a `useTheme()` hook inside the provider tree reads the theme and applies `appearance` via a wrapper).

   Actually, since `ClerkProvider` takes `appearance` as a prop and `useTheme()` must be called inside `ThemeProvider`, create a small wrapper:
   ```tsx
   function ClerkWithTheme({ children }) {
     const { resolvedTheme } = useTheme();
     const isDark = resolvedTheme === "dark" || resolvedTheme === "teal";
     return (
       <ClerkProvider appearance={isDark ? { baseTheme: dark } : undefined}>
         {children}
       </ClerkProvider>
     );
   }
   ```
   **Note:** This requires `ThemeProvider` to wrap `ClerkProvider`, which inverts the current nesting. Verify Clerk functions correctly inside `ThemeProvider`.

### Phase 2: Migrate UI Primitives (shadcn components)

**Files** (already reference undefined CSS variable tokens — this phase **fixes** them):

- `app/components/ui/button.tsx` — verify `bg-primary`, `bg-secondary` etc. resolve to new tokens
- `app/components/ui/input.tsx` — `border-input`, `ring-ring`, etc.
- `app/components/ui/textarea.tsx` — same as input
- `app/components/ui/dialog.tsx` — `bg-white` overlay + content
- `app/components/ui/context-menu.tsx` — `bg-white` menu + focus states
- `app/components/ui/skeleton.tsx` — `bg-gray-100` → `bg-skeleton`

**Strategy:** These components already use shadcn token names (`bg-background`, `text-foreground`, `bg-primary`, etc.). Define these shadcn tokens as aliases in `globals.css` pointing to our semantic tokens:
```css
:root, [data-theme="light"] {
  /* Shadcn compatibility aliases */
  --background: var(--color-bg);
  --foreground: var(--color-text-primary);
  --primary: var(--color-bg-inverted);
  --primary-foreground: var(--color-text-inverted);
  --secondary: var(--color-bg-surface);
  --secondary-foreground: var(--color-text-primary);
  --muted: var(--color-bg-surface);
  --muted-foreground: var(--color-text-tertiary);
  --accent: var(--color-bg-surface-hover);
  --accent-foreground: var(--color-text-primary);
  --popover: var(--color-bg);
  --popover-foreground: var(--color-text-primary);
  --border: var(--color-border);
  --input: var(--color-border);
  --ring: var(--color-border-strong);
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
}
```
Then add the corresponding `hsl()` or direct color utility mapping to Tailwind. This fixes the existing broken shadcn components AND themes them simultaneously.

### Phase 3: Migrate Application Components

**Files ranked by color density (migrate in this order):**

| # | File | What changes |
|---|------|-------------|
| 1 | `app/globals.css` | Already done in Phase 1 |
| 2 | `app/settings/page.tsx` (22 refs) | `text-gray-900` → `text-text-primary`, `text-gray-500` → `text-text-tertiary`, `bg-gray-50` → `bg-surface`, `border-dashed` border color, etc. |
| 3 | `app/page.tsx` (23 refs) | Landing page: SVG grid pattern colors, feature cards, CTA button, browser mockup, self-host section |
| 4 | `app/components/sidebar.tsx` (8 refs) | `bg-white` → `bg-bg`, active/inactive link colors, section header text |
| 5 | `app/privacy/page.tsx` (7 refs) | Text and heading colors |
| 6 | `app/components/result-item.tsx` (5 refs) | Card colors, hover states |
| 7 | `app/components/header.tsx` (5 refs) | `bg-white` buttons → `bg-bg`, text colors |
| 8 | `app/components/main-results.tsx` (4 refs) | Load More button, empty states |
| 9 | `app/components/ui/context-menu.tsx` (4 refs) | Done in Phase 2 |
| 10 | `app/components/go-back-navigation.tsx` (3 refs) | Inverted button bg, spinner color |
| 11 | `app/components/new-item-dialog.tsx` (3 refs) | `bg-white` → `bg-bg`, submit button |
| 12 | `app/components/editable-text.tsx` (2 refs) | `bg-gray-50`, `hover:bg-gray-200` |
| 13 | `app/components/footer.tsx` (2 refs) | `bg-gray-100/60`, text colors |
| 14 | `app/components/new-list-dialog.tsx` (2 refs) | `bg-white`, submit button |
| 15 | `app/components/edit-item-dialog.tsx` (2 refs) | `bg-white`, submit button |
| 16 | `app/components/search-bar.tsx` (1 ref) | `bg-black/5` → `bg-input-bg` |
| 17 | `app/components/list-results.tsx` (1 ref) | Border/text color |
| 18 | `app/components/highlight-chars.tsx` (1 ref) | `bg-slate-200` → `bg-highlight` |
| 19 | `app/hooks/use-clipboard-url.tsx` (1 ref) | `!text-gray-400` in toast |
| 20 | `app/components/icon-spinner.tsx` | Respect `--color-spinner` instead of hardcoded rgba |

**Migration pattern** (example — sidebar.tsx):
```
bg-white         → bg-bg
text-gray-500    → text-text-tertiary
text-gray-600    → text-text-secondary
text-gray-900    → text-text-primary
bg-gray-100      → bg-surface-active
bg-gray-50       → bg-surface
hover:bg-gray-50 → hover:bg-surface-hover
hover:text-gray-900 → hover:text-text-primary
```

### Phase 4: Theme Picker + Sonner

**Files:**

- `app/settings/page.tsx` — add theme picker section
- `app/layout.tsx` or `app/providers.tsx` — wire Sonner `theme` prop

**Theme picker design** (matches existing settings section pattern):
```tsx
<div className="flex items-start justify-between">
  <div>
    <h2 className="text-sm font-medium text-text-primary">Appearance</h2>
    <p className="mt-1 text-xs text-text-tertiary">Choose your preferred theme</p>
  </div>
</div>
<div className="flex flex-col gap-3 rounded-md border border-dashed p-4">
  {/* 4 radio-style options: System, Light, Dark, Teal */}
  {/* Each shows name + brief description */}
  {/* Active option highlighted */}
</div>
```

Place **before** the API Tokens section (top of settings content, most discoverable).

**Sonner:** Create a small wrapper or read `useTheme()` to pass `theme={resolvedTheme === 'light' ? 'light' : 'dark'}` to `<Toaster>`.

### Phase 5: Polish & Verification

- Visually test all 3 themes across all routes (`/`, `/home`, `/settings`, `/sign-in`, `/privacy`, `/lists/[id]`)
- Verify SSR: no flash of wrong theme on hard refresh
- Verify system preference: toggle OS dark mode, confirm app follows when set to "System"
- Verify persistence: select Teal, refresh page, confirm Teal persists
- Verify Clerk: sign-in/sign-up forms match active theme
- Verify Sonner: trigger a toast in each theme
- Check `color-scheme` is set correctly (scrollbars, form controls adapt)
- Quick contrast check: ensure `text-tertiary` on dark bg passes WCAG AA (4.5:1 minimum)

## Acceptance Criteria

- [ ] Three themes work: Light, Dark, Teal
- [ ] System preference detected on first visit (light OS → light, dark OS → dark)
- [ ] Manual override persists across page navigation and refresh
- [ ] "System" option available to revert to automatic detection
- [ ] Theme picker on settings page with 4 options
- [ ] No flash of wrong theme on SSR/page load
- [ ] All components themed: sidebar, header, search bar, result items, dialogs, context menus, footer, landing page
- [ ] Clerk auth UI matches active theme
- [ ] Sonner toasts match active theme
- [ ] Browser chrome (`themeColor`) adapts to light/dark
- [ ] Scrollbars and native controls follow `color-scheme`
- [ ] Teal theme: teal accent on links, active states, borders; dark background
- [ ] Existing accent colors preserved (amber stars, sky Twitter, red destructive)

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| `ViewTransitions` + `ThemeProvider` conflict | Test early in Phase 1; `ThemeProvider` wraps body content, not `<html>` |
| Clerk `appearance` sync requires nesting change | Invert `ClerkProvider`/`ThemeProvider` nesting; verify auth still works |
| Missing a hardcoded color class | Grep audit of all `gray-`, `bg-white`, `bg-black`, `#fff`, `#000` before marking complete |
| Landing page SVG patterns in dark mode | Replace `stroke-gray-200` / `fill-gray-50` with CSS variable-based fills |
| Global `button hover:bg-gray-50` rule | Replace in Phase 1 to prevent dark mode flash |

## Out of Scope

- iOS Safari extension theming (extension already follows OS via `color-scheme: light dark`)
- Server-side theme persistence / cross-device sync
- Theme transition animations
- Custom user-defined themes
- E2E tests for theme (can be added later)

## References

- Brainstorm: `docs/brainstorms/2026-02-16-theme-support-brainstorm.md`
- Settings page (picker location): `app/settings/page.tsx`
- Layout (provider tree): `app/layout.tsx`
- Providers: `app/providers.tsx`
- Globals CSS: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- `next-themes` docs: https://github.com/pacocoursey/next-themes
