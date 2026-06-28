'use client'

import { SearchIcon } from '@/icons/search-icon'

import { useEffect, useState } from 'react'

import { locStr } from '@/lib/genomic/genomic'

import { Autocomplete } from '@/components/autocomplete'
import type { ISearchBoxProps } from '@/components/search-box'
import { useDebounce } from '@/hooks/debounce'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { useGeneQuery } from '@/lib/edb/genome'
import { Feature, IGenomicFeature } from '@/lib/genomic/genomic-feature'
import { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { cn } from '@/lib/shadcn-utils'

const LI_CLS = cn(
  'h-button-md hover:bg-muted/60 outline-none focus-visible:bg-muted/60 flex flex-row',
  'justify-start items-center px-3 gap-x-2 w-full'
)

interface IProps extends ISearchBoxProps {
  feature?: Feature
  /**
   * Called when user clicks on a location in the dropdown.
   * This distinguishes it from onTextChanged which is called
   * whenever the text input changes.
   *
   * @param loc   The genomic location selected by the user.
   * @returns
   */
  onLocationChanged?: (loc: IGenomicLocation) => void
}

export function LocationAutocomplete({
  value,
  feature = 'gene',
  onTextChange,
  onTextChanged,
  onLocationChanged,
  className = '',
  ...props
}: IProps) {
  const { settings } = useEdbSettings()

  const [query, setQuery] = useState('')

  const [results, setResults] = useState<IGenomicFeature[]>([])

  /**
   * Debounce the query to avoid excessive requests. User should
   * be able to type without lag.
   */
  const debouncedQuery = useDebounce(query, { delayMs: 500 })

  const { data: geneData } = useGeneQuery(
    debouncedQuery,
    settings.genomic.assembly,
    feature
  )

  useEffect(() => {
    if (geneData) {
      setResults(geneData)
    }
  }, [geneData])

  useEffect(() => {
    if (value) {
      setQuery(value?.toString())
    }
  }, [value])

  return (
    <Autocomplete
      value={query}
      //showClear={false}
      onTextChange={(v) => {
        setQuery(v)
        onTextChange?.(v)
      }}
      onTextChanged={(v) => {
        onTextChanged?.(v)
      }}
      className={className}
      placeholder="e.g. TP53, chr1:1000-2000"
      searchLabel="Search for Gene or Location"
      deleteLabel="Delete Location"
      {...props}
    >
      {results.map((item) => (
        <li key={item.geneId}>
          <button
            className={LI_CLS}
            onClick={() => {
              //if (item.geneSymbol) {
              //onTextChange?.(item.geneSymbol)
              //onTextChanged?.(item.geneSymbol)
              onLocationChanged?.(item.loc)
              //}
            }}
          >
            <SearchIcon />
            <span className="grow text-left">{item.symbol}</span>
            <span className="text-right text-foreground/30 text-xs truncate">
              {locStr(item.loc)}
            </span>
          </button>
        </li>
      ))}
    </Autocomplete>
  )
}
