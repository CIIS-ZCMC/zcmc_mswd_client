# MSWD Client — Social Case Plan

Client half of the Social Case module: the **Social Case Study Report** (SCSR),
the formal narrative a social worker authors, a section head signs, and the
hospital files.

This document was rewritten on **2026-09-25** after auditing the shipped code.
The original plan (Phases E–F) was written when the client had no router, no
`src/features/cases/`, and a read-only SCSR card. All of that is now built —
Phase E shipped as planned, and Phase F was delivered wholesale by
`CASE_MODULE_PLAN.md` (react-router v7 + caseload + case-detail). What remains
are the server capabilities that still have **no client consumer**: progress
notes, follow-ups, and reporting.

The server half lives in `zcmc_mswd_server/docs/SOCIAL_CASE_PLAN.md`
(Phases A–D, **all ☑ shipped** — A: SCSR authoring/lifecycle/PDF; B: caseload
queue; C: progress notes / follow-ups; D: reporting + case-summary PDF).

**Status legend:** ☐ not started · ◐ in progress · ☑ done

| Phase | Server gate | Status |
|-------|-------------|--------|
| E. Types, API, adapter, SCSR tab rewrite | A | ☑ done |
| F. Case route + caseload screen | B + routing | ☑ done — via `CASE_MODULE_PLAN.md` |
| G. Progress notes + follow-ups UI | C | ☑ done |
| H. Reporting dashboard + case-summary PDF | D | ☑ done |

---

## What is built today (as-built record)

### Phase E — SCSR authoring ☑

The read-only "Social Safety Net Case Study Report" card is gone. In its place:

| File | Role |
|------|------|
| [social-case.types.ts](../src/features/cases/types/social-case.types.ts) | `SocialCaseStatus`, `SocialCase` UI model, payload types |
| [social-case-api.ts](../src/features/cases/api/social-case-api.ts) | `getSocialCase` (404→null), `startSocialCase`, `updateSocialCase`, `submitSocialCase`, `finalizeSocialCase`, `amendSocialCase`, `downloadSocialCasePdf` |
| [social-case-adapter.ts](../src/features/cases/api/social-case-adapter.ts) | `ApiSocialCase` → `SocialCase` |
| [use-social-case.ts](../src/features/cases/hooks/use-social-case.ts) | `socialCaseKeys`, `useSocialCase` (gated on id + `cases.view`), the five write hooks; finalize/amend invalidate `history` + `profile` |
| [social-case-tab.tsx](../src/features/patients/components/tabs/social-case-tab.tsx) | the three-state shell: no-episode / no-SCSR / SCSR-exists |
| [social-case-editor.tsx](../src/features/cases/components/social-case-editor.tsx) | the sectioned narrative form |
| [social-case-signoff.tsx](../src/features/cases/components/social-case-signoff.tsx) | the two read-only signature blocks |
| [amend-social-case-dialog.tsx](../src/features/cases/components/dialogs/amend-social-case-dialog.tsx) | required reason, max 255 |

Every rule the original plan called for is honoured in the shipped tab:

- **Three distinct states**, not blurred: no case episode (empty state), no SCSR
  yet (`data === null`, "Elevate to SCSR" gated on `cases.create`), and an
  existing SCSR (status badge, editor, actions).
- **`is_editable` / `can_finalize` come from the server**, not re-derived from
  status. The finalize button is disabled on `canFinalize === false`.
- **Finalize and amend are gated on `usePermission("cases.finalize_social_case")`**
  — hidden for Case Manager, not left to 403. A "Section Head authority" notice
  renders for a Case Manager viewing a `for_review` report.
- **Finalize is permitted direct from draft.**
- **Amend reopens without creating a version** — prior PDF untouched; revisions
  are a stack of `Document` rows sharing a `social_case_no`.
- **A finalize 422 is surfaced on the action** with watcher-specific copy
  pointing the worker to the Watchers tab, not a generic toast.
- Both `NOT_ON_FILE` placeholders (`recommendedAssistance`, `approvedAmount`)
  are retired; `latestCaseId` is populated on `PatientRecord` by the adapter.

The tab also composes the Assessment module (all ☑ per `ASSESSMENT_MODULE_PLAN.md`):
`MswdClassificationCard`, `AssessmentHistoryTimeline`, `ReassessCaseDialog`, and
the promote-assessment-to-SCSR flow.

### Phase F — case route + caseload ☑ (delivered by CASE_MODULE_PLAN)

The original Phase F was **blocked** on "a routing project that does not exist
yet." That project shipped as `CASE_MODULE_PLAN.md`:

- react-router v7, `<BrowserRouter>` in [main.tsx](../src/main.tsx), `<Routes>`
  in [main-layout.tsx](../src/components/layout/main-layout.tsx).
- `/caseload` → [caseload-page.tsx](../src/features/cases/components/caseload-page.tsx),
  consuming `GET /my-caseload` with status-bucket tabs.
- `/cases/:caseId` → [case-detail-page.tsx](../src/features/cases/components/case-detail-page.tsx),
  which composes the SCSR tab, the assessments timeline and the Watchers tab, and
  runs the case lifecycle (assign / close / refer / reopen / archive / card-color).

The SCSR is therefore now reachable **two ways** — from the patient detail view's
`social-case` tab and from the case detail page's `Social Case (SCSR)` tab. Both
mount the same `SocialCaseTab`. See the open items below.

---

## Phase G — Progress notes + follow-ups UI ☑

**Gate:** server Phase C (shipped). Shipped with:
- `src/features/cases/types/progress-note.types.ts` (`CaseProgressNote`, `NoteType`, create/update payloads).
- `src/features/cases/api/progress-notes-api.ts` & `progress-notes-adapter.ts`.
- `src/features/cases/hooks/use-progress-notes.ts` (`useProgressNotes`, `useMyFollowUps`, `useProgressNoteMutations`).
- `src/features/cases/components/progress-notes-tab.tsx` mounted directly on Case Detail page (`/cases/:caseId`).
- "Follow-ups Due" queue tab on Caseload page (`/caseload?status=follow_ups`) with overdue alerting and instant completion.

---

## Phase H — Reporting dashboard + case-summary PDF ☑

**Gate:** server Phase D (shipped). Shipped with:
- **Case Summary PDF Export**: `downloadCaseSummaryPdf(id)` via `fetchBlob`, mounted as "Summary PDF" action on Case Detail page.
- **Reporting Module**: `src/features/reports/` with `report.types.ts`, `reports-api.ts`, `reports-adapter.ts`, `use-social-case-reports.ts`, and `social-case-reports-page.tsx`.
- **Navigation & Routes**: Added `/reports/social-cases` route in `main-layout.tsx` and "Reports" nav tab in `sidebar.tsx` (gated on `reports.view` with exports gated on `reports.generate`).
- **Privacy Compliance**: Confidentiality notice banner indicating protective case records are excluded from aggregate metrics.

**Gate:** server Phase D (shipped). No client consumer today.

| Server endpoint | Permission | Returns |
|-----------------|-----------|---------|
| `GET /reports/social-cases` | `reports.view` | JSON aggregates over a date range |
| `GET /reports/social-cases/export` | `reports.generate` | same as CSV or PDF |
| `GET /cases/{case}/summary-pdf` | `cases.view` | an endorsement/referral document |

Proposed client work:

- **Case-summary PDF button** on the case detail page header — the cheapest,
  highest-value slice. `downloadCaseSummaryPdf(caseId)` via `fetchBlob`, copying
  `downloadSocialCasePdf`. Gated on `cases.view`; can ship independently of the
  dashboard.
- **Reports page** — `src/features/reports/` (new feature folder), a route
  `/reports/social-cases` gated on `usePermission("reports.view")`, a date-range
  picker, and aggregate cards/charts (recharts is already a dependency).
- **Export action** gated separately on `usePermission("reports.generate")` —
  Case Manager holds `reports.view` but not `reports.generate`, so the on-screen
  dashboard shows while bulk PHI export stays with Supervisor+. Do not let the
  export button render for a role that will only 403.
- Respect the server's `protective_excluded` marker in the response — surface it
  in the UI ("N protective cases excluded") rather than showing a silently wrong
  total. Never re-filter protective rows client-side.

**Blast radius.** A new feature folder, one route, one nav entry, one header
button. Additive.

**Gate.** `npx tsc -b`; manual: dashboard renders for `reports.view`; export is
absent for Case Manager and works for Supervisor; the summary PDF downloads and
contains the SCSR narrative + interventions + progress notes.

---

## Open items / tech debt

- **Duplicate SCSR mounting.** `SocialCaseTab` and `WatchersTab` render both on
  the patient detail view and on the case detail page. This is harmless (same
  data, same case id) but means two entry points to maintain. The server plan's
  original intent was case-scoped screens; now that `/cases/:id` exists, decide
  whether the patient-view copies become redirects/read-only summaries or stay.
  Not urgent — flagged so the redundancy is a decision, not an accident.
- **`as any` casts in case-detail-page.** [case-detail-page.tsx:365](../src/features/cases/components/case-detail-page.tsx#L365)
  passes `caseRecord.patient as any` into `SocialCaseTab` and `WatchersTab`,
  because those tabs take a full `PatientRecord` but the case profile carries a
  lighter patient shape. Tighten the tab props to what they actually read (an id
  + `caseStudy.caseNumber` + `watchers`), or have the case page fetch the real
  `PatientRecord`. Currently a compile hole the strict config would otherwise
  catch.
- **P4 — the intake watcher gap** still lands here as a finalize 422. Intake
  `watchers[]` sync onto `patient_watchers`, but the finalize gate reads
  `case_watchers`. The tab's error handling makes the message comprehensible; the
  actual fix belongs in `WATCHER_LOGIC_PLAN.md`.

---

## Out of scope

- **Filament SCSR authoring parity** — back-office correction stays in the admin
  panel; the finalized-row lock protects it.
- **A row-level revision viewer** — revisions are archived PDFs in the Documents
  tab by design (server §A.8).
- **A full `assessment_expenses` CRUD editor** — the SCSR renders the expense
  grid read-only; line-item CRUD is its own piece of work.
