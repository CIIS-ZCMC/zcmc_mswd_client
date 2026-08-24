import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { collection, paginated, resource } from './api-envelope'

const row = z.object({ id: z.number(), name: z.string() })

describe('api-envelope', () => {
  it('unwraps a single resource', () => {
    expect(resource(row).parse({ data: { id: 1, name: 'A' } })).toEqual({ id: 1, name: 'A' })
  })

  it('unwraps an unpaginated collection', () => {
    expect(collection(row).parse({ data: [{ id: 1, name: 'A' }] })).toEqual([{ id: 1, name: 'A' }])
  })

  it('maps Laravel pagination meta onto Paginated', () => {
    const result = paginated(row).parse({
      data: [{ id: 1, name: 'A' }],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 2, from: 3, last_page: 4, per_page: 2, to: 3, total: 7 },
    })

    expect(result).toEqual({ items: [{ id: 1, name: 'A' }], page: 2, pageSize: 2, total: 7 })
  })

  it('falls back to a single full page when the collection is not paginated', () => {
    const result = paginated(row).parse({ data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] })

    expect(result).toEqual({
      items: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
      page: 1,
      pageSize: 2,
      total: 2,
    })
  })

  it('applies the inner schema transform to every row', () => {
    const transformed = row.transform((r) => `${r.id}:${r.name}`)
    expect(paginated(transformed).parse({ data: [{ id: 1, name: 'A' }] }).items).toEqual(['1:A'])
  })

  it('rejects a payload that is not wrapped in data', () => {
    expect(() => resource(row).parse({ id: 1, name: 'A' })).toThrow()
  })
})
