# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server (proxies /api -> Laravel, see below)
npm run build      # tsc -b then vite build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run format     # prettier --write on **/*.{ts,tsx}
```

No test runner is configured — there is no test framework, test script, or test files in the repo.

## What this is

Front-end for the ZCMC (Zamboanga City Medical Center) Medical Social Work Department patient portal. React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui, TanStack Query.

**There is a real backend**: a Laravel API in `zcmc_mswd_server/` (sibling repo, with Filament admin, spatie/permission and spatie/activitylog). `npm run dev` proxies `/api/*` to `http://127.0.0.1:8000` so the browser stays same-origin and needs no CORS config; override with `VITE_API_PROXY_TARGET`, or bypass the proxy entirely with `VITE_API_URL` (see `.env.local`). Auth is a Sanctum bearer token in `localStorage` under `zcmc_auth_token`.

## Architecture

### Shell

`main.tsx` (QueryClientProvider + ThemeProvider) → `App.tsx` (auth gate: spinner / `LoginForm` / `MainLayout`) → `components/layout/main-layout.tsx` (Header + Sidebar master list + `PatientDetailView`). The detail view is a 9-tab pane: `profile`, `id`, `family`, `watchers`, `staff`, `social-case`, `intake-sheet`, `documents`, `history`.

`App.tsx` holds no data — it wires `usePatients()` (list, pagination, filters) and `usePatientDetail()` (one patient) into `MainLayout` as props. The prop list is long and hand-threaded; follow that pattern rather than introducing a context unless asked.

### Feature folders

`src/features/<feature>/{api,components,hooks,types}`. Live features: `auth`, `patients` (the bulk of the app), `audit` (cross-patient activity log, API-only so far). `intake` and `reference` are empty scaffolding.

### The four data layers

1. **`src/lib/api-client.ts`** — thin `fetch` wrapper. Injects the bearer token, builds `filter[key]=value` params from a `filters` option (the backend's `ListQuery` contract), maps Laravel's `{message, errors}` into a typed `ApiError`, and clears the token on 401. It returns the **raw** parsed body; it does not unwrap `data`.
2. **Feature `*-api.ts`** — one exported function per endpoint, each unwrapping Laravel's `{data: T}` / `{data: T[], meta}` envelope itself (`ApiEnvelope` / `ApiPaginated` in `patients/types/api.types.ts`). Payload interfaces live next to their function.
3. **`patients/api/patients-adapter.ts`** — assembles the UI's flat `PatientRecord` from the backend's normalized, episode-driven resources. Read its header comment before touching it; two rules bind all new code:
   - **Never fabricate a value the backend doesn't track.** Use the `NOT_ON_FILE` / `NOT_TRACKED` placeholders. This is a hospital case-management system — an invented physician name or indigency classification is actively misleading.
   - "Most recent case" stands in for "the patient's episode" wherever one case/classification is expected. Concurrent open cases render only one — known limitation.
4. **Hooks** — `useQuery`/`useMutation`. `patientDetailKeys(patientId)` in `hooks/use-patient-detail.ts` is the shared query-key factory; every write hook invalidates through it.

`PatientRecord` (`patients/types/patient.types.ts`, re-exported from `patients/types/index.ts`) is the single UI-facing domain model, nesting `familyMembers`, `watchers`, `assignedStaff`, `caretakers`, `caseStudy`, `documents`, and `history`.

### Two write paths — don't confuse them

- **Real, server-backed**: `use-patient-writes.ts` (family members, watchers, patient background) and `use-caretaker-writes.ts` (assign/reassign/unassign custody). These call the API and invalidate queries on success so the new state comes from the server, never from a client guess. Custody writes also invalidate `history`, since the server writes an audit entry.
- **Local-only overlay**: `use-patient-mutations.ts` splices a whole new `PatientRecord` in memory and prepends an `AuditHistory` entry. It exists **only** for the Intake Sheet tab, which is not yet wired to an endpoint. `usePatientDetail` keeps a `localPatient` overlay for it, resynced from the server value during render; any real write discards pending local edits.

New write paths should go through path one. Do not add to the local overlay.

### Permissions

`usePermission("cases.view")` / `useAnyPermission` / `useHasRole` read the permission strings the server sends on `/me`; the strings must match the `permission:` middleware names in the server's `routes/api.php` exactly. Queries for permission-gated endpoints are `enabled`-gated rather than allowed to 403 — e.g. a `patients.view`-only user degrades to demographics instead of seeing a page-level error. Never re-implement server-side filtering client-side (see the note in `features/audit/api/activity-log-api.ts` about protective cases).

### Phase plans in `docs/`

`API_CONTRACT_SYNC_PLAN.md`, `PATIENT_CARETAKE_PLAN.md`, `WATCHER_LOGIC_PLAN.md`, `WATCHER_RELATIONSHIP_DROPDOWN_PLAN.md` are live working documents with per-phase status tables, each mirroring a server-side plan of the same name. Client phases are gated on server phases being deployed first. Check the status table before starting related work, and update it as phases land.

### Legacy / dead code

`src/components/mswd/` and `src/data/patients-data.ts` are the pre-API mock implementation and are no longer imported anywhere — don't extend them, and prefer `features/patients/data/mock-patients.ts` if a fixture is needed. `src/components/theme-provider.tsx` is now just a re-export shim for `src/providers/theme-provider.tsx` (the real localStorage-backed implementation, with `system` support, cross-tab sync, and a `d` hotkey).

## Domain vocabulary

*Category C1/C2/C3/D* (indigency classification, lives on `Assessment`, not `Patient`) · *MSWD No.* vs *Hospital No.* · *watcher* (authorized bedside companion with a pass number and expiry) · *caretaker* (standing custody of a patient, distinct from the *episode handler* — the user assigned to a case) · *case* (an episode) · *assessment* (a point-in-time evaluation within a case).

## UI layer

- shadcn/ui, style `base-mira`, base color `mist` — see `components.json`. Add components with `npx shadcn@latest add <name>`; the `shadcn` MCP server is configured in `.mcp.json`.
- Primitives are **`@base-ui/react`**, not Radix. When writing or editing anything in `src/components/ui/`, follow the Base UI API (`TabsPrimitive.Root.Props`, `render` props, etc.) — Radix patterns copied from the web will not compile.
- Icons: `lucide-react`. Charts: `recharts`. Dates: `date-fns` + `react-day-picker`.
- Theming is CSS-variable driven in `src/index.css`: `:root` / `.dark` blocks define oklch tokens, `@theme inline` maps them to Tailwind utilities. Custom families: `font-sans` (Roboto Variable), `font-heading` (Raleway Variable).

## Conventions

- Import via the `@/` alias (mapped in both `vite.config.ts` and the tsconfigs). Within a feature, use relative imports (`../api/patients-api`); across features, use `@/features/...`.
- Prettier: **no semicolons**, double quotes, 2-space, 80 cols, `prettier-plugin-tailwindcss` sorts classes (`cn` and `cva` are registered as class functions). Much of `src/features/patients/components/` is not prettier-clean — don't reformat wholesale in an unrelated change.
- Comments in this codebase explain *why* a contract or workaround exists, often citing the server side. Preserve and extend that style rather than stripping it.
- TS is strict with `noUnusedLocals`/`noUnusedParameters` and `erasableSyntaxOnly`, so `tsc -b` fails on unused imports — run `npm run typecheck` before declaring work done.
