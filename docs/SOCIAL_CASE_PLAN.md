# MSWD Client — Social Case Plan

Client half of the Social Case module: the **Social Case Study Report** (SCSR),
the formal narrative a social worker authors, a section head signs, and the
hospital files. Two phases.

The server half lives in `zcmc_mswd_server/docs/SOCIAL_CASE_PLAN.md` (Phases
A–D) and carries the schema, endpoint and permission definitions. Phase E is
gated on server Phase A; Phase F is gated on work that does not exist in either
plan yet — see its section.

**Status legend:** ☐ not started · ◐ in progress · ☑ done

| Phase | Gate | Status |
|-------|------|--------|
| E. Types, API, adapter, SCSR tab rewrite | server A | ☑ done |
| F. Case route + caseload screen | server B + a routing project | ☐ blocked |

**Recommended sequencing: server A → E → routing project → server B, C → F.**
Shipping server B before F means building a caseload queue nothing can open.

---

## Background — what exists today

`social-case-tab.tsx` renders a card titled "Social Safety Net Case Study
Report" with five fields. Every one of them is derived, not authored:

| Rendered | Actually comes from |
|----------|---------------------|
| Case Study No | `latestCase.case_code` — the *case* code, not a report number |
| Category badge | `latestAssessment.classification` |
| Classification Details | `buildClassificationSummary()` — housing/utilities/income joined with `•` |
| Presenting Problem | `latestAssessment.presenting_problem` |
| Social Worker Notes | `latestAssessment.assessment_notes` |
| Recommended Assistance | **hardcoded `NOT_ON_FILE`** |
| Approved Amount | **hardcoded `undefined`** |

So the tab is a read-only view of an intake-time assessment wearing a report's
title. There is no draft, no submit, no sign-off, no control number, and nothing
to print. A case manager cannot produce the document their job is measured by.

**A live cosmetic bug worth fixing in passing.**
[`social-case-tab.tsx:59`](../src/features/patients/components/tabs/social-case-tab.tsx)
renders `₱{patient.caseStudy.approvedAmount?.toLocaleString()}`. Since the
adapter hardcodes `approvedAmount` to `undefined`, that prominent primary-colored
figure is, on every patient, a bare `₱` with no number after it.

**There is no `src/features/cases/`.** Cases reach the UI only as
`latestCase`/`latestAssessment` folded into `PatientRecord` by
`patients-adapter.ts`.

**There is no router.** No `react-router`, no route definitions; navigation is a
`currentView` `useState` in `main-layout.tsx` switching between the patient
master-detail and the audit log.

### The near-exact precedent

The Unified Intake Sheet already models this same shape — a
draft → submitted → finalized document with a server-rendered PDF — and Phase E
should mirror it rather than invent:

| Concern | Follow |
|---------|--------|
| API module | `patients/api/intake-sheets-api.ts` |
| Lifecycle verbs | `submitIntakeSheet` / `finalizeIntakeSheet` / `cancelIntakeSheet` |
| PDF download | `downloadIntakeSheetPdf` → `fetchBlob` in `lib/api-client.ts`, which exists precisely because the endpoint needs the bearer token |
| Hooks + invalidation | `hooks/use-intake-sheets.ts` |
| Status badges and filters | `tabs/intake-sheet-tab.tsx` (`STATUS_LABEL`, `statusBadgeVariant`) |
| A long authoring form | `dialogs/intake-sheet-wizard-modal.tsx` |

**One thing not to copy from it.** `intake-sheet-tab.tsx` gates no action behind
`usePermission` — its finalize button renders for everyone and relies on the
server's 403. The SCSR must not repeat that: `cases.finalize_social_case` is a
section-head authority that Case Manager deliberately does not hold, and a
button that always 403s for the role that most uses this screen is a defect, not
a safety net.

---

## Phase E — Types, API, adapter, SCSR tab rewrite ☑

**Gate:** server Phase A deployed.

The visible payoff is retiring both `NOT_ON_FILE` placeholders and turning a
read-only card into an editor.

### Types

| File | Change |
|------|--------|
| `src/features/cases/types/social-case.types.ts` *(new)* | `SocialCaseStatus = "draft" \| "for_review" \| "finalized"`; `SocialCase` — the UI-facing model: `id`, `caseId`, `socialCaseNo`, `status`, `revision`, `classification`, socioeconomic (`totalFamilyIncome`, `housingType`, `utilitiesAccess`), the ten narrative sections, `preparedBy`/`preparedAt`, `notedBy`/`notedAt`, `reviewRequestedAt`, `expenses`, `expensesTotal`, `isEditable`, `canFinalize`, `latestDocument` |
| `src/features/cases/types/index.ts` *(new)* | barrel, mirroring `patients/types/index.ts` |
| `src/features/patients/types/api.types.ts` | `+ ApiSocialCase` per the `SocialCaseResource` key list in server §A.8; `+ social_case_status` to `ApiAssessment` |
| `src/features/patients/types/case-study.types.ts` | `SocialCaseStudy` loses `recommendedAssistance` and `approvedAmount` — they become real fields on `SocialCase`, sourced from `recommended_assistance` / `recommended_amount` |

`ApiSocialCase` belongs in `patients/types/api.types.ts` rather than a new
`cases/types/api.types.ts`: that file is already the single home for every
wire-shape in the app, and splitting it per feature is a separate refactor.

**Use the server's `is_editable` and `can_finalize` rather than re-deriving them
from `status`.** The Caretake tab learned this the hard way — the server splits
active/history custody for the same reason. `can_finalize` folds in the watcher
requirement (`EnsureWatcherRequirementSatisfied`), which the client cannot
evaluate at all.

### API

`src/features/cases/api/social-case-api.ts` *(new)*:

| Function | Endpoint |
|----------|----------|
| `getSocialCase(caseId)` | `GET /cases/{case}/social-case` — 404 when none exists yet, which is a normal state, not an error |
| `startSocialCase(caseId, payload)` | `POST /cases/{case}/social-case` — optional `assessment_id`; promotes an existing assessment |
| `updateSocialCase(caseId, payload)` | `PUT /cases/{case}/social-case` |
| `submitSocialCase(caseId)` | `POST /cases/{case}/social-case/submit` |
| `finalizeSocialCase(caseId)` | `POST /cases/{case}/social-case/finalize` |
| `amendSocialCase(caseId, reason)` | `POST /cases/{case}/social-case/amend` — `reason` required, max 255 |
| `downloadSocialCasePdf(caseId, filename)` | `GET /cases/{case}/social-case/pdf` via `fetchBlob`, copying `downloadIntakeSheetPdf` |

Every route is `/cases/{case}/social-case` — **singular, never
`/social-cases/{id}`**. That is deliberate on the server side: the URL carries
the one-SCSR-per-episode invariant. Do not add an id-addressed variant.

`src/features/cases/api/social-case-adapter.ts` *(new)* — `ApiSocialCase` →
`SocialCase`. Small enough to live beside the API module rather than growing a
second `patients-adapter`-sized file.

### The case id problem — settle this first

The SCSR is case-scoped, but `SocialCaseTab` receives only a `PatientRecord`,
and **`PatientRecord` carries no case id**. `caseStudy.caseNumber` is the case
*code* (`CASE-2026-000123`), not the numeric id the routes need.

`usePatientDetail` already fetches the latest case via
`getLatestCaseForPatient`, so the id exists — it is discarded during adaptation.

**Add `latestCaseId?: string` to `PatientRecord`,** populated in
`toPatientDetailRecord` from `extras.latestCase?.id`. Rejected alternatives:
threading the raw `ApiCase` down through `PatientDetailView` as a second prop
(the prop list is already long and hand-threaded), and having the tab re-fetch
the latest case (a duplicate request for data the parent already holds).

It stays optional because the list mapping has no case id to give, and because
`usePatientDetail` gates the latest-case query on `cases.view` — a
`patients.view`-only user legitimately has no case, and therefore no SCSR. The
tab must render that as "no case episode" rather than as a failure.

### Adapter

| Function | Change |
|----------|--------|
| `toPatientDetailRecord` | populate `latestCaseId` |
| `caseStudy` block (both list and detail) | drop `recommendedAssistance: NOT_ON_FILE` and `approvedAmount: undefined` |

Leave the rest of `caseStudy` alone. It still usefully summarises the latest
assessment for the list view and for the Caretake tab's episode banner
([`caretake-tab.tsx:77`](../src/features/patients/components/tabs/caretake-tab.tsx)
reads `caseStudy.caseNumber`), and the SCSR is a separate query, not a
replacement for it.

### Hooks

`src/features/cases/hooks/use-social-case.ts` *(new)*:

```ts
export function socialCaseKeys(caseId: number) {
  return { detail: ["cases", caseId, "social-case"] as const }
}
```

`useSocialCase(caseId)` — `enabled` on a real id **and** on
`usePermission("cases.view")`, matching how `usePatientDetail` gates its
case-scoped queries rather than letting them 403.

A 404 means "not started yet" and must not surface as an error: either
`retry: false` with the component branching on the 404, or normalise it to
`null` in `getSocialCase`. **Prefer normalising in the API function** — one
place, and the hook's consumers then only handle `data === null`.

`useStartSocialCase` / `useUpdateSocialCase` / `useSubmitSocialCase` /
`useFinalizeSocialCase` / `useAmendSocialCase`, each invalidating
`socialCaseKeys(caseId).detail`. Finalize and amend must **also** invalidate the
patient's `history` (the server writes a `CaseActivity` and an audit entry) and
`profile` — the same rule `use-caretaker-writes.ts` follows, and for the same
reason.

### Components

| File | Purpose |
|------|---------|
| `src/features/patients/components/tabs/social-case-tab.tsx` | rewritten: status badge, the ten sections, lifecycle actions, PDF button |
| `src/features/cases/components/social-case-editor.tsx` *(new)* | the sectioned form — kept out of the tab so the tab stays a thin shell over its three states |
| `src/features/cases/components/social-case-signoff.tsx` *(new)* | the two signature blocks, read-only |
| `src/features/cases/components/dialogs/amend-social-case-dialog.tsx` *(new)* | required reason, max 255 |

The tab has **three** states and should not blur them:

1. **No case episode** (`latestCaseId` absent) — an empty state, no start
   button. There is nothing to attach an SCSR to.
2. **No SCSR yet** (`data === null`) — a "Start Social Case Study" button,
   gated on `cases.create`. Worth saying in the empty state that starting one
   carries over the existing assessment's income, classification and expenses,
   because that is the non-obvious payoff of promotion over re-typing.
3. **An SCSR exists** — status badge, sections, actions.

### Rules the UI must enforce

- **Finalize behind `usePermission("cases.finalize_social_case")`, and amend
  behind the same.** Not a toast after a 403 — hide or disable the action. Case
  Manager holds `cases.update` and authors the report but cannot sign it, and
  that is the common case, not the edge one.
- **Editable means `is_editable` from the server**, which is status ∈
  `[draft, for_review]`. A finalized SCSR rejects writes at the model layer, so
  a client that lets someone type into it is promising something the server will
  refuse.
- **Finalize is permitted direct from `draft`** — the review step is optional by
  policy and mandatory by nothing. Do not make the UI enforce a sequence the
  server does not.
- **Amend reopens; it does not create a version.** The prior PDF stays. Say so
  in the dialog: revisions are a stack of immutable `Document` rows sharing a
  `social_case_no`, visible in the Documents tab. No new read surface is needed
  and none should be built.
- **Surface a finalize 422 on the action, not as a generic toast.** The likely
  cause is the watcher requirement, and the worker needs to know it is the
  watcher gate, not a save failure. See P4 below.

**Blast radius.** One tab rewritten, one new feature folder, one optional field
on `PatientRecord`. `SocialCaseStudy` losing two keys breaks
`mock-patients.ts` at compile time — budget for that here.

**Gate.** `npx tsc -b` clean (**not** `npm run typecheck`, which excludes
`src/`). Then manually: start an SCSR on a case opened via intake and confirm
income, classification and expenses carried over with no retyping; edit; submit
as Case Manager; confirm finalize is **not offered** to Case Manager and works
as Supervisor; download the PDF and confirm `₱` renders and both signature
blocks are present; amend, re-finalize, confirm two documents share the
`social_case_no`.

---

## Phase F — Case route + caseload screen ☐ blocked

**Gate:** server Phase B, **and a routing project that does not exist yet.**

Server Phase B ships `GET /my-caseload` — a paginated queue of the actor's own
cases filtered by `social_case_status`, with bucket counts. It is the screen a
case manager would live in.

**The client cannot open a case.** There is no router, no case-scoped route, and
navigation is a two-value `useState` in `main-layout.tsx`. A caseload list whose
rows cannot be clicked through to anything is not worth building, and bolting a
third value onto `currentView` to fake it would make the routing problem worse
rather than deferring it honestly.

What Phase F needs first, as its own plan:

- A router (`react-router` or TanStack Router) and real URLs — at minimum
  `/patients/:id` and `/cases/:id`.
- Filter and pagination state in the URL. The audit log already does this by
  hand with `history.replaceState`
  ([`audit-log-page.tsx`](../src/features/audit/components/audit-log-page.tsx));
  a router would replace that, and the caseload has strictly more filter state.
- A decision on whether the patient detail view's nine tabs become nested routes
  or stay local state.

Only then: `src/features/cases/components/caseload-page.tsx`, a
`use-caseload.ts` hook with `placeholderData: keepPreviousData`, bucket chips
driven by the server's `meta.buckets`, and a sidebar entry gated on
`cases.view`.

**Do not start Phase F before that plan exists.** The routing decision is
architectural and reversing it is expensive; making it implicitly, as a
side-effect of wanting a caseload screen, is how it gets made badly.

---

## Notes carried from the server plan

Two of the server's recorded problems land on this side:

**P4 — the intake watcher gap will be reported as an SCSR bug.** Intake
`watchers[]` sync onto `patient_watchers`, but the finalize gate reads
`case_watchers`. A worker who added a watcher through intake will hit a 422 at
finalize about a watcher they believe they already provided. Phase E cannot fix
this, but its error handling determines whether the message is comprehensible.
The fix belongs in `WATCHER_LOGIC_PLAN.md`.

**P2 — B, C and F are blocked by this repo, not the server.** Worth restating
here, because the block is ours to clear.

---

## Out of scope

- **Progress notes / follow-ups UI** (server Phase C). Needs the same routing
  work as Phase F; folding it into the patient detail view would put case-scoped
  data under a patient-scoped screen.
- **Reporting dashboards and exports** (server Phase D).
- **A row-level revision viewer.** Revisions are archived PDFs in the Documents
  tab by design — see server §A.8.
- **An `assessment_expenses` editor.** Server §A.10 gives it an API, and the
  SCSR's §V needs to *render* the expense grid, but a full CRUD surface for line
  items is its own piece of work. Phase E renders them read-only.
- **Filament parity.** Back-office correction stays in the admin panel.
