import { VCenterRow } from '@/layout/v-center-row'

import { useState } from 'react'

import { PropsPanel } from '@/components/props-panel'
import {
  NO_DIALOG,
  TEXT_NAME,
  TEXT_OK,
  TEXT_RESET,
  TEXT_UNLABELLED,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid, randId } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import { OpenIcon } from '@/components/icons/open-icon'
import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
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
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { randomHexColor } from '@/lib/color/color'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { DEFAULT_MUTATIONS, type IMutation } from './oncoplot-utils'

interface IMutationElemProps {
  mutation: IMutation
  setDelMutation?: (mutation: IMutation) => void
}

function MutationElem({ mutation, setDelMutation }: IMutationElemProps) {
  const { mutations, setMutations } = useOncoplotSettings()

  return (
    <SortableItem key={mutation.id} id={mutation.id}>
      <ColorPickerButton
        className={SIMPLE_COLOR_EXT_CLS}
        color={mutation.color}
        onColorChange={color => {
          setMutations(
            produce(mutations, draft => {
              const mut = draft.find(m => m.id === mutation.id)
              if (mut) {
                mut.color = color
              }
            })
          )
        }}
      />

      <Input
        placeholder={TEXT_NAME}
        value={mutation.name}
        className="grow min-w-0"
        onTextChange={v =>
          setMutations(
            produce(mutations, draft => {
              const mut = draft.find(m => m.id === mutation.id)
              if (mut) {
                mut.name = v
              }
            })
          )
        }
      />

      {/* <Switch
        checked={mutation.show}
        onCheckedChange={v =>
          setMutations(
            produce(mutations, draft => {
              const mut = draft.find(m => m.id === mutation.id)
              if (mut) {
                mut.show = v
              }
            })
          )
        }
      /> */}

      <VCenterRow className={DRAG_HANDLE_APPEAR_CLS}>
        <button
          className={cn(
            TRANS_COLOR_CLS,
            'stroke-foreground/50 hover:stroke-red-400'
          )}
          onClick={() => setDelMutation?.(mutation)}
          title="Delete feature"
        >
          <TrashIcon stroke="" w="w-4" />
        </button>
      </VCenterRow>
    </SortableItem>
  )
}

export function VariantPropsPanel({ ref }: IDivProps) {
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { mutations, setMutations } = useOncoplotSettings()

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
        setMutations(mutations as IMutation[])
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

      {showDialog.id.includes('reset') && (
        <OKCancelDialog
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              setMutations([...DEFAULT_MUTATIONS])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset all mutations?
        </OKCancelDialog>
      )}

      {showDialog.id.includes('delete') && (
        <OKCancelDialog
          //open={delFeature !== null}
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              setMutations(
                mutations.filter(
                  mutation =>
                    mutation.id !==
                    (showDialog.params!.mutation! as IMutation).id
                )
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete the ${
            (showDialog.params!.mutation! as IMutation).name
              ? (showDialog.params!.mutation! as IMutation).name
              : TEXT_UNLABELLED
          } mutation?`}
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
              onClick={() => downloadJson(mutations, 'mutations.json')}
              title="Save mutations"
            >
              <SaveIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() =>
                setMutations(
                  produce(mutations, draft => {
                    draft.push({
                      id: makeUuid(),
                      name: 'New mutation',
                      color: randomHexColor(),
                      aliases: [],
                      show: true,
                    })
                  })
                )
              }
              title="Add mutation"
            >
              <PlusIcon fill="stroke-foreground" />
            </IconButton>
          </VCenterRow>

          <Button
            variant="link"
            size="sm"
            // ripple={false}
            onClick={() => setShowDialog({ id: randId('reset'), params: {} })}
            //aria-label="Clear All"
            title="Reset mutations"
          >
            {TEXT_RESET}
          </Button>
        </VCenterRow>

        <VScrollPanel>
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={event => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = mutations.findIndex(t => t.id === active.id)
                const newIndex = mutations.findIndex(t => t.id === over.id)
                const newOrder = arrayMove(mutations, oldIndex, newIndex)

                setMutations(newOrder)
              }
            }}
          >
            <SortableContext
              items={mutations.map(mutation => mutation.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col  ">
                {mutations.map(mutation => {
                  return (
                    <MutationElem
                      key={mutation.id}
                      mutation={mutation}
                      setDelMutation={mutation =>
                        setShowDialog({
                          id: randId('delete'),
                          params: { mutation },
                        })
                      }
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
