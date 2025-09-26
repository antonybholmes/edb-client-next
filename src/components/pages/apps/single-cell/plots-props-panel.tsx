import { VCenterRow } from '@layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { SearchIcon } from '@/components/icons/search-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/accordion'
import { Button } from '@/components/shadcn/ui/themed/button'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import {
  DragHandle,
  SortableItem,
  SortableItemContext,
} from '@/components/sortable-item'
import {
  NO_DIALOG,
  TEXT_RESET,
  TEXT_SEARCH,
  type IDialogParams,
} from '@/consts'
import { getColorMap } from '@/lib/color/colormap'
import { API_SCRNA_SEARCH_GENES_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import type { ILim } from '@/lib/math/math'
import { textToLines } from '@/lib/text/lines'
import { truncate } from '@/lib/text/text'
import { queryClient } from '@/query'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useContext, useState } from 'react'
import { PlotDialog } from './plot-dialog'
import {
  PlotGridContext,
  type IScrnaGene,
  type IUmapPlot,
  type PlotMode,
} from './plot-grid-provider'

import { makeNanoIdLen12 } from '@/lib/id'
import { useUmapSettings } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md`

export function PlotsPropsPanel({ datasetId }: { datasetId: string }) {
  const { settings, updateSettings, resetSettings } = useUmapSettings()
  const { fetchAccessToken } = useEdbAuth()

  const { plots, setPlots, clusterInfo } = useContext(PlotGridContext)!

  const [text, setText] = useState('=aicda\n=prdm1')
  const [openTabs, setOpenTabs] = useState<string[]>(['plots'])

  // const plots = useMemo(
  //   () => allPlots.filter(p => p.mode.includes('gex')),
  //   [allPlots]
  // )

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  function PlotItem({
    plot,
    active = null,
  }: {
    plot: IUmapPlot
    active?: string | null
  }) {
    const { isDragging } = useContext(SortableItemContext)
    //const [isDragging, setIsDragging] = useState(false)

    const [hover, setHover] = useState(false)

    const hoverMode = hover || isDragging || plot.id === active

    // const ref = useRef<HTMLDivElement>(null

    // function handleMouseDown() {
    //   function onMouseUp() {
    //     setIsDragging(false)

    //     document.removeEventListener('mouseup', onMouseUp)
    //   }

    //   console.log('Sdfsdfsdfsdf')
    //   setIsDragging(true)

    //   document.addEventListener('mouseup', onMouseUp)
    // }

    //useMouseDownListener(handleMouseDown)

    return (
      <VCenterRow
        className={GROUP_BG_CLS}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VCenterRow
          //ref={ref}
          key={plot.id}
          data-drag={plot.id === active}
          data-hover={hoverMode}
          className={GROUP_CLS}
          // style={{
          //   backgroundColor: hoverMode ? `${group.color}20` : undefined,
          // }}
          //onMouseDown={handleMouseDown}
        >
          <DragHandle />

          <VCenterCol
            className="overflow-hidden grow gap-y-1"
            //style={{ color: group.color, fill: group.color }}
          >
            <p className="truncate font-semibold">{plot.name}</p>
          </VCenterCol>

          <VCenterRow
            //data-drag={isDragging}
            data-hover={hoverMode}
            className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
          >
            <button
              title={`Edit ${plot.name}`}
              className="opacity-50 hover:opacity-100"
              onClick={() => setShowDialog({ id: 'edit', params: { plot } })}
            >
              <SettingsIcon />
            </button>
          </VCenterRow>
        </VCenterRow>

        <VCenterRow
          //data-drag={isDragging}
          data-hover={hoverMode}
          className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
        >
          <button
            onClick={() => setPlots(plots.filter((p) => p.id !== plot.id))}
            className="stroke-foreground/50 hover:stroke-red-500 trans-color"
            title={`Delete ${plot.name}`}
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      </VCenterRow>
    )
  }

  async function search() {
    const ids = textToLines(text, { trim: true })

    console.log(ids)

    const newGenes: IScrnaGene[] = []

    for (const id of ids) {
      const res = await queryClient.fetchQuery({
        queryKey: ['genes', datasetId, id],
        queryFn: async () => {
          const accessToken = await fetchAccessToken()

          if (!accessToken) {
            return []
          }

          const res = await httpFetch.getJson<{ data: IScrnaGene[] }>(
            `${API_SCRNA_SEARCH_GENES_URL}/${datasetId}?q=${encodeURIComponent(id)}`,

            { headers: bearerHeaders(accessToken) }
          )

          //console.log(res.data)

          return res.data
        },
      })

      const genes: IScrnaGene[] = res

      console.log(genes)

      newGenes.push(...genes)
    }

    if (newGenes.length > 0) {
      const geneset = {
        id: makeNanoIdLen12(),
        name: truncate(newGenes.map((g) => g.geneSymbol).join(', ')),
        genes: newGenes,
      }

      // add new plots for each gene set
      setPlots([
        ...plots,
        {
          id: makeNanoIdLen12(),
          name: truncate(newGenes.map((g) => g.geneSymbol).join(', ')),
          geneset,
          mode: 'global-gex' as PlotMode,
          clusters: clusterInfo.clusters,
          gex: {
            hueOrder: [],
            hue: [],
            range: [0, 1] as ILim,
          },
          palette: getColorMap(settings.cmap),
        },
      ])

      updateSettings(
        produce(settings, (draft) => {
          draft.genesets.push(geneset)
        })
      )
    }

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  return (
    <>
      {showDialog.id.includes('edit') && (
        <PlotDialog
          open={true}
          plot={showDialog.params!['plot']! as IUmapPlot}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="justify-end pb-2">
          <LinkButton
            onClick={() => {
              resetSettings()
            }}
            title="Reset Properties to Defaults"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>

        <Textarea
          id="filter"
          aria-label="Filter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Search...`}
          className="h-32"
        />
        <VCenterRow>
          <Button variant="theme" ripple={false} onClick={() => search()}>
            <SearchIcon stroke="stroke-white" />
            <span>{TEXT_SEARCH}</span>
          </Button>
        </VCenterRow>
        <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
          <AccordionItem value="plots">
            <AccordionTrigger>Plots</AccordionTrigger>
            <AccordionContent>
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                //onDragStart={event => setActiveId(event.active.id as string)}
                //for the moment do not allow to be re-arranged as it messes up
                //cluster color rendering
                onDragEnd={(event) => {
                  const { active, over } = event

                  if (over && active.id !== over?.id) {
                    const oldIndex = plots.findIndex(
                      (plot) => plot.id === active.id
                    )

                    const newIndex = plots.findIndex(
                      (plot) => plot.id === over.id
                    )

                    const newOrder = arrayMove(
                      plots.map((plot) => plot.id),
                      oldIndex,
                      newIndex
                    )

                    setPlots(
                      newOrder.map(
                        (id) => plots.find((plot) => plot.id === id)!
                      )
                    )
                  }

                  //setActiveId(null)
                }}
              >
                <SortableContext
                  items={plots.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col">
                    {plots.map((p) => {
                      return (
                        <SortableItem key={p.id} id={p.id}>
                          <PlotItem key={p.id} plot={p} />
                        </SortableItem>
                      )
                    })}
                  </ul>
                </SortableContext>

                {/* <DragOverlay>
                {activeId ? (
                  <TrackItem
                    index={-1}
                    location={locations.filter(l => l.loc === activeId)[0]!}
                    key={activeId}
                    active={activeId}
                  />
                ) : null}
              </DragOverlay> */}
              </DndContext>
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
