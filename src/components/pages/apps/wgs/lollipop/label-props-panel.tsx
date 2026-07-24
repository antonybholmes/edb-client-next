import { VCenterRow } from '@/layout/v-center-row'

import { useState } from 'react'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import { BaseCol } from '@/components/layout/base-col'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_ADD, TEXT_CLEAR, TEXT_NAME, TEXT_OK, TEXT_SHOW } from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { TrashIcon } from '@/icons/trash-icon'
import type { IDivProps } from '@/interfaces/div-props'
import { COLOR_BLACK } from '@/lib/color/color'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { IconButton } from '@/themed/icon-button'
import { NumericalInput } from '@/themed/numerical-input'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import { DragDropProvider } from '@dnd-kit/react'
import { produce } from 'immer'
import { useLollipopSettings } from './lollipop-settings-store'
import { useLollipopStore } from './lollipop-store'
import { DEFAULT_FEATURE_COLOR, type IProteinLabel } from './lollipop-utils'

export function LabelPropsPanel({ ref }: IDivProps) {
  const { protein } = useLollipopSettings()
  const { aaStats, labels, setLabels } = useLollipopStore()
  //const [delLabel, setDelLabel] = useState<IProteinLabel | null>(null)

  const { displayProps, setDisplayProps } = useLollipopSettings()

  const { open: openDialog } = useDialogs()

  //const [confirmClear, setConfirmClear] = useState(false)
  const [positions, setPositions] = useState('')

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

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
    <PropsPanel ref={ref} className="gap-y-2 pr-1">
      {/* <h2 className="font-semibold text-lg">Labels</h2> */}

      <VCenterRow className="justify-between gap-x-2 items-stretch">
        <VCenterRow className="gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() => {
                openFilesDialog({
                  fileTypes: ['json'],
                  onFileChange: (message, files) =>
                    onTextFileChange(message, files, (files) => {
                      openLabelFiles(files)
                    }),
                })
              }}
              title="Open labels"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() => downloadJson(labels, 'labels.json')}
              title="Save labels"
            >
              <DownloadIcon />
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
            onCheckedChange={(state) =>
              setDisplayProps(
                produce(displayProps, (draft) => {
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
            // size="sm"
            // ripple={false}
            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  content: 'Are you sure you want to clear all labels?',
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      setLabels([])
                    }
                  },
                },
              })
            }}
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
          onChange={(e) => setPositions(e.currentTarget.value)}
        />
        <Button
          variant="app-theme"
          onClick={() => {
            const used = new Set<number>(labels.map((label) => label.start))

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
              .filter((label) => !used.has(label.start))

            if (newLabels.length > 0) {
              setLabels([...labels, ...newLabels])
            }
          }}
        >
          {TEXT_ADD}
        </Button>
      </VCenterRow>

      <LineSeparator />
      <VScrollPanel>
        <DragDropProvider

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
          <ul className="flex flex-col">
            {labels.map((label, li) => {
              const id = `label-${label}-${li}`
              return (
                <SortableItem
                  key={id}
                  id={id}
                  index={li}
                  extChildren={
                    <VCenterRow className={DRAG_HANDLE_APPEAR_CLS}>
                      <button
                        className={cn(
                          TRANS_COLOR_CLS,
                          'stroke-foreground/50 hover:stroke-red-400'
                        )}
                        onClick={() => {
                          openDialog({
                            type: 'warning',
                            payload: {
                              content:
                                'Are you sure you want to delete this label?',
                              callback: (response) => {
                                if (response === TEXT_OK) {
                                  setLabels(
                                    labels.filter((l) => l.id !== label.id)
                                  )
                                }
                              },
                            },
                          })
                        }}
                        title="Delete label"
                      >
                        <TrashIcon stroke="" />
                      </button>
                    </VCenterRow>
                  }
                >
                  <Checkbox
                    checked={label.show}
                    onCheckedChange={(state) =>
                      setLabels(
                        produce(labels, (draft) => {
                          draft[li]!.show = state
                        })
                      )
                    }
                  />

                  <FillButton
                    colors={[
                      {
                        color: label.color,
                        allowNoColor: false,
                        onColorChange: ({ color }) =>
                          setLabels(
                            produce(labels, (draft) => {
                              draft[li]!.color = color
                            })
                          ),
                      },
                    ]}
                    className={SIMPLE_COLOR_EXT_CLS}
                    title="Label color"
                  />
                  <BaseCol className="gap-y-1 grow">
                    <Input
                      id={li.toString()}
                      placeholder={TEXT_NAME}
                      value={label.name}
                      w="grow"
                      onTextChange={(v) => {
                        setLabels(
                          produce(labels, (draft) => {
                            draft[li]!.name = v
                          })
                        )
                      }}
                    />

                    <VCenterRow className="gap-x-2">
                      <NumericalInput
                        value={label.start}
                        placeholder="Start"
                        onNumChange={(v) => {
                          setLabels(
                            produce(labels, (draft) => {
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
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
