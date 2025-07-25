import { APP_ID } from '@/consts'
import type { ISearch } from '@hooks/use-search'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

const SETTINGS_KEY = `${APP_ID}.search-filters-v2`

export interface IFilters {
  rows: ISearch
  cols: ISearch
}

export const DEFAULT_FILTERS: IFilters = {
  rows: {
    caseSensitive: false,
    matchEntireCell: false,
    keepOrder: false,
    ids: [],
  },
  cols: {
    caseSensitive: false,
    matchEntireCell: false,
    keepOrder: false,
    ids: [],
  },
}

const filtersAtom = persistentAtom<IFilters>(
  SETTINGS_KEY,
  {
    ...DEFAULT_FILTERS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useSearchFilters(): {
  filters: IFilters

  updateFilters: (settings: IFilters) => void
  resetRowFilters: () => void
  resetColFilters: () => void
} {
  const filters = useStore(filtersAtom)

  function updateFilters(settings: IFilters) {
    filtersAtom.set(settings)
  }

  function resetRowFilters() {
    updateFilters({ ...filters, rows: { ...DEFAULT_FILTERS.rows } })
  }

  function resetColFilters() {
    updateFilters({ ...filters, cols: { ...DEFAULT_FILTERS.rows } })
  }

  return {
    filters,
    updateFilters,
    resetRowFilters,
    resetColFilters,
  }
}
