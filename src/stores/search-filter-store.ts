import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

const SETTINGS_KEY = `${APP_ID}-search-filters-v2`

interface ISearchFilter {
  caseSensitive: boolean
  matchEntireCell: boolean
  keepOrder: boolean
  ids: string[]
}

export interface IFilters {
  rows: ISearchFilter
  cols: ISearchFilter
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

const localFiltersStore = persistentAtom<IFilters>(
  SETTINGS_KEY,
  {
    ...DEFAULT_FILTERS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useSearchFilterStore(): {
  filters: IFilters

  updateFilters: (settings: IFilters) => void
  resetRowFilters: () => void
  resetColFilters: () => void
} {
  const filters = useStore(localFiltersStore)

  function updateFilters(settings: IFilters) {
    localFiltersStore.set(settings)
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
