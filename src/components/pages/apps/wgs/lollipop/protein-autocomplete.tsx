import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

import { TEXT_NAME } from '@/consts'

import { Autocomplete } from '@/components/autocomplete'
import { SearchIcon } from '@/components/icons/search-icon'
import { useDebouncedComponentSize } from '@/hooks/component-size'
import { useDebounce } from '@/hooks/debounce'

import { useLollipopSettings } from './lollipop-settings-store'
import type { IProtein } from './lollipop-utils'
import { useProteins } from './protein-store'

export function ProteinAutocomplete() {
  const { protein, setProtein } = useLollipopSettings()

  const { searchUniprot } = useProteins()

  //const { lollipopFromTable } = useLollipopStore()

  //const { step } = useHistory()

  const [search, setSearch] = useState<string>(protein?.geneSymbol ?? '')

  //const { add: addToast } = Toast.useToastManager()

  const [searchProteins, setSearchProteins] = useState<IProtein[]>([])

  const [autoOpen, setAutoOpen] = useState(true)

  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useDebounce(search, { delayMs: 500 })

  const ref: RefObject<HTMLInputElement | null> = useRef(null)

  const size = useDebouncedComponentSize(ref)

  useEffect(() => {
    async function search() {
      if (debouncedSearch.length < 2) {
        return
      }
      console.log('Searching UniProt for:', debouncedSearch)
      const proteins = await searchUniprot(debouncedSearch)

      setSearchProteins(proteins)

      setIsSearching(false)
    }

    search()
  }, [debouncedSearch])

  useEffect(() => {
    setSearch(protein?.geneSymbol ?? '')
  }, [protein])

  useEffect(() => {
    function fetch() {
      searchForProtein(protein?.geneSymbol ?? '')
    }

    fetch()
  }, [])

  async function searchForProtein(query: string) {
    if (query.length > 1) {
      try {
        const proteins = await searchUniprot(query)

        setSearchProteins(proteins)
      } catch (e) {
        console.log(e)
      }
    }
  }

  // function makeLollipopPlot(searchProtein: IProtein) {
  //   setProtein(searchProtein)

  //   const sheet = findSheet('Variants', step!)

  //   if (!sheet) {
  //     console.warn('No mutations data frame found')
  //     return
  //   }

  //   const errors = lollipopFromTable(
  //     sheet.df as AnnotationDataFrame,
  //     searchProtein
  //   )

  //   if (errors.length > 0) {
  //     //console.warn('Errors found while parsing lollipop data:', errors)

  //     addToast({
  //       id: makeUuid(),
  //       title:
  //         'Errors were found while parsing the mutation data, but they were ignored',
  //       description: [...new Set(errors)].sort().slice(0, 4).join(',') + '...',
  //       type: 'warning',
  //     })
  //   }

  //   setAutoOpen(false)
  // }

  let content: ReactNode = null

  if (isSearching) {
    content = (
      <div className="flex flex-row items-center gap-x-2 px-3 h-9">
        Searching...
      </div>
    )
  } else {
    if (searchProteins.length > 0) {
      content = searchProteins.map((searchProtein, pi) => (
        <li key={pi}>
          <button
            className="flex flex-row px-3 items-center gap-x-2 justify-between text-left grow hover:bg-muted/50 min-h-9 w-full rounded-sm"
            onClick={() => {
              //makeLollipopPlot(searchProtein)
              setProtein(searchProtein)

              //setSearchProteins([]) // clear search results
            }}
            aria-label={`Select ${searchProtein.geneSymbol}`}
          >
            <span className="inline-flex flex-row items-center gap-x-2">
              <SearchIcon className="shrink-0" />

              <span className="font-bold">
                {searchProtein.geneSymbol} {searchProtein.accession} (
                {searchProtein.sequence.length} aa)
              </span>
            </span>
            <span
              className="text-foreground/50"
              style={{ display: size.w > 250 ? 'inline' : 'none' }}
            >
              {searchProtein.organism}
            </span>
          </button>
        </li>
      ))
    } else {
      content = (
        <div className="flex flex-row items-center gap-x-2 px-3 h-9">
          No results found.
        </div>
      )
    }
  }

  return (
    <Autocomplete
      ref={ref}
      placeholder={TEXT_NAME}
      value={search}
      onTextChange={(v) => {
        setSearch(v)
        setIsSearching(true)
      }}

      onFocus={() => setAutoOpen(true)}
      autoOpen={autoOpen}
      aria-label="Protein name"
      className="w-4/5 text-sm"
    >
      {content}
    </Autocomplete>
  )
}
