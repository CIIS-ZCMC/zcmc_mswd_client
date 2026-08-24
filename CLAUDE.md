# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`README.md` covers the stack, folder layout, naming conventions and the auth flow. Read it first — this file covers only what it doesn't: the cross-repo contract, the pieces that span several files, and the traps that have already cost time.

## This repo is half of a pair

The client is meaningless without `zcmc_mswd_server`, a Laravel 12 + Filament API checked out separately (on this machine: `D:\System\zcmc_mswd_system\zcmc_mswd_server`, a **separate git repo** — `CIIS-ZCMC/zcmc_mswd_client` and `CIIS-ZCMC/zcmc_mswd_server` on GitHub).

Two consequences worth internalising:

- **The Filament admin panel is the reference implementation.** `app/Filament/Resources/*` on the server defines how MSWD staff actually work — the form fields, table filters, record actions and their visibility rules. When building a screen here, read the matching Filament resource rather than inventing behaviour. This client exists to replace that panel for day-to-day users.
- **Many client features need a server change first.** Adding a sortable column, a filter, or a dropdown's option list is a two-repo change. See the list-query contract below.

**Never guess the API shape.** Every past failure in this codebase traces to a schema written from imagination. Capture the real response before writing a parser or a fixture:

```bash
curl -s -X POST http://localhost:8000/api/login -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"zcmc@admin.com","password":"P@$$w0rd"}' -o /tmp/l.json
TOKEN=$(sed -n 's/.*"token":"\([^"]*\)".*/\1/p' /tmp/l.json)
curl -s "http://localhost:8000/api/patients?per_page=2" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Laravel serialises decimals as strings (`"5000.00"`) and some integer columns arrive as numbers where you'd expect text (`employee_number`). Both have caused real bugs that hand-written MSW fixtures hid.

## Commands

Client:

```bash
npm run dev          # Vite dev server
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint
npm test             # vitest run
```

A single test file or case:

```bash
npx vitest run src/features/patients/pages/PatientsPage.test.tsx
npx vitest run -t "sends the search term"
```

Server (from its own directory):

```bash
php artisan test                      # full Pest suite
php artisan test --filter=ListQueryTest
./vendor/bin/pint --dirty             # style; run before committing
php artisan route:list --path=api     # pipe through `sed 's/\x1b\[[0-9;]*m//g'` — colour codes break grep
```

Before pushing anything, all three client checks and the server suite should be green.

## The API boundary

Three layers, and skipping one causes the failures this codebase has already had.

**1. Envelope.** Laravel wraps everything. `src/lib/api-envelope.ts` provides `resource()` for `{data}`, `collection()` for `{data: []}`, and `paginated()` which maps `{data, meta}` onto the app's `Paginated<T>`. Every `api.ts` parses through these — never destructure `.data` by hand.

**2. Shape.** Zod objects mirror the API's snake_case payload *exactly as sent*. Do not rename fields inside the schema.

**3. Mapping.** An explicit `toX()` transform converts to the camelCase type the app uses. `src/features/auth/schemas.ts` and `src/features/patients/schemas.ts` are the pattern.

The payoff is that a 422's `errors.<field>` maps straight onto the matching form input with no translation — which is why **form field names stay snake_case**, matching the API (see `PatientForm.tsx`). The README's reference to `PatientIntakeForm` is stale; that file is now `PatientForm.tsx`.

## The list-query contract (cross-repo)

`useListQuery` (`src/hooks/useListQuery.ts`) holds table state — page, search, sort, filters, archived scope — in the URL, so a filtered view is linkable and survives a refresh. It emits `?page`, `?per_page`, `?search`, `?sort`, `?direction`, `?trashed` and `?filter[col]`.

The server side is `App\Support\ListQuery` + `BaseRepository::paginateList()`. Each repository declares allow-lists:

```php
protected array $searchable = ['mswd_id', 'hospital_id', 'first_name', 'last_name'];
protected array $filterable = ['sector_id', 'sex'];
protected array $sortable   = ['mswd_id', 'last_name', 'first_name', 'created_at'];
```

**A sort or filter key not on the list is silently dropped, not applied.** So adding a filter to a table here requires adding the column to the matching repository there. `searchable` supports `relation.column` for searching through a relation.

## Record actions and forms

Two primitives cover what Filament calls actions:

- `RecordAction` (`src/components/common/RecordAction.tsx`) — a button that optionally confirms, optionally collects a small payload, runs a mutation and toasts the outcome. Backs both plain confirms (archive, close) and form actions (assign, refer, merge). Its `visible` prop is the equivalent of Filament's `->visible()`; mirror the same permission and state rules.
- `RecordFormModal` (`src/components/common/RecordFormModal.tsx`) — a full create form in a dialog: schema → RHF → fields → server field errors → success toast.

`toast-context` surfaces a service's `ValidationException` the way Filament does — a 422 on archive means "this patient still has an open case", and the user needs to see that message.

Permission gating uses `useAuth().can('patients.create')`, matching the permission the API enforces on that route. It is a convenience, not a boundary.

## Current state

Phase 1 of the Filament port is done; the rest is tracked in GitHub issues #2–#6 on the client repo.

**Real:** auth, the patient registry (server-side search/filter/sort/paging), the patient detail page with ten relation tabs, patient create/edit, the merge/archive/restore actions, and the Add record menu (case, intake sheet, assessment, assistance).

**Placeholder:** `/cases`, `/assistance` and `/reports` all render `PatientsPage`. `/intake` has no route. The `cases`, `assistance` and `intake` features exist but expose only what Add record needs — creation plus per-patient read. The lifecycle actions (approve/release/cancel assistance, assign/close/refer/reopen a case) and the seven-step intake wizard are not built.

There is no global module navigation; the sidebar is the patient registry only, and everything is reached per-patient.

## Traps

- **`php artisan serve` is single-threaded** unless `PHP_CLI_SERVER_WORKERS` is set in the server's `.env`. Without it the SPA's concurrent calls (each with a CORS preflight) queue behind one worker and pages appear to hang for seconds. It's set in `.env.example`, but `.env` is gitignored — check it, and **restart an already-running server** after changing it.
- **Vite ignores the harness `PORT`.** When using preview tooling, read the actual port from the dev-server logs rather than trusting the assigned one.
- **All dialogs render at once.** A closed `<dialog>` is still in the DOM, so any shared element `id` collides — `RecordFormModal` uses `useId()` for its form id because a hardcoded one made every submit button target the first form in the document.
- **A `<select>` whose `value` matches no option displays the first one while holding `''`.** Derive a selection from loaded options rather than seeding state before the query resolves.
- **React Compiler is enabled** (`babel-plugin-react-compiler` in `vite.config.ts`); don't hand-add `useMemo`/`useCallback` for performance alone.

## Server-side skills

The server repo carries `.claude/skills/` for `laravel-best-practices`, `pest-testing` and `tailwindcss-development`. Consult them when working in that repo.
