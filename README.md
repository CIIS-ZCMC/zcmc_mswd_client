# ZCMC MSWD Client

Frontend for the Zamboanga City Medical Center Medical Social Welfare Department
records system — patient intake, social case assessment, assistance requests and
reporting.

Stack: React 19 (React Compiler) · TypeScript · Vite · React Router · TanStack
Query · Tailwind CSS v4 · React Hook Form + Zod · Vitest + Testing Library + MSW.

## Getting started

```bash
npm install
cp .env.example .env   # then point VITE_API_URL at your API
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Watch mode |

## Environment

Validated at startup by `src/lib/env.ts`; a missing or malformed variable throws
immediately rather than failing later at a fetch.

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the MSWD API, no trailing slash |
| `VITE_APP_ENV` | `development` \| `staging` \| `production` |

## Structure

```
src/
  app/            router, provider tree, QueryClient defaults
  features/       one folder per domain area (auth, patients, cases, assistance, reports)
    <feature>/
      api.ts          endpoint functions over apiClient, responses parsed by Zod
      queries.ts      query-key factory + useQuery/useMutation hooks
      schemas.ts      Zod schemas — the source of truth for this feature's types
      components/     feature-local components
      pages/          route-level components (default export, lazily loaded)
      index.ts        the feature's public surface
  components/
    ui/           styling primitives (Button, Input, Card, …)
    layout/       AppShell, Sidebar, Topbar
    common/       DataTable, FormField, PageHeader, Pagination, EmptyState, ErrorBoundary
  lib/            apiClient, env, session, utils
  hooks/          generic hooks (useDebounce, useMediaQuery)
  types/          cross-cutting types (Role, Paginated<T>, ApiError)
  test/           setup, renderWithProviders, MSW handlers
```

## Conventions

- **Feature-first.** Everything for one domain area lives in its folder. Import
  across features only through the feature's `index.ts` — never reach into
  another feature's internals. Code graduates to `components/common` or `lib`
  once a second feature needs it.
- **Zod schemas are the source of truth.** Derive types with `z.infer`; never
  hand-write a parallel interface. API responses are parsed, so a backend change
  fails loudly at the boundary instead of surfacing as `undefined` in the UI.
- **Server state belongs to TanStack Query.** Never copy fetched data into
  `useState`. Build every key through the feature's key factory so mutations can
  invalidate by prefix.
- **Components never call `api.ts` directly** — always through a hook in
  `queries.ts`.
- **Errors are normalized.** Everything rejected by `apiClient` is an `ApiError`
  with `status` and `fieldErrors`; forms map `fieldErrors` back onto inputs via
  RHF's `setError`.
- **Forms follow `PatientIntakeForm`** — schema → resolver → `FormField` →
  mutation hook. Copy that file when adding a form.
- **Route pages default-export** and are lazily loaded in `app/router.tsx`;
  everything else uses named exports.
- Folders `kebab-case`, component files `PascalCase.tsx`, others `kebab-case.ts`.
  A file past ~200 lines is a signal to split.

## Auth

`POST /login` returns a Laravel Sanctum token, which lives in `src/lib/session.ts`
(outside React, so axios interceptors can read it) mirrored into `localStorage` and
sent as `Authorization: Bearer <token>`. On boot `AuthProvider` exchanges that token
for the current user via `GET /me`; `POST /logout` revokes it. Any 401 from a
non-login request clears the session and drops the user back to `/login`. Bad
credentials come back as a **422** with `errors.email`, which the login form maps
onto the email field.

The backend serializes users through `UserResource`, so both `/login` and `/me`
answer with the user under `data` in snake_case. `src/features/auth/schemas.ts`
parses that shape and maps it to the camelCase `User` the app uses — `employee_name`
becomes `name`, and `roles`/`permissions` come straight from Spatie.

`ProtectedRoute` guards the authenticated route branch and remembers the intended
destination; `RoleGate` hides UI by role and `useAuth().can('patients.view')` by
permission — both are conveniences, not security boundaries, since the API still
enforces access.

## Testing

`renderWithProviders` (`src/test/utils.tsx`) mounts a component inside the real
provider stack with a memory router. The API is mocked with MSW; handlers live in
`src/test/mocks/handlers.ts` and unhandled requests fail the test.
