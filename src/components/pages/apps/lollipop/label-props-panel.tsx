import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'

import { useContext, useState } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { OpenIcon } from '@/components/icons/open-icon'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  NO_DIALOG,
  TEXT_ADD,
  TEXT_CLEAR,
  TEXT_NAME,
  TEXT_OK,
  type IDialogParams,
} from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import { TRANS_COLOR_CLS } from '@/theme'
import { PropsPanel } from '@components/props-panel'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PlusIcon } from '@icons/plus-icon'
import { SaveIcon } from '@icons/save-icon'
import { TrashIcon } from '@icons/trash-icon'
import { COLOR_BLACK } from '@lib/color/color'
import { downloadJson } from '@lib/download-utils'
import { cn } from '@lib/shadcn-utils'
import { nanoid, randId } from '@lib/utils'
import { Button } from '@themed/button'
import { Input } from '@themed/input'
import { Switch } from '@themed/switch'
import { produce } from 'immer'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '../../open-files'
import { LollipopContext } from './lollipop-provider'
import { useLollipopSettings } from './lollipop-settings-store'
import { DEFAULT_FEATURE_COLOR, type IProteinLabel } from './lollipop-utils'

export function LabelPropsPanel({ ref }: IDivProps) {
  const { protein, aaStats, labels, setLabels } = useContext(LollipopContext)!
  //const [delLabel, setDelLabel] = useState<IProteinLabel | null>(null)

  const { displayProps, setDisplayProps } = useLollipopSettings()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [confirmClear, setConfirmClear] = useState(false)
  const [positions, setPositions] = useState('')

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
          {`Are you sure you want to delete this label?`}
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="gap-y-4">
        {/* <h2 className={PROPS_TITLE_CLS}>Settings</h2> */}

        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            {/* <Button
                variant="muted"
                size="icon"
                rounded="full"
                onClick={() => setOpen(makeRandId("open"))}
                aria-label="Open groups"
              >
                <OpenIcon fill="" />
              </Button> */}

            <IconButton
              onClick={() => setShowDialog({ id: randId('open'), params: {} })}
              title="Open features"
            >
              <OpenIcon />
            </IconButton>

            <IconButton
              ripple={false}
              onClick={() => downloadJson(labels, 'labels.json')}
              title="Save labels"
            >
              <SaveIcon className="rotate-180" />
            </IconButton>

            <IconButton
              ripple={false}
              onClick={() =>
                setLabels([
                  ...labels,
                  {
                    id: nanoid(),
                    name: `${protein.sequence[0]}1`,
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

          {labels.length > 0 && (
            <Button
              variant="link"
              size="sm"
              ripple={false}
              onClick={() => setShowDialog({ id: randId('clear'), params: {} })}
              //aria-label="Clear All"
              title="Clear all labels"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <BaseCol className="gap-y-1">
          <Switch
            checked={displayProps.labels.show}
            onCheckedChange={state =>
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.labels.show = state
                })
              )
            }
          >
            <span className="w-16 shrink-0">Show</span>
          </Switch>
        </BaseCol>

        <BaseCol className="gap-y-1 grow">
          {labels.map((label, li) => {
            return (
              <BaseCol
                key={li}

                // style={{
                //   backgroundColor: `${feature.color}20`,
                // }}
              >
                <VCenterRow className="gap-x-2 px-2 py-1 hover:bg-muted/50 rounded-theme">
                  <Switch
                    checked={label.show}
                    onCheckedChange={state =>
                      setLabels(
                        produce(labels, draft => {
                          draft[li]!.show = state
                        })
                      )
                    }
                  />
                  <Input
                    id={li.toString()}
                    placeholder={TEXT_NAME}
                    value={label.name}
                    className="grow min-w-0"
                    onTextChange={v => {
                      setLabels(
                        produce(labels, draft => {
                          draft[li]!.name = v
                        })
                      )
                    }}
                  />

                  <NumericalInput
                    value={label.start}
                    placeholder="Start"
                    w="w-16"
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
                    <TrashIcon stroke="" />
                  </button>
                </VCenterRow>
              </BaseCol>
            )
          })}
        </BaseCol>

        <VCenterRow className="py-2 border-t border-border justify-between gap-x-2">
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
                    id: nanoid(),
                    name: `${protein.sequence[v - 1]}${v}`,
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
      </PropsPanel>

      {showDialog.id.includes('open') && (
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
    </>
  )
}
