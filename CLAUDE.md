# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b (project references) then vite build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run format     # prettier --write on **/*.{ts,tsx}
```

No test runner is configured — there is no test framework, test script, or test files in the repo.

## What this is

Front-end for the ZCMC (Zamboanga City Medical Center) Medical Social Work Department patient portal. React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui.

**There is no backend.** `zcmc_mswd_server/` next to this repo is empty. All data comes from `MOCK_PATIENTS` in [src/data/patients-data.ts](src/data/patients-data.ts), held in `useState` in `App.tsx` and mutated in memory — nothing persists across reload. When adding features, follow the existing pattern (lift state to `App`, pass `onUpdatePatient` down) rather than introducing a data layer unless asked.

## Architecture

Three-file app shell, everything else is UI primitives:

- [src/App.tsx](src/App.tsx) — owns the `patients` array and `selectedPatientId`. Renders navbar + master-detail split.
- [src/components/mswd/mswd-sidebar.tsx](src/components/mswd/mswd-sidebar.tsx) — master list; client-side search/category/intake-date filtering via `useMemo`.
- [src/components/mswd/mswd-patient-view.tsx](src/components/mswd/mswd-patient-view.tsx) — detail pane; 8 tabs (`profile`, `id`, `family`, `watchers`, `staff`, `social-case`, `documents`, `history`).

`PatientRecord` in [src/data/patients-data.ts](src/data/patients-data.ts) is the single domain model — it nests `familyMembers`, `watchers`, `assignedStaff`, `caseStudy`, `documents`, and `history`. Every mutation in the patient view builds a whole new `PatientRecord` immutably **and prepends an `AuditHistory` entry** describing the change, then calls `onUpdatePatient`. Preserve that audit-trail convention for any new write path.

Domain vocabulary that appears throughout: *Category C1/C2/C3/D* (indigency classification), *MSWD No.* vs *Hospital No.*, *watcher* (an authorized bedside companion with a pass number and expiry).

## UI layer

- shadcn/ui, style `base-mira`, base color `mist` — see [components.json](components.json). Add components with `npx shadcn@latest add <name>`; the `shadcn` MCP server is configured in `.mcp.json`.
- Primitives are **`@base-ui/react`**, not Radix. When writing or editing anything in `src/components/ui/`, follow the Base UI API (`TabsPrimitive.Root.Props`, `render` props, etc.) — Radix patterns copied from the web will not compile.
- Icons: `lucide-react`. Charts: `recharts`.
- Theming is CSS-variable driven in [src/index.css](src/index.css): `:root` / `.dark` blocks define oklch tokens, and `@theme inline` maps them to Tailwind utilities. Two custom font families are registered: `font-sans` (Roboto Variable) and `font-heading` (Raleway Variable).

### Theme toggling is currently duplicated

[src/components/theme-provider.tsx](src/components/theme-provider.tsx) is the real implementation (localStorage-backed, `system` support, cross-tab sync, `d` hotkey). But `App.tsx` *also* keeps its own `isDark` state with its own `d` keydown listener and directly toggles `documentElement.classList`. Both fire on `d`, so they fight. If you touch theming, consolidate on `useTheme()` from the provider and delete the local state in `App.tsx`.

## Conventions

- Import via the `@/` alias (mapped in both `vite.config.ts` and the tsconfigs).
- Prettier: **no semicolons**, double quotes, 2-space, 80 cols, `prettier-plugin-tailwindcss` sorts classes (`cn` and `cva` are registered as class functions). The existing `mswd/` components are not prettier-clean — don't reformat them wholesale in an unrelated change.
- TS is strict with `noUnusedLocals`/`noUnusedParameters` and `erasableSyntaxOnly`, so `tsc -b` fails on unused imports — run `npm run typecheck` before declaring work done.
