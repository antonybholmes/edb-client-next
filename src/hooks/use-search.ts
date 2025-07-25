import { create } from 'zustand'

// export interface ISearch {
//   caseSensitive: boolean
//   matchEntireCell: boolean
//   keepOrder: boolean
//   ids: string[]
// }

// export const DEFAULT_SEARCH: ISearch = {
//   caseSensitive: false,
//   matchEntireCell: false,
//   keepOrder: false,
//   ids: [],
// }

interface SearchState {
  queries: string[]
  caseSensitive: boolean
  matchEntireCell: boolean
  keepOrder: boolean

  setQuery: (queries: string[]) => void
  //setCache: (query: string, result: SearchResult) => void
  //getCachedResult: (query: string) => SearchResult | undefined
}

export const useSearchStore = create<SearchState>(set => ({
  queries: [],
  caseSensitive: false,
  matchEntireCell: false,
  keepOrder: false,
  setQuery: (queries: string[]) => set({ queries }),

  //getCachedResult: query => get().cache[query],
}))

export function useSearch() {
  const { queries, setQuery } = useSearchStore()

  const query = queries[0] ?? ''

  function resetQuery() {
    setQuery([])
  }

  // const search = async (newQuery: string) => {
  //   setQuery(newQuery)

  //   const cached = getCachedResult(newQuery)
  //   if (cached) {
  //     return cached
  //   }

  //   const result = await fetch(
  //     `/api/search?q=${encodeURIComponent(newQuery)}`
  //   ).then(res => res.json())

  //   setCache(newQuery, result)
  //   return result
  // }

  return { query, queries, setQuery, resetQuery }
}
