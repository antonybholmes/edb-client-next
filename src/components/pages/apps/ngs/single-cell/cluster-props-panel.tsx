import { VCenterRow } from '@/layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { PropsPanel } from '@/components/props-panel'
import { DRAG_ICON_ANIM_CLS, SortableItem } from '@/components/sortable-item'
import { TEXT_RESET } from '@/consts'
import { LinkButton } from '@/themed/link-button'

import { produce } from 'immer'
import { useEffect, useState } from 'react'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { cn } from '@/lib/shadcn-utils'
import { DragDropProvider } from '@dnd-kit/react'
import { Settings2 } from 'lucide-react'
import { usePlotGrid, type IScrnaCluster } from './plot-grid-store'
import { useSingleCellDialogs } from './single-cell-dialogs'
import { useSingleCellSettings } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md group justify-between`

function ClusterItem({
  cluster,
  index,
  active = null,
}: {
  cluster: IScrnaCluster
  index: number
  active?: number | null
}) {
  const { clusterInfo, updateClusterInfo } = usePlotGrid() //useContext(PlotGridContext)!
  const { open: openDialog } = useSingleCellDialogs()

  const [hover, setHover] = useState(false)

  const hoverMode = hover || cluster.label === active

  const [color, setColor] = useState(cluster.color)

  useEffect(() => {
    setColor(cluster.color)
  }, [cluster.color])

  return (
    <SortableItem
      id={cluster.label.toString()}
      index={index}
      key={cluster.label}
      data-drag={cluster.label === active}
      data-hover={hoverMode}
      className={GROUP_CLS}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Checkbox
        checked={cluster.show}
        onCheckedChange={(checked) => {
          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, (draft) => {
              draft.clusters.find((c) => c.label === cluster.label)!.show =
                checked
            })
          )
        }}
      />

      <FillButton
        colors={[
          {
            color,
            allowNoColor: false,
            onColorChange: ({ color }) => setColor(color),
          },
        ]}
        onOpenChanged={(open) => {
          if (!open) {
            if (!clusterInfo) {
              return
            }
            updateClusterInfo(
              produce(clusterInfo, (draft) => {
                draft.clusters.find((c) => c.label === cluster.label)!.color =
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
        onClick={() =>
          openDialog({ type: 'edit-cluster', payload: { cluster } })
        }
      >
        <Settings2 className={cn(DRAG_ICON_ANIM_CLS, 'w-4')} />
      </button>
    </SortableItem>
  )
}

export function ClusterPropsPanel() {
  const { resetSettings } = useSingleCellSettings()
  const { clusterInfo } = usePlotGrid()

  return (
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
      <VScrollPanel>
        <DragDropProvider>
          <ul className="flex flex-col">
            {clusterInfo?.clusters.map((c, ci) => {
              return <ClusterItem key={c.label} cluster={c} index={ci} />
            })}
          </ul>

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
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
