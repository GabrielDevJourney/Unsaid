---
name: unsaid-ui
description: Unsaid design system reference. Use proactively before writing any UI component, layout, or style change in this codebase. Covers design tokens, typography rules, button hierarchy, layout scaffolding, data hierarchy in cards, responsive patterns, animation patterns, interaction states, and brand tone. Grounded in what actually exists — not generic design advice.
---

# Unsaid UI Design System

This is the single source of truth for building UI in Unsaid. Read this before writing any component, layout, or Tailwind class.

---

## Brand Context

Unsaid is a journaling and mental-health reflection app. The UI must feel **calm, understated, and personal** — the user's writing is always the hero. Never introduce visual loudness, bright colors, or decorative complexity that competes with content.

---

## Design Tokens

Source of truth: `app/globals.css`

```
--background:      #f2f2f2        (warm light gray — NOT white)
--card:            #fcfcfc        (cards, slightly lighter)
--sidebar:         #fafafa        (sidebar surface)
--border:          #e5e5e5        (dividers, card edges)
--gray-3:          #f0f0f0        (active sidebar nav state)
--primary:         oklch(0.205 0 0)  (near-black)
--muted-foreground: oklch(0.556 0 0) (mid-gray, secondary text)
--radius:          0.625rem       (base — scale via --radius-sm/md/lg/xl/2xl/3xl/4xl)
```

Dark mode uses `.dark` class. All tokens have dark equivalents in `globals.css`.

---

## Typography

Two fonts only. Never introduce a third.

| Role | Font | Usage |
|------|------|-------|
| `font-sans` | Satoshi | All body text, labels, UI elements |
| `font-serif` | Libre Baskerville | Page titles, card titles, section headings — always italic |

**Page title (h1) — list/overview views:**
```tsx
<h1 className="font-serif text-2xl md:text-4xl italic text-zinc-600">
  Page Title
</h1>
```

**Page title (h1) — detail views** (pattern detail, progress detail):
```tsx
<h1 className="font-serif text-2xl md:text-4xl italic text-zinc-800">
  Detail Title
</h1>
```

**Exception — entry editor h1:** Uses `md:text-3xl` (not `md:text-4xl`) because the editor column is narrower:
```tsx
<h1 className="font-serif text-2xl md:text-3xl italic text-zinc-600">
  Entry Title
</h1>
```

**Section heading (h2) — settings, form sections:**
```tsx
<h2 className="pl-2 text-2xl font-medium font-serif italic text-neutral-500">
  Section Heading
</h2>
```

**Card title (h3):**
```tsx
<h3 className="font-serif text-xl md:text-2xl italic text-muted-foreground leading-snug line-clamp-2">
  Card Title
</h3>
```

**Body / secondary text:**
```tsx
<p className="text-sm text-muted-foreground leading-relaxed">...</p>
```

**Data labels (stats, numeric displays):**
```tsx
<span className="text-4xl text-muted-foreground font-serif italic tabular-nums">
  42
</span>
```

---

## The Sunrise Accent — Strict Rules

The sunrise gradient (`rgba(247,107,21,0.8)` → `rgba(255,115,1,0.5)`) is the **only warm/color element** in the entire design system. Everything else is grayscale.

**When to use it:** Only for the journaling entry creation action — New Entry button, Add Entry sidebar icon, progress bar fill.

**Never use it for:** Navigation, settings actions, filters, destructive actions, or any secondary UI.

**Button usage:**
```tsx
// Primary CTA — toolbar, with label
<Button variant="sunrise" asChild>
  <Link href="/entries/new">
    <HugeiconsIcon icon={Add01Icon} className="size-5 text-white" />
    <span className="text-sm font-medium text-white">New entry</span>
  </Link>
</Button>

// Icon-only — mobile toolbar
<Button variant="sunrise" size="icon-lg" asChild>
  <Link href="/entries/new">
    <HugeiconsIcon icon={Add01Icon} className="size-4 text-white" />
  </Link>
</Button>
```

Ring is baked into `compoundVariants` — **never add `ring-*` at the call site**.

---

## Button Hierarchy

```
sunrise   → New Entry / Add Entry action ONLY
default   → Primary form submit, confirmation actions
outline   → Secondary actions, utility icon buttons, filter toggles (use bg-card)
ghost     → Icon-only utility (close, toggle, sidebar trigger)
filter    → Filter badge pills (empty base, styled via className)
```

**Size guide:**
```
icon-lg  (size-10) → icon buttons in toolbars (search toggle, aside toggle)
icon-sm  (size-8)  → smaller icon buttons
icon     (size-9)  → standard icon buttons
default  (h-9)     → labeled buttons
sm       (h-8)     → compact labeled buttons
cta      (h-11 w-35) → hero CTAs
xs       (h-6)     → very compact
```

---

## Page Layout Scaffolding

Every page-level view follows this structure — no exceptions:

```tsx
<div className="flex h-full flex-col overflow-hidden">
  <PageHeader backHref="/home">               {/* h-24, border-b, px-6 lg:px-10 */}
    <h1 className="font-serif text-2xl md:text-4xl italic text-zinc-600">
      Title
    </h1>
  </PageHeader>

  <div className="flex-1 overflow-y-auto">
    <div className="px-6 py-6 lg:px-10">    {/* or appropriate padding variant below */}
      {/* content */}
    </div>
  </div>
</div>
```

**Content padding conventions (dashboard only):**

| Context | Padding |
|---------|---------|
| Card grid views (home, patterns list) | `px-6 py-6 lg:px-10` |
| Detail views (pattern detail, progress detail) | `px-6 py-8 lg:px-10 lg:py-10` |
| Form/settings views | `px-10 py-8` |
| Entry editor content column | `p-4 md:p-6` |

Max-width constraints:
- Settings-style single-column: `max-w-4xl mx-auto`
- Detail view main content: `lg:max-w-2/3`

**`px-4` rule:** Forbidden in dashboard content areas. Auth pages, empty states, and marketing may use `px-4`.

---

## Sticky Toolbar Pattern

Used in home, feedback, patterns, and anywhere filters + search live above a scrollable list.

```tsx
<div
  className={`sticky top-0 z-30 mb-6 flex items-center gap-3 bg-background py-2 ${
    isScrolled ? "border-b border-border" : ""
  }`}
>
  {/* Left: search */}
  {/* Right group: filters → date → action (sunrise CTA always last) */}
  <div className="flex items-center gap-3 ml-auto md:ml-0">
    <FilterBadges ... />
    <DateFilter ... />
    <Button variant="sunrise" ...>...</Button>
  </div>
</div>
```

**Search — mobile icon, desktop inline:**
```tsx
{/* Mobile: icon toggles full-screen overlay */}
<Button variant="outline" size="icon-lg" className="bg-card md:hidden"
  onClick={() => setIsSearchOpen(true)}>
  <HugeiconsIcon icon={Search01Icon} className="size-5" />
</Button>

{/* Mobile overlay */}
<AnimatePresence>
  {isSearchOpen && (
    <motion.div
      className="absolute inset-0 z-40 flex items-center gap-3 bg-background px-6 md:hidden"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
    >
      <Input ... />
      <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
        <HugeiconsIcon icon={Cancel01Icon} />
      </Button>
    </motion.div>
  )}
</AnimatePresence>

{/* Desktop: inline */}
<div className="relative hidden md:flex flex-1">
  <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <Input className="h-10 rounded-lg bg-card pl-9" />
</div>
```

---

## Card Data Hierarchy

Consistent order across all card types:

1. **Metadata badges** — `h-7 rounded-sm border px-2 text-xs font-medium` + variant color from constants
2. **Title** — `font-serif italic text-muted-foreground text-xl md:text-2xl leading-snug line-clamp-2`
3. **Body copy** — `text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-4`

**Card shell:**
```tsx
<div className="rounded-xl border border-border bg-card shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden">
```

**Badge list — scroll on mobile, wrap on desktop:**
```tsx
<div className="flex flex-nowrap gap-2 overflow-x-auto md:flex-wrap">
```

---

## Responsive Breakpoints

| Breakpoint | px | What changes |
|------------|----|-------------|
| `sm:` | 640px | Sheet max-widths (`sm:max-w-70`), tight 2-col grids |
| `md:` | 768px | Text scales up, search becomes inline, card grids go 1→2 col, padding adjustments, mobile buttons hidden |
| `lg:` | 1024px | Sidebar visible (hamburger `lg:hidden`), layout flip `flex-col→flex-row`, description text shown, sticky detail panels, `px-10` headers |
| `xl:` | 1280px | Aside panel appears, aside toggle button hidden |

**Grid patterns:**
```tsx
// Standard card grid (home, patterns)
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">

// Progress / weekly sections (earlier 2-col)
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

// Weekly insights (later 2-col)
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
```

**Layout flip — detail pages:**
```tsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
  <div className="lg:w-1/3 lg:self-start lg:sticky lg:top-10">
    {/* metadata / context panel */}
  </div>
  <div className="lg:max-w-2/3">
    {/* main content */}
  </div>
</div>
```

**Visibility toggles:**
```
hidden lg:block    — description text, secondary panels (desktop only)
lg:hidden          — mobile-only elements (hamburger, mobile-specific badge sets)
md:hidden          — mobile search overlay, icon-only buttons replaced by labeled on desktop
hidden md:flex     — desktop inline elements (search input, labeled buttons)
xl:hidden          — aside toggle button (aside is always visible at xl+)
```

**Aside pattern:**
```tsx
{/* Desktop */}
<aside className="hidden w-73 shrink-0 overflow-y-auto border-l xl:flex">
  <HomeAside ... />
</aside>

{/* Mobile/tablet — Sheet */}
<Sheet open={isAsideOpen} onOpenChange={setIsAsideOpen}>
  <SheetContent side="right" className="w-70 p-0 sm:max-w-70">
    <HomeAside ... />
  </SheetContent>
</Sheet>
```

**Button visibility on toolbar:**
```tsx
{/* Mobile: icon-only sunrise */}
<Button variant="sunrise" size="icon-lg" className="md:hidden" asChild>...
{/* Desktop: labeled sunrise */}
<Button variant="sunrise" className="hidden md:flex" asChild>...
```

---

## Icon System

Library: `@hugeicons/core-free-icons` + `@hugeicons/react`

```tsx
<HugeiconsIcon icon={SomeIcon} className="size-5 text-muted-foreground" />
```

| Size | When |
|------|------|
| `size-3` | Badge/chip level (rare) |
| `size-4` | Small toolbar icons, button icons |
| `size-5` | Standard content icons |
| `size-6` | Sidebar nav icons |

**strokeWidth:**
- `1.5` — default for all hugeicons (navigational, content)
- `1` — low-weight decorative nav icons
- `2` — close/dismiss actions

**Color:**
- `text-muted-foreground` — most common; utility and content icons
- `text-zinc-600` — sidebar navigation icons specifically
- `text-white` — icons inside sunrise buttons

**Lucide icons:** Exist only inside shadcn `components/ui/` primitives (Sheet/Dialog close, Calendar chevrons). Do not replace them. Do not use lucide for new feature icons — use hugeicons.

---

## Elevation and Shadow

System is intentionally flat — no heavy shadows.

```
Cards:         shadow-xs default, hover:shadow-sm
Popovers:      handled by shadcn (no override needed)
Sidebar:       no shadow, border-r only
Everything else: no shadow
```

---

## Animation Patterns

| Use case | Tool | Pattern |
|----------|------|---------|
| Overlay slide-in (search, mobile panels) | Framer Motion `AnimatePresence` + `motion.div` | `initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}` |
| Onboarding step transitions (forward) | Framer Motion | `initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.18 }}` |
| Onboarding progress pills | Framer Motion spring | `animate={{ width: isActive ? 64 : 12 }} transition={{ type: "spring", stiffness: 600, damping: 75 }}` |
| Progress bar fill | Framer Motion spring | `animate={{ width: \`${pct}%\` }} transition={{ type: "spring", stiffness: 300, damping: 40 }}` |
| Sidebar/panel collapse | Tailwind | `transition-[width,height,padding,gap] duration-400 ease-in-out` |
| Sidebar max-width collapse | Tailwind | `transition-[max-width,opacity] duration-400 ease-in-out` |
| Card hover | Tailwind | `transition-shadow duration-200` |
| Add Entry pulse | Custom CSS | `animate-pulse-wave-1`, `animate-pulse-wave-2` (defined in `globals.css`) |
| Accordion expand/collapse | CSS (tw-animate-css) | `animate-accordion-down` / `animate-accordion-up` (from shadcn Accordion) |

Keep animations purposeful. Prefer `duration-200` for hover, `duration-400` for layout shifts.

**Tween vs spring:** Use `type: "tween"` for overlays and directional slides. Use `type: "spring"` for size/width changes and progress indicators.

---

## Interactive States

```
hover:shadow-sm              — cards
hover:scale-[1.02]           — buttons (baked into default variant compoundVariants)
active:scale-[0.98]          — buttons (baked into default variant compoundVariants)
focus-visible:ring-[3px]
focus-visible:ring-ring/50   — inputs and all focusable elements
transition-colors            — color-changing interactive elements
```

Do not add scale or ring manually to button call sites — these are in CVA variants.

---

## Component Rules

**Always reach for these before building custom:**
- shadcn primitives in `components/ui/` — we own these files, modify freely
- `cn()` for class composition — never string concatenation
- CVA (`cva()`) for new component variants — add directly in the component file

**Pattern type badges and insight tag styles:**
- Badge colors: `PATTERN_TYPE_BADGE_STYLES[patternType]` from `lib/constants/pattern-types.ts`
- Insight tag colors: `INSIGHT_TAG_STYLES[tag]` from `lib/constants/insight-tag-types.ts`
- Never hardcode badge colors — always pull from constants

**"New" badge (unviewed items):**
```tsx
<span className="inline-flex h-7 items-center rounded-sm bg-neutral-500 px-2 text-xs font-medium text-white">
  New
</span>
```

---

## What NOT to Do

- Don't deviate from `font-serif italic` for h1/h2/h3 titles — color is `text-zinc-600` (list) or `text-zinc-800` (detail) or `text-neutral-500` (section h2)
- Don't use sunrise orange for anything except entry creation
- Don't add `ring-*` or `scale-*` at sunrise/default button call sites — in `compoundVariants`
- Don't use `px-4` in dashboard content areas — use `px-6` or `px-10`
- Don't hardcode badge colors or locale arrays — use constants and `lib/date-utils.ts`
- Don't add inline styles — Tailwind only
- Don't use a third font
- Don't add elevation beyond `shadow-xs`/`shadow-sm`
- Don't add new Zustand stores without discussion
- Don't put business logic or Supabase calls in components
- Don't use lucide-react for new feature icons — hugeicons only
- Don't add `strokeWidth` or icon color overrides without checking existing context
