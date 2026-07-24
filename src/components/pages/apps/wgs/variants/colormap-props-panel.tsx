import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import { TEXT_NAME } from '@/consts'
import { downloadJson } from '@/lib/download-utils'
import { Input } from '@/themed/v2/input'

import { SortableItem } from '@/components/sortable-item'
import { IconButton } from '@/themed/icon-button'

import { produce } from 'immer'

import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import {
  useVariantSettings,
  type ICMAP,
  type ICMAPColor,
  type PredefinedCMAP,
} from './variant-settings-store'

interface IGeneElemProps {
  color: ICMAPColor
}

function SortableGeneElem({
  color,
  index,
}: IGeneElemProps & { index: number }) {
  const { settings, updateSettings } = useVariantSettings()
  return (
    <SortableItem key={color.id} id={color.id} index={index}>
      <FillButton
        colors={[
          {
            color: color.color,
            allowNoColor: false,
            onColorChange: ({ color: newColor }) => {
              updateSettings(
                produce(settings, (draft) => {
                  const colToUpdate = draft.variants.cmap.colors.find(
                    (c) => c.id === color.id
                  )
                  if (colToUpdate) {
                    colToUpdate.color = newColor
                  }

                  // if this color is used in a predefined cmap, update the color there as well
                  // so that the change is reflected in the UI immediately
                  if (draft.variants.colorBy in draft.cmaps) {
                    const cmapToUpdate =
                      draft.cmaps[draft.variants.colorBy as PredefinedCMAP]

                    const colToUpdateInCmap = cmapToUpdate.colors.find(
                      (c) => c.id === color.id
                    )

                    if (colToUpdateInCmap) {
                      colToUpdateInCmap.color = newColor
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
        onTextChange={(v) =>
          updateSettings(
            produce(settings, (draft) => {
              const colToUpdate = draft.variants.cmap.colors.find(
                (c) => c.id === color.id
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

  // const { open: openDialog } = useDialogs()

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  function openFeatureFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const data = JSON.parse(file.text)

      updateSettings(
        produce(settings, (draft) => {
          draft.variants.cmap = data as ICMAP
        })
      )
    }
  }

  return (
    <PropsPanel className="gap-y-2 pr-1">
      <SideBarHeader className="justify-between gap-x-2">
        <VCenterRow>
          <IconButton
            onClick={() => {
              openFilesDialog({
                message: 'Select colormap file to open',
                fileTypes: ['json'],
                onFileChange: (message, files) => {
                  onTextFileChange(message, files, (files) => {
                    openFeatureFiles(files)
                  })
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
      </SideBarHeader>

      <MenuSeparator />

      <VScrollPanel>
        <DragDropProvider
          onDragEnd={(event) => {
            const newOrder = move(settings.variants.cmap.colors, event)

            updateSettings(
              produce(settings, (draft) => {
                draft.variants.cmap.colors = newOrder
              })
            )
          }}
        >
          <ul className="flex flex-col  ">
            {settings.variants.cmap.colors.map((color, ci) => {
              return (
                <SortableGeneElem key={color.id} color={color} index={ci} />
              )
            })}
          </ul>
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
