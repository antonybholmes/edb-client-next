import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { forwardRef, type ForwardedRef } from 'react'

import { CheckPropRow } from '@dialog/check-prop-row'
import { produce } from 'immer'
import { useHubsStore } from './hubs-store'

export const HubsPropsPanel = forwardRef(function HubsPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { store, setStore } = useHubsStore()

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
      <PropsPanel ref={ref} className="px-1">
        <ScrollAccordion value={['search', 'plot', 'all-plots']}>
          <AccordionItem value="search">
            <AccordionTrigger>Display</AccordionTrigger>
            <AccordionContent>
              <CheckPropRow
                title="Hide Tracks"
                checked={store.hideTracks}
                onCheckedChange={v => {
                  const newStore = produce(store, draft => {
                    draft.hideTracks = v
                  })

                  setStore(newStore)
                }}
              />
              <CheckPropRow
                title="Show guidelines"
                checked={store.showGuidelines}
                onCheckedChange={v => {
                  const newStore = produce(store, draft => {
                    draft.showGuidelines = v
                  })

                  setStore(newStore)
                }}
              />
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
