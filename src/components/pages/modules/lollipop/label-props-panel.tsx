import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'

import {
  forwardRef,
  useContext,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import { FgBgColorPicker } from '@/components/fg-bg-color-picker'
import {
  COLOR_BLACK,
  TEXT_ADD,
  TEXT_CLEAR,
  TEXT_OK,
  TEXT_UNLABELLED,
} from '@/consts'
import { TRANS_COLOR_CLS } from '@/theme'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { PlusIcon } from '@components/icons/plus-icon'
import { SaveIcon } from '@components/icons/save-icon'
import { TrashIcon } from '@components/icons/trash-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { Input } from '@components/shadcn/ui/themed/input'
import { Switch } from '@components/shadcn/ui/themed/switch'
import { cn } from '@lib/class-names'
import { downloadJson } from '@lib/download-utils'
import { nanoid } from '@lib/utils'
import { DEFAULT_FEATURE_COLOR, type IProteinLabel } from './lollipop-utils'
import { PlotContext } from './plot-context'

interface ILollipopFeaturePanelProps {
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export const LabelPropsPanel = forwardRef(function LabelPropsPanel(
  { downloadRef }: ILollipopFeaturePanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { plotState, plotDispatch } = useContext(PlotContext)
  const [delLabel, setDelLabel] = useState<IProteinLabel | null>(null)

  const displayProps = plotState.df.displayProps
  const labels = plotState.df.labels
  const [confirmClear, setConfirmClear] = useState(false)
  const [positions, setPositions] = useState('')

  return (
    <>
      <OKCancelDialog
        open={confirmClear}
        onReponse={(r) => {
          if (r === TEXT_OK) {
            //onGroupsChange?.([])
            plotDispatch({ type: 'labels', labels: [] })
          }

          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all features?
      </OKCancelDialog>

      <OKCancelDialog
        open={delLabel !== null}
        showClose={true}
        onReponse={(r) => {
          if (r === TEXT_OK) {
            plotDispatch({
              type: 'labels',
              labels: labels.filter((feature) => feature.id !== delLabel!.id),
            })
          }
          setDelLabel(null)
        }}
      >
        {`Are you sure you want to delete ${
          delLabel && delLabel.name ? delLabel.name : TEXT_UNLABELLED
        }?`}
      </OKCancelDialog>

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

            <Button
              variant="muted"
              size="icon"
              ripple={false}
              onClick={() => downloadJson(labels, downloadRef, 'features.json')}
              aria-label="Save labels"
            >
              <SaveIcon className="rotate-180" />
            </Button>

            <Button
              variant="muted"
              size="icon"
              ripple={false}
              onClick={() =>
                plotDispatch({
                  type: 'labels',
                  labels: [
                    ...labels,
                    {
                      id: nanoid(),
                      name: `${plotState.df.protein.seq[0]}1`,
                      start: 1,
                      color: DEFAULT_FEATURE_COLOR,
                      show: true,
                    },
                  ],
                })
              }
              aria-label="Add label"
              tooltip="Add label"
            >
              <PlusIcon fill="stroke-foreground" />
            </Button>
          </VCenterRow>

          {labels.length > 0 && (
            <Button
              variant="link"
              size="sm"
              pad="none"
              ripple={false}
              onClick={() => setConfirmClear(true)}
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
            onCheckedChange={(state) =>
              plotDispatch({
                type: 'display',
                displayProps: {
                  ...displayProps,
                  labels: { ...displayProps.labels, show: state },
                },
              })
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
                <VCenterRow className="gap-x-2">
                  <Switch
                    checked={label.show}
                    onCheckedChange={(state) =>
                      plotDispatch({
                        type: 'labels',
                        labels: [
                          ...labels.slice(0, li),
                          { ...label, show: state },
                          ...labels.slice(li + 1),
                        ],
                      })
                    }
                  />
                  <Input
                    id={li.toString()}
                    placeholder="Name"
                    value={label.name}
                    className="grow rounded-theme"
                    onChange={(event) => {
                      plotDispatch({
                        type: 'labels',
                        labels: [
                          ...labels.slice(0, li),
                          { ...label, name: event.currentTarget.value },
                          ...labels.slice(li + 1),
                        ],
                      })
                    }}
                  />

                  <Input
                    defaultValue={label.start}
                    placeholder="Start"
                    className="w-16 shrink-0 text-center rounded-theme"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        const v = parseInt(event.currentTarget.value)
                        if (Number.isInteger(v)) {
                          plotDispatch({
                            type: 'labels',
                            labels: [
                              ...labels.slice(0, li),
                              {
                                ...label,
                                start: Math.max(
                                  1,
                                  Math.min(v, plotState.df.aaStats.length)
                                ),
                              },
                              ...labels.slice(li + 1),
                            ],
                          })
                        }
                      }
                    }}
                  />

                  <FgBgColorPicker
                    fgColor={label.color}
                    onFgColorChange={(color) =>
                      plotDispatch({
                        type: 'labels',
                        labels: [
                          ...labels.slice(0, li),
                          { ...label, color },
                          ...labels.slice(li + 1),
                        ],
                      })
                    }
                  />

                  <button
                    className={cn(
                      TRANS_COLOR_CLS,
                      'fill-foreground/25 hover:fill-red-400'
                    )}
                    onClick={() => setDelLabel(label)}
                  >
                    <TrashIcon />
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
            onChange={(e) => setPositions(e.currentTarget.value)}
          />
          <Button
            variant="theme"
            onClick={() => {
              const used = new Set<number>(labels.map((label) => label.start))

              const newLabels: IProteinLabel[] = positions
                .trim()
                .split(',')
                .map((s: string) => {
                  const v = parseInt(s.trim())

                  return {
                    id: nanoid(),
                    name: `${plotState.df.protein.seq[v - 1]}${v}`,
                    start: v,
                    color: COLOR_BLACK,
                    show: true,
                  }
                })
                .filter((label) => !used.has(label.start))

              if (newLabels.length > 0) {
                plotDispatch({
                  type: 'labels',
                  labels: [...labels, ...newLabels],
                })
              }
            }}
          >
            {TEXT_ADD}
          </Button>
        </VCenterRow>
      </PropsPanel>
    </>
  )
})
