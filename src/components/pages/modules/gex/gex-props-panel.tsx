import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { CheckPropRow } from '@components/check-prop-row'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropRow } from '@components/prop-row'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { NumericalInput } from '@components/shadcn/ui/themed/numerical-input'
import { SwitchPropRow } from '@components/switch-prop-row'
import type { IBoolMap } from '@interfaces/bool-map'
import { forwardRef, useState, type ForwardedRef } from 'react'
import { useGexPlotStore } from './gex-plot-store'
import { useGexStore } from './gex-store'
import { type IGexDataset } from './gex-utils'
import INFO from './module.json'

export interface IProps {
  datasets: IGexDataset[]
  setGenes?: (genes: string[]) => void
  //displayProps: IGexDisplayProps
  //onDisplayPropsChange: (props: IGexDisplayProps) => void
}

export const GexPropsPanel = forwardRef(function GexPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const [displayProps, setDisplayProps] = useGexStore()
  const { gexPlotSettings, updateGexPlotSettings } = useGexPlotStore()

  // const [text, setText] = useState<string>(
  //   process.env.NODE_ENV === 'development' ? 'BCL6\nPRDM1\nKMT2D' : ''
  // )

  const [confirmClear, setConfirmClear] = useState(false)

  const [showAll, setShowAll] = useState<IBoolMap>({
    box: true,
    violin: true,
    swarm: false,
  })

  const [fillAll, setFillAll] = useState<IBoolMap>({
    box: true,
    violin: true,
    swarm: true,
  })

  const [strokeAll, setStrokeAll] = useState<IBoolMap>({
    box: true,
    violin: true,
    swarm: true,
  })

  // function setProps(dataset: IGexDataset, props: IGexPlotDisplayProps) {
  //   updateGexPlotSettings(
  //     Object.fromEntries([
  //       ...Object.entries(gexPlotSettings).filter(
  //         ([id, _]) => id !== dataset.id.toString()
  //       ),
  //       [dataset.id.toString(), props],
  //     ])
  //   )
  // }

  return (
    <>
      <OKCancelDialog
        open={confirmClear}
        title={INFO.name}
        onReponse={() => {
          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all the genes?
      </OKCancelDialog>

      <PropsPanel ref={ref} className="px-1">
        <ScrollAccordion value={['search', 'plot', 'all-plots']}>
          {/* <AccordionItem value="search">
            <AccordionTrigger>Search</AccordionTrigger>
            <AccordionContent>
              <Textarea3
                id="filter"
                aria-label="Filter"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Genes"
                className="h-32"
              />

              <VCenterRow className="shrink-0 justify-between gap-x-2">
                <Button
                  variant="theme"
                  aria-label="Apply filter to current matrix"
                  onClick={() => {
                    const genes = text
                      .split(/[\r\n]/)
                      .map(x => x.trim())
                      .filter(x => x.length > 0)

                    setGenes?.(genes)
                  }}
                >
                  <SearchIcon fill="fill-white" />
                  <span>Search</span>
                </Button>

                {text && (
                  // <Button
                  //   variant="muted"
                  //   multiProps="icon"
                  //   ripple={false}
                  //   onClick={() => setConfirmClear(true)}
                  //   title="Clear all genes"
                  // >
                  //   <TrashIcon />
                  // </Button>

                  <Button
                    variant="link"
                    pad="none"
                    size="sm"
                    ripple={false}
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear
                  </Button>
                )}
              </VCenterRow>
            </AccordionContent>
          </AccordionItem> */}

          <AccordionItem value="plot">
            <AccordionTrigger>Plot</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Size">
                <DoubleNumericalInput
                  v1={displayProps.plot.bar.width}
                  placeholder="Width"
                  min={1}
                  dp={0}
                  onNumChanged1={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        bar: {
                          ...displayProps.plot.bar,
                          width: v,
                        },
                      },
                    })
                  }
                  v2={displayProps.plot.height}
                  onNumChanged2={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        height: v,
                      },
                    })
                  }
                />
              </PropRow>

              <PropRow title="Gap">
                <NumericalInput
                  value={displayProps.plot.gap}
                  placeholder="Gap"
                  min={1}
                  dp={0}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        gap: v,
                      },
                    })
                  }
                  //className="w-16 rounded-theme"
                />
              </PropRow>

              <PropRow title="Columns">
                <NumericalInput
                  value={displayProps.page.cols}
                  placeholder="Columns"
                  min={1}
                  dp={0}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      page: {
                        ...displayProps.page,
                        cols: v,
                      },
                    })
                  }
                  //className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="all-plots">
            <AccordionTrigger>All Plots</AccordionTrigger>
            <AccordionContent innerClassName="flex flex-col gap-y-4 p-2">
              <BaseCol className="gap-y-2">
                <SwitchPropRow
                  title="Box & whiskers"
                  labelClassName="font-medium"
                  checked={showAll['box']!}
                  onCheckedChange={state => {
                    updateGexPlotSettings(
                      Object.fromEntries(
                        Object.entries(gexPlotSettings).map(([id, props]) => {
                          return [
                            id,
                            {
                              ...props,
                              box: { ...props.box, show: state },
                            },
                          ]
                        })
                      )
                    )

                    setShowAll({ ...showAll, box: state })
                  }}
                />
                <VCenterRow className="gap-y-1 gap-x-4 pl-4">
                  <CheckPropRow
                    title="Fill"
                    checked={fillAll['box']!}
                    disabled={!showAll['box']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                box: {
                                  ...props.box,
                                  fill: {
                                    ...props.box.fill,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setFillAll({ ...fillAll, box: state })
                    }}
                  />

                  <CheckPropRow
                    title="Stroke"
                    checked={strokeAll['box']!}
                    disabled={!showAll['box']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                box: {
                                  ...props.box,
                                  stroke: {
                                    ...props.box.stroke,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setStrokeAll({ ...strokeAll, box: state })
                    }}
                  />
                </VCenterRow>
              </BaseCol>

              <BaseCol className="gap-y-2">
                <SwitchPropRow
                  title="Violins"
                  labelClassName="font-medium"
                  checked={showAll['violin']!}
                  onCheckedChange={state => {
                    updateGexPlotSettings(
                      Object.fromEntries(
                        Object.entries(gexPlotSettings).map(([id, props]) => {
                          return [
                            id,
                            {
                              ...props,
                              violin: { ...props.violin, show: state },
                            },
                          ]
                        })
                      )
                    )

                    setShowAll({ ...showAll, violin: state })
                  }}
                />

                <VCenterRow className="gap-y-1 gap-x-4 pl-4">
                  <CheckPropRow
                    title="Fill"
                    checked={fillAll['violin']!}
                    disabled={!showAll['violin']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                violin: {
                                  ...props.violin,
                                  fill: {
                                    ...props.violin.fill,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setFillAll({ ...fillAll, violin: state })
                    }}
                  />

                  <CheckPropRow
                    title="Stroke"
                    checked={strokeAll['violin']!}
                    disabled={!showAll['violin']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                violin: {
                                  ...props.violin,
                                  stroke: {
                                    ...props.violin.stroke,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setStrokeAll({ ...strokeAll, violin: state })
                    }}
                  />
                </VCenterRow>
              </BaseCol>

              <BaseCol className="gap-y-2">
                <SwitchPropRow
                  title="Swarms"
                  labelClassName="font-medium"
                  checked={showAll['swarm']!}
                  onCheckedChange={state => {
                    updateGexPlotSettings(
                      Object.fromEntries(
                        Object.entries(gexPlotSettings).map(([id, props]) => {
                          return [
                            id,
                            {
                              ...props,
                              swarm: { ...props.swarm, show: state },
                            },
                          ]
                        })
                      )
                    )

                    setShowAll({ ...showAll, swarm: state })
                  }}
                />
                <VCenterRow className="gap-y-1 gap-x-4 pl-4">
                  <CheckPropRow
                    title="Fill"
                    checked={fillAll['swarm']!}
                    disabled={!showAll['swarm']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                swarm: {
                                  ...props.swarm,
                                  fill: {
                                    ...props.swarm.fill,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setFillAll({ ...fillAll, swarm: state })
                    }}
                  />

                  <CheckPropRow
                    title="Stroke"
                    checked={strokeAll['swarm']!}
                    disabled={!showAll['swarm']!}
                    onCheckedChange={state => {
                      updateGexPlotSettings(
                        Object.fromEntries(
                          Object.entries(gexPlotSettings).map(([id, props]) => {
                            return [
                              id,
                              {
                                ...props,
                                swarm: {
                                  ...props.swarm,
                                  stroke: {
                                    ...props.swarm.stroke,
                                    show: state,
                                  },
                                },
                              },
                            ]
                          })
                        )
                      )

                      setStrokeAll({ ...strokeAll, swarm: state })
                    }}
                  />
                </VCenterRow>
              </BaseCol>
            </AccordionContent>
          </AccordionItem>

          {/* {datasets.map((dataset, di) => {
            const props: IGexPlotDisplayProps = gexPlotSettings[
              dataset.id.toString()
            ] ?? { ...DEFAULT_GEX_PLOT_DISPLAY_PROPS }

            return (
              <AccordionItem value={dataset.name} key={di}>
                <AccordionTrigger>{dataset.name}</AccordionTrigger>
                <AccordionContent>
                  <DialogBlock>
                    <Label className="font-medium">Box & Whisker</Label>

                    <SwitchPropRow
                      title="Fill"
                      checked={props.box.fill.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          box: {
                            ...props.box,
                            fill: { ...props.box.fill, show: state },
                          },
                        })
                      }}
                    >
                      <NumericalInput
                        value={props.box.fill.opacity}
                        placeholder="Opacity"
                        max={1}
                        inc={0.1}
                        onNumChanged={v =>
                          setProps(dataset, {
                            ...props,
                            box: {
                              ...props.box,
                              fill: { ...props.box.fill, opacity: v },
                            },
                          })
                        }
                        className="w-16 rounded-theme"
                      />

                      <ColorPickerButton
                        color={props.box.fill.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            box: {
                              ...props.box,
                              fill: { ...props.box.fill, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change box stroke color"
                      />
                    </SwitchPropRow>

                    <SwitchPropRow
                      title="Stroke"
                      checked={props.box.stroke.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          box: {
                            ...props.box,
                            stroke: { ...props.box.stroke, show: state },
                          },
                        })
                      }}
                    >
                      <ColorPickerButton
                        color={props.box.stroke.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            box: {
                              ...props.box,
                              stroke: { ...props.box.stroke, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change box stroke color"
                      />
                    </SwitchPropRow>
                  </DialogBlock>

                  <DialogBlock>
                    <Label className="font-medium">Violin</Label>

                    <SwitchPropRow
                      title="Fill"
                      checked={props.violin.fill.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          violin: {
                            ...props.violin,
                            fill: { ...props.violin.fill, show: state },
                          },
                        })
                      }}
                    >
                      <NumericalInput
                        value={props.violin.fill.opacity}
                        placeholder="Opacity"
                        max={1}
                        inc={0.1}
                        onNumChanged={v =>
                          setProps(dataset, {
                            ...props,
                            violin: {
                              ...props.violin,
                              fill: { ...props.violin.fill, opacity: v },
                            },
                          })
                        }
                        className="w-16 rounded-theme"
                      />

                      <ColorPickerButton
                        color={props.violin.fill.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            violin: {
                              ...props.violin,
                              fill: { ...props.violin.fill, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change violin fill color"
                      />
                    </SwitchPropRow>

                    <SwitchPropRow
                      title="Stroke"
                      checked={props.violin.stroke.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          violin: {
                            ...props.violin,
                            stroke: {
                              ...props.violin.stroke,
                              show: state,
                            },
                          },
                        })
                      }}
                    >
                      <ColorPickerButton
                        color={props.violin.stroke.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            violin: {
                              ...props.violin,
                              stroke: { ...props.violin.stroke, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change violin stroke color"
                      />
                    </SwitchPropRow>
                  </DialogBlock>

                  <DialogBlock>
                    <Label className="font-medium">Swarm</Label>

                    <SwitchPropRow
                      title="Fill"
                      checked={props.swarm.fill.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          swarm: {
                            ...props.swarm,
                            fill: { ...props.swarm.fill, show: state },
                          },
                        })
                      }}
                    >
                      <NumericalInput
                        value={props.swarm.fill.opacity}
                        placeholder="Opacity"
                        title="Fill opacity"
                        max={1}
                        inc={0.1}
                        onNumChanged={v =>
                          setProps(dataset, {
                            ...props,
                            swarm: {
                              ...props.swarm,
                              fill: { ...props.swarm.fill, opacity: v },
                            },
                          })
                        }
                        className="w-16 rounded-theme"
                      />

                      <ColorPickerButton
                        color={props.swarm.fill.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            swarm: {
                              ...props.swarm,
                              fill: { ...props.swarm.fill, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change swarm fill color"
                      />
                    </SwitchPropRow>

                    <SwitchPropRow
                      title="Stroke"
                      checked={props.swarm.stroke.show}
                      onCheckedChange={state => {
                        setProps(dataset, {
                          ...props,
                          swarm: {
                            ...props.swarm,
                            stroke: {
                              ...props.swarm.stroke,
                              show: state,
                            },
                          },
                        })
                      }}
                    >
                      <ColorPickerButton
                        color={props.swarm.stroke.color}
                        onColorChange={color =>
                          setProps(dataset, {
                            ...props,
                            swarm: {
                              ...props.swarm,
                              stroke: { ...props.swarm.stroke, color },
                            },
                          })
                        }
                        className={SIMPLE_COLOR_EXT_CLS}
                        title="Change swarm stroke color"
                      />
                    </SwitchPropRow>
                  </DialogBlock>
                </AccordionContent>
              </AccordionItem>
            )
          })} */}
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
})
