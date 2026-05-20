# Frontend Rules (Unsaid-Specific)

> Before writing any UI: invoke the `/unsaid-ui` skill. It contains the live design token reference, typography rules, button hierarchy, layout scaffolding, and brand constraints grounded in the actual codebase.


## Component Structure

Components are organized by domain in `components/`:
```
components/
  entries/        — entry editor, entry card
  home/           — home view, entry card grid, home toolbar, home aside
  patterns/       — pattern cards, pattern detail
  progress/       — progress insight view
  settings/       — account section, subscription section, deletion warning
  shared/         — filter badge, delete confirm popover, toolbar, message banner
  sidebar/        — navigation, badge, deletion warning card
  upgrade/        — gate bar, upgrade modal
  onboarding/     — wizard steps
  ui/             — shadcn primitives (we own these)
  icons/          — SVG icon components
  layout/         — PageHeader
```

---

## Server vs Client Components

- All `app/(dashboard)/*/page.tsx` files are Server Components — data fetching at page level only
- Client components handle interactivity, filters, state, infinite scroll
- Pattern: page fetches → passes props → `*-view.tsx` client component manages state
- Example: `app/(dashboard)/home/page.tsx` (server) → `components/home/home-view.tsx` (client)
- No direct Supabase calls from components — ever

---

## Zustand Stores

**Only 2 stores exist. Do not add a new store without discussion.**

| Store | File | Owns |
|-------|------|------|
| `useEntryEditorStore` | `lib/entry-editor/store.ts` | Entry content, save state, insights, suggestion, reflection context, autosave logic |
| `useSidebarBadgeStore` | `lib/stores/sidebar-badge-store.ts` | `progressAdjustment` counter, `decrementProgress()` action |

Rules:
- Local `useState` for UI-only state (open/close, hover, tab selection)
- Zustand only when state crosses component boundaries or survives route changes
- Stores expose actions, not raw setters

---

## Tailwind & Styling

- **Tailwind v4** — no `tailwind.config.ts`. All theming via CSS variables in `app/globals.css`
- No inline styles — Tailwind classes only
- Custom CSS tokens (defined in `:root` in `globals.css`):
  - Fonts: `--font-satoshi` (primary), `--font-libre` (Libre Baskerville, serif accents)
  - Radius: `--radius` base + `--radius-sm/md/lg/xl/2xl/3xl/4xl`
  - Sidebar: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`
  - Charts: `--chart-1` through `--chart-5` (OKLCH)
- Dark mode via `.dark` class
- Custom animations: `animate-pulse-wave-1`, `animate-pulse-wave-2` (entry creation button)

---

## shadcn/ui

- We own every file in `components/ui/` — modify them freely
- All components use `data-slot` attributes for semantic targeting
- Variants via CVA (`cva()`) — add new variants directly in the component file
- `cn()` (tailwind-merge) for class composition — always use this, never string concatenation

**`sunrise` button variant:** Has `ring-4 ring-zinc-300` baked in. Do not add `ring-*` at call sites.

---

## Constants

Single source of truth — never hardcode these values:

| What | File |
|------|------|
| Entry limits, rate limits, AI trigger intervals | `lib/constants.ts` |
| Pattern type codes, labels, colors, descriptions | `lib/constants/pattern-types.ts` |
| Checkout URL, gate fill percentage | `lib/constants/upgrade.ts` |
| Feedback status config with color classes | `lib/constants/feedback-status-types.ts` |
| Insight tag types | `lib/constants/insight-tag-types.ts` |

---

## What NOT to Do

- No business logic in components
- No direct Supabase queries from components
- No new Zustand stores without discussion
- No inline styles
- No locale arrays hardcoded — use `lib/date-utils.ts` (`formatDate`, `getMonthName`, `getWeekStart`). Only reach for raw `Intl` directly if date-utils doesn't cover the case.
- Server Actions are for mutations only — never for reads in Server Components
- Page-level data fetching only — never call repos from pages (call services)
