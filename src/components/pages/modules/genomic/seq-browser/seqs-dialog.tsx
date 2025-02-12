import {
  TEXT_CANCEL,
  TEXT_OK,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
} from '@/consts'
import { type IModalProps } from '@components/dialog/ok-cancel-dialog'

import { CheckPropRow } from '@/components/check-prop-row'
import {
  getAccordionId,
  SettingsAccordionItem,
} from '@/components/dialog/settings/settings-dialog'
import { BagIcon } from '@/components/icons/bag-icon'
import { CheckIcon } from '@/components/icons/check-icon'
import { CloseIcon } from '@/components/icons/close-icon'
import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { SortIcon } from '@/components/icons/sort-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SearchBox } from '@/components/search-box'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/accordion'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Checkbox } from '@/components/shadcn/ui/themed/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/themed/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/dropdown-menu'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { cn } from '@/lib/class-names'
import { SearchQuery } from '@/lib/search'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useContext, useEffect, useMemo, useState } from 'react'
import { SeqBrowserSettingsContext } from './seq-browser-settings-provider'
import { TracksContext, type IDBSeqTrack } from './tracks-provider'

export interface IProps extends IModalProps {
  platform: string
  callback?: (tracks: IDBSeqTrack[], combine: boolean) => void
}

export function SeqsDialog({
  open = true,
  onOpenChange = () => {},
  platform,
  callback,
  onReponse,
  className,
}: IProps) {
  const { trackDb } = useContext(TracksContext)
  const { settings } = useContext(SeqBrowserSettingsContext)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchSelectAll, setSearchSelectAll] = useState(false)
  const [addedSelectAll, setAddedSelectAll] = useState(false)
  const [combine, setCombine] = useState(false)
  const [sortReversed, setSortReversed] = useState(false)
  const [searchedDb, setSearchedDb] = useState<IDBSeqTrack[]>([])

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  const seqs = useMemo(
    () =>
      trackDb.filter(
        t => t.genome === settings.genome && t.platform === platform
      ),
    [trackDb]
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
      new Map<string, boolean>(seqs.map(track => [track.seqId, false]))
    )
  }, [seqs])

  useEffect(() => {
    if (search === '') {
      setSearchedDb(seqs)
    } else {
      const sq = new SearchQuery(search)

      setSearchedDb(seqs.filter(track => sq.search(track.name)))
    }
  }, [seqs, search])

  //const addedDb = searchedDb.filter(t => addedMap.get(t.seqId) ?? false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
        className={cn('text-sm grid grid-cols-3 w-2/3 h-2/3', className)}
        contentVariant="glass"
      >
        <BaseCol className="grow p-3 text-xs gap-y-2 rounded-l-lg">
          {error && <span className="text-destructive text-wrap">{error}</span>}
          <SearchBox
            id="search"
            h="2xl"
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
                  setAddedMap(
                    new Map<string, boolean>([
                      ...[...addedMap.entries()],
                      // only add the positive ones we selected
                      ...[...selectedMap.entries()].filter(e => e[1]),
                    ])
                  )
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
                        t => [t.seqId, !searchSelectAll] as [string, boolean]
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
                    title="Sort items"
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
                {`${platform.replaceAll('_', ' ').replaceAll('And', '&')} Cart`}
              </DialogTitle>

              <VCenterRow className="gap-x-2">
                {/* <Button
                  variant="accent"
                  className="text-sm"
                  ripple={false}
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
                  Remove from cart
                </Button> */}

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

                  // setAddedSelectedMap(
                  //   new Map<string, boolean>([
                  //     ...[...addedSelectedMap.entries()],
                  //     ...[...keys].map(
                  //       key => [key, false] as [string, boolean]
                  //     ),
                  //   ])
                  // )
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
                        t => [t.seqId, !addedSelectAll] as [string, boolean]
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

            <VCenterRow className="justify-between p-2">
              <CheckPropRow
                title="Overlay tracks"
                checked={combine}
                onCheckedChange={setCombine}
              />
              <Button
                variant="theme"
                onClick={() => {
                  const selectedTracks = seqs.filter(
                    track => addedMap.get(track.seqId) ?? false
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
          <DialogDescription>Select NGS sequences</DialogDescription>
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}

function storeItems(
  searchedDb: IDBSeqTrack[],

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

  const allDatasets: IDBSeqTrack[][] = datasets.map(dataset => {
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
                      checked={selectedMap.get(seq.seqId) ?? false}
                      onCheckedChange={state => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.seqId, state],
                          ])
                        )
                      }}
                    >
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {seq.reads.toLocaleString()} reads, {seq.platform},{' '}
                          {seq.genome}
                        </span>
                      </BaseCol>
                    </Checkbox>

                    <button
                      className="invisible group-hover:visible"
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.seqId, true] as [string, boolean],
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
  searchedDb: IDBSeqTrack[],
  addedMap: Map<string, boolean>,
  setAddedMap: (selected: Map<string, boolean>) => void,
  selectedMap: Map<string, boolean>,
  setSelectedMap: (selected: Map<string, boolean>) => void,
  reverseSort: boolean
) {
  searchedDb = searchedDb.filter(t => addedMap.get(t.seqId) ?? false)

  let datasets = [...new Set(searchedDb.map(t => t.dataset))].sort()

  if (reverseSort) {
    datasets = datasets.toReversed()
  }

  const allDatasets: IDBSeqTrack[][] = datasets.map(dataset => {
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
                      checked={selectedMap.get(seq.seqId) ?? false}
                      onCheckedChange={state => {
                        setSelectedMap(
                          new Map<string, boolean>([
                            ...selectedMap.entries(),
                            [seq.seqId, state],
                          ])
                        )
                      }}
                    >
                      <BaseCol>
                        <span className="truncate">{seq.name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {seq.reads.toLocaleString()} reads, {seq.platform},{' '}
                          {seq.genome}
                        </span>
                      </BaseCol>
                    </Checkbox>

                    <button
                      className="invisible group-hover:visible "
                      onClick={() => {
                        setAddedMap(
                          new Map<string, boolean>([
                            ...[...addedMap.entries()],
                            [seq.seqId, false] as [string, boolean],
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
