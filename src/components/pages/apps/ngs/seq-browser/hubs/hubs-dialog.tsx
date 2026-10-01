import {
  TEXT_OK,
  TEXT_REMOVE_FROM_CART,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import {
  DialogFloatingToolbar,
  DialogToolbar,
  type IModalProps,
} from '@/dialogs/ok-cancel-dialog'

import { SearchBox } from '@/components/search-box'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownSortOrderGroup,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  getAccordionId,
  SideAccordionItem,
} from '@/dialogs/settings/settings-dialog'
import { MultiSelectIcon } from '@/icons/multi-select-icon'
import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'
import { ScrollAccordion } from '@/themed/v2/accordion'
import { Checkbox } from '@/themed/v2/check-box'

import { ExternalLinkIcon } from '@/components/icons/external-link'
import { PlusIcon } from '@/components/icons/plus-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { GlassSideDialog } from '@/dialogs/glass-side-dialog'
import { BoolSearchQuery } from '@/lib/search'
import { cn } from '@/lib/shadcn-utils'
import { IconButton } from '@/themed/icon-button'

import { DialogTitle } from '@/components/shadcn/ui/themed/v2/dialog'
import { useEffect, useMemo, useState } from 'react'
import { type ISeqDBTrack } from '../tracks-provider'
import { useTracks } from '../tracks-store'

import { useDialogs } from '@/components/dialogs/dialogs'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { normalizeAssemblyName } from '@/components/edb/genome'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { SortableItem } from '@/components/sortable-item'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { TruncateSpan } from '@/components/truncate-span'
import { appsConfig } from '@/config/apps'
import { DragDropProvider } from '@dnd-kit/react'
import { ArrowDownUp, CirclePlus, ShoppingCart } from 'lucide-react'
import { TRACK_ITEM_BUTTONS_CLS } from '../track-items/seq-track-item'
import { HubDialog } from './hub-dialog'
import { IHub, makeNewHub, useHubs } from './hub-store'

function makeUcscUrl(seq: ISeqDBTrack): string {
  return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${seq.assembly}&hgct_customText=track%20type=bigWig%20name=%22${seq.name}%22%20visibility=full%20bigDataUrl=${seq.url}`
}

export interface IProps extends IModalProps<{
  tracks: ISeqDBTrack[]
  combine: boolean
}> {
  technology: string
}

export function HubsDialog({
  open = true,
  technology,
  onResponse,
  className,
}: IProps) {
  const { trackDb } = useTracks()
  const { settings } = useEdbSettings()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [combine, setCombine] = useState(false)

  const { hubs, addHub } = useHubs()

  const [searchedDb, setSearchedDb] = useState<ISeqDBTrack[]>([])

  const seqs = useMemo(() => {
    console.log('tech', technology)
    return (trackDb ?? []).filter(
      (t) =>
        normalizeAssemblyName(t.assembly) ===
          normalizeAssemblyName(settings.genomic.assembly) &&
        t.technology === technology
    ) as ISeqDBTrack[]
  }, [trackDb, settings.genomic.assembly, technology])

  const [addedMap, setAddedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [addedSelectedMap, setAddedSelectedMap] = useState<
    Map<string, boolean>
  >(new Map<string, boolean>())

  // useEffect(() => {
  //   addHub({ id: makeUuid(), name: 'test', tracks: [] })
  //   console.log('hubs', hubs)
  // }, [])

  useEffect(() => {
    if (seqs.length === 0) {
      return
    }

    if (search === '') {
      setSearchedDb(seqs)
    } else {
      const sq = new BoolSearchQuery(search)

      setSearchedDb(seqs.filter((track) => sq.match(track.name)))
    }
  }, [seqs, search])

  //const addedDb = searchedDb.filter(t => addedMap.get(t.publicId) ?? false)

  return (
    <GlassSideDialog
      title={
        <DialogFloatingToolbar>
          <SearchBox
            id="search"
            value={search}
            onTextChange={(v) => setSearch(v)}
            placeholder="Search samples..."
            className="w-72"
            rounded="full"
            clear={() => setSearch('')}
          />
        </DialogFloatingToolbar>
      }
      //size="large"
      open={open}
      //onOpenChange={onOpenChange}
      className={cn('h-3/5', className)}
      onResponse={(response) => {
        if (response === TEXT_OK) {
          const selectedTracks = seqs.filter(
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
      leftFooterChildren={
        <VCenterRow className="gap-x-2">
          <Switch checked={combine} onCheckedChange={setCombine}>
            Overlay tracks
          </Switch>

          <InfoHoverCard>
            When enabled, the selected tracks will be overlaid on top of each
            other in the same view. This is useful for comparing multiple
            datasets in the same region.
          </InfoHoverCard>
        </VCenterRow>
      }
      cols={3}
    >
      <SideItems
        seqs={seqs}
        searchedDb={searchedDb}
        addedMap={addedMap}
        setAddedMap={setAddedMap}
        searchSelectAll={searchSelectAll}
        setSearchSelectAll={setSearchSelectAll}
      />
      <BaseCol className="grow gap-y-2">
        <VCenterRow className="gap-x-2 justify-between">
          <VCenterRow className="gap-x-2">
            <DialogTitle className="font-bold">{`${technology.replaceAll('_', ' ').replaceAll('And', '&')} Cart`}</DialogTitle>
          </VCenterRow>

          <VCenterRow className="justify-end text-xs">
            <IconButton
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
              }}
            >
              <TrashIcon />
            </IconButton>
          </VCenterRow>
        </VCenterRow>

        <CartItems
          searchedDb={searchedDb}
          addedMap={addedMap}
          setAddedMap={setAddedMap}
          selectedMap={addedSelectedMap}
          setSelectedMap={setAddedSelectedMap}
          asc={true}
        />
      </BaseCol>
    </GlassSideDialog>
  )
}

export interface IHubCallback {
  hub: IHub
  callback?: (hub: IHub) => void
}

function HubItems() {
  const [asc, setAsc] = useState(true)

  const [selectedMap, setSelectedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const { open: openDialog } = useDialogs()

  const { hubs, addHub, removeHub, updateHub } = useHubs()

  const [openGroupDialog, setOpenGroupDialog] = useState<
    IHubCallback | undefined
  >(undefined)

  function _addHub() {
    editHub(makeNewHub())
  }

  function editHub(hub: IHub) {
    // if a column is selected, suggest its name as what the user wants to
    // to group

    setOpenGroupDialog({
      hub,

      callback: (hub: IHub) => {
        //const indices = getColIdxFromGroup(df, group)

        addHub(hub)

        setOpenGroupDialog(undefined)
      },
    })
  }

  return (
    <>
      {openGroupDialog?.callback && (
        <HubDialog
          hub={openGroupDialog?.hub}
          onResponse={(response, hub) => {
            if (response === TEXT_OK && hub) {
              openGroupDialog?.callback?.(hub)
            } else {
              setOpenGroupDialog(undefined)
            }
          }}
        />
      )}
      <BaseCol className="text-xs gap-y-2 pb-2 border-b border-border/50">
        <h2 className="font-semibold">Hubs</h2>
        <VCenterRow className="mx-1">
          <VCenterRow className="gap-x-1">
            <IconButton
              variant="flat-alt"

              // ripple={false}
              onClick={() => {
                _addHub()
              }}
              title="Add Hub"
              //className={DIALOG_HEADER_BUTTON_CLS}
            >
              <CirclePlus size={20} strokeWidth={1.5} />
            </IconButton>

            <ToolbarSeparator />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    variant="flat-alt"

                    title="Sort Items"
                  >
                    <ArrowDownUp size={20} strokeWidth={1.5} />
                  </IconButton>
                }
              />
              <DropdownMenuContent align="start">
                <DropdownSortOrderGroup asc={asc} setAsc={setAsc} />
              </DropdownMenuContent>
            </DropdownMenu>
          </VCenterRow>

          <IconButton
            variant="flat-alt"
            //variant="flat"
            onClick={() => {}}
          >
            <MultiSelectIcon />
          </IconButton>
        </VCenterRow>

        <DragDropProvider
        //onDragStart={event => setActiveId(event.active.id as string)}
        // onDragEnd={(event) => {
        //   const newOrder = move(dfs, event)

        //   setDfs(newOrder)
        // }}
        >
          <ul>
            {hubs.map((hub, hi) => (
              <SortableItem
                key={hub.id}
                id={hub.id}
                index={hi}
                className="group"
                extChildren={
                  <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
                    <button
                      className="text-foreground/50 hover:text-destructive trans-color"
                      onClick={() => {
                        openDialog({
                          type: 'warning',
                          payload: {
                            content: `Are you sure you want to delete the "${hub.name}" hub?`,
                            callback: (response) => {
                              if (response === TEXT_OK) {
                                removeHub(hub.id)
                              }
                            },
                          },
                        })
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </VCenterRow>
                }
              >
                <TruncateSpan className="h-8 grow">{hub.name}</TruncateSpan>
                <FillButton
                  title="Hub color"
                  button="simple"
                  colors={[
                    {
                      color: hub.color,
                      allowNoColor: false,
                      onColorChange: ({ color }) =>
                        updateHub({ ...hub, color }),
                    },
                  ]}
                />
              </SortableItem>
            ))}
          </ul>
        </DragDropProvider>
      </BaseCol>
    </>
  )
}

function SideItems({
  seqs,
  searchedDb,
  addedMap,
  searchSelectAll,
  setAddedMap,
  setSearchSelectAll,
}: {
  seqs: ISeqDBTrack[]
  searchedDb: ISeqDBTrack[]
  addedMap: Map<string, boolean>
  searchSelectAll: boolean
  setAddedMap: (selected: Map<string, boolean>) => void
  setSearchSelectAll: (selectAll: boolean) => void
}) {
  const [asc, setAsc] = useState(true)
  const [error, setError] = useState('')
  const [selectedMap, setSelectedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  useEffect(() => {
    if (seqs.length === 0) {
      return
    }

    setSelectedMap(
      new Map<string, boolean>(seqs.map((track) => [track.id, false]))
    )
  }, [seqs])

  return (
    <BaseCol className="grow text-xs gap-y-2 mt-4 mx-1">
      {error && <span className="text-destructive text-wrap">{error}</span>}

      <DialogToolbar className="mx-1">
        <VCenterRow className="gap-x-1">
          <IconButton
            variant="flat-alt"

            // ripple={false}
            onClick={() => {
              setAddedMap(
                new Map<string, boolean>([
                  ...[...addedMap.entries()],
                  // only add the positive ones we selected
                  ...[...selectedMap.entries()].filter((e) => e[1]),
                ])
              )
            }}
            title="Add to Cart"
            //className={DIALOG_HEADER_BUTTON_CLS}
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
          </IconButton>

          <ToolbarSeparator />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton
                  variant="flat-alt"

                  title="Sort Items"
                >
                  <ArrowDownUp size={20} strokeWidth={1.5} />
                </IconButton>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownSortOrderGroup asc={asc} setAsc={setAsc} />
            </DropdownMenuContent>
          </DropdownMenu>
        </VCenterRow>

        <IconButton
          variant="flat-alt"
          //variant="flat"
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
      </DialogToolbar>

      {/* <HubItems /> */}

      <ItemsInStore
        searchedDb={searchedDb}
        addedMap={addedMap}
        setAddedMap={setAddedMap}
        selectedMap={selectedMap}
        setSelectedMap={setSelectedMap}
        asc={asc}
      />
    </BaseCol>
  )
}

function ItemsInStore({
  searchedDb,
  addedMap,
  setAddedMap,
  selectedMap,
  setSelectedMap,
  asc,
}: {
  searchedDb: ISeqDBTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  asc: boolean
}) {
  const [searchDatasetNames, setSearchDatasets] = useState<string[]>([])
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  useEffect(() => {
    // prioritize default institution over others so that
    // Columbia's results appear above everyone else's
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

    if (!asc) {
      searchDatasets = searchDatasets.toReversed()
    }

    if (searchDatasets.length > 0) {
      setSearchDatasets(searchDatasets)

      setAccordionValues(
        searchedDb.length < 50
          ? searchDatasets.map((dataset) => getAccordionId(dataset))
          : []
      )
    }
  }, [searchedDb, asc, setSearchDatasets, setAccordionValues])

  const displayDatasets: ISeqDBTrack[][] = searchDatasetNames.map((dataset) => {
    let ret = searchedDb.filter((track) => track.dataset === dataset)

    if (!asc) {
      ret = ret.toReversed()
    }

    return ret
  })

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
            showBorder={dataseti > 0}
          >
            <ul className="flex flex-col gap-y-2 text-sm">
              {displayDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row items-center justify-between gap-y-0.5 gap-x-2 pl-2 border-l-2 border-transparent hover:border-app-theme overflow-hidden  group"
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
                      <p className="truncate text-xs font-medium">{seq.name}</p>
                      <p className="text-xs text-secondary-foreground truncate">
                        {`${seq.technology}, ${seq.assembly}${seq.type === 'Seq' ? ` (${seq.reads!.toLocaleString()} reads)` : ''}`}
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

                    {seq.url && (
                      <a
                        className="invisible group-hover:visible stroke-foreground/70 hover:stroke-foreground"
                        title="View in UCSC Genome Browser"
                        href={makeUcscUrl(seq)}
                        target="_blank"
                      >
                        <ExternalLinkIcon strokeWidth={1.5} stroke="" />
                      </a>
                    )}
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
  asc,
}: {
  searchedDb: ISeqDBTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  asc: boolean
}) {
  searchedDb = searchedDb.filter((t) => addedMap.get(t.id) ?? false)

  let datasets = [...new Set(searchedDb.map((t) => t.dataset))].sort()

  if (!asc) {
    datasets = datasets.toReversed()
  }

  const allDatasets: ISeqDBTrack[][] = datasets.map((dataset) => {
    let ret = searchedDb.filter((track) => track.dataset === dataset)

    if (!asc) {
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
              {allDatasets[dataseti]!.map((track, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row gap-y-0.5 gap-x-2 group"
                  >
                    <VCenterRow className="px-2 py-1 gap-x-2 grow group-hover:bg-muted/50 overflow-hidden rounded-theme">
                      <Checkbox
                        checked={selectedMap.get(track.id) ?? false}
                        onCheckedChange={(state) => {
                          setSelectedMap(
                            new Map<string, boolean>([
                              ...selectedMap.entries(),
                              [track.id, state],
                            ])
                          )
                        }}
                      />
                      <BaseCol>
                        <span className="truncate font-medium">
                          {track.name}
                        </span>
                        <span className="text-xs text-secondary-foreground">
                          {track.type === 'Seq'
                            ? `${track.reads!.toLocaleString()} reads,`
                            : ''}
                          {track.technology}, {track.assembly}
                        </span>
                      </BaseCol>
                    </VCenterRow>
                    <button
                      className="invisible group-hover:visible stroke-foreground/50 hover:stroke-destructive"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [track.id, false] as [string, boolean],
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
