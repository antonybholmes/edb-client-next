import type { IHelpTopic } from '@/pages/api/help'
import { QCP } from '@/query'
import type { IClassProps } from '@interfaces/class-props'
import { APP_HELP_API_URL } from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { Autocomplete } from '../autocomplete'
import { SearchIcon } from '../icons/search-icon'
import type { ITopicTree } from './help-tree-node'

function HelpAutocomplete({ className }: IClassProps) {
  const [searchResults, setResults] = useState<IHelpTopic[]>([])

  // Fetch search data from /search.json
  const { data } = useQuery({
    queryKey: ['searchData'],
    queryFn: async () => {
      const res = await httpFetch.getJson<ITopicTree[]>(APP_HELP_API_URL)

      return res
    },
  })

  const searchIndex = useMemo(() => {
    if (!data) return null
    return new Fuse(data, {
      keys: ['title', 'description'], // Fields to search
      threshold: 0.3, // Fuzzy match level
    })
  }, [data])

  function handleSearch(query: string) {
    if (!searchIndex) {
      return
    }

    //console.log(query)

    const results = searchIndex.search(query)

    setResults(results.map(result => result.item))
  }

  return (
    <Autocomplete onTextChange={handleSearch} className={className}>
      {searchResults.map((item, li) => (
        <li key={li}>
          <a
            href={item.slug}
            className="hover:bg-muted/50 focus-visible:bg-muted/50 outline-none h-8 flex flex-row items-center px-3 gap-x-2"
            aria-label={item.title}
          >
            <SearchIcon />
            <span>{item.title}</span>
          </a>
        </li>
      ))}
    </Autocomplete>
  )
}

export function HelpAutocompleteQuery({ className }: IClassProps) {
  return (
    <QCP>
      <HelpAutocomplete className={className} />
    </QCP>
  )
}
