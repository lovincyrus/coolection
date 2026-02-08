# List Management: Sidebar Navigation

**Date:** 2026-02-07
**Status:** Ready for planning

## What We're Building

Replace the horizontal scrolling pill navigation for lists with a collapsible sidebar. The sidebar gives lists a proper home — visible, organized, and manageable — instead of hiding them behind a horizontal scroll.

### Current State
- Lists shown as horizontal pills in a `ScrollArea` with invisible scrollbar
- Hard to organize or scan when you have many lists
- No item counts visible
- Delete button hidden on mobile
- Creating a new list is a keyboard shortcut (`L`) + dialog

### Target State
- **Desktop:** Collapsible left sidebar showing all lists vertically with item counts
- **Mobile:** Slide-out drawer from the left (hamburger trigger)
- **Collapsed:** Sidebar fully hidden, small toggle button to reopen
- **Actions in sidebar:** New List button, inline rename, delete per list

## Why This Approach

**Layout shift sidebar (Approach A)** over overlay or Radix Sheet because:
- Content reflows naturally when sidebar is open — no covered content
- Familiar pattern (VS Code, Notion, Raindrop)
- When collapsed, the app looks exactly like it does today (centered single-column)
- Gives lists proper real estate to grow without cluttering the main view

Rejected alternatives:
- **Overlay sidebar:** Covers content, feels temporary, extra dismiss click
- **Radix Sheet:** Always overlay-style, more modal than sidebar
- **Wrapping chips:** Gets messy with 10+ lists, still no management actions
- **Grid/cards:** Too much visual weight for a navigation element

## Key Decisions

1. **Collapsible, fully hidden when closed** — toggle button in header area brings it back
2. **Name + item count** per list — enough info without clutter (e.g., "Design · 12")
3. **Slide-out drawer on mobile** — hamburger menu, native-feeling
4. **Quick actions in sidebar** — New List button at top, rename/delete per list (context menu or hover actions)
5. **Active list highlighted** — current list visually distinct
6. **Sidebar state persisted** — remember open/closed in localStorage

## Open Questions

- Should the sidebar width be fixed or resizable?
- Where exactly should the toggle button live when sidebar is collapsed? (header left? floating edge?)
- Should the "All Bookmarks" / "Home" be an entry in the sidebar or stay as the header link?
- Should sidebar show recently visited lists or sort alphabetically?
- Transition animation style — slide + content shift, or instant?
