import { useContext, useEffect, useState } from 'react'

import { TEXT_NAME } from '@/consts'

import { Autocomplete } from '@/components/autocomplete'
import { SearchIcon } from '@/components/icons/search-icon'
import { toast } from '@/components/shadcn/ui/themed/crisp'
import { findSheet, useHistory } from '../matcalc/history/history-store'
import { LollipopContext } from './lollipop-provider'
import type { IProtein } from './lollipop-utils'
import { useProteins } from './protein-store'

export function ProteinAutocomplete() {
  //const { protein, setProtein } = useLollipopSettings()

  const { search: searchCache, searchUniprot } = useProteins()

  const { protein, setProtein, lollipopFromTable } =
    useContext(LollipopContext)!

  const { step } = useHistory()

  const [search, setSearch] = useState<string>('')

  const [searchProteins, setSearchProteins] = useState<IProtein[]>([])

  const [autoOpen, setAutoOpen] = useState(true)

  useEffect(() => {
    setSearch(protein.gene)
  }, [protein])

  useEffect(() => {
    function fetch() {
      searchForProtein(protein.gene)
    }

    fetch()
  }, [])

  async function searchForProtein(query: string) {
    if (query.length > 1) {
      try {
        console.log('Searching UniProt for:', query)
        const proteins = await searchUniprot(query)

        setSearchProteins(proteins)
      } catch (e) {
        console.log(e)
      }
    }
  }

  function lollipopPlot(searchProtein: IProtein) {
    setProtein(searchProtein)

    const mutDf = findSheet(step!, 'Mutations')

    if (!mutDf) {
      console.warn('No mutations data frame found')
      return
    }

    const errors = lollipopFromTable(mutDf, searchProtein)

    if (errors.length > 0) {
      //console.warn('Errors found while parsing lollipop data:', errors)

      toast({
        title:
          'Errors were found while parsing the mutation data, but they were ignored',
        description: [...new Set(errors)].sort().slice(0, 4).join(',') + '...',
        variant: 'warning',
      })
    }

    setAutoOpen(false)
  }

  return (
    <Autocomplete
      placeholder={TEXT_NAME}
      value={search}
      onTextChange={(v) => {
        console.log('Setting protein name:', v)
        setSearch(v)
        setSearchProteins(searchCache(v))
      }}
      onTextChanged={(v) => {
        console.log('Searching for protein:', v)

        searchForProtein(v)
      }}
      onFocus={() => setAutoOpen(true)}
      autoOpen={autoOpen}
      aria-label="Protein name"
      className="w-1/2 text-sm"
    >
      {searchProteins.map((searchProtein, pi) => {
        return (
          <li key={pi}>
            <button
              className="flex flex-row px-3  items-center gap-x-2 justify-between text-left grow hover:bg-muted/50 min-h-9 w-full"
              onClick={() => {
                lollipopPlot(searchProtein)

                //setSearchProteins([]) // clear search results
              }}
              aria-label={`Select ${searchProtein.gene}`}
            >
              <span className="inline-flex flex-row items-center gap-x-2">
                <SearchIcon className="shrink-0" />

                <span className="font-bold">
                  {searchProtein.gene} ({searchProtein.sequence.length} aa)
                </span>
              </span>
              <span className="text-foreground/50">
                {`${searchProtein.accession}, ${searchProtein.organism}`}
              </span>
            </button>
          </li>
        )
      })}
    </Autocomplete>
  )
}
