import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import { TEXT_NAME, TEXT_OK } from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid } from '@/lib/id'
import { Input } from '@/themed/v2/input'

import { SortableItem } from '@/components/sortable-item'
import type { IDivProps } from '@/interfaces/div-props'
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
import { TrashIcon } from '@/components/icons/trash-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { randomHexColor } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { TRACK_ITEM_BUTTONS_CLS } from '../../genomic/seq-browser/track-items/seq-track-item'
import { useOncoplot } from './oncoplot-store'
import { type IOncoGene } from './oncoplot-utils'

interface IGeneElemProps {
  gene: IOncoGene

  setDelGene?: (gene: IOncoGene) => void
}

function SortableGeneElem({ gene }: IGeneElemProps) {
  const { genes, setGenes } = useOncoplot()
  const { open: openDialog } = useDialogs()

  return (
    <SortableItem
      key={gene.id}
      id={gene.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            className={cn(
              TRANS_COLOR_CLS,
              'stroke-foreground/50 hover:stroke-red-400'
            )}
            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  content: `Are you sure you want to delete ${gene.name}?`,
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      setGenes(genes.filter((m) => m.id !== gene.id))
                    }
                  },
                },
              })
            }}
            title="Delete gene"
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      }
    >
      <Checkbox
        checked={gene.show}
        onCheckedChange={(v) =>
          setGenes(
            produce(genes, (draft) => {
              const mut = draft.find((m) => m.id === gene.id)
              if (mut) {
                mut.show = v
              }
            })
          )
        }
      />

      <FillButton
        colors={[
          {
            color: gene.color,
            allowNoColor: false,
            onColorChange: ({ color }) => {
              setGenes(
                produce(genes, (draft) => {
                  const g = draft.find((m) => m.id === gene.id)
                  if (g) {
                    g.color = color
                  }
                })
              )
            },
          },
        ]}
      />

      <Input
        placeholder={TEXT_NAME}
        value={gene.name}
        className="grow min-w-0"
        onTextChange={(v) =>
          setGenes(
            produce(genes, (draft) => {
              const mut = draft.find((m) => m.id === gene.id)
              if (mut) {
                mut.name = v
              }
            })
          )
        }
      />
    </SortableItem>
  )
}

export function GenePropsPanel({ ref }: IDivProps) {
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)

  const { genes, setGenes } = useOncoplot()

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
      const mutations = JSON.parse(file.text)

      if (Array.isArray(mutations)) {
        setGenes(mutations as IOncoGene[])
      }
    }
  }

  return (
    <PropsPanel ref={ref} className="gap-y-2 pr-1">
      <VCenterRow className="justify-between gap-x-2">
        <VCenterRow>
          <IconButton
            onClick={() => {
              openFilesDialog({
                fileTypes: ['json'],
                onFileChange: (message, files) =>
                  onTextFileChange(message, files, (files) => {
                    openFeatureFiles(files)
                  }),
              })
            }}
            title="Open mutations"
          >
            <UploadIcon />
          </IconButton>

          <IconButton
            // ripple={false}
            onClick={() => downloadJson(genes, 'genes.json')}
            title="Save genes"
          >
            <DownloadIcon />
          </IconButton>

          <ToolbarSeparator />

          <IconButton
            // ripple={false}
            onClick={() =>
              setGenes(
                produce(genes, (draft) => {
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
          </IconButton>
        </VCenterRow>
      </VCenterRow>

      <MenuSeparator />

      <VScrollPanel>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = genes.findIndex((t) => t.id === active.id)
              const newIndex = genes.findIndex((t) => t.id === over.id)
              const newOrder = arrayMove(genes, oldIndex, newIndex)

              setGenes(newOrder)
            }
          }}
        >
          <SortableContext
            items={genes.map((gene) => gene.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col  ">
              {genes.map((gene) => {
                return <SortableGeneElem key={gene.id} gene={gene} />
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </VScrollPanel>
    </PropsPanel>
  )
}
