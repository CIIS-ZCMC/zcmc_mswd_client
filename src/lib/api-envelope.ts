import { z } from 'zod'
import type { Paginated } from '@/types'

/**
 * Laravel wraps every API resource in `data`, and paginated collections add
 * `meta`. These helpers unwrap both so features never hand-roll it.
 *
 * Parse the API's own snake_case shape here, then map to the app's camelCase
 * types in the feature's `schemas.ts` — see `src/features/auth/schemas.ts`.
 */

const metaSchema = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
})

/** `{ data: T }` — a single record. */
export function resource<T extends z.ZodTypeAny>(schema: T) {
  return z
    .object({ data: schema })
    .transform((payload) => (payload as { data: z.output<T> }).data)
}

/** `{ data: T[] }` — an unpaginated collection, as the lookup endpoints return. */
export function collection<T extends z.ZodTypeAny>(schema: T) {
  return z
    .object({ data: z.array(schema) })
    .transform((payload) => (payload as { data: z.output<T>[] }).data)
}

/**
 * `{ data: T[], meta: {...} }` mapped onto the app's `Paginated<T>`.
 *
 * A Laravel collection only carries `meta` when it is actually paginated, so an
 * unpaginated response falls back to a single full page rather than throwing.
 */
export function paginated<T extends z.ZodTypeAny>(schema: T) {
  return z
    .object({ data: z.array(schema), meta: metaSchema.optional() })
    .transform((payload): Paginated<z.output<T>> => {
      const { data, meta } = payload as { data: z.output<T>[]; meta?: z.infer<typeof metaSchema> }
      return {
        items: data,
        page: meta?.current_page ?? 1,
        pageSize: meta?.per_page ?? data.length,
        total: meta?.total ?? data.length,
      }
    })
}
