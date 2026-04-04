import { config } from '@/config'
import type { ISearch } from '@/hooks/search'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:search-filters:v4`

export interface IFilter extends ISearch {
  keepOrder: boolean
}

export interface IFilters {
  rows: IFilter
  cols: IFilter
}

export const DEFAULT_FILTERS: IFilters = {
  rows: {
    caseSensitive: false,
    matchEntireCell: false,
    keepOrder: false,
    queries: [],
  },
  cols: {
    caseSensitive: false,
    matchEntireCell: false,
    keepOrder: false,
    queries: [],
  },
}

export interface ISearchFiltersStore extends IFilters {
  updateSettings: (settings: Partial<IFilters>) => void
}

export const useSearchFiltersStore = create<ISearchFiltersStore>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      updateSettings: (settings: Partial<IFilters>) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useSearchFilters(): {
  settings: IFilters
  updateSettings: (settings: IFilters) => void
  reset: () => void
  resetRowFilters: () => void
  resetColFilters: () => void
} {
  const settings = useSearchFiltersStore((state) => state)
  const updateSettings = useSearchFiltersStore((state) => state.updateSettings)

  function reset() {
    updateSettings({ ...DEFAULT_FILTERS })
  }

  function resetRowFilters() {
    updateSettings({ rows: { ...DEFAULT_FILTERS.rows } })
  }

  function resetColFilters() {
    updateSettings({ cols: { ...DEFAULT_FILTERS.rows } })
  }

  return {
    settings,
    updateSettings,
    reset,
    resetRowFilters,
    resetColFilters,
  }
}
