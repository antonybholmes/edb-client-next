import { VCenterRow } from '@layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { ColorPickerButton } from '@/components/color/color-picker-button'
import { VCenterCol } from '@/components/layout/v-center-col'
import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/accordion'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import {
  DragHandle,
  SortableItem,
  SortableItemContext,
} from '@/components/sortable-item'
import { TEXT_RESET } from '@/consts'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useContext, useEffect, useState } from 'react'
import { PlotGridContext, type IScrnaCluster } from './plot-grid-provider'

import { useUmapSettings } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md`

export function ClusterPropsPanel() {
  const { resetSettings } = useUmapSettings()
  const { clusterInfo, setClusterInfo } = useContext(PlotGridContext)!

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'axes',
    'clusters',
  ])

  function ClusterItem({
    cluster,
    active = null,
  }: {
    cluster: IScrnaCluster
    active?: number | null
  }) {
    const { isDragging } = useContext(SortableItemContext)
    //const [isDragging, setIsDragging] = useState(false)

    const [hover, setHover] = useState(false)

    const hoverMode = hover || isDragging || cluster.clusterId === active

    const [color, setColor] = useState(cluster.color)

    useEffect(() => {
      setColor(cluster.color)
    }, [cluster.color])

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
          key={cluster.clusterId}
          data-drag={cluster.clusterId === active}
          data-hover={hoverMode}
          className={GROUP_CLS}
          // style={{
          //   backgroundColor: hoverMode ? `${group.color}20` : undefined,
          // }}
          //onMouseDown={handleMouseDown}
        >
          <DragHandle />

          {/* <ColorDotButton color={group.color}
                title={`Edit ${group.name} group`}
                onClick={() => editGroup(group)}
              
              /> */}

          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            onOpenChanged={open => {
              if (!open) {
                setClusterInfo(
                  produce(clusterInfo, draft => {
                    draft.clusters.find(
                      c => c.clusterId === cluster.clusterId
                    )!.color = color
                  })
                )
              }
            }}
            className="w-3.5 h-3.5 rounded-full aspect-auto shrink-0"
            title="Set color"
          />

          <VCenterCol
            className="overflow-hidden grow gap-y-1"
            //style={{ color: group.color, fill: group.color }}
          >
            <p className="truncate font-semibold">
              {cluster.scClass} [{cluster.clusterId}]
            </p>
          </VCenterCol>

          {/* <VCenterRow
              //data-drag={isDragging}
              data-hover={hoverMode}
              className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
            >
              <button
                title={`Edit ${cluster.name} group`}
                className="opacity-50 hover:opacity-100"
                onClick={() => editGroup(cluster)}
              >
          
                <SettingsIcon />
              </button>
  
             
            </VCenterRow> */}
        </VCenterRow>

        {/* <VCenterRow
            //data-drag={isDragging}
            data-hover={hoverMode}
            className="gap-x-1 items-center opacity-0 data-[hover=true]:opacity-100 shrink-0"
          >
            <button
              onClick={() => setDelGroup(cluster)}
              className="stroke-foreground/50 hover:stroke-red-500 trans-color"
   
              title={`Delete ${cluster.name} group`}
   
            >
              <TrashIcon stroke="" />
            </button>
          </VCenterRow> */}
      </VCenterRow>
    )
  }

  return (
    <PropsPanel>
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
      <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="clusters">
          <AccordionTrigger>Clusters</AccordionTrigger>
          <AccordionContent>
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              //onDragStart={event => setActiveId(event.active.id as string)}
              // for the moment do not allow to be re-arranged as it messes up
              // cluster color rendering
              // onDragEnd={event => {
              //   const { active, over } = event

              //   if (over && active.id !== over?.id) {
              //     const oldIndex = where(
              //       settings.clusters,
              //       c => c.id === active.id
              //     )[0]!

              //     const newIndex = where(
              //       settings.clusters,
              //       c => c.id === over.id
              //     )[0]!

              //     const newOrder = arrayMove(
              //       settings.clusters.map(c => c.id),
              //       oldIndex,
              //       newIndex
              //     )

              //     console.log(newOrder)

              //     updateSettings(
              //       produce(settings, draft => {
              //         draft.clusters = newOrder.map(
              //           id => settings.clusters.find(c => c.id === id)!
              //         )
              //       })
              //     )
              //   }

              //   //setActiveId(null)
              // }}
            >
              <SortableContext
                items={clusterInfo.clusters.map(c => c.clusterId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col">
                  {clusterInfo.clusters.map(c => {
                    return (
                      <SortableItem
                        key={c.clusterId}
                        id={c.clusterId.toString()}
                      >
                        <ClusterItem key={c.clusterId} cluster={c} />
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
  )
}
