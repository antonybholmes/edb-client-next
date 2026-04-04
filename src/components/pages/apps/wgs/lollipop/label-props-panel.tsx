import { VCenterRow } from '@/layout/v-center-row'

import { useState } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { OpenIcon } from '@/components/icons/open-icon'
import { BaseCol } from '@/components/layout/base-col'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import {
  NO_DIALOG,
  TEXT_ADD,
  TEXT_CLEAR,
  TEXT_NAME,
  TEXT_OK,
  TEXT_SHOW,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { TrashIcon } from '@/icons/trash-icon'
import type { IDivProps } from '@/interfaces/div-props'
import { COLOR_BLACK } from '@/lib/color/color'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid, randId } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { IconButton } from '@/themed/icon-button'
import { NumericalInput } from '@/themed/numerical-input'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useLollipopSettings } from './lollipop-settings-store'
import { useLollipopStore } from './lollipop-store'
import { DEFAULT_FEATURE_COLOR, type IProteinLabel } from './lollipop-utils'

export function LabelPropsPanel({ ref }: IDivProps) {
  const { protein } = useLollipopSettings()
  const { aaStats, labels, setLabels } = useLollipopStore()
  //const [delLabel, setDelLabel] = useState<IProteinLabel | null>(null)

  const { displayProps, setDisplayProps } = useLollipopSettings()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [confirmClear, setConfirmClear] = useState(false)
  const [positions, setPositions] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function openLabelFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const labels = JSON.parse(file.text)

      if (Array.isArray(labels)) {
        setLabels(labels as IProteinLabel[])
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
              openLabelFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}

      {showDialog.id.includes('clear') && (
        <OKCancelDialog
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              setLabels([])
            }

            //setConfirmClear(false)

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to clear all features?
        </OKCancelDialog>
      )}

      {showDialog.id.includes('delete') && (
        <OKCancelDialog
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              setLabels(
                labels.filter(
                  feature =>
                    feature.id !==
                    (showDialog!.params!.label as IProteinLabel).id
                )
              )
            }
            //setDelLabel(null)

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete this label?
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="gap-y-2 pr-1">
        <h2 className="font-semibold text-lg">Labels</h2>

        <VCenterRow className="justify-between gap-x-2 items-stretch">
          <VCenterRow className="gap-x-2">
            <VCenterRow>
              <IconButton
                onClick={() =>
                  setShowDialog({ id: randId('open'), params: {} })
                }
                title="Open features"
              >
                <OpenIcon />
              </IconButton>

              <IconButton
                // ripple={false}
                onClick={() => downloadJson(labels, 'labels.json')}
                title="Save labels"
              >
                <SaveIcon className="rotate-180" />
              </IconButton>

              <IconButton
                // ripple={false}
                onClick={() =>
                  setLabels([
                    ...labels,
                    {
                      id: makeUuid(),
                      name: `${protein?.sequence[0] ?? ''}1`,
                      start: 1,
                      color: DEFAULT_FEATURE_COLOR,
                      show: true,
                    },
                  ])
                }
                title="Add label"
              >
                <PlusIcon fill="stroke-foreground" />
              </IconButton>
            </VCenterRow>
            <ToolbarSeparator />
            <Checkbox
              checked={displayProps.labels.show}
              onCheckedChange={state =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.labels.show = state
                  })
                )
              }
            >
              {TEXT_SHOW}
            </Checkbox>
          </VCenterRow>

          {labels.length > 0 && (
            <Button
              variant="link"
              size="sm"
              // ripple={false}
              onClick={() => setShowDialog({ id: randId('clear'), params: {} })}
              //aria-label="Clear All"
              title="Clear all labels"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <VCenterRow className="justify-between gap-x-2">
          <Input
            placeholder="Positions"
            className="grow shrink-0 text-center rounded-theme"
            value={positions}
            onChange={e => setPositions(e.currentTarget.value)}
          />
          <Button
            variant="theme"
            onClick={() => {
              const used = new Set<number>(labels.map(label => label.start))

              const newLabels: IProteinLabel[] = positions
                .trim()
                .split(',')
                .map((s: string) => {
                  const v = parseInt(s.trim())

                  return {
                    id: makeUuid(),
                    name: `${protein?.sequence[v - 1] ?? ''}${v}`,
                    start: v,
                    color: COLOR_BLACK,
                    show: true,
                  }
                })
                .filter(label => !used.has(label.start))

              if (newLabels.length > 0) {
                setLabels([...labels, ...newLabels])
              }
            }}
          >
            {TEXT_ADD}
          </Button>
        </VCenterRow>

        <LineSeparator />

        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
          // onDragEnd={event => {
          //   const { active, over } = event

          //   if (over && active.id !== over?.id) {
          //     const oldIndex = features.findIndex(t => t.id === active.id)
          //     const newIndex = features.findIndex(t => t.id === over.id)
          //     const newOrder = arrayMove(features, oldIndex, newIndex)

          //     setFeatures(newOrder)
          //   }
          // }}
        >
          <SortableContext
            items={labels.map((label, li) => `label-${label}-${li}`)}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel>
              <ul className="flex flex-col">
                {labels.map((label, li) => {
                  const id = `label-${label}-${li}`
                  return (
                    <SortableItem
                      key={id}
                      id={id}
                      extChildren={
                        <VCenterRow className={DRAG_HANDLE_APPEAR_CLS}>
                          <button
                            className={cn(
                              TRANS_COLOR_CLS,
                              'stroke-foreground/50 hover:stroke-red-400'
                            )}
                            onClick={() =>
                              setShowDialog({
                                id: randId('delete'),
                                params: { label },
                              })
                            }
                            title="Delete label"
                          >
                            <TrashIcon stroke="" w="w-4" />
                          </button>
                        </VCenterRow>
                      }
                    >
                      <Checkbox
                        checked={label.show}
                        onCheckedChange={state =>
                          setLabels(
                            produce(labels, draft => {
                              draft[li]!.show = state
                            })
                          )
                        }
                      />

                      <ColorPickerButton
                        color={label.color}
                        onColorChange={color =>
                          setLabels(
                            produce(labels, draft => {
                              draft[li]!.color = color
                            })
                          )
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Label color"
                      />
                      <BaseCol className="gap-y-1 grow">
                        <Input
                          id={li.toString()}
                          placeholder={TEXT_NAME}
                          value={label.name}
                          w="grow"
                          onTextChange={v => {
                            setLabels(
                              produce(labels, draft => {
                                draft[li]!.name = v
                              })
                            )
                          }}
                        />

                        <VCenterRow className="gap-x-2">
                          <NumericalInput
                            value={label.start}
                            placeholder="Start"
                            onNumChange={v => {
                              setLabels(
                                produce(labels, draft => {
                                  draft[li]!.start = Math.max(
                                    1,
                                    Math.min(v, aaStats.length)
                                  )
                                })
                              )
                            }}
                          />
                        </VCenterRow>
                      </BaseCol>
                    </SortableItem>
                  )
                })}
              </ul>
            </VScrollPanel>
          </SortableContext>
        </DndContext>
      </PropsPanel>
    </>
  )
}
