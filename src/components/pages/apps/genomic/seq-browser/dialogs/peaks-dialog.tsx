import { BaseCol } from '@/layout/base-col'

import {
  TEXT_OK,
  TEXT_REMOVE_FROM_CART,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { SearchBox } from '@/components/search-box'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { MultiSelectIcon } from '@/icons/multi-select-icon'
import { VCenterRow } from '@/layout/v-center-row'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { appsConfig } from '@/config/apps'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { BoolSearchQuery } from '@/lib/search'
import { Checkbox } from '@/themed/v2/check-box'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  getAccordionId,
  SideAccordionItem,
} from '@/dialogs/settings/settings-dialog'
import { ScrollAccordion } from '@/themed/v2/accordion'

import { PlusIcon } from '@/components/icons/plus-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { CenterCol } from '@/components/layout/center-col'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { GlassSideDialog } from '@/dialogs/glass-side-dialog'
import { IconButton } from '@/themed/icon-button'

import { API_BEDS_URL } from '@/components/edb/edb'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { DialogTitle } from '@/components/shadcn/ui/themed/v2/dialog'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ArrowDownUp, ShoppingCart } from 'lucide-react'
import type { IBedDBDataTrack, IBedDBTrack } from '../tracks-provider'

export interface IProps extends IModalProps<{
  tracks: IBedDBTrack[]
  combine: boolean
}> {
  technology: string
}

export function PeaksDialog({
  technology,
  open = true,
  onOpenChange = () => {},
  onResponse,
  className,
}: IProps) {
  const { fetchAccessToken } = useEdbAuth()
  const [combine, setCombine] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [trackDb, setTrackDb] = useState<IBedDBDataTrack[]>([])
  const [searchedDb, setSearchedDb] = useState<IBedDBDataTrack[]>([])
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [reverseSort, setReverseSort] = useState(false)
  const { settings } = useEdbSettings()

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

      const res = await httpFetch.getJson<{ data: IBedDBDataTrack[] }>(
        `${API_BEDS_URL}/assemblies/${settings.genomic.assembly}/samples`,
        {
          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (data) {
      let beds: IBedDBDataTrack[] = data

      beds = beds.filter((bed) => bed.technology === technology)

      setTrackDb(beds)

      setSelectedMap(
        new Map<string, boolean>(
          beds.map((b) => [b.id, false] as [string, boolean])
        )
      )
    }
  }, [data, settings.genomic.assembly, technology])

  useEffect(() => {
    if (search === '') {
      setSearchedDb(trackDb)
    } else {
      const sq = new BoolSearchQuery(search)

      setSearchedDb(trackDb.filter((track) => sq.match(track.name)))
    }
  }, [trackDb, search])

  //const addedDb = searchedDb.filter(t => addedMap.get(t.id) ?? false)

  return (
    <GlassSideDialog
      title={
        <CenterCol className="gap-x-2 grow">
          <SearchBox
            id="search"
            value={search}
            onTextChange={(v) => setSearch(v)}
            placeholder="Search samples..."
            className="w-3/5"
          />
        </CenterCol>
      }
      open={open}
      onOpenChange={onOpenChange}
      onResponse={(response) => {
        if (response === TEXT_OK) {
          const selectedTracks = trackDb.filter(
            (track) => addedMap.get(track.id) ?? false
          )

          if (selectedTracks.length > 0) {
            onResponse?.(TEXT_OK, { tracks: selectedTracks, combine })
          } else {
            setError('You must add at least one track to the cart')
          }
        } else {
          onResponse?.(response)
        }
      }}
      buttons={[TEXT_OK]}
      className={className}
      leftFooterChildren={
        <VCenterRow className="gap-x-2">
          <CheckPropRow
            title="Overlay tracks"
            checked={combine}
            onCheckedChange={setCombine}
          />
          <InfoHoverCard>
            When enabled, the selected tracks will be overlaid on top of each
            other in the same view. This is useful for comparing multiple
            datasets in the same region.
          </InfoHoverCard>
        </VCenterRow>
      }
      cols={3}
    >
      <BaseCol className="grow text-xs gap-y-4 p-3">
        {error && <span className="text-destructive">{error}</span>}
        <VCenterRow className="gap-x-2 justify-between">
          <VCenterRow className="gap-x-1">
            <IconButton
              variant="flat-alt"
              //size="icon"
              // ripple={false}
              onClick={() => {
                setAddedMap(new Map<string, boolean>(selectedMap.entries()))
              }}
              title="Add to Cart"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {/* <Plus
                className="absolute left-1/2 top-1/2 -translate-1/2"
                size={8}
                strokeWidth={3}
              /> */}
            </IconButton>

            <ToolbarSeparator />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    variant="flat-alt"
                    onClick={() => {
                      setAddedMap(
                        new Map<string, boolean>(selectedMap.entries())
                      )
                    }}
                    title="Sort Items"
                  >
                    <ArrowDownUp size={20} strokeWidth={1.5} />
                  </IconButton>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    onClick={() => setReverseSort(!reverseSort)}
                    aria-label="Sort items alphabetically"
                    checked={reverseSort}
                  >
                    <span>Reversed</span>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </VCenterRow>

          <IconButton
            variant="flat-alt"

            onClick={() => {
              setSelectedMap(
                new Map<string, boolean>([
                  ...[...selectedMap.entries()],
                  ...searchedDb.map(
                    (t) => [t.id, !searchSelectAll] as [string, boolean]
                  ),
                ])
              )

              setSearchSelectAll(!searchSelectAll)
            }}
            title={searchSelectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
          >
            <MultiSelectIcon checked={!searchSelectAll} />
          </IconButton>
        </VCenterRow>

        <StoreItems
          searchedDb={searchedDb}
          addedMap={addedMap}
          setAddedMap={setAddedMap}
          selectedMap={selectedMap}
          setSelectedMap={setSelectedMap}
          reverseSort={reverseSort}
        />
      </BaseCol>

      <BaseCol className="grow gap-y-2">
        <VCenterRow className="gap-x-2 justify-between">
          <VCenterRow className="gap-x-2">
            {/* <CartIcon /> */}
            <DialogTitle className="font-bold">{`${technology.replaceAll('_', ' ').replaceAll('And', '&')} Peaks Cart`}</DialogTitle>
          </VCenterRow>

          <VCenterRow className="justify-end text-xs">
            <IconButton
              // ripple={false}
              onClick={() => {
                setAddedSelectedMap(
                  new Map<string, boolean>([
                    ...[...addedSelectedMap.entries()],
                    ...searchedDb.map(
                      (t) => [t.id, !addedSelectAll] as [string, boolean]
                    ),
                  ])
                )

                setAddedSelectAll(!addedSelectAll)
              }}
              title={searchSelectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
            >
              <MultiSelectIcon checked={!addedSelectAll} />
            </IconButton>

            <IconButton
              // ripple={false}
              title={TEXT_REMOVE_FROM_CART}
              onClick={() => {
                const keys = new Set(addedSelectedMap.keys())

                setAddedMap(
                  new Map<string, boolean>([
                    ...[...addedMap.entries()],
                    ...[...keys].map(
                      (key) => [key, false] as [string, boolean]
                    ),
                  ])
                )

                setAddedSelectedMap(
                  new Map<string, boolean>([
                    ...[...addedSelectedMap.entries()],
                    ...[...keys].map(
                      (key) => [key, false] as [string, boolean]
                    ),
                  ])
                )
              }}
            >
              <TrashIcon />
            </IconButton>
          </VCenterRow>
        </VCenterRow>

        <CartItems
          searchedDb={trackDb}
          addedMap={addedMap}
          setAddedMap={setAddedMap}
          selectedMap={addedSelectedMap}
          setSelectedMap={setAddedSelectedMap}
          reverseSort={reverseSort}
        />
      </BaseCol>
    </GlassSideDialog>
  )
}

function StoreItems({
  searchedDb,
  addedMap,
  setAddedMap,
  selectedMap,
  setSelectedMap,
  reverseSort,
}: {
  searchedDb: IBedDBDataTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  reverseSort: boolean
}) {
  const [searchDatasetNames, setSearchDatasets] = useState<string[]>([])
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  useEffect(() => {
    let searchDatasets: string[] = [
      ...[
        ...new Set(
          searchedDb
            .filter(
              (t) => t.institution === appsConfig.seqbrowser.defaultInstitution
            )
            .map((t) => t.dataset)
        ),
      ].sort(),
      ...[
        ...new Set(
          searchedDb
            .filter(
              (t) => t.institution !== appsConfig.seqbrowser.defaultInstitution
            )
            .map((t) => t.dataset)
        ),
      ].sort(),
    ]

    if (reverseSort) {
      searchDatasets = searchDatasets.toReversed()
    }

    setSearchDatasets(searchDatasets)

    setAccordionValues(
      searchedDb.length < 50
        ? searchDatasets.map((dataset) => getAccordionId(dataset))
        : []
    )
  }, [searchedDb, reverseSort])

  const displayDatasets: IBedDBDataTrack[][] = searchDatasetNames.map(
    (dataset) => {
      let ret = searchedDb.filter((track) => track.dataset === dataset)

      if (reverseSort) {
        ret = ret.toReversed()
      }

      return ret
    }
  )

  return (
    <ScrollAccordion
      value={accordionValues}
      onValueChange={(v) => setAccordionValues(v as string[])}
      variant="sidebar"
    >
      {searchDatasetNames.map((dataset, dataseti) => {
        return (
          <SideAccordionItem
            title={`${dataset} (${displayDatasets[dataseti]!.length})`}
            value={dataset}
            key={dataseti}
          >
            <ul className="flex flex-col gap-y-2">
              {displayDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row justify-between gap-x-2 gap-y-0.5 pr-2 border-r-2 border-transparent hover:border-app-theme overflow-hidden group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.id) ?? false}
                      onCheckedChange={(state) => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.id, state],
                          ])
                        )
                      }}
                    />

                    <BaseCol className="grow overflow-hidden">
                      <p className="truncate">{seq.name}</p>
                      <p className="text-xs text-secondary-foreground truncate">
                        {`${seq.technology}, ${seq.assembly}${seq.type === 'BED' ? `(${seq.regions!.toLocaleString()} regions)` : ''}`}
                      </p>
                    </BaseCol>

                    <button
                      className="invisible group-hover:visible stroke-foreground/70 hover:stroke-foreground"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.id, true] as [string, boolean],
                          ])
                        )
                      }}
                      title="Add to Cart"
                    >
                      <PlusIcon stroke="" size={16} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </SideAccordionItem>
        )
      })}
    </ScrollAccordion>
  )
}

function CartItems({
  searchedDb,
  addedMap,
  setAddedMap,
  selectedMap,
  setSelectedMap,
  reverseSort,
}: {
  searchedDb: IBedDBDataTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  reverseSort: boolean
}) {
  searchedDb = searchedDb.filter((t) => addedMap.get(t.id) ?? false)

  let datasets = [...new Set(searchedDb.map((t) => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IBedDBDataTrack[][] = datasets.map((dataset) => {
    let ret = searchedDb.filter((track) => track.dataset === dataset)

    if (reverseSort) {
      ret = ret.toReversed()
    }

    return ret
  })

  return (
    <ScrollAccordion value={datasets.map((dataset) => getAccordionId(dataset))}>
      {datasets.map((dataset, dataseti) => {
        return (
          <SideAccordionItem title={dataset} key={dataseti}>
            <ul className="flex flex-col ">
              {allDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row gap-y-0.5 gap-x-2 group"
                  >
                    <VCenterRow className="px-2 py-1 gap-x-2 grow group-hover:bg-muted/50 overflow-hidden rounded-theme">
                      <Checkbox
                        checked={selectedMap.get(seq.id) ?? false}
                        onCheckedChange={(state) => {
                          setSelectedMap(
                            new Map<string, boolean>([
                              ...selectedMap.entries(),
                              [seq.id, state],
                            ])
                          )
                        }}
                      />
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {`${seq.type === 'BED' ? `${seq.regions!.toLocaleString()} regions,` : ''} ${seq.technology}, ${seq.assembly}`}
                        </span>
                      </BaseCol>
                    </VCenterRow>

                    <button
                      className="invisible group-hover:visible stroke-foreground/50 hover:stroke-destructive"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.id, false] as [string, boolean],
                          ])
                        )
                      }}
                      title={TEXT_REMOVE_FROM_CART}
                    >
                      <TrashIcon stroke="" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </SideAccordionItem>
        )
      })}
    </ScrollAccordion>
  )
}
