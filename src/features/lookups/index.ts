import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { collection, paginated } from '@/lib/api-envelope'

/**
 * Reference data backing the app's select inputs. These change rarely, so they
 * are cached hard — the Filament panel likewise plucks them per render.
 */

const namedSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullish(),
})

const assistantTypeSchema = namedSchema.extend({
  category: z.string().nullish(),
  is_active: z.boolean(),
})

const guarantorSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullish(),
  is_active: z.boolean(),
})

const userOptionSchema = z.object({
  id: z.number(),
  employee_name: z.string(),
  is_active: z.boolean(),
})

export interface Option {
  value: string
  label: string
}

const STALE_TIME = 30 * 60 * 1000

export const lookupKeys = {
  all: ['lookups'] as const,
  sectors: () => [...lookupKeys.all, 'sectors'] as const,
  assistantTypes: () => [...lookupKeys.all, 'assistant-types'] as const,
  interventionTypes: () => [...lookupKeys.all, 'intervention-types'] as const,
  guarantors: () => [...lookupKeys.all, 'guarantors'] as const,
  users: () => [...lookupKeys.all, 'users'] as const,
}

async function fetchOptions<T extends z.ZodTypeAny>(
  url: string,
  schema: T,
  toOption: (item: z.output<T>) => Option,
): Promise<Option[]> {
  const { data } = await apiClient.get(url)
  return collection(schema).parse(data).map(toOption)
}

export function useSectors() {
  return useQuery({
    queryKey: lookupKeys.sectors(),
    queryFn: () =>
      fetchOptions('/sectors', namedSchema, (s) => ({ value: String(s.id), label: s.name })),
    staleTime: STALE_TIME,
  })
}

export function useAssistantTypes() {
  return useQuery({
    queryKey: lookupKeys.assistantTypes(),
    queryFn: () =>
      // Only active types are offered on new records.
      fetchOptions('/assistant-types?active=1', assistantTypeSchema, (t) => ({
        value: String(t.id),
        label: t.name,
      })),
    staleTime: STALE_TIME,
  })
}

export function useInterventionTypes() {
  return useQuery({
    queryKey: lookupKeys.interventionTypes(),
    queryFn: () =>
      fetchOptions('/intervention-types', namedSchema, (t) => ({
        value: String(t.id),
        label: t.name,
      })),
    staleTime: STALE_TIME,
  })
}

export function useGuarantors() {
  return useQuery({
    queryKey: lookupKeys.guarantors(),
    queryFn: () =>
      fetchOptions('/guarantors?active=1', guarantorSchema, (g) => ({
        value: String(g.id),
        label: g.name,
      })),
    staleTime: STALE_TIME,
  })
}

/**
 * Staff options for the "assigned worker" selects. `/users` is paginated and
 * permission-gated (`users.view`), so this asks for one large page and yields
 * nothing when the caller lacks the permission.
 */
export function useUserOptions(enabled = true) {
  return useQuery({
    queryKey: lookupKeys.users(),
    queryFn: async (): Promise<Option[]> => {
      const { data } = await apiClient.get('/users', { params: { per_page: 100 } })
      return paginated(userOptionSchema)
        .parse(data)
        .items.map((user) => ({ value: String(user.id), label: user.employee_name }))
    },
    staleTime: STALE_TIME,
    enabled,
    retry: false,
  })
}
