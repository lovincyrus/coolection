# Theme Support: Light, Dark, Teal

**Date:** 2026-02-16
**Status:** Ready for planning

## What We're Building

Three-theme support for Coolection: **light** (current), **dark**, and **teal** (dark background with teal accents). Defaults to OS system preference (light/dark), with a manual override on the settings page. Teal is a third explicit choice.

## Why This Approach

**CSS Variables + `next-themes`**

- Define all color tokens as CSS variables in `globals.css`, scoped per theme via `[data-theme]` attributes
- Use `next-themes` for system preference detection, localStorage persistence, and SSR flash prevention
- Tailwind maps to CSS variables (e.g., `bg-surface` resolves to `var(--color-surface)`)

**Rationale:** Single source of truth per theme, clean separation, scales to N themes. `next-themes` is ~2KB and handles the hard hydration/flash problems that are painful to solve by hand.

## Key Decisions

- **3 themes:** Light (default/current), Dark, Teal (dark + teal accents)
- **System preference + manual override:** OS preference maps to light/dark; teal is opt-in only
- **Theme switcher location:** Settings page (alongside API token management)
- **Token-based approach:** Replace hardcoded gray classes with semantic CSS variables
- **Motivation:** Personal preference, not user-facing feature request

## Theme Definitions (Draft)

### Light (current look)
- Background: white
- Surface: gray-50
- Text: gray-900 / gray-500
- Borders: gray-200
- Accents: current sky/amber usage

### Dark
- Background: gray-950
- Surface: gray-900
- Text: gray-100 / gray-400
- Borders: gray-800
- Accents: same sky/amber, slightly brighter

### Teal
- Background: gray-950
- Surface: gray-900
- Text: gray-100 / gray-400
- Borders: teal-800/900
- Accents: teal-400/500 for links, active states, highlights

## Open Questions

- Should the iOS Safari extension also support themes, or web-only for now?
- Should bookmark card thumbnails/favicons get a subtle background treatment in dark modes?
- Exact teal palette values (teal-400 vs teal-500 for primary accent)

## Scope

- Install `next-themes`, add ThemeProvider to layout
- Define CSS variable tokens for all 3 themes in `globals.css`
- Update Tailwind config to use CSS variable-based colors
- Migrate components from hardcoded gray classes to semantic tokens
- Add theme picker to settings page
- Handle viewport `themeColor` meta tag per theme
