import {
  TEXT_OK,
  TEXT_REMOVE_FROM_CART,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@dialog/ok-cancel-dialog'

import { SearchBox } from '@components/search-box'
import { CheckPropRow } from '@dialog/check-prop-row'
import {
  getAccordionId,
  SettingsAccordionItem,
} from '@dialog/settings/settings-dialog'
import { BagIcon } from '@icons/bag-icon'
import { MultiSelectIcon } from '@icons/multi-select-icon'
import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { ScrollAccordion } from '@themed/accordion'
import { Button } from '@themed/button'
import { Checkbox } from '@themed/check-box'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@themed/dropdown-menu'

import { CartIcon } from '@components/icons/cart-icon'
import { ExternalLinkIcon } from '@components/icons/external-link'
import { DialogTitle } from '@components/shadcn/ui/themed/dialog'
import { InfoHoverCard } from '@components/shadcn/ui/themed/hover-card'
import { GlassSideDialog } from '@dialog/glass-side-dialog'
import { SortIcon } from '@icons/sort-icon'
import { BoolSearchQuery } from '@lib/search'
import { cn } from '@lib/shadcn-utils'
import { CircleMinus } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import { TracksContext, type AllDBSignalTrackTypes } from '../tracks-provider'

function makeUcscUrl(seq: AllDBSignalTrackTypes): string {
  return `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${seq.genome}&hgct_customText=track%20type=bigWig%20name=%22${seq.name}%22%20visibility=full%20bigDataUrl=${seq.url}`
}

export interface IProps extends IModalProps {
  platform: string
  callback?: (tracks: AllDBSignalTrackTypes[], combine: boolean) => void
}

export function SeqsDialog({
  open = true,
  onOpenChange = () => {},
  platform,
  callback,
  onResponse = () => {},
  className,
}: IProps) {
  const { trackDb } = useContext(TracksContext)
  const { settings } = useSeqBrowserSettings()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [combine, setCombine] = useState(false)
  const [sortReversed, setSortReversed] = useState(false)
  const [searchedDb, setSearchedDb] = useState<AllDBSignalTrackTypes[]>([])

  const seqs = useMemo(
    () =>
      trackDb.filter(
        (t) => t.genome === settings.genome && t.platform === platform
      ),
    [trackDb, settings.genome, platform]
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
      new Map<string, boolean>(seqs.map((track) => [track.publicId, false]))
    )
  }, [seqs])

  useEffect(() => {
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
        <VCenterRow className="gap-x-2">
          <CartIcon />
          <DialogTitle>{`${platform.replaceAll('_', ' ').replaceAll('And', '&')} Cart`}</DialogTitle>
        </VCenterRow>
      }
      open={open}
      onOpenChange={onOpenChange}
      className={className}
      onResponse={(response, data) => {
        if (response === TEXT_OK) {
          const selectedTracks = seqs.filter(
            (track) => addedMap.get(track.publicId) ?? false
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
        {error && <span className="text-destructive text-wrap">{error}</span>}
        <VCenterRow className="gap-x-2">
          <SearchBox
            id="search"
            value={search}
            onTextChange={(v) => setSearch(v)}
            placeholder="Search samples..."
            className="grow"
          />

          <VCenterRow>
            <Button
              variant="ios"
              size="icon"
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
            >
              <BagIcon />
            </Button>

            <Button
              variant="ios"
              // ripple={false}
              size="icon"
              onClick={() => {
                setSelectedMap(
                  new Map<string, boolean>([
                    ...[...selectedMap.entries()],
                    ...searchedDb.map(
                      (t) => [t.publicId, !searchSelectAll] as [string, boolean]
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
                  // ripple={false}
                  /* onClick={() => {
                    setAddedMap(new Map<string, boolean>(selectedMap.entries()))
                  }} */
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
                  checked={sortReversed}
                  onClick={() => setSortReversed(!sortReversed)}
                  aria-label="Sort items alphabetically"
                >
                  <span>Reversed</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </VCenterRow>
        </VCenterRow>

        {StoreItems(
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
            // ripple={false}
            title={TEXT_REMOVE_FROM_CART}
            onClick={() => {
              const keys = new Set(addedSelectedMap.keys())

              setAddedMap(
                new Map<string, boolean>([
                  ...[...addedMap.entries()],
                  ...[...keys].map((key) => [key, false] as [string, boolean]),
                ])
              )
            }}
          >
            <CircleMinus className="w-4" />
          </Button>

          <Button
            //variant="accent"
            size="icon"
            // ripple={false}
            onClick={() => {
              setAddedSelectedMap(
                new Map<string, boolean>([
                  ...[...addedSelectedMap.entries()],
                  ...searchedDb.map(
                    (t) => [t.publicId, !addedSelectAll] as [string, boolean]
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
          seqs,
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

function StoreItems(
  searchedDb: AllDBSignalTrackTypes[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  const [searchDatasetNames, setSearchDatasets] = useState<string[]>([])
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  useEffect(() => {
    let searchDatasets = [...new Set(searchedDb.map((t) => t.dataset))].sort()

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

  const displayDatasets: AllDBSignalTrackTypes[][] = searchDatasetNames.map(
    (dataset) => {
      let ret = searchedDb.filter((track) => track.dataset === dataset)

      if (reverseSort) {
        ret = ret.toReversed()
      }

      return ret
    }
  )

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
                    className="flex flex-row items-center justify-between gap-y-0.5 gap-x-2 p-2 hover:bg-muted overflow-hidden rounded-theme group"
                  >
                    <Checkbox
                      checked={selectedMap.get(seq.publicId) ?? false}
                      onCheckedChange={(state) => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.publicId, state],
                          ])
                        )
                      }}
                    />

                    <BaseCol className="grow overflow-hidden">
                      <p className="truncate">{seq.name}</p>
                      <p className="text-xs text-secondary-foreground truncate">
                        {`${seq.trackType === 'Seq' ? `${seq.reads.toLocaleString()} reads,` : ''} ${seq.platform}, ${seq.genome}`}
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
  searchedDb: AllDBSignalTrackTypes[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  searchedDb = searchedDb.filter((t) => addedMap.get(t.publicId) ?? false)

  let datasets = [...new Set(searchedDb.map((t) => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: AllDBSignalTrackTypes[][] = datasets.map((dataset) => {
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
                        onCheckedChange={(state) => {
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
                          {seq.trackType === 'Seq'
                            ? `${seq.reads.toLocaleString()} reads,`
                            : ''}
                          {seq.platform}, {seq.genome}
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
