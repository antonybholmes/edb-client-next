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
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { LinkButton } from '@/themed/link-button'

import { produce } from 'immer'

import { PlusIcon } from '@/components/icons/plus-icon'
import {
  DropdownMenuItem,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { DropdownButton } from '@/components/toolbar/dropdown-button'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { Settings2 } from 'lucide-react'
import { TRACK_ITEM_BUTTONS_CLS } from '../../genomic/seq-browser/track-items/seq-track-item'

import { useDialogs } from '@/components/dialogs/dialogs'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useSingleCellDialogs } from './single-cell-dialogs'
import { useSingleCellSettings, type IGeneSet } from './single-cell-settings'

export const GROUP_BG_CLS = 'rounded-theme group gap-x-1'

export const GROUP_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  data-[hover=true]:bg-muted data-[drag=true]:shadow-md group`

function PlotItem({ geneset, index }: { geneset: IGeneSet; index: number }) {
  const { open: openDialog } = useDialogs()
  const { open: openSingleCellDialog } = useSingleCellDialogs()
  const { updateSettings, settings } = useSingleCellSettings()

  return (
    <SortableItem
      id={geneset.id}
      index={index}
      key={geneset.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  title: 'Delete Plot',
                  content: `Are you sure you want to delete the ${geneset.name} plot?`,
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.genesets = draft.genesets.filter(
                            (g) => g.id !== geneset.id
                          )
                        })
                      )
                    }
                  },
                },
              })
            }}
            className="stroke-foreground/50 hover:stroke-destructive"
            title="Delete location"
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      }
    >
      <VCenterCol className="overflow-hidden grow gap-y-1">
        <p className="truncate font-semibold">{geneset.name}</p>
      </VCenterCol>

      <VCenterRow className={DRAG_HANDLE_APPEAR_CLS}>
        <button
          title={`Edit ${geneset.name}`}
          className="opacity-50 hover:opacity-100"
          onClick={() => {
            openSingleCellDialog({ type: 'edit-plot', payload: { geneset } })
          }}
        >
          <Settings2 className={cn(DRAG_ICON_ANIM_CLS, 'w-4')} />
        </button>
      </VCenterRow>
    </SortableItem>
  )
}

export function PlotsPropsPanel() {
  const { settings, updateSettings, resetSettings } = useSingleCellSettings()

  const { open: openDialog } = useDialogs()
  const { open: openSingleCellDialog } = useSingleCellDialogs()
  const genesets = settings.genesets

  return (
    <PropsPanel className="gap-y-2">
      <VCenterRow className="justify-between pr-2">
        <DropdownButton
          size="dropdown-with-icon"
          icon={<PlusIcon withCircle={true} />}
          title="Add Plot"
          onMainClick={() => {
            openSingleCellDialog({ type: 'add-genes', payload: {} })
          }}
          //align="end"
        >
          <DropdownMenuItem
            aria-label="Genes"
            onClick={() =>
              openSingleCellDialog({
                type: 'add-genes',
                payload: {},
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
                produce(settings, (draft) => {
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
            openDialog({
              type: 'warning',
              payload: {
                title: 'Reset Plots',
                content:
                  'Are you sure you want to reset the plots to default view?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset plots to default view"
        >
          {TEXT_CLEAR}
        </LinkButton>
      </VCenterRow>

      <VScrollPanel>
        <DragDropProvider
          onDragEnd={(event) => {
            const newOrder = move(genesets, event)

            updateSettings(
              produce(settings, (draft) => {
                draft.genesets = newOrder

                console.error('draft.genesets', draft.genesets)
              })
            )
          }}
        >
          <ul className="flex flex-col">
            {genesets.map((gs, gi) => {
              return <PlotItem key={gs.id} geneset={gs} index={gi} />
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
