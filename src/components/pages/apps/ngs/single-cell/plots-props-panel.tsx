import { VCenterRow } from '@/layout/v-center-row'
//import { faFolderOpen } from "@fortawesome/free-regular-svg-icons"
//import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons"
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { TrashIcon } from '@/components/icons/trash-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { PropsPanel } from '@/components/props-panel'
import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { LinkButton } from '@/themed/link-button'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useState } from 'react'
import { PlotDialog } from './plot-dialog'

import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { PlusIcon } from '@/components/icons/plus-icon'
import {
  DropdownMenuItem,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { DropdownButton } from '@/components/toolbar/dropdown-button'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { makeUuid, randId } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { Settings2 } from 'lucide-react'
import { TRACK_ITEM_BUTTONS_CLS } from '../../genomic/seq-browser/track-items/seq-track-item'
import { AddGenesDialog } from './add-genes-dialog'

import { useSingleCellSettings, type IGeneSet } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md group`

function PlotItem({
  geneset,
  setShowDialog,
}: {
  geneset: IGeneSet
  setShowDialog: (params: IDialogParams) => void
}) {
  //const { isDragging } = useContext(SortableItemContext)
  //const [isDragging, setIsDragging] = useState(false)

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
      id={geneset.id}
      key={geneset.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            onClick={() => {
              //setPlots(plots.filter(p => p.id !== plot.id))
              setShowDialog({
                id: 'delete',
                params: { geneset },
              })
            }}
            className="stroke-foreground/50 hover:stroke-red-500"
            title="Delete location"
          >
            <TrashIcon stroke="" w="w-4" />
          </button>
        </VCenterRow>
      }
    >
      <VCenterCol
        className="overflow-hidden grow gap-y-1"
        //style={{ color: group.color, fill: group.color }}
      >
        <p className="truncate font-semibold">{geneset.name}</p>
      </VCenterCol>

      <VCenterRow
        className={DRAG_HANDLE_APPEAR_CLS}
        //data-drag={isDragging}
      >
        <button
          title={`Edit ${geneset.name}`}
          className="opacity-50 hover:opacity-100"
          onClick={() => setShowDialog({ id: 'edit', params: { geneset } })}
        >
          <Settings2 className={cn(DRAG_ICON_ANIM_CLS, 'w-4')} />
        </button>
      </VCenterRow>
    </SortableItem>
  )
}

export function PlotsPropsPanel({ datasetId }: { datasetId: string }) {
  const { settings, updateSettings, resetSettings } = useSingleCellSettings()

  //const [text, setText] = useState('')
  //const [makeSignature, setMakeSignature] = useState(false)
  //const [openTabs, setOpenTabs] = useState<string[]>(['plots'])

  const genesets = settings.genesets

  // const plots = useMemo(
  //   () => allPlots.filter(p => p.mode.includes('gex')),
  //   [allPlots]
  // )

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  return (
    <>
      {showDialog.id.includes('edit') && (
        <PlotDialog
          open={true}
          geneset={showDialog.params!['geneset']! as IGeneSet}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.includes('add-genes') && (
        <AddGenesDialog
          open={true}
          datasetId={datasetId}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('reset') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              resetSettings()
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset the plot view?
        </OKCancelDialog>
      )}

      {showDialog.id.startsWith('delete') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              const geneset = showDialog.params!['geneset']! as IGeneSet
              updateSettings(
                produce(settings, draft => {
                  draft.genesets = draft.genesets.filter(
                    g => g.id !== geneset.id
                  )
                })
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete the{' '}
          {(showDialog.params!['geneset']! as IGeneSet).name} plot?
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="justify-between pr-2">
          <DropdownButton
            size="dropdown-with-icon"
            icon={<PlusIcon withCircle={true} />}
            title="Add Plot"
            onMainClick={() =>
              setShowDialog({
                id: randId('add-genes'),
                params: {},
              })
            }
            //align="end"
          >
            <DropdownMenuItem
              aria-label="Genes"
              onClick={() =>
                setShowDialog({
                  id: randId('add-genes'),
                  params: {},
                })
              }
            >
              Genes
            </DropdownMenuItem>

            <MenuSeparator />

            <DropdownMenuItem
              aria-label="Clusters"
              onClick={() => {
                updateSettings(
                  produce(settings, draft => {
                    draft.genesets.push({
                      id: makeUuid(),
                      name: 'Clusters',
                      genes: [],
                      mode: 'clusters',
                    })
                  })
                )
              }}
            >
              Clusters
            </DropdownMenuItem>
          </DropdownButton>

          <LinkButton
            onClick={() => {
              setShowDialog({ id: 'reset', params: {} })
            }}
            title="Reset plots to default view"
          >
            {TEXT_CLEAR}
          </LinkButton>
        </VCenterRow>

        <VScrollPanel>
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            //for the moment do not allow to be re-arranged as it messes up
            //cluster color rendering
            onDragEnd={event => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = genesets.findIndex(
                  plot => plot.id === active.id
                )

                const newIndex = genesets.findIndex(plot => plot.id === over.id)

                const newOrder = arrayMove(
                  genesets.map(plot => plot.id),
                  oldIndex,
                  newIndex
                )

                // setPlots(
                //   newOrder.map(id => plots.find(plot => plot.id === id)!)
                // )

                updateSettings(
                  produce(settings, draft => {
                    draft.genesets = newOrder.map(
                      id => settings.genesets.find(g => g.id === id)!
                    )

                    console.error('draft.genesets', draft.genesets)
                  })
                )
              }

              //setActiveId(null)
            }}
          >
            <SortableContext
              items={genesets.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col">
                {genesets.map(gs => {
                  return (
                    // <BaseSortableItem key={gs.id} id={gs.id}>
                    <PlotItem
                      key={gs.id}
                      geneset={gs}
                      setShowDialog={setShowDialog}
                    />
                    // </BaseSortableItem>
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
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
