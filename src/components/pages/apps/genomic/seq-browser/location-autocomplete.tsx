// 'use client'

import { SearchIcon } from '@icons/search-icon'

import { useEffect, useState } from 'react'

import { Feature, IGenomicFeature, locStr } from '@lib/genomic/genomic'

import { useGeneQuery } from '@/lib/edb/genome'
import { BUTTON_MD_H_CLS } from '@/theme'
import { Autocomplete } from '@components/autocomplete'
import type { ISearchBoxProps } from '@components/search-box'
import { cn } from '@lib/shadcn-utils'
import { useSeqBrowserSettings } from './seq-browser-settings'

const LI_CLS = cn(
  BUTTON_MD_H_CLS,
  'hover:bg-muted/50 outline-none focus-visible:bg-muted/50 flex flex-row',
  'justify-start items-center px-3 gap-x-2 w-full'
)

interface IProps extends ISearchBoxProps {
  feature?: Feature
  onLocationChanged?: (loc: IGenomicFeature) => void
}

export function LocationAutocomplete({
  value,
  feature = 'gene',
  onTextChange,
  onTextChanged,
  onLocationChanged,
  className,
  ...props
}: IProps) {
  const { settings } = useSeqBrowserSettings()

  const [query, setQuery] = useState('')

  const [results, setResults] = useState<IGenomicFeature[]>([])

  const { data: geneData } = useGeneQuery(query, settings.genome, feature)

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
      searchLabel="Search for Gene or Location"
      deleteLabel="Delete Location"
      {...props}
    >
      {results.map((item) => (
        <li key={item.geneId}>
          <button
            className={LI_CLS}
            onClick={() => {
              if (item.geneSymbol) {
                onTextChange?.(item.geneSymbol)
                onTextChanged?.(item.geneSymbol)
                onLocationChanged?.(item)
              }
            }}
          >
            <SearchIcon />
            <span className="grow text-left">{item.geneSymbol}</span>
            <span className="text-right text-foreground/30 text-xs truncate">
              {locStr(item.loc)}
            </span>
          </button>
        </li>
      ))}
    </Autocomplete>
  )
}
