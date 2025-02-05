import type { IChildrenProps } from '@interfaces/children-props'
import { createContext, useState } from 'react'

export const SearchContext = createContext<{
  search: string
  setSearch: (search: string) => void
}>({ search: '', setSearch: () => {} })

interface IProps extends IChildrenProps {
  defaultSearch?: string
}

export function SearchProvider({ defaultSearch = '', children }: IProps) {
  const [search, setSearch] = useState<string>(defaultSearch)

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  )
}
