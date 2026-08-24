import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from './useDebounce'

/** Soft-delete scope, matching the API's `?trashed=` values. */
export type TrashedScope = 'without' | 'with' | 'only'

export interface ListQueryState {
  page: number
  perPage: number
  /** Raw search box value — reflects keystrokes immediately. */
  search: string
  sort?: string
  direction: 'asc' | 'desc'
  filters: Record<string, string>
  trashed: TrashedScope
}

/**
 * Query params sent to the API. `search` here is the debounced value, so typing
 * does not fire a request per keystroke.
 */
export interface ListQueryParams {
  page: number
  per_page: number
  search?: string
  sort?: string
  direction?: string
  trashed?: TrashedScope
  [filter: string]: string | number | undefined
}

const DEFAULT_PER_PAGE = 15

/**
 * Table state (page, search, sort, filters, archived scope) held in the URL, so
 * a filtered list is linkable and survives a refresh or a back-navigation.
 *
 * `prefix` namespaces the params, letting two tables share one screen.
 */
export function useListQuery(options: { prefix?: string; perPage?: number; filterKeys?: string[] } = {}) {
  const { prefix = '', perPage = DEFAULT_PER_PAGE, filterKeys = [] } = options
  const [searchParams, setSearchParams] = useSearchParams()

  const key = useCallback((name: string) => (prefix ? `${prefix}_${name}` : name), [prefix])

  const state = useMemo<ListQueryState>(() => {
    const filters: Record<string, string> = {}
    for (const name of filterKeys) {
      const value = searchParams.get(key(`f_${name}`))
      if (value) filters[name] = value
    }

    const trashed = searchParams.get(key('trashed'))

    return {
      page: Math.max(1, Number(searchParams.get(key('page')) ?? 1)),
      perPage,
      search: searchParams.get(key('search')) ?? '',
      sort: searchParams.get(key('sort')) ?? undefined,
      direction: searchParams.get(key('direction')) === 'desc' ? 'desc' : 'asc',
      filters,
      trashed: trashed === 'with' || trashed === 'only' ? trashed : 'without',
    }
  }, [searchParams, key, filterKeys, perPage])

  const debouncedSearch = useDebounce(state.search)

  /** Write params, dropping empties so the URL stays clean. */
  const patch = useCallback(
    (changes: Record<string, string | undefined>, { resetPage = true } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [name, value] of Object.entries(changes)) {
            if (value === undefined || value === '') next.delete(key(name))
            else next.set(key(name), value)
          }
          // Any change to what is being listed invalidates the current page.
          if (resetPage) next.delete(key('page'))
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, key],
  )

  const setPage = useCallback((page: number) => patch({ page: String(page) }, { resetPage: false }), [patch])
  const setSearch = useCallback((search: string) => patch({ search }), [patch])
  const setTrashed = useCallback(
    (trashed: TrashedScope) => patch({ trashed: trashed === 'without' ? undefined : trashed }),
    [patch],
  )
  const setFilter = useCallback(
    (name: string, value: string | undefined) => patch({ [`f_${name}`]: value }),
    [patch],
  )
  const setSort = useCallback(
    (sort: { sortBy: string; sortDir: 'asc' | 'desc' }) =>
      patch({ sort: sort.sortBy, direction: sort.sortDir }, { resetPage: false }),
    [patch],
  )

  const reset = useCallback(() => {
    const cleared: Record<string, undefined> = {
      page: undefined,
      search: undefined,
      trashed: undefined,
      sort: undefined,
      direction: undefined,
    }
    for (const name of filterKeys) cleared[`f_${name}`] = undefined
    patch(cleared)
  }, [patch, filterKeys])

  const params = useMemo<ListQueryParams>(() => {
    const result: ListQueryParams = { page: state.page, per_page: state.perPage }
    if (debouncedSearch) result.search = debouncedSearch
    if (state.sort) {
      result.sort = state.sort
      result.direction = state.direction
    }
    if (state.trashed !== 'without') result.trashed = state.trashed
    // Bracket notation matches Laravel's `filter[column]=value`.
    for (const [name, value] of Object.entries(state.filters)) result[`filter[${name}]`] = value
    return result
  }, [state, debouncedSearch])

  const isFiltered =
    Boolean(state.search) || state.trashed !== 'without' || Object.keys(state.filters).length > 0

  return { state, params, isFiltered, setPage, setSearch, setSort, setFilter, setTrashed, reset }
}
