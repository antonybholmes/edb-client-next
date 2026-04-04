import { VCenterRow } from '@/layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { ColorPickerButton } from '@/components/color/color-picker-button'
import { PropsPanel } from '@/components/props-panel'
import { DRAG_ICON_ANIM_CLS, SortableItem } from '@/components/sortable-item'
import { NO_DIALOG, TEXT_RESET, type IDialogParams } from '@/consts'
import { LinkButton } from '@/themed/link-button'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { cn } from '@/lib/shadcn-utils'
import { Settings2 } from 'lucide-react'
import { ClusterDialog } from './cluster-dialog'
import { usePlotGrid, type IScrnaCluster } from './plot-grid-store'
import { useSingleCellSettings } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md group justify-between`

function ClusterItem({
  cluster,
  setShowDialog,
  active = null,
}: {
  cluster: IScrnaCluster
  setShowDialog: (params: IDialogParams) => void
  active?: number | null
}) {
  //const { isDragging } = useContext(SortableItemContext)
  //const [isDragging, setIsDragging] = useState(false)
  const { clusterInfo, updateClusterInfo } = usePlotGrid() //useContext(PlotGridContext)!

  const [hover, setHover] = useState(false)

  const hoverMode = hover || cluster.label === active

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
    <SortableItem
      id={cluster.label.toString()}
      key={cluster.label}
      data-drag={cluster.label === active}
      data-hover={hoverMode}
      className={GROUP_CLS}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* <Switch
        checked={cluster.show}
        onCheckedChange={checked => {
          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, draft => {
              draft.clusters.find(c => c.label === cluster.label)!.show =
                checked
            })
          )
        }}
      /> */}

      <Checkbox
        checked={cluster.show}
        onCheckedChange={checked => {
          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, draft => {
              draft.clusters.find(c => c.label === cluster.label)!.show =
                checked
            })
          )
        }}
      />

      <ColorPickerButton
        color={color}
        onColorChange={setColor}
        onOpenChanged={open => {
          if (!open) {
            if (!clusterInfo) {
              return
            }
            updateClusterInfo(
              produce(clusterInfo, draft => {
                draft.clusters.find(c => c.label === cluster.label)!.color =
                  color
              })
            )
          }
        }}
        className="w-4 h-4 rounded-xs aspect-auto shrink-0"
        title="Set color"
      />

      <TruncateSpan className="h-8 grow font-semibold">
        {cluster.name} ({cluster.metadata['scClass']})
      </TruncateSpan>

      <button
        title={`Edit ${cluster.name}`}
        className="opacity-50 hover:opacity-100 focus-visible:opacity-100 shrink-0"
        onClick={() => setShowDialog({ id: 'edit', params: { cluster } })}
      >
        <Settings2 className={cn(DRAG_ICON_ANIM_CLS, 'w-4')} />
      </button>
    </SortableItem>
  )
}

export function ClusterPropsPanel() {
  const { resetSettings } = useSingleCellSettings()
  const { clusterInfo } = usePlotGrid() // useContext(PlotGridContext)!

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  return (
    <>
      {showDialog.id.includes('edit') && (
        <ClusterDialog
          open={true}
          cluster={showDialog.params!['cluster']! as IScrnaCluster}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <PropsPanel className="gap-y-2 pr-1">
        <VCenterRow className="justify-end px-2">
          <LinkButton
            onClick={() => {
              resetSettings()
            }}
            title="Reset Properties to Defaults"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>

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
            items={clusterInfo?.clusters.map(c => c.label) || []}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel>
              <ul className="flex flex-col">
                {clusterInfo?.clusters.map(c => {
                  return (
                    // <BaseSortableItem key={c.id} id={c.id.toString()}>
                    <ClusterItem
                      key={c.label}
                      cluster={c}
                      setShowDialog={setShowDialog}
                    />
                    // </BaseSortableItem>
                  )
                })}
              </ul>
            </VScrollPanel>
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
      </PropsPanel>
    </>
  )
}
