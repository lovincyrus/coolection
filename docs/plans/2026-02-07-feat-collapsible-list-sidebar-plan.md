---
title: Collapsible List Sidebar
type: feat
date: 2026-02-07
status: revised after review
---

# Collapsible List Sidebar

## Overview

Replace the horizontal scrolling pill navigation with a collapsible left sidebar. Lists get a proper vertical home with persistent open/closed state. On mobile, the sidebar becomes a slide-out drawer.

## Problem Statement

The current horizontal `ScrollArea` with invisible scrollbar makes lists hard to organize and scan. Once you have more than a handful of lists, they disappear off-screen with no visual cue. The delete button is hidden on mobile entirely.

## Proposed Solution (Simplified)

A layout-shift sidebar that pushes content right when open and disappears completely when collapsed. **One new file** (`sidebar.tsx`), small modifications to 3 existing files, 2 files deleted.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sidebar width | 256px fixed | Clean number, enough for list names |
| Default state (first visit) | Open on desktop, closed on mobile | Show lists on desktop; don't eat mobile space |
| Mobile breakpoint | 768px (`md:`) | Matches existing Tailwind patterns |
| Toggle placement | Left side of header | Always discoverable, doesn't float over content |
| "All Bookmarks" in sidebar | Yes, as first item | Single navigation model |
| Sort order | Alphabetical ascending | Predictable, no DB changes needed |
| Mobile drawer auto-close | Yes, on list selection | Standard mobile pattern |
| Animation | CSS transitions (200ms ease-out) | No Framer Motion needed — CSS handles it |
| Horizontal pills | Removed | Sidebar replaces them entirely |
| Mobile drawer | Simple CSS overlay with backdrop | No focus trap in MVP |

### Deferred to follow-up PRs

- Item counts (requires API/Prisma changes)
- Inline rename in sidebar (already works on list detail page)
- Inline delete in sidebar (already works on list detail page)
- `[` keyboard shortcut to toggle
- Focus trap for mobile drawer
- Search filtering sidebar
- Drag-to-reorder lists

## Technical Approach

### File Changes

```
app/
├── components/
│   ├── sidebar.tsx                     # NEW — the sidebar (~80-120 lines)
│   ├── list-navigation.tsx             # DELETE — replaced by sidebar
│   ├── list-navigation-skeletons.tsx   # DELETE — sidebar uses SWR fallback
│   ├── header.tsx                      # MODIFY — add inline toggle button (+8 lines)
│   └── provider/
│       └── globals-provider.tsx        # MODIFY — add sidebarOpen state (+6 lines)
├── home/
│   └── page.tsx                        # MODIFY — remove ListNavigation
└── layout.tsx                          # MODIFY — add flex wrapper for sidebar + content
```

### Step 1: Add sidebar state to GlobalsProvider

**`app/components/provider/globals-provider.tsx`** — Add ~6 lines:

```tsx
// Add sidebarOpen boolean with localStorage persistence:
const [sidebarOpen, setSidebarOpen] = useState(() => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("coolection:sidebar") !== "closed";
});

useEffect(() => {
  localStorage.setItem("coolection:sidebar", sidebarOpen ? "open" : "closed");
}, [sidebarOpen]);

// Expose sidebarOpen and setSidebarOpen on context
```

### Step 2: Create sidebar component

**`app/components/sidebar.tsx`** — Single file, ~80-120 lines:

```tsx
// Structure:
// ┌─────────────────────┐
// │ All Bookmarks        │  ← Link to /home, highlighted when on /home
// │─────────────────────│
// │ Design               │  ← Active: bg-gray-100 font-medium
// │ Work                  │  ← Hover: bg-gray-50
// │ Read Later            │
// │ ...                   │  ← Overflow scrolls
// │─────────────────────│
// │ + New List            │  ← Opens existing new list dialog
// └─────────────────────┘
//
// - "use client"
// - Uses useLists() for data (same SWR stub pattern as existing components)
// - Uses usePathname() to determine active list
// - List items rendered inline in .map() (no separate component)
// - Long names: truncate with ellipsis + title attribute
// - CSS transitions for width (desktop) and transform (mobile)
// - Desktop: static sidebar, width transitions 0↔256px
// - Mobile (<md): fixed overlay with semi-transparent backdrop
//   - Backdrop click closes drawer
//   - Selecting a list auto-closes drawer
// - Styling: gray-50 background, border-r, matches design language
```

### Step 3: Add toggle button to header

**`app/components/header.tsx`** — Add inline button (~8 lines):

```tsx
// Add PanelLeftIcon from lucide-react
// Render button on left side of header
// Same styling as existing header buttons
// aria-label: "Open sidebar" / "Close sidebar" based on state
// onClick: setSidebarOpen(prev => !prev) from useGlobals()
```

### Step 4: Layout wrapper

**`app/layout.tsx`** — Add flex container:

```tsx
// Wrap page content in a flex container:
// <div className="flex">
//   <Sidebar />
//   <div className="flex-1">{children}</div>
// </div>
// Sidebar is client-only (inherits from GlobalsProvider being "use client")
// No hydration mismatch: sidebar renders client-side with correct state
```

### Step 5: Cleanup

1. **`app/home/page.tsx`** — Remove `<ListNavigation>` and its `<Suspense>` wrapper
2. **`app/components/list-navigation.tsx`** — Delete
3. **`app/components/list-navigation-skeletons.tsx`** — Delete

## Acceptance Criteria

### Functional

- [ ] Sidebar shows all non-deleted lists vertically
- [ ] "All Bookmarks" entry at top, links to /home
- [ ] Active list/page highlighted in sidebar
- [ ] Lists sorted alphabetically
- [ ] "New List" button in sidebar opens existing create dialog
- [ ] Sidebar toggle button in header collapses/expands sidebar
- [ ] Collapsed state: sidebar fully hidden, content reflows to centered
- [ ] State persisted in localStorage across navigations and sessions
- [ ] Mobile (`<md`): sidebar is slide-out drawer with hamburger trigger
- [ ] Mobile drawer auto-closes on list selection
- [ ] Mobile drawer has backdrop overlay
- [ ] Horizontal pill navigation removed from /home

### Non-Functional

- [ ] CSS transition animation is smooth (no layout thrashing)
- [ ] Sidebar works in private browsing (defaults to open if localStorage fails)
- [ ] No hydration mismatch (client-only rendering)
- [ ] Toggle button has accessible name reflecting current state
- [ ] Long list names truncated with ellipsis

## References

- Brainstorm: `docs/brainstorms/2026-02-07-list-sidebar-brainstorm.md`
- Current list nav: `app/components/list-navigation.tsx`
- GlobalsProvider: `app/components/provider/globals-provider.tsx`
- Design language: gray-50/100/200/500 palette, Inter font, outline buttons
