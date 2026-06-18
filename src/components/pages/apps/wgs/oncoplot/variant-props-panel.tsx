import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import { TEXT_NAME, TEXT_OK, TEXT_RESET, TEXT_UNLABELLED } from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

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
        colors={[
          {
            color: mutation.color,
            onColorChange: color => {
              setMutations(
                produce(mutations, draft => {
                  const mut = draft.find(m => m.id === mutation.id)
                  if (mut) {
                    mut.color = color
                  }
                })
              )
            },
          },
        ]}
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
          <TrashIcon stroke="" />
        </button>
      </VCenterRow>
    </SortableItem>
  )
}

export function VariantPropsPanel({ ref }: IDivProps) {
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)

  const { open: openDialog } = useDialogs()

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
      <PropsPanel ref={ref} className="gap-y-2 pr-1">
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() =>
                openDialog({
                  type: 'open',
                  payload: {
                    message: 'Select mutation file to open',
                    fileTypes: ['json'],
                    callback: (message, files) => {
                      onTextFileChange(message, files, files => {
                        openFeatureFiles(files)
                      })
                    },
                  },
                })
              }
              title="Open mutations"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() => downloadJson(mutations, 'variants.json')}
              title="Save variants"
            >
              <DownloadIcon />
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
            //size="sm"
            // ripple={false}
            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  content: 'Are you sure you want to reset all mutations?',
                  callback: response => {
                    if (response === TEXT_OK) {
                      setMutations([...DEFAULT_MUTATIONS])
                    }
                  },
                },
              })
            }}
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
                      setDelMutation={mutation => {
                        openDialog({
                          type: 'warning',
                          payload: {
                            content: `Are you sure you want to delete the ${
                              mutation.name ? mutation.name : TEXT_UNLABELLED
                            } mutation?`,
                            callback: response => {
                              if (response === TEXT_OK) {
                                setMutations(
                                  mutations.filter(m => m.id !== mutation.id)
                                )
                              }
                            },
                          },
                        })
                      }}
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
