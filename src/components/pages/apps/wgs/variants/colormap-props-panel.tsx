import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import { TEXT_NAME } from '@/consts'
import { downloadJson } from '@/lib/download-utils'
import { Input } from '@/themed/v2/input'

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

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import {
  onTextFileChange,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
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
}

function SortableGeneElem({ color }: IGeneElemProps) {
  const { settings, updateSettings } = useVariantSettings()
  return (
    <SortableItem key={color.id} id={color.id}>
      <ColorPickerButton
        className={SIMPLE_COLOR_EXT_CLS}
        colors={[
          {
            color: color.color,
            onColorChange: v => {
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
            },
          },
        ]}
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

  const { settings, updateSettings } = useVariantSettings()

  const { open: openDialog } = useDialogs()

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
    <PropsPanel className="gap-y-2 pr-1">
      <VCenterRow className="justify-between gap-x-2">
        <VCenterRow>
          <IconButton
            onClick={() => {
              openDialog({
                type: 'open',
                payload: {
                  fileTypes: ['json'],
                  callback: (message, files) => {
                    onTextFileChange(message, files, files => {
                      openFeatureFiles(files)
                    })
                  },
                },
              })
            }}
            title="Open colormap"
          >
            <UploadIcon />
          </IconButton>

          <IconButton
            // ripple={false}
            onClick={() =>
              downloadJson(settings.variants.cmap, 'colormap.json')
            }
            title="Save colormap"
          >
            <DownloadIcon />
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
                return <SortableGeneElem key={color.id} color={color} />
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </VScrollPanel>
    </PropsPanel>
  )
}
