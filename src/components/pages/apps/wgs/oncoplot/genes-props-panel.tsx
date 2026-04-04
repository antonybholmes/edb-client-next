import { VCenterRow } from '@/layout/v-center-row'

import { useState } from 'react'

import { PropsPanel } from '@/components/props-panel'
import { NO_DIALOG, TEXT_NAME, TEXT_OK, type IDialogParams } from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid, randId } from '@/lib/id'
import { Input } from '@/themed/v2/input'

import { OpenIcon } from '@/components/icons/open-icon'
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

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { TrashIcon } from '@/components/icons/trash-icon'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
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
  setShowDialog: (params: IDialogParams) => void
}

function SortableGeneElem({ gene, setShowDialog }: IGeneElemProps) {
  const { genes, setGenes } = useOncoplot()

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
              //setGenes(genes.filter(m => m.id !== gene.id))

              setShowDialog({
                id: 'delete',
                params: { gene },
              })
            }}
            title="Delete gene"
          >
            <TrashIcon stroke="" w="w-4" />
          </button>
        </VCenterRow>
      }
    >
      <Checkbox
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
      />

      <ColorPickerButton
        className={SIMPLE_COLOR_EXT_CLS}
        color={gene.color}
        onColorChange={color => {
          setGenes(
            produce(genes, draft => {
              const mut = draft.find(m => m.id === gene.id)
              if (mut) {
                mut.color = color
              }
            })
          )
        }}
      />

      <Input
        placeholder={TEXT_NAME}
        value={gene.name}
        className="grow min-w-0"
        onTextChange={v =>
          setGenes(
            produce(genes, draft => {
              const mut = draft.find(m => m.id === gene.id)
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
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { genes, setGenes } = useOncoplot()

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

      {showDialog.id.includes('delete') && (
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
      )}

      <PropsPanel ref={ref} className="gap-y-2 pr-1">
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() => setShowDialog({ id: randId('open'), params: {} })}
              title="Open mutations"
            >
              <OpenIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() => downloadJson(genes, 'genes.json')}
              title="Save genes"
            >
              <SaveIcon />
            </IconButton>

            <IconButton
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
            </IconButton>
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
                const oldIndex = genes.findIndex(t => t.id === active.id)
                const newIndex = genes.findIndex(t => t.id === over.id)
                const newOrder = arrayMove(genes, oldIndex, newIndex)

                setGenes(newOrder)
              }
            }}
          >
            <SortableContext
              items={genes.map(gene => gene.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col  ">
                {genes.map(gene => {
                  return (
                    <SortableGeneElem
                      key={gene.id}
                      gene={gene}
                      setShowDialog={setShowDialog}
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
