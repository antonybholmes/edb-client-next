import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'

import {
  forwardRef,
  useContext,
  useState,
  type Dispatch,
  type ForwardedRef,
  type RefObject,
  type SetStateAction,
} from 'react'

import {
  COLOR_TRANSPARENT,
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

import { FgBgColorPicker } from '@/components/fg-bg-color-picker'
import {
  DEFAULT_DISPLAY_PROPS,
  DEFAULT_FEATURE_BG_COLOR,
  DEFAULT_FEATURE_COLOR,
  type IProteinFeature,
} from './lollipop-utils'
import { PlotContext } from './plot-context'

interface IFeatureProps {
  fi: number
  feature: IProteinFeature
  setDelFeature: Dispatch<SetStateAction<IProteinFeature | null>>
}

function FeatureElem({ fi, feature, setDelFeature }: IFeatureProps) {
  const { plotState, plotDispatch } = useContext(PlotContext)
  const features = plotState.df.features

  const [start, setStart] = useState(feature.start.toString())
  const [end, setEnd] = useState(feature.end.toString())

  function setPosition() {
    let vs = parseInt(start)
    let ve = parseInt(end)

    if (!Number.isInteger(vs)) {
      vs = feature.start
    }

    if (!Number.isInteger(ve)) {
      ve = feature.end
    }

    plotDispatch({
      type: 'features',
      features: [
        ...features.slice(0, fi),
        {
          ...feature,
          start: Math.max(1, Math.min(vs, plotState.df.aaStats.length)),
          end: Math.max(1, Math.min(ve, plotState.df.aaStats.length)),
        },
        ...features.slice(fi + 1),
      ],
    })
  }

  return (
    <VCenterRow key={fi} className="gap-x-2">
      <Switch
        checked={feature.show}
        onCheckedChange={(state) =>
          plotDispatch({
            type: 'features',
            features: [
              ...features.slice(0, fi),
              { ...feature, show: state },
              ...features.slice(fi + 1),
            ],
          })
        }
      />

      <FgBgColorPicker
        fgColor={feature.color}
        bgColor={feature.bgColor}
        allowNoColor={true}
        onFgColorChange={(color) =>
          plotDispatch({
            type: 'features',
            features: [
              ...features.slice(0, fi),
              {
                ...feature,
                color,
                //show: color !== COLOR_TRANSPARENT,
              },
              ...features.slice(fi + 1),
            ],
          })
        }
        onBgColorChange={(color) =>
          plotDispatch({
            type: 'features',
            features: [
              ...features.slice(0, fi),
              {
                ...feature,
                bgColor: color,
                //show: color !== COLOR_TRANSPARENT,
              },
              ...features.slice(fi + 1),
            ],
          })
        }
      />

      <Input
        id={fi.toString()}
        placeholder="Name"
        value={feature.name}
        className="rounded-theme grow"
        onChange={(event) => {
          plotDispatch({
            type: 'features',
            features: [
              ...features.slice(0, fi),
              { ...feature, name: event.currentTarget.value },
              ...features.slice(fi + 1),
            ],
          })
        }}
      />

      <Input
        value={start}
        placeholder="Start"
        className="w-12 shrink-0 text-center rounded-theme"
        onChange={(e) => setStart(e.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setPosition()
          }
        }}
      />

      <Input
        value={end}
        placeholder="End"
        className="w-12 shrink-0 text-center rounded-theme"
        onChange={(e) => setEnd(e.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setPosition()
          }
        }}
      />

      <button
        className={cn(TRANS_COLOR_CLS, 'fill-foreground/25 hover:fill-red-400')}
        onClick={() => setDelFeature(feature)}
      >
        <TrashIcon />
      </button>
    </VCenterRow>
  )
}

interface ILollipopFeaturePanelProps {
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export const FeaturePropsPanel = forwardRef(function FeaturePropsPanel(
  { downloadRef }: ILollipopFeaturePanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { plotState, plotDispatch } = useContext(PlotContext)
  const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)

  const displayProps = plotState.df.displayProps
  const features = plotState.df.features
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <>
      <OKCancelDialog
        open={confirmClear}
        onReponse={(r) => {
          if (r === TEXT_OK) {
            //onGroupsChange?.([])
            plotDispatch({ type: 'features', features: [] })
          }

          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all features?
      </OKCancelDialog>

      <OKCancelDialog
        open={delFeature !== null}
        showClose={true}
        onReponse={(r) => {
          if (r === TEXT_OK) {
            plotDispatch({
              type: 'features',
              features: features.filter(
                (feature) => feature.id !== delFeature!.id
              ),
            })
          }
          setDelFeature(null)
        }}
      >
        {`Are you sure you want to delete ${
          delFeature && delFeature.name ? delFeature.name : TEXT_UNLABELLED
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
              variant="accent"
              size="icon"
              ripple={false}
              onClick={() =>
                downloadJson(features, downloadRef, 'features.json')
              }
              aria-label="Open groups"
            >
              <SaveIcon className="rotate-180" />
            </Button>

            <Button
              variant="muted"
              size="icon"
              ripple={false}
              onClick={() =>
                plotDispatch({
                  type: 'features',
                  features: [
                    ...features,
                    {
                      id: nanoid(),
                      name: `Feature ${features.length + 1}`,
                      start: 1,
                      end: Math.min(10, plotState.df.aaStats.length),
                      color: DEFAULT_FEATURE_COLOR,
                      bgColor: DEFAULT_FEATURE_BG_COLOR,
                      show: true,
                    },
                  ],
                })
              }
              aria-label="Add feature"
              tooltip="Add feature"
            >
              <PlusIcon fill="stroke-foreground" />
            </Button>
          </VCenterRow>

          {features.length > 0 && (
            <Button
              variant="link"
              size="sm"
              pad="none"
              ripple={false}
              onClick={() => setConfirmClear(true)}
              //aria-label="Clear All"
              title="Clear all groups"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <BaseCol className="gap-y-1">
          <Switch
            checked={displayProps.features.show}
            onCheckedChange={(state) =>
              plotDispatch({
                type: 'display',
                displayProps: {
                  ...displayProps,
                  features: { ...displayProps.features, show: state },
                },
              })
            }
          >
            <span className="w-16 shrink-0">Show</span>
          </Switch>

          <Switch
            disabled={!displayProps.features.show}
            checked={displayProps.features.positions.show}
            onCheckedChange={(state) =>
              plotDispatch({
                type: 'display',
                displayProps: {
                  ...displayProps,
                  features: {
                    ...displayProps.features,
                    positions: {
                      ...displayProps.features.positions,
                      show: state,
                    },
                  },
                },
              })
            }
          >
            <span className="w-16 shrink-0">Positions</span>
          </Switch>

          {/* <Switch
            checked={displayProps.features.background.show}
            onCheckedChange={state =>
              plotDispatch({
                type: "display",
                displayProps: {
                  ...displayProps,
                  features: {
                    ...displayProps.features,

                    background: {
                      ...displayProps.features.background,
                      show: state,
                    },
                  },
                },
              })
            }
          >
            <SimpleColorPickerButton
              color={displayProps.features.background.color}
              onColorChange={color =>
                plotDispatch({
                  type: "display",
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      background: {
                        ...displayProps.features.background,
                        color: color,
                      },
                    },
                  },
                })
              }
              className={SIMPLE_COLOR_EXT_CLS}
            />
            <span>Background</span>
          </Switch>

          <Switch
            checked={displayProps.features.border.show}
            onCheckedChange={state =>
              plotDispatch({
                type: "display",
                displayProps: {
                  ...displayProps,
                  features: {
                    ...displayProps.features,

                    border: {
                      ...displayProps.features.border,
                      show: state,
                    },
                  },
                },
              })
            }
          >
            <SimpleColorPickerButton
              color={displayProps.features.border.color}
              onColorChange={color =>
                plotDispatch({
                  type: "display",
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      border: {
                        ...displayProps.features.border,
                        color,
                      },
                    },
                  },
                })
              }
              className={SIMPLE_COLOR_EXT_CLS}
            />
            <span>Border</span>
          </Switch> */}
          <VCenterRow className="gap-x-2">
            <FgBgColorPicker
              fgColor={displayProps.features.border.color}
              bgColor={displayProps.features.background.color}
              defaultFgColor={DEFAULT_DISPLAY_PROPS.features.border.color}
              defaultBgColor={DEFAULT_DISPLAY_PROPS.features.background.color}
              allowNoColor={true}
              onFgColorChange={(color) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      border: {
                        ...displayProps.features.border,
                        color,
                        show: color !== COLOR_TRANSPARENT,
                      },
                    },
                  },
                })
              }
              onBgColorChange={(color) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      background: {
                        ...displayProps.features.background,
                        color,
                        show: color !== COLOR_TRANSPARENT,
                      },
                    },
                  },
                })
              }
            />

            <span className="w-16 shrink-0">Outline</span>
          </VCenterRow>
        </BaseCol>

        <BaseCol className="gap-y-1 grow">
          {features.map((feature, fi) => {
            return (
              <FeatureElem
                key={fi}
                fi={fi}
                feature={feature}
                setDelFeature={setDelFeature}
              />
            )
          })}
        </BaseCol>
      </PropsPanel>
    </>
  )
})
