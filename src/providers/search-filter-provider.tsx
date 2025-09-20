import { type IChildrenProps } from '@interfaces/children-props'

import {
  DEFAULT_FILTERS,
  useSearchFilters,
  type IFilters,
} from '@/stores/search-filter-store'
import { createContext } from 'react'

export const SearchFiltersContext = createContext<{
  settings: IFilters
  updateSettings: (settings: IFilters) => void
  resetRowFilters: () => void
  resetColFilters: () => void
}>({
  settings: { ...DEFAULT_FILTERS },
  updateSettings: () => {},
  resetRowFilters: () => {},
  resetColFilters: () => {},
})

export function SearchFilterProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetRowFilters, resetColFilters } =
    useSearchFilters()

  // const [accountStore, setAccountStore] = useUserStore()

  // const [accountState, accountDispatch] = useReducer(accountReducer, {
  //   ...accountStore,
  // })

  // when the account is changed, also write it back to the store

  // when the account is changed, also write it back to the store
  // useEffect(() => {
  //   setAccountStore(accountState)
  // }, [accountState])

  return (
    <SearchFiltersContext.Provider
      value={{ settings, updateSettings, resetRowFilters, resetColFilters }}
    >
      {children}
    </SearchFiltersContext.Provider>
  )
}
