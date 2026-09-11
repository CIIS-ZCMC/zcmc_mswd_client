# MSS — Watcher Logic Plan (Client)

Client half of the plan replacing the patient-scoped `patient_watchers` model
with episode-scoped `case_watchers`. The server half — schema, requirement
resolver, endpoints, transition enforcement, and the backfill command — is
**fully shipped**: `zcmc_mswd_server/docs/WATCHER_LOGIC_PLAN.md`, Phases 1–5,
all ☑. Nothing here is blocked from starting.

**Status legend:** ☐ not started · ◐ in progress · ☑ done

| Phase | Status | Depends on |
|-------|--------|------------|
| 6. Types + adapter + API layer | ☑ | server Phase 3 (shipped) |
| 7. Watchers UI goes case-scoped | ☑ | client Phase 6 |
| 8. Requirement banner, waiver dialog, worklist filter | ☑ | client Phase 6; server Phase 4 (shipped) |

Each phase ships independently and is additive — the existing
`/patients/{id}/watchers` endpoints stay live on the server throughout, so
nothing here needs a coordinated deploy.

---

## 1. Background — what's actually true in this client today

The server doc's original client sketch (its §8) assumed a case-detail page
already existed for the Watchers tab to "move to." Checked before writing
this plan — **it doesn't.** `src/features/cases/{api,hooks,types}/` exist as
directories but are completely empty; there is no case-scoped route, page,
or component anywhere in the app. `src/features/reference/{api,hooks,types}/`
are likewise empty scaffolds — every reference lookup the app uses today
(sectors, assistant types, etc.) is fetched ad hoc, not through a shared
`reference` feature. Every phase below is written around this reality
instead of the page that doesn't exist.

Three things that matter for what follows:

1. **Everything is patient-centric.** `patient-detail-view.tsx` renders 9
   tabs (`profile`, `id`, `family`, `watchers`, `staff`, `social-case`,
   `documents`, `history`, `intake-sheet`), all fed by `usePatientDetail`.
   There is no equivalent `useCaseDetail` or case route. `getLatestCaseForPatient`
   (`patients-api.ts`) is the only place a "case" is fetched today, and it
   hits `GET /cases?filter[patient_id]=…&per_page=1` — the **list** endpoint,
   which never carries `watchers` or `watcher_status` (only
   `GET /cases/{case}/profile` does, per the server's Phase 3 design — those
   two keys are deliberately gated on eager-loading `watchers`, which only
   the profile endpoint does, to avoid an N+1 across every other place
   `CaseModelResource` is reused).
2. **The watcher API surface already exists** (`createWatcher` in
   `patients-api.ts`, `ApiWatcher` in `api.types.ts`, `Watcher` type,
   `watchers-tab.tsx`, `watcher-dialog.tsx`) — all patient-scoped, all
   exactly matching what the server doc's §1 called out as the problem this
   whole feature exists to fix. `watcher.types.ts`'s own doc comment already
   says as much: `passNo`/`validUntil` are placeholder strings because the
   backing columns didn't exist. They do now (`case_watchers.pass_number`,
   `.pass_valid_until`, `.pass_status`).
3. **Case-level write actions barely exist yet.** `useSubmitIntakeSheet` /
   `useFinalizeIntakeSheet` (`use-intake-sheets.ts`) are real and wired to
   buttons. There is no client-side "close case" or "approve assistance"
   action anywhere — so Phase 8's "disable the blocked action" guard only has
   two real buttons to attach to today (Submit/Finalize Intake), not the
   four the server enforces (close case and approve assistance are
   server-enforced already; the client just has no button that could hit
   them yet).

**Given all of this, "the tab moves from patient to case" (server §8) is
rewritten below as "the tab's data and mutations move to being case-scoped,
while staying physically inside the patient detail view."** Building a real
case-detail page is a separate, larger initiative outside this plan's scope
— if and when one exists, moving the already-case-scoped tab into it is a
placement change, not a data-layer one, because Phase 7 does that work now.

This also intersects with the **separate, already-in-progress**
`API_CONTRACT_SYNC_PLAN.md` in this repo (client Phases 5–8, all still ☐
despite some of Phase 8's permission-gating already appearing to be
implemented in `use-patient-detail.ts` — worth a quick recheck against that
doc before starting here, since both plans touch `patients-adapter.ts`,
`patient-detail-view.tsx`, and the sidebar). That plan's Phase 7 (server-driven
sidebar filters) is a prerequisite for this plan's "Missing watcher" worklist
filter in Phase 8 below.

---

## 2. Phase 6 — Types, API, adapter ☐

No visible UI change. Wires the data layer so Phase 7 has something to call.

### New types — `src/features/cases/types/watcher.types.ts`

Finally populates the empty `features/cases/types/` scaffold — this is the
first thing to live there.

```ts
export interface CaseWatcher {
  id: string
  caseId: string
  patientWatcherId: string | null
  fullName: string
  relationship: string
  contactNo: string | null
  address: string | null
  isPrimary: boolean
  isInformant: boolean
  passNumber: string | null
  passValidUntil: string | null
  passStatus: "active" | "expired" | "revoked"
  presentFrom: string | null
  presentUntil: string | null
  addedBy: { id: string; name: string } | null
  notes: string | null
}

export type WatcherRequirement = "required" | "recommended" | "optional" | "waived"

export interface WatcherStatus {
  requirement: WatcherRequirement
  hasPrimary: boolean
  satisfied: boolean
  blocking: boolean
}

export interface WatcherRelationshipType {
  id: string
  name: string
  code: string
}
```

`src/features/cases/types/api.types.ts` — the raw server shapes, matching
`CaseWatcherResource` / `WatcherRequirementService::status()` /
`WatcherRelationshipTypeResource` field-for-field:

```ts
export interface ApiCaseWatcher {
  id: number
  case_id: number
  patient_watcher_id: number | null
  name: string
  relationship: string
  contact_number: string | null
  address: string | null
  is_primary: boolean
  is_informant: boolean
  pass_number: string | null
  pass_valid_until: string | null
  pass_status: string
  present_from: string | null
  present_until: string | null
  added_by?: { id: number; name: string } | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ApiWatcherStatus {
  requirement: string
  has_primary: boolean
  satisfied: boolean
  blocking: boolean
}

export interface ApiWatcherRelationshipType {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
}
```

The 422 body a blocked transition returns (`errors.watcher`, `watcher_status`)
also needs a spot in the shared API error type — wherever
`ApiValidationError` (or equivalent) already lives; check `lib/api-client.ts`
for the existing shape before adding a new one.

### API — `src/features/cases/api/case-watchers-api.ts`

One function per server endpoint from `docs/WATCHER_LOGIC_PLAN.md` §6 on the
server (all nine already shipped):

```ts
listCaseWatchers(caseId)              // GET  cases/{case}/watchers
getWatcherStatus(caseId)              // GET  cases/{case}/watcher-status
createCaseWatcher(caseId, payload)    // POST cases/{case}/watchers
updateCaseWatcher(watcherId, payload) // PUT  case-watchers/{caseWatcher}
deleteCaseWatcher(watcherId)          // DELETE case-watchers/{caseWatcher}
promoteCaseWatcher(watcherId)         // POST case-watchers/{caseWatcher}/promote
issueWatcherPass(watcherId, payload)  // POST case-watchers/{caseWatcher}/issue-pass
revokeWatcherPass(watcherId)          // POST case-watchers/{caseWatcher}/revoke-pass
storeWatcherWaiver(caseId, payload)   // POST cases/{case}/watcher-waiver
destroyWatcherWaiver(caseId)          // DELETE cases/{case}/watcher-waiver
```

Same `apiClient` / `ApiEnvelope` shape as every function in `patients-api.ts`
— no new HTTP conventions needed. `createCaseWatcher`'s payload accepts
either `{ patient_watcher_id }` or the full inline-person fields, matching
`StoreCaseWatcherRequest` on the server exactly.

`src/features/cases/api/case-watchers-adapter.ts` — `toCaseWatcher()`,
`toWatcherStatus()`, in the style of `toWatcher()` in `patients-adapter.ts`.

### Reference lookup — `src/features/reference/api/watcher-relationship-types-api.ts`

Also the first file in that empty scaffold. One function:
`listWatcherRelationshipTypes()` → `GET /watcher-relationship-types`. Feeds
the relationship `Select` in Phase 7's dialog.

### Hooks — `src/features/cases/hooks/`

`use-case-watchers.ts` (list + status, `["cases", caseId, "watchers"]` /
`["cases", caseId, "watcher-status"]`) and `use-case-watcher-mutations.ts`
(create/update/delete/promote/issue-pass/revoke-pass/waiver), all
invalidating both query keys plus `patientDetailKeys(patientId).latestCase`
(from `use-patient-detail.ts`) on every write — the patient view's "current
case" data and the case-watchers data must never disagree, and right now
they're read through two completely different hooks.

**Gate:** `npx tsc --noEmit`.

**Revert:** safe — nothing calls any of this yet.

---

## 3. Phase 7 — Watchers UI goes case-scoped ☐

The substance of "move from patient to case" (server §8), without the page
move that doesn't have anywhere to go yet (see §1). The tab stays where it
is in `patient-detail-view.tsx`; what it reads and writes changes.

- **Resolve the case first.** The tab needs a `caseId` before it can call any
  Phase 6 hook — reuse `getLatestCaseForPatient` (already fetched by
  `usePatientDetail`) rather than adding a second lookup. If there's no case
  yet (a patient with no admission on file), the tab should say so rather
  than 404 against `undefined`.
- **`watcher.types.ts`** (patients feature) — replace `Watcher` with a
  re-export of `CaseWatcher` from `features/cases/types`, or delete it and
  update `PatientRecord.watchers: Watcher[]` to point at the new type
  directly. Check every import of the old `Watcher` type before deleting it
  — `patients-adapter.ts` and `watchers-tab.tsx` at minimum.
- **`watchers-tab.tsx`** — reads case watchers via the Phase 6 hook instead
  of `patient.watchers`. Table gains a Role column (Primary / Informant
  badges) and real Pass No. / Valid Until / Status instead of the current
  placeholder strings. Actions per row: Promote to primary, Edit, Issue
  Pass / Revoke Pass, Remove.
- **`watcher-dialog.tsx`** — currently a 3-field form (`fullName`,
  `relationship` as free-text `Input`, `contactNo`) that only ever creates a
  patient-scoped watcher. Needs:
  - A **directory picker** at the top — "Select from known contacts," listing
    the patient's own `patient_watchers` (already on `PatientRecord.watchers`
    via the existing profile fetch — no new request). Selecting one
    pre-fills the form and sends `patient_watcher_id`; leaving it on "new
    person" sends the inline fields instead, matching
    `CaseWatcherService::create()`'s two paths on the server.
  - `relationship` becomes a `Select` sourced from
    `listWatcherRelationshipTypes()` (Phase 6), not free text — the server
    now 422s an unrecognised value, so a free-text input would just produce
    a wall of rejected submits.
  - `isPrimary` / `isInformant` switches, optional `presentFrom` /
    `presentUntil` date fields.
  - The dialog's `onIssueWatcherPass` callback and its name are both
    residue of the old single-purpose "issue a pass" flow — this dialog now
    creates a watcher; issuing a pass is its own action per row (below), so
    rename the prop and stop conflating the two.
- **Issuing a pass** is a separate action, not part of create — matches the
  server's `POST case-watchers/{caseWatcher}/issue-pass` being a distinct
  endpoint from `store`. The button and copy in `watchers-tab.tsx` ("Issue
  Watcher Pass") currently sit on the *create* action; after this phase that
  copy belongs on a per-row action instead, and the header button becomes a
  plain "Add Watcher."
- **Known contacts, deferred.** The server plan's "read-only Known Contacts
  list on the patient view" doesn't have a natural home without a real
  patient-vs-case UI split, which doesn't exist yet (§1). Skipped for this
  phase; the directory picker above covers the only place that data is
  actually needed right now.

**Gate:** `tsc`, `npm run build`, then a manual pass: add an inline watcher,
add one via the directory picker, promote a different one to primary and
confirm the first is demoted, issue a pass and confirm the number renders,
revoke it, remove a non-primary watcher, and confirm removing the last
primary on an inpatient case surfaces the server's 422 message rather than a
generic error toast.

**Revert:** moderate surface (one tab, one dialog, one type file) — keep in
its own commit, separate from Phase 6.

---

## 4. Phase 8 — Requirement banner, waiver dialog, worklist filter ☐

Independent of Phase 7's UI details, but needs Phase 6's `WatcherStatus`
type and `getWatcherStatus`/waiver hooks to exist first.

### Banner

Placed above the tabs in `patient-detail-view.tsx` (there's no case-detail
page to put it on top of instead — see §1), driven by
`useWatcherStatus(caseId)`:

| requirement | hasPrimary | Banner |
|---|---|---|
| `required` | false | destructive — "This inpatient case requires a registered watcher. Some actions are blocked until one is added or a waiver is filed." |
| `required` | true | none |
| `recommended` | false | warning — "No watcher recorded. Recommended for ER cases." |
| `optional` | either | none |
| `waived` | either | muted — reason + who waived it + when, once the waiver payload exposes that (confirm `StoreWatcherWaiverController`'s response carries `watcher_waived_by`/`watcher_waived_at` in a client-friendly shape — today `CaseModelResource` only exposes the raw `watcher_waiver_reason` etc. columns, not a resolved actor name). |

Copy in the "required, not satisfied" row above is softened from the
server-doc original ("blocked until...") to "some actions," since — per §1
— only Submit/Finalize Intake are real buttons today; close-case and
approve-assistance enforcement exists server-side with no client button yet
to guard.

### Waiver dialog

Visible only when `usePermission("cases.waive_watcher")` is true (the hook
already exists, `features/auth/hooks/use-permission.ts` — this is a
one-line gate, not new plumbing). Reason `Select` with the six values
`StoreWatcherWaiverRequest` validates (`unidentified_patient`, `abandoned`,
`unaccompanied`, `patient_refused`, `under_protective_custody`, `other`),
required free-text note when `other`, confirm step. Filing one clears the
destructive banner immediately (invalidate the status query).

### Optimistic guard

`useSubmitIntakeSheet` / `useFinalizeIntakeSheet`'s trigger buttons
(`intake-sheet-tab.tsx`) render `disabled` with a tooltip when
`watcherStatus.blocking` is true, rather than letting the user hit the
server's 422. The 422 handler stays as the real gate regardless — the
banner's cached status can be stale (another tab just removed the primary
watcher, etc.) — so this is a UX nicety, not the actual enforcement, which
the server already owns end to end.

### Worklist filter

A "Missing watcher" filter on the patient sidebar. **Depends on
`API_CONTRACT_SYNC_PLAN.md`'s client Phase 7** (server-driven sidebar
filters) landing first — the sidebar's current filtering is a client-side
`useMemo` over already-fetched rows, and there is no
`?watcher_blocking=1`-style filter on `GET /patients` today (nor is one
planned in the server's sync plan). If this filter is wanted, it needs a
small server-side addition first: a `whereDoesntHave('latestAssessment', …)`
+ admission-type scope on `PatientRepository`, in the same shape as the
`classification`/`intake_date` filters the server sync plan's Phase 4
already added. **Flagging as a cross-repo dependency rather than scoping it
into this phase** — confirm with the server side before committing to it.

**Gate:** log in as a role without `cases.waive_watcher` (e.g. Case Manager)
and confirm the waiver dialog trigger is absent; as `MSS Head` and confirm
it appears. Open an inpatient case with no watcher and confirm the
destructive banner and disabled Submit/Finalize buttons; add a watcher and
confirm both clear; remove it and file a waiver instead, confirm the muted
banner. Open an OPD case and confirm no banner at all.

**Revert:** safe — the banner and dialog are additive; the guard only
disables buttons, it doesn't change what they do when enabled.

---

## 5. Verification

No test runner in this repo (per `CLAUDE.md`) — per-phase gates above are
`tsc --noEmit` plus the manual walkthroughs described. Full pass before
calling this plan done: `npm run build`, then walk through Phase 7 and
Phase 8's manual gates back to back on one inpatient case and one OPD case.

## Commit boundaries

Phase 6 on its own (no visible change, safe to land alone). Phase 7 on its
own. Phase 8's banner+waiver together, worklist filter held out as its own
follow-up once the server-side dependency above is resolved — four commits,
not three.

## Open items

- **Waiver actor display.** Confirm whether `CaseModelResource` should
  expose a resolved `watcher_waived_by` name (not just the raw user id) for
  the "waived by X" banner copy above — small server-side addition if not.
- **`AdmissionStatus`/`Gender`/`CivilStatus` are all plain `string`** in
  `patient.types.ts` because the server doesn't enforce an enum either. Same
  will be true of the new `relationship` field on `CaseWatcher` at the
  *type* level, even though the UI constrains it to a `Select` sourced from
  the reference lookup — don't tighten it to a union that could drift from
  the seeded master list.
- **Cross-plan sequencing with `API_CONTRACT_SYNC_PLAN.md`.** Both plans
  touch `patients-adapter.ts` and `patient-detail-view.tsx`. Worth deciding
  which lands first, or doing them in the same sitting, to avoid two people
  independently reshaping the same adapter function in parallel branches.
- **Whether a real case-detail page is coming.** If one gets scoped
  separately, everything in Phase 6/7 here should port over close to
  as-is — the data layer is already case-scoped by then, only the
  component's location changes.
