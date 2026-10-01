# UIS Module (Intake + Assessing) — Client Plan

Client half of the server's `zcmc_mswd_server/docs/UIS_MODULE_PLAN.md` (server issues #160–#175,
all merged). The server must be deployed first: it added assessment/family fields, recalculates the
MSWD classification on every expense write, and changed the UIS print contract.

**Status legend:** ☐ not started · ◐ in progress · ☑ done

| Phase | Depends on | Status |
|-------|-----------|--------|
| 1. Contract plumbing + types (`ApiError.code`, `fetchBlob` errors, assessment/family/readiness types) + classification display (A–D + legacy) (#56) | server | ☑ done |
| 2. Family civil status (type, adapter, dialog, family tab) | 1 | ☐ |
| 3. UIS print flow (readiness, copies/remarks/preview/blank, 409, drop encounter endpoints) | 1 | ☐ |
| 4. Intake assessment form (create/edit, expenses CRUD, reassess dialog fixes) | 1, 3 | ☐ |
| 5. Docs (contract-sync pointer, CLAUDE.md) | 4 | ☐ |

## Background — what was broken against the server

- `uis-print-api.ts` calls `/patient-transactions/{id}/uis/*`; the server only has
  `/cases/{case}/uis/*` (a case is one encounter, `cases.transaction_id`).
- The server's print endpoint 409s with `{code: "uis_no_assessment"}` for a case without an intake
  assessment (unless `?blank=1`); `ApiError` dropped the `code` and `fetchBlob` never read the body.
- No client calls for assessment create/update/expenses; classification display assumed A–D only.

## Server contract (reference)

- `GET /cases/{id}/uis` → `ApiUisReadiness` (`has_assessment`, `ready`, `missing[]`,
  `classification`, `print_count`, `last_printed_at`). `missing` is a hint, not a block.
- `GET /cases/{id}/uis/pdf?preview=1|download=1|blank=1&copies=1..20&remarks=<=255` — logs the print
  unless `preview`; 409 `uis_no_assessment` without an assessment unless `blank`.
- Assessment fields: `informant_name`, `informant_relationship`, `other_income_sources[{source,amount}]`,
  `referral_source`, `medical_history`, `recommendation`, `recommendation_mode`, `fund_source`,
  `house_tenure` (owned|rented), `light_source[]` (electricity|kerosene|candle), `water_source[]`
  (owned|public|artesian_well), `problem_categories[]` (health|economic|housing|food_nutrition|
  employment|other), `problem_specify`.
- Expense create/update/delete recalculates `net_per_capita_income`, `calculated_classification`,
  `classification` (unless overridden) and `calculated_discount_rate` — refetch, never recompute.
- `PUT /assessments/{id}` with `classification: null` reverts to the calculated classification.
- Classification codes are A, B, C1, C2, C3, D; old rows may hold `indigent|low_income|
  self_sufficient|others` (shown as "legacy", not converted).
- Family members gained free-text `civil_status`.

## Decisions

- UIS is case-only: no encounter-level print; an encounter without a case says "open a case".
- Legacy classification words are displayed, never mapped to brackets (CLAUDE.md: never invent a
  classification).
- One issue/branch/PR per phase.

## Phase 1 — Contract plumbing (done)

`ApiError.code`; `fetchBlob` sends `Accept: application/pdf, application/json` and parses JSON error
bodies; `ApiAssessment`/`ApiFamilyMember`/`ApiUisPrintLog`/`ApiUisReadiness` synced with the server
(duplicate `ApiUisPrintLog` removed); `Assessment` UI type + adapter carry the new fields and no longer
coerce an empty classification to `"D"`. Classification helpers moved to `features/cases/lib/classification.ts`
(`getClassificationBadgeText`, `getBracketColor/Label`, `formatCurrency`): A–D as before, legacy words as
"x (legacy)", missing as "Not on file". The SCSR editor's free-form classification select
(`social-case-editor.tsx`) is a separate SCSR field and is left alone.

## Verification

Per phase: `npm run typecheck && npm run build` (lint baseline is 76 pre-existing errors — do not add
to it). Then drive the flow in the browser against a local server (`php artisan serve`).
