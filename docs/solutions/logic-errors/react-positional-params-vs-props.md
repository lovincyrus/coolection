---
tags: [react, props, typescript, swr, fallback-data]
category: logic-errors
module: app/components
symptoms:
  - empty state shown briefly on page load
  - "no items" message for users with items
  - data appears after navigation or revalidation
  - fallbackData undefined in SWR hooks
---

# React Component Positional Parameters vs Destructured Props

## Problem

React components defined with positional parameters instead of destructured props silently receive the wrong data:

```tsx
// BUG: React passes a single props object as the first argument
function MyComponent(propA: any, propB: any) {
  // propA = { propA: ..., propB: ... } (the full props object)
  // propB = undefined (React only passes one argument)
}
```

## Correct Pattern

```tsx
function MyComponent({ propA, propB }: { propA: any; propB: any }) {
  // propA = actual value
  // propB = actual value
}
```

## Why It's Hard to Catch

- TypeScript doesn't flag this because `any` matches both patterns
- The component still renders — SWR just fetches from the API instead of using fallbackData
- The bug manifests as a brief empty state flash, which disappears once real data loads
- Works fine "after switching from another list" because SWR has cached data by then

## Detection

If a component receives `fallbackData` or server data as props but shows loading/empty states on first render, check whether the function signature uses positional params or destructured props.
