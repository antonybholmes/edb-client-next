import { BaseCol } from '@layout/base-col'

import {
  TEXT_OK,
  TEXT_REMOVE_FROM_CART,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@dialog/ok-cancel-dialog'

import { SearchBox } from '@components/search-box'
import { CheckPropRow } from '@dialog/check-prop-row'
import { MultiSelectIcon } from '@icons/multi-select-icon'
import { VCenterRow } from '@layout/v-center-row'
import { API_SEARCH_BEDS_URL } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { BoolSearchQuery } from '@lib/search'
import { cn } from '@lib/shadcn-utils'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@themed/button'
import { Checkbox } from '@themed/check-box'
import { useEffect, useState } from 'react'

import {
  getAccordionId,
  SettingsAccordionItem,
} from '@dialog/settings/settings-dialog'
import { BagIcon } from '@icons/bag-icon'
import { ScrollAccordion } from '@themed/accordion'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@themed/dropdown-menu'

import { CartIcon } from '@components/icons/cart-icon'
import { DialogTitle } from '@components/shadcn/ui/themed/dialog'
import { InfoHoverCard } from '@components/shadcn/ui/themed/hover-card'
import { GlassSideDialog } from '@dialog/glass-side-dialog'
import { SortIcon } from '@icons/sort-icon'
import { CircleMinus } from 'lucide-react'
import type { AllDBBedTrackTypes, IBedTrack } from '../tracks-provider'

export interface IProps extends IModalProps {
  genome: string
  platform: string
  callback?: (tracks: AllDBBedTrackTypes[], combine: boolean) => void
}

export function PeaksDialog({
  genome,
  platform,
  open = true,
  onOpenChange = () => {},
  callback,
  onResponse = () => {},
  className,
}: IProps) {
  const { fetchAccessToken } = useEdbAuth()
  const [combine, setCombine] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [trackDb, setTrackDb] = useState<IBedTrack[]>([])
  const [searchedDb, setSearchedDb] = useState<IBedTrack[]>([])
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
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.getJson<{ data: IBedTrack[] }>(
        `${API_SEARCH_BEDS_URL}/${genome}`,
        {
          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (data) {
      let beds: IBedTrack[] = data

      beds = beds.filter(bed => bed.platform === platform)

      setTrackDb(beds)

      setSelectedMap(
        new Map<string, boolean>(
          beds.map(b => [b.publicId, false] as [string, boolean])
        )
      )
    }
  }, [data])

  useEffect(() => {
    if (search === '') {
      setSearchedDb(trackDb)
    } else {
      const sq = new BoolSearchQuery(search)

      setSearchedDb(trackDb.filter(track => sq.match(track.name)))
    }
  }, [trackDb, search])

  //const addedDb = searchedDb.filter(t => addedMap.get(t.publicId) ?? false)

  return (
    <GlassSideDialog
      title={
        <VCenterRow className="gap-x-2">
          <CartIcon />
          <DialogTitle>{`${platform.replaceAll('_', ' ').replaceAll('And', '&')} Peaks Cart`}</DialogTitle>
        </VCenterRow>
      }
      open={open}
      onOpenChange={onOpenChange}
      onResponse={(response, data) => {
        if (response === TEXT_OK) {
          const selectedTracks = trackDb.filter(
            track => addedMap.get(track.publicId) ?? false
          )

          if (selectedTracks.length > 0) {
            callback?.(selectedTracks, combine)
          } else {
            setError('You must add at least one track to the cart')
          }
        } else {
          onResponse?.(response, data)
        }
      }}
      buttons={[TEXT_OK]}
      className={className}
      leftFooterChildren={
        <>
          <CheckPropRow
            title="Overlay tracks"
            checked={combine}
            onCheckedChange={setCombine}
          />
          <InfoHoverCard title="Overlay tracks">
            When enabled, the selected tracks will be overlaid on top of each
            other in the same view. This is useful for comparing multiple
            datasets in the same region.
          </InfoHoverCard>
        </>
      }
      cols={3}
    >
      <BaseCol className="grow text-xs gap-y-2">
        {error && <span className="text-destructive">{error}</span>}
        <VCenterRow className="gap-x-2 justify-between">
          <SearchBox
            id="search"
            value={search}
            onTextChange={v => setSearch(v)}
            placeholder="Search samples..."
            className="grow"
          />

          <VCenterRow>
            <Button
              variant="ios"
              size="icon"
              ripple={false}
              onClick={() => {
                setAddedMap(new Map<string, boolean>(selectedMap.entries()))
              }}
              title="Add to Cart"
            >
              <BagIcon />
            </Button>

            <Button
              variant="ios"
              ripple={false}
              size="icon"
              onClick={() => {
                setSelectedMap(
                  new Map<string, boolean>([
                    ...[...selectedMap.entries()],
                    ...searchedDb.map(
                      t => [t.publicId, !searchSelectAll] as [string, boolean]
                    ),
                  ])
                )

                setSearchSelectAll(!searchSelectAll)
              }}
              title={searchSelectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
            >
              <MultiSelectIcon checked={!searchSelectAll} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ios"
                  size="icon"
                  ripple={false}
                  onClick={() => {
                    setAddedMap(new Map<string, boolean>(selectedMap.entries()))
                  }}
                  title="Sort Items"
                >
                  <SortIcon reverse={sortReversed} />
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
                <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  onClick={() => setSortReversed(!sortReversed)}
                  aria-label="Sort items alphabetically"
                  checked={sortReversed}
                >
                  <span>Reversed</span>
                </DropdownMenuCheckboxItem>
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

      <BaseCol className="grow gap-y-2">
        <VCenterRow className="justify-end text-xs">
          <Button
            //variant="accent"
            size="icon"
            ripple={false}
            title={TEXT_REMOVE_FROM_CART}
            onClick={() => {
              const keys = new Set(addedSelectedMap.keys())

              setAddedMap(
                new Map<string, boolean>([
                  ...[...addedMap.entries()],
                  ...[...keys].map(key => [key, false] as [string, boolean]),
                ])
              )

              setAddedSelectedMap(
                new Map<string, boolean>([
                  ...[...addedSelectedMap.entries()],
                  ...[...keys].map(key => [key, false] as [string, boolean]),
                ])
              )
            }}
          >
            <CircleMinus className="w-4" />
          </Button>

          <Button
            //variant="accent"
            size="icon"
            ripple={false}
            onClick={() => {
              setAddedSelectedMap(
                new Map<string, boolean>([
                  ...[...addedSelectedMap.entries()],
                  ...searchedDb.map(
                    t => [t.publicId, !addedSelectAll] as [string, boolean]
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
      </BaseCol>
    </GlassSideDialog>
  )
}

function storeItems(
  searchedDb: IBedTrack[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  const [searchDatasetNames, setSearchDatasets] = useState<string[]>([])
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  useEffect(() => {
    let searchDatasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

    if (reverseSort) {
      searchDatasets = searchDatasets.toReversed()
    }

    setSearchDatasets(searchDatasets)

    setAccordionValues(
      searchedDb.length < 50
        ? searchDatasets.map(dataset => getAccordionId(dataset))
        : []
    )
  }, [searchedDb, reverseSort])

  const displayDatasets: IBedTrack[][] = searchDatasetNames.map(dataset => {
    let ret = searchedDb.filter(track => track.dataset === dataset)

    if (reverseSort) {
      ret = ret.toReversed()
    }

    return ret
  })

  return (
    <ScrollAccordion value={accordionValues} onValueChange={setAccordionValues}>
      {searchDatasetNames.map((dataset, dataseti) => {
        return (
          <SettingsAccordionItem
            title={`${dataset} (${displayDatasets[dataseti]!.length})`}
            value={dataset}
            key={dataseti}
          >
            <ul className="flex flex-col">
              {displayDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row justify-between gap-x-2 gap-y-0.5 p-2 hover:bg-muted overflow-hidden rounded-theme group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.publicId) ?? false}
                      onCheckedChange={state => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.publicId, state],
                          ])
                        )
                      }}
                    ></Checkbox>

                    <BaseCol className="grow overflow-hidden">
                      <p className="truncate">{seq.name}</p>
                      <p className="text-xs text-secondary-foreground truncate">
                        {`${seq.trackType === 'BED' ? `${seq.regions.toLocaleString()} regions,` : ''} ${seq.platform}, ${seq.genome}`}
                      </p>
                    </BaseCol>

                    <button
                      className="invisible group-hover:visible stroke-foreground/70 hover:stroke-foreground"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.publicId, true] as [string, boolean],
                          ])
                        )
                      }}
                      title="Add to Cart"
                    >
                      <BagIcon w="w-4" stroke="" />
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
  searchedDb: IBedTrack[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  searchedDb = searchedDb.filter(t => addedMap.get(t.publicId) ?? false)

  let datasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IBedTrack[][] = datasets.map(dataset => {
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
                    className="flex flex-row gap-y-0.5 gap-x-2 group"
                  >
                    <VCenterRow className="p-2.5 gap-x-2 grow group-hover:bg-muted overflow-hidden rounded-theme">
                      <Checkbox
                        className={cn([
                          !selectedMap.get(seq.publicId),
                          'invisible group-hover:visible',
                        ])}
                        checked={selectedMap.get(seq.publicId) ?? false}
                        onCheckedChange={state => {
                          setSelectedMap(
                            new Map<string, boolean>([
                              ...selectedMap.entries(),
                              [seq.publicId, state],
                            ])
                          )
                        }}
                      />
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {`${seq.trackType === 'BED' ? `${seq.regions.toLocaleString()} regions,` : ''} ${seq.platform}, ${seq.genome}`}
                        </span>
                      </BaseCol>
                    </VCenterRow>

                    <button
                      className="invisible group-hover:visible stroke-foreground/50 hover:stroke-red-500"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.publicId, false] as [string, boolean],
                          ])
                        )
                      }}
                      title={TEXT_REMOVE_FROM_CART}
                    >
                      <CircleMinus className="w-5" stroke="" />
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
