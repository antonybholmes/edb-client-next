// 'use client'

import { SearchIcon } from '@icons/search-icon'

import { useEffect, useState } from 'react'

import { API_GENOME_INFO_URL } from '@lib/edb/edb'
import { locStr } from '@lib/genomic/genomic'

import { useQuery } from '@tanstack/react-query'

import { httpFetch } from '@lib/http/http-fetch'

import { BUTTON_MD_H_CLS } from '@/theme'
import { Autocomplete } from '@components/autocomplete'
import type { ISearchBoxProps } from '@components/search-box'
import { cn } from '@lib/shadcn-utils'
import { useSeqBrowserSettings } from './seq-browser-settings'
import type { IGenomicFeature } from './svg/genes-track-svg'

const LI_CLS = cn(
  BUTTON_MD_H_CLS,
  'hover:bg-muted/50 outline-none focus-visible:bg-muted/50 flex flex-row',
  'justify-start items-center px-3 gap-x-2 w-full'
)

export function LocationAutocomplete({
  value,
  onTextChange,
  onTextChanged,
  className,
  ...props
}: ISearchBoxProps) {
  const { settings } = useSeqBrowserSettings()

  const [query, setQuery] = useState('')

  const [results, setResults] = useState<IGenomicFeature[]>([])

  const { data: geneData } = useQuery({
    queryKey: ['gene-search', settings.genome, query],
    queryFn: async () => {
      if (query.length < 2 || query.includes('chr:')) {
        return []
      }

      try {
        const res = await httpFetch.getJson<{
          data: IGenomicFeature[]
        }>(
          `${API_GENOME_INFO_URL}/${settings.genome}?search=${query}&level=gene&mode=fuzzy`
        )

        //console.log('search genes', res.data)

        return res.data
      } catch (e) {
        console.log(e)
        return []
      }
    },
  })

  useEffect(() => {
    if (geneData) {
      setResults(geneData)
    }
  }, [geneData])

  useEffect(() => {
    setQuery(value?.toString() ?? '')
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
              if (item.geneName) {
                onTextChange?.(item.geneName)
                onTextChanged?.(item.geneName)
              }
            }}
          >
            <SearchIcon />
            <span className="grow text-left">{item.geneName}</span>
            <span className="text-right text-foreground/30 text-xs truncate">
              {locStr(item.loc)}
            </span>
          </button>
        </li>
      ))}
    </Autocomplete>
  )
}
