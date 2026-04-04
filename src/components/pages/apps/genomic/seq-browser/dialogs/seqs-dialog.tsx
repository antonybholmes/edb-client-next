import {
  TEXT_OK,
  TEXT_REMOVE_FROM_CART,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@/dialog/ok-cancel-dialog'

import { SearchBox } from '@/components/search-box'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownSortOrderGroup,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { CheckPropRow } from '@/dialog/check-prop-row'
import {
  getAccordionId,
  SettingsAccordionItem,
} from '@/dialog/settings/settings-dialog'
import { MultiSelectIcon } from '@/icons/multi-select-icon'
import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'
import { ScrollAccordion } from '@/themed/v2/accordion'
import { Button } from '@/themed/v2/button'
import { Checkbox } from '@/themed/v2/check-box'

import { ExternalLinkIcon } from '@/components/icons/external-link'
import { PlusIcon } from '@/components/icons/plus-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { CenterCol } from '@/components/layout/center-col'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { GlassSideDialog } from '@/dialog/glass-side-dialog'
import { BoolSearchQuery } from '@/lib/search'
import { cn } from '@/lib/shadcn-utils'
import { IconButton } from '@/themed/icon-button'

import { DialogTitle } from '@/components/shadcn/ui/themed/v2/dialog'
import { useEffect, useMemo, useState } from 'react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import { type IDBTrack } from '../tracks-provider'
import { useTracks } from '../tracks-store'

import { appsConfig } from '@/config/apps'
import { ArrowDownUp } from 'lucide-react'

function makeUcscUrl(seq: IDBTrack): string {
  return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${seq.assembly}&hgct_customText=track%20type=bigWig%20name=%22${seq.name}%22%20visibility=full%20bigDataUrl=${seq.url}`
}

export interface IProps extends IModalProps {
  technology: string
  callback?: (tracks: IDBTrack[], combine: boolean) => void
}

export function SeqsDialog({
  open = true,
  //onOpenChange = () => {},
  technology,
  callback,
  onResponse = () => {},
  className,
}: IProps) {
  const { trackDb } = useTracks()
  const { settings } = useSeqBrowserSettings()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [combine, setCombine] = useState(false)
  const [asc, setAsc] = useState(true)
  const [searchedDb, setSearchedDb] = useState<IDBTrack[]>([])

  const seqs = useMemo(
    () =>
      trackDb.filter(
        t => t.assembly === settings.assembly && t.technology === technology
      ),
    [trackDb, settings.assembly, technology]
  )

  const [selectedMap, setSelectedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [addedMap, setAddedMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [addedSelectedMap, setAddedSelectedMap] = useState<
    Map<string, boolean>
  >(new Map<string, boolean>())

  useEffect(() => {
    setSelectedMap(
      new Map<string, boolean>(seqs.map(track => [track.id, false]))
    )
  }, [seqs])

  useEffect(() => {
    if (search === '') {
      setSearchedDb(seqs)
    } else {
      const sq = new BoolSearchQuery(search)

      setSearchedDb(seqs.filter(track => sq.match(track.name)))
    }
  }, [seqs, search])

  //const addedDb = searchedDb.filter(t => addedMap.get(t.publicId) ?? false)

  return (
    <GlassSideDialog
      title={
        // <VCenterRow className="gap-x-2">
        //   <CartIcon />
        //   <DialogTitle>{`${platform.replaceAll('_', ' ').replaceAll('And', '&')} Cart`}</DialogTitle>
        // </VCenterRow>

        <CenterCol className="grow">
          <SearchBox
            id="search"
            value={search}
            onTextChange={v => setSearch(v)}
            placeholder="Search samples..."
            className="w-3/5"
          />
        </CenterCol>
      }
      //size="large"
      open={open}
      //onOpenChange={onOpenChange}
      className={cn('h-3/5', className)}
      onResponse={(response, data) => {
        if (response === TEXT_OK) {
          const selectedTracks = seqs.filter(
            track => addedMap.get(track.id) ?? false
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
      <BaseCol className="grow text-xs gap-y-2">
        {error && <span className="text-destructive text-wrap">{error}</span>}

        <VCenterRow className="gap-x-2 justify-between">
          <VCenterRow>
            <Button
              variant="ios"
              //size="icon"
              // ripple={false}
              onClick={() => {
                setAddedMap(
                  new Map<string, boolean>([
                    ...[...addedMap.entries()],
                    // only add the positive ones we selected
                    ...[...selectedMap.entries()].filter(e => e[1]),
                  ])
                )
              }}
              aria-label="Add to Cart"
            >
              <PlusIcon />
              <span>Add to Cart</span>
            </Button>

            <IconButton
              // ripple={false}
              variant="ios"
              onClick={() => {
                setSelectedMap(
                  new Map<string, boolean>([
                    ...[...selectedMap.entries()],
                    ...searchedDb.map(
                      t => [t.id, !searchSelectAll] as [string, boolean]
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

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton
                  variant="ios"
                  // ripple={false}
                  /* onClick={() => {
                    setAddedMap(new Map<string, boolean>(selectedMap.entries()))
                  }} */
                  title="Sort Items"
                >
                  <ArrowDownUp size={20} strokeWidth={1.5} />
                </IconButton>
              }
            />
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
              <DropdownSortOrderGroup asc={asc} setAsc={setAsc} />
            </DropdownMenuContent>
          </DropdownMenu>
        </VCenterRow>

        <ItemsInStore
          searchedDb={searchedDb}
          addedMap={addedMap}
          setAddedMap={setAddedMap}
          selectedMap={selectedMap}
          setSelectedMap={setSelectedMap}
          asc={asc}
        />
      </BaseCol>

      <BaseCol className="grow gap-y-2">
        <VCenterRow className="gap-x-2 justify-between">
          <VCenterRow className="gap-x-2">
            <DialogTitle className="font-bold">{`${technology.replaceAll('_', ' ').replaceAll('And', '&')} Cart`}</DialogTitle>
          </VCenterRow>

          <VCenterRow className="justify-end text-xs">
            <IconButton
              //variant="accent"

              // ripple={false}
              onClick={() => {
                setAddedSelectedMap(
                  new Map<string, boolean>([
                    ...[...addedSelectedMap.entries()],
                    ...searchedDb.map(
                      t => [t.id, !addedSelectAll] as [string, boolean]
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
              //variant="accent"

              // ripple={false}
              title={TEXT_REMOVE_FROM_CART}
              onClick={() => {
                const keys = new Set(addedSelectedMap.keys())

                setAddedMap(
                  new Map<string, boolean>([
                    ...[...addedMap.entries()],
                    ...[...keys].map(key => [key, false] as [string, boolean]),
                  ])
                )
              }}
            >
              <TrashIcon className="w-4" />
            </IconButton>
          </VCenterRow>
        </VCenterRow>

        <CartItems
          searchedDb={searchedDb}
          addedMap={addedMap}
          setAddedMap={setAddedMap}
          selectedMap={addedSelectedMap}
          setSelectedMap={setAddedSelectedMap}
          asc={asc}
        />
      </BaseCol>
    </GlassSideDialog>
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
  searchedDb: IDBTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  asc: boolean
}) {
  const [searchDatasetNames, setSearchDatasets] = useState<string[]>([])
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  useEffect(() => {
    //console.log(searchedDb)

    // prioritize default institution over others so that
    // Columbia's results appear above everyone else's
    let searchDatasets: string[] = [
      ...[
        ...new Set(
          searchedDb
            .filter(
              t => t.institution === appsConfig.seqbrowser.defaultInstitution
            )
            .map(t => t.dataset)
        ),
      ].sort(),

      ...[
        ...new Set(
          searchedDb
            .filter(
              t => t.institution !== appsConfig.seqbrowser.defaultInstitution
            )
            .map(t => t.dataset)
        ),
      ].sort(),
    ]

    if (!asc) {
      searchDatasets = searchDatasets.toReversed()
    }

    setSearchDatasets(searchDatasets)

    setAccordionValues(
      searchedDb.length < 50
        ? searchDatasets.map(dataset => getAccordionId(dataset))
        : []
    )
  }, [searchedDb, asc])

  const displayDatasets: IDBTrack[][] = searchDatasetNames.map(dataset => {
    let ret = searchedDb.filter(track => track.dataset === dataset)

    if (!asc) {
      ret = ret.toReversed()
    }

    return ret
  })

  return (
    <ScrollAccordion
      value={accordionValues}
      onValueChange={v => setAccordionValues(v as string[])}
      variant="settings"
    >
      {searchDatasetNames.map((dataset, dataseti) => {
        return (
          <SettingsAccordionItem
            title={`${dataset} (${displayDatasets[dataseti]!.length})`}
            value={dataset}
            key={dataseti}
          >
            <ul className="flex flex-col text-sm">
              {displayDatasets[dataseti]!.map((seq, ti) => {
                return (
                  <li
                    key={ti}
                    className="flex flex-row items-center justify-between gap-y-0.5 gap-x-2 p-2 hover:bg-muted overflow-hidden rounded-theme group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.id) ?? false}
                      onCheckedChange={state => {
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
                        {`${seq.technology}, ${seq.assembly}${seq.type === 'Seq' ? ` (${seq.reads.toLocaleString()} reads)` : ''}`}
                      </p>
                    </BaseCol>

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
                      <PlusIcon w="w-4" stroke="" />
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

function CartItems({
  searchedDb,
  addedMap,
  setAddedMap,
  selectedMap,
  setSelectedMap,
  asc,
}: {
  searchedDb: IDBTrack[]
  addedMap: Map<string, boolean>
  setAddedMap: (selected: Map<string, boolean>) => void
  selectedMap: Map<string, boolean>
  setSelectedMap: (selected: Map<string, boolean>) => void
  asc: boolean
}) {
  searchedDb = searchedDb.filter(t => addedMap.get(t.id) ?? false)

  let datasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

  if (!asc) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IDBTrack[][] = datasets.map(dataset => {
    let ret = searchedDb.filter(track => track.dataset === dataset)

    if (!asc) {
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
                          !selectedMap.get(seq.id),
                          'invisible group-hover:visible',
                        ])}
                        checked={selectedMap.get(seq.id) ?? false}
                        onCheckedChange={state => {
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
                          {seq.type === 'Seq'
                            ? `${seq.reads.toLocaleString()} reads,`
                            : ''}
                          {seq.technology}, {seq.assembly}
                        </span>
                      </BaseCol>
                    </VCenterRow>
                    <button
                      className="invisible group-hover:visible stroke-foreground/50 hover:stroke-red-500"
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
                      <TrashIcon className="w-5" stroke="" />
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
