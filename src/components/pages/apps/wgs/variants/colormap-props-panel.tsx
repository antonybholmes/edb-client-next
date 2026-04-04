import { VCenterRow } from '@/layout/v-center-row'

import { useState } from 'react'

import { PropsPanel } from '@/components/props-panel'
import { NO_DIALOG, TEXT_NAME, type IDialogParams } from '@/consts'
import { SaveIcon } from '@/icons/save-icon'
import { downloadJson } from '@/lib/download-utils'
import { randId } from '@/lib/id'
import { Input } from '@/themed/v2/input'

import { OpenIcon } from '@/components/icons/open-icon'
import { SortableItem } from '@/components/sortable-item'
import { IconButton } from '@/themed/icon-button'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { VScrollPanel } from '@/components/v-scroll-panel'
import {
  useVariantSettings,
  type ICMAP,
  type ICMAPColor,
  type PredefinedCMAP,
} from './variant-settings-store'

interface IGeneElemProps {
  color: ICMAPColor

  //setDelGene?: (gene: IOncoGene) => void
  //setShowDialog: (params: IDialogParams) => void
}

function SortableGeneElem({ color }: IGeneElemProps) {
  const { settings, updateSettings } = useVariantSettings()
  return (
    <SortableItem
      key={color.id}
      id={color.id}
      // extChildren={
      //   <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
      //     <button
      //       className={cn(
      //         TRANS_COLOR_CLS,
      //         'stroke-foreground/50 hover:stroke-red-400'
      //       )}
      //       onClick={() => {
      //         //setGenes(genes.filter(m => m.id !== gene.id))

      //         setShowDialog({
      //           id: 'delete',
      //           params: { gene },
      //         })
      //       }}
      //       title="Delete gene"
      //     >
      //       <TrashIcon stroke="" w="w-4" />
      //     </button>
      //   </VCenterRow>
      // }
    >
      {/* <Checkbox
        checked={gene.show}
        onCheckedChange={v =>
          setGenes(
            produce(genes, draft => {
              const mut = draft.find(m => m.id === gene.id)
              if (mut) {
                mut.show = v
              }
            })
          )
        }
      /> */}

      <ColorPickerButton
        className={SIMPLE_COLOR_EXT_CLS}
        color={color.color}
        onColorChange={v => {
          updateSettings(
            produce(settings, draft => {
              const colToUpdate = draft.variants.cmap.colors.find(
                c => c.id === color.id
              )
              if (colToUpdate) {
                colToUpdate.color = v
              }

              // if this color is used in a predefined cmap, update the color there as well
              // so that the change is reflected in the UI immediately
              if (draft.variants.colorBy in draft.cmaps) {
                const cmapToUpdate =
                  draft.cmaps[draft.variants.colorBy as PredefinedCMAP]

                const colToUpdateInCmap = cmapToUpdate.colors.find(
                  c => c.id === color.id
                )

                if (colToUpdateInCmap) {
                  colToUpdateInCmap.color = v
                }
              }
            })
          )
        }}
      />

      <Input
        placeholder={TEXT_NAME}
        value={color.name}
        className="grow min-w-0"
        onTextChange={v =>
          updateSettings(
            produce(settings, draft => {
              const colToUpdate = draft.variants.cmap.colors.find(
                c => c.id === color.id
              )
              if (colToUpdate) {
                colToUpdate.name = v
              }
            })
          )
        }
      />
    </SortableItem>
  )
}

export function ColormapPropsPanel() {
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { settings, updateSettings } = useVariantSettings()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function openFeatureFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const data = JSON.parse(file.text)

      updateSettings(
        produce(settings, draft => {
          draft.variants.cmap = data as ICMAP
        })
      )
    }
  }

  return (
    <>
      {showDialog.id.startsWith('open') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openFeatureFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}

      {/* {showDialog.id.includes('reset') && (
        <OKCancelDialog
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              setGenes([...DEFAULT_MUTATIONS])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset all mutations?
        </OKCancelDialog>
      )} */}

      {/* {showDialog.id.includes('delete') && (
        <OKCancelDialog
          //open={delFeature !== null}
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              setGenes(
                genes.filter(
                  gene => gene.id !== (showDialog.params!.gene! as IOncoGene).id
                )
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete ${
            (showDialog.params!.gene! as IOncoGene).name
          }?`}
        </OKCancelDialog>
      )} */}

      <PropsPanel className="gap-y-2 pr-1">
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() => setShowDialog({ id: randId('open'), params: {} })}
              title="Open colormap"
            >
              <OpenIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() =>
                downloadJson(settings.variants.cmap, 'colormap.json')
              }
              title="Save colormap"
            >
              <SaveIcon />
            </IconButton>

            {/* <IconButton
              // ripple={false}
              onClick={() =>
                setGenes(
                  produce(genes, draft => {
                    draft.push({
                      id: makeUuid(),
                      name: 'New gene',
                      color: randomHexColor(),
                      show: true,
                    })
                  })
                )
              }
              title="Add gene"
            >
              <PlusIcon fill="stroke-foreground" />
            </IconButton> */}
          </VCenterRow>

          {/* <Button
            variant="link"
            size="sm"
            // ripple={false}
            onClick={() => setShowDialog({ id: randId('reset'), params: {} })}
            //aria-label="Clear All"
            title="Reset genes"
          >
            {TEXT_RESET}
          </Button> */}
        </VCenterRow>

        <MenuSeparator />

        <VScrollPanel>
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={event => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = settings.variants.cmap.colors.findIndex(
                  c => c.id === active.id
                )
                const newIndex = settings.variants.cmap.colors.findIndex(
                  c => c.id === over.id
                )
                const newOrder = arrayMove(
                  settings.variants.cmap.colors,
                  oldIndex,
                  newIndex
                )

                updateSettings(
                  produce(settings, draft => {
                    draft.variants.cmap.colors = newOrder
                  })
                )
              }
            }}
          >
            <SortableContext
              items={settings.variants.cmap.colors.map(color => color.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col  ">
                {settings.variants.cmap.colors.map(color => {
                  return (
                    <SortableGeneElem
                      key={color.id}
                      color={color}
                      //setShowDialog={setShowDialog}
                    />
                  )
                })}
              </ul>
            </SortableContext>
          </DndContext>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
