import { BaseCol } from '@/components/layout/base-col'

import {
  TEXT_CANCEL,
  TEXT_OK,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@components/dialog/ok-cancel-dialog'

import { CheckPropRow } from '@/components/check-prop-row'
import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SearchBox } from '@/components/search-box'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Checkbox } from '@/components/shadcn/ui/themed/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/themed/dialog'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { cn } from '@/lib/class-names'
import { API_SEARCH_BEDS_URL } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { SearchQuery } from '@/lib/search'
import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'

import {
  getAccordionId,
  SettingsAccordionItem,
} from '@/components/dialog/settings/settings-dialog'
import { BagIcon } from '@/components/icons/bag-icon'
import { CheckIcon } from '@/components/icons/check-icon'
import { CloseIcon } from '@/components/icons/close-icon'
import { SortIcon } from '@/components/icons/sort-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/dropdown-menu'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { type IDBBedTrack } from './tracks-provider'

export interface IProps extends IModalProps {
  genome: string
  platform: string
  callback?: (tracks: IDBBedTrack[], combine: boolean) => void
}

export function PeaksDialog({
  genome,
  platform,
  open = true,
  onOpenChange = () => {},
  callback,
  onReponse,
  className,
}: IProps) {
  const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)
  const [combine, setCombine] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [trackDb, setTrackDb] = useState<IDBBedTrack[]>([])
  const [searchedDb, setSearchedDb] = useState<IDBBedTrack[]>([])
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [sortReversed, setSortReversed] = useState(false)

  const [selectedMap, setSelectedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [addedMap, setAddedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [addedSelectedMap, setAddedSelectedMap] = useState<
    Map<string, boolean>
  >(new Map<string, boolean>())

  const { data } = useQuery({
    queryKey: ['beds'],
    queryFn: async () => {
      const accessToken = await getAccessTokenAutoRefresh()

      const res = await httpFetch.getJson(`${API_SEARCH_BEDS_URL}/${genome}`, {
        headers: bearerHeaders(accessToken),
      })

      return res.data
    },
  })

  useEffect(() => {
    if (data) {
      let beds: IDBBedTrack[] = data

      beds = beds.filter(bed => bed.platform === platform)

      setTrackDb(beds)

      setSelectedMap(
        new Map<string, boolean>(
          beds.map(b => [b.bedId, false] as [string, boolean])
        )
      )
    }
  }, [data])

  useEffect(() => {
    if (search === '') {
      setSearchedDb(trackDb)
    } else {
      const sq = new SearchQuery(search)

      console.log(trackDb.filter(track => sq.search(track.name)))

      setSearchedDb(trackDb.filter(track => sq.search(track.name)))
    }
  }, [trackDb, search])

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  //const addedDb = searchedDb.filter(t => addedMap.get(t.bedId) ?? false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
        className={cn(
          'text-sm grid grid-cols-1 lg:grid-cols-3 w-7/12 h-2/3',
          className
        )}
        contentVariant="glass"
      >
        <BaseCol className="grow p-3 text-xs gap-y-2 col-span-1 rounded-l-lg">
          {error && <span className="text-destructive">{error}</span>}
          <SearchBox
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onSearch={e => {
              if (e === 'clear') {
                setSearch('')
              }
            }}
            placeholder="Search samples..."
          />

          <VCenterRow className="gap-x-1 justify-between">
            <VCenterRow className="gap-x-1">
              <Button
                variant="ghost"
                size="icon"
                pad="none"
                ripple={false}
                onClick={() => {
                  setAddedMap(new Map<string, boolean>(selectedMap.entries()))
                }}
                title="Add to cart"
              >
                <BagIcon />
              </Button>
              <ToolbarSeparator />
              <Button
                variant="ghost"
                ripple={false}
                size="icon"
                pad="none"
                onClick={() => {
                  setSelectedMap(
                    new Map<string, boolean>([
                      ...[...selectedMap.entries()],
                      ...searchedDb.map(
                        t => [t.bedId, !searchSelectAll] as [string, boolean]
                      ),
                    ])
                  )

                  setSearchSelectAll(!searchSelectAll)
                }}
                title={searchSelectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
              >
                <MultiSelectIcon checked={!searchSelectAll} />
              </Button>
            </VCenterRow>

            <VCenterRow className="gap-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    pad="none"
                    ripple={false}
                    onClick={() => {
                      setAddedMap(
                        new Map<string, boolean>(selectedMap.entries())
                      )
                    }}
                    title="Add to cart"
                  >
                    <SortIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  //side="right"
                  // onEscapeKeyDown={() => {
                  //   setMenuOpen(false)
                  // }}
                  // onInteractOutside={() => {
                  //   setMenuOpen(false)
                  // }}
                  // onPointerDownOutside={() => {
                  //   setMenuOpen(false)
                  // }}
                  align="start"
                  //className="fill-foreground"
                >
                  <DropdownMenuLabel>Sort order</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setSortReversed(!sortReversed)}
                    aria-label="Sort items alphabetically"
                  >
                    {sortReversed && <CheckIcon fill="" w="w-4" />}

                    <span>Reversed</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </VCenterRow>
          </VCenterRow>

          {storeItems(
            searchedDb,
            addedMap,
            setAddedMap,
            selectedMap,
            setSelectedMap,
            sortReversed
          )}
        </BaseCol>

        <BaseCol className="col-span-2 bg-background rounded-r-xl border-l border-border">
          <DialogHeader className="mb-2 border-b border-border">
            <VCenterRow className="px-6 py-3 -mr-3 justify-between">
              <DialogTitle className="text-xl">
                {`${platform} Peaks`}
              </DialogTitle>

              <VCenterRow className="gap-x-2">
                <Button
                  variant="accent"
                  size="icon-lg"
                  rounded="full"
                  pad="none"
                  onClick={() => _resp(TEXT_CANCEL)}
                >
                  <CloseIcon />
                </Button>
              </VCenterRow>
            </VCenterRow>
          </DialogHeader>

          <BaseCol className="p-2 grow gap-y-2">
            <VCenterRow className="justify-end text-xs gap-x-1">
              <Button
                variant="accent"
                size="icon"
                pad="none"
                ripple={false}
                title="Remove from cart"
                onClick={() => {
                  const keys = new Set(addedSelectedMap.keys())

                  setAddedMap(
                    new Map<string, boolean>([
                      ...[...addedMap.entries()],
                      ...[...keys].map(
                        key => [key, false] as [string, boolean]
                      ),
                    ])
                  )

                  setAddedSelectedMap(
                    new Map<string, boolean>([
                      ...[...addedSelectedMap.entries()],
                      ...[...keys].map(
                        key => [key, false] as [string, boolean]
                      ),
                    ])
                  )
                }}
              >
                <TrashIcon />
              </Button>
              <ToolbarSeparator />

              <Button
                variant="accent"
                size="icon"
                pad="none"
                ripple={false}
                onClick={() => {
                  setAddedSelectedMap(
                    new Map<string, boolean>([
                      ...[...addedSelectedMap.entries()],
                      ...searchedDb.map(
                        t => [t.bedId, !addedSelectAll] as [string, boolean]
                      ),
                    ])
                  )

                  setAddedSelectAll(!addedSelectAll)
                }}
                title={searchSelectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
              >
                <MultiSelectIcon checked={!addedSelectAll} />
              </Button>
            </VCenterRow>

            {cartItems(
              trackDb,
              addedMap,
              setAddedMap,
              addedSelectedMap,
              setAddedSelectedMap,
              sortReversed
            )}

            <VCenterRow className="justify-between p-2">
              <CheckPropRow
                title="Overlay tracks"
                checked={combine}
                onCheckedChange={setCombine}
              />
              <Button
                variant="theme"
                onClick={() => {
                  const selectedTracks = trackDb.filter(
                    track => addedMap.get(track.bedId) ?? false
                  )

                  if (selectedTracks.length > 0) {
                    callback?.(selectedTracks, combine)
                  } else {
                    setError('You must add at least one track to the cart')
                  }
                }}
                className="w-24"
                size="lg"
              >
                {TEXT_OK}
              </Button>
            </VCenterRow>
          </BaseCol>
        </BaseCol>
        <VisuallyHidden asChild>
          <DialogDescription>Select peak tracks</DialogDescription>
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}

function storeItems(
  searchedDb: IDBBedTrack[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  let datasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IDBBedTrack[][] = datasets.map(dataset => {
    let ret = searchedDb.filter(track => track.dataset === dataset)

    if (reverseSort) {
      ret = ret.toReversed()
    }

    return ret
  })

  return (
    <ScrollAccordion value={datasets.map(dataset => getAccordionId(dataset))}>
      {datasets.map((dataset, dataseti) => {
        return (
          <SettingsAccordionItem title={dataset} key={dataseti}>
            <ul className="flex flex-col">
              {allDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row justify-between gap-y-0.5 p-2.5 hover:bg-background/80 overflow-hidden rounded-theme group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.bedId) ?? false}
                      onCheckedChange={state => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.bedId, state],
                          ])
                        )
                      }}
                    >
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {seq.regions.toLocaleString()} regions, {seq.platform}
                          , {seq.genome}
                        </span>
                      </BaseCol>
                    </Checkbox>

                    <button
                      className="invisible group-hover:visible"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.bedId, true] as [string, boolean],
                          ])
                        )
                      }}
                      title="Add to cart"
                    >
                      <BagIcon />
                    </button>
                  </li>
                )
              })}
            </ul>
          </SettingsAccordionItem>
        )
      })}
    </ScrollAccordion>
  )
}

function cartItems(
  searchedDb: IDBBedTrack[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  searchedDb = searchedDb.filter(t => addedMap.get(t.bedId) ?? false)

  let datasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IDBBedTrack[][] = datasets.map(dataset => {
    let ret = searchedDb.filter(track => track.dataset === dataset)

    if (reverseSort) {
      ret = ret.toReversed()
    }

    return ret
  })

  return (
    <ScrollAccordion value={datasets.map(dataset => getAccordionId(dataset))}>
      {datasets.map((dataset, dataseti) => {
        return (
          <SettingsAccordionItem title={dataset} key={dataseti}>
            <ul className="flex flex-col ">
              {allDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row justify-between gap-y-0.5 p-2.5 hover:bg-background/80 overflow-hidden  rounded-theme group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.bedId) ?? false}
                      onCheckedChange={state => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.bedId, state],
                          ])
                        )
                      }}
                    >
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {seq.regions.toLocaleString()} regions, {seq.platform}
                          , {seq.genome}
                        </span>
                      </BaseCol>
                    </Checkbox>

                    <button
                      className="invisible group-hover:visible "
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.bedId, false] as [string, boolean],
                          ])
                        )
                      }}
                      title="Remove from cart"
                    >
                      <TrashIcon stroke="stroke-foreground hover:stroke-red-500" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </SettingsAccordionItem>
        )
      })}
    </ScrollAccordion>
  )
}
