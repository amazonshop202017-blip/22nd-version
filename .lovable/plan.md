

# Complete Redesign: Sidebar, Filter Header, and Filter Submenus

## Overview
A premium, clean redesign of all navigation and filter surfaces. Unified design language across Basic and Advanced filter panels. Works beautifully in both light and dark modes.

---

## 1. Sidebar Redesign

**Visual changes:**
- Remove `rounded-r-2xl` — clean straight edge with `border-r`
- Active nav items: Replace heavy `bg-primary shadow-lg` with a subtle **left accent bar** (3px primary) + light `bg-primary/10` background, text stays `text-primary`
- Inactive items: `text-muted-foreground`, hover shows `bg-muted/50`
- Remove all `whileHover={{ x: 4 }}` slide animations — use simple CSS transitions
- Reduce item padding from `py-3` to `py-2.5`, tighter vertical rhythm
- Collapse toggle button: Smaller (`w-6 h-6`), more subtle styling
- "Add Trade" button: `rounded-lg` instead of `rounded-xl`, cleaner shadow
- Chart Room sub-items: Lighter font weight, active sub-item gets `text-primary` with a tiny dot indicator instead of `bg-primary/10`
- Section separators: Thinner, more subtle
- Account menu at bottom: Cleaner card with less rounded corners (`rounded-xl` → `rounded-lg`)

**Files:** `Sidebar.tsx`, `SidebarAccountMenu.tsx`

---

## 2. Filter Header Bar (GlobalHeader) Redesign

**Visual changes:**
- Container: `bg-background border-b border-border` — solid, no blur/transparency, reduce padding to `py-3 px-6`
- Filter trigger buttons ("Basic Filters", "Advanced Filters"): Replace outlined buttons with **muted pill style** — `bg-muted/60 hover:bg-muted border-0 rounded-lg text-sm font-medium`. Active filter count badge uses a small `bg-primary/15 text-primary` pill instead of solid primary
- DisplayModeSelector: Keep circular but match muted style (`bg-muted/60` instead of `bg-background border`)
- Date range button: Same muted pill style, integrated X button inside the pill (no split button hack)
- Account filter button: Same muted pill style, integrated X inside
- Spacing: `gap-2` instead of `gap-3`, more compact

**File:** `GlobalHeader.tsx`, `DisplayModeSelector.tsx`

---

## 3. Unified Filter Submenus (Basic + Advanced)

**New shared design language for both panels:**

**Panel container:**
- `bg-popover rounded-xl border border-border shadow-xl` with `p-5`
- Subtle inner shadow for depth

**Basic Filters panel:**
- Reduce from `w-[900px]` to `w-[820px]`
- Add section headers: uppercase `text-[10px] tracking-widest text-muted-foreground font-semibold` labels — "TRADE CONTEXT", "TIME", "PERFORMANCE"
- Thin separator lines between sections
- Remove icons from individual filter labels — just clean text labels
- Filter trigger buttons inside panel: `bg-muted/40 border-0 rounded-md h-8` — borderless, muted background
- Inner popover lists (symbol, outcome, etc.): Tighter spacing, items use `rounded-md`, hover is `bg-muted/60`, checkmarks instead of checkbox components for cleaner look
- Each section uses `grid-cols-4` for better proportions

**Advanced Filters panel:**
- Left sidebar menu: `w-36`, active item uses `bg-muted text-foreground font-medium` instead of `bg-primary text-primary-foreground`
- Right content area: Same control styling as Basic Filters
- Popover selectors inside: Same borderless muted style

**File:** `GlobalHeader.tsx` (basic filters section), `AdvancedFiltersPanel.tsx`

---

## 4. Selected Filters Bar Redesign

**Visual changes:**
- Container: `bg-muted/20 border-b border-border/50 py-1.5 px-6`
- Filter chips: `bg-muted/70 text-foreground rounded-md px-2.5 py-1` — monochrome, clean. Label prefix in `text-muted-foreground text-[10px] uppercase tracking-wider` above the value
- X button on chips: Smaller, `hover:bg-foreground/10 rounded-full`
- "Clear all": Ghost text button, `text-muted-foreground hover:text-foreground`, no destructive red

**File:** `SelectedFiltersBar.tsx`

---

## 5. CSS Updates

- Update `.glass-card` utility: `bg-card border border-border/60 shadow-sm` — remove blur and transparency for clean minimal look
- Add new utility class `.filter-control` for consistent filter button styling across panels

**File:** `index.css`

---

## 6. AppLayout Adjustment

- Update `ml-16 lg:ml-52` to use CSS variable or match sidebar width changes
- Ensure smooth transition when sidebar collapses

**File:** `AppLayout.tsx`

---

## Files Modified (7 total)
1. `src/components/layout/Sidebar.tsx`
2. `src/components/layout/SidebarAccountMenu.tsx`
3. `src/components/layout/GlobalHeader.tsx`
4. `src/components/layout/AdvancedFiltersPanel.tsx`
5. `src/components/layout/SelectedFiltersBar.tsx`
6. `src/components/layout/DisplayModeSelector.tsx`
7. `src/index.css`

