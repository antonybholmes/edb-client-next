import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { forwardRef, type ForwardedRef } from 'react'

import { TEXT_RESET } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { VCenterRow } from '@layout/v-center-row'
import { LinkButton } from '@themed/link-button'
import { NumericalInput } from '@themed/numerical-input'
import { useGseaStore } from './gsea-store'

export const GseaPropsPanel = forwardRef(function GseaPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { displayProps, setDisplayProps, resetDisplayProps } = useGseaStore()

  // const [text, setText] = useState<string>(
  //   process.env.NODE_ENV === 'development' ? 'BCL6\nPRDM1\nKMT2D' : ''
  // )

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
      {/* <OKCancelDialog
        open={confirmClear}
        title={INFO.name}
        onResponse={() => {
          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all the genes?
      </OKCancelDialog> */}

      <PropsPanel ref={ref} className="px-1 h-full">
        <VCenterRow className="justify-end">
          <LinkButton
            onClick={() => resetDisplayProps()}
            title="Reset Properties to Defaults"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>
        <ScrollAccordion
          value={['page', 'enrichment-plot', 'genes-plot', 'rank-plot']}
        >
          <AccordionItem value="page">
            <AccordionTrigger>Page</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Columns">
                <NumericalInput
                  value={displayProps.page.columns}
                  placeholder="Opacity"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      page: {
                        ...displayProps.page,
                        columns: v,
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="padding">
            <AccordionTrigger>Padding</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Top">
                <NumericalInput
                  value={displayProps.plot.margin.top}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        margin: {
                          ...displayProps.plot.margin,
                          top: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Left">
                <NumericalInput
                  value={displayProps.plot.margin.left}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        margin: {
                          ...displayProps.plot.margin,
                          left: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Bottom">
                <NumericalInput
                  value={displayProps.plot.margin.bottom}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        margin: {
                          ...displayProps.plot.margin,
                          bottom: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Right">
                <NumericalInput
                  value={displayProps.plot.margin.right}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      plot: {
                        ...displayProps.plot,
                        margin: {
                          ...displayProps.plot.margin,
                          right: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="enrichment-plot">
            <AccordionTrigger>Enrichment</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Size">
                <DoubleNumericalInput
                  v1={displayProps.axes.x.length}
                  placeholder="Width"
                  limit={[1, 1000]}
                  dp={0}
                  onNumChanged1={v =>
                    setDisplayProps({
                      ...displayProps,
                      axes: {
                        ...displayProps.axes,
                        x: {
                          ...displayProps.axes.x,
                          length: v,
                        },
                      },
                    })
                  }
                  v2={displayProps.es.axes.y.length}
                  onNumChanged2={v =>
                    setDisplayProps({
                      ...displayProps,
                      es: {
                        ...displayProps.es,
                        axes: {
                          ...displayProps.es.axes,
                          y: {
                            ...displayProps.es.axes.y,
                            length: v,
                          },
                        },
                      },
                    })
                  }
                />
              </PropRow>
              <PropRow title="Line color">
                <ColorPickerButton
                  color={displayProps.es.line.color}
                  onColorChange={color =>
                    setDisplayProps({
                      ...displayProps,
                      es: {
                        ...displayProps.es,
                        line: {
                          ...displayProps.es.line,
                          color,
                        },
                      },
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Line color"
                />
              </PropRow>

              <PropRow title="Line stroke">
                <NumericalInput
                  value={displayProps.es.line.width}
                  disabled={!displayProps.genes.show}
                  placeholder="Stroke"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      es: {
                        ...displayProps.es,
                        line: {
                          ...displayProps.es.line,
                          width: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <SwitchPropRow
                title="Leading Edge"
                checked={displayProps.es.leadingEdge.show}
                onCheckedChange={state =>
                  setDisplayProps({
                    ...displayProps,
                    es: {
                      ...displayProps.es,
                      leadingEdge: {
                        ...displayProps.es.leadingEdge,
                        show: state,
                      },
                    },
                  })
                }
              />

              <PropRow title="Color" className="ml-2">
                <ColorPickerButton
                  color={displayProps.es.leadingEdge.fill.color}
                  onColorChange={color =>
                    setDisplayProps({
                      ...displayProps,
                      es: {
                        ...displayProps.es,
                        leadingEdge: {
                          ...displayProps.es.leadingEdge,
                          fill: {
                            ...displayProps.es.leadingEdge.fill,
                            color,
                          },
                        },
                      },
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Line color"
                />
              </PropRow>

              <PropRow title="Opacity" className="ml-2">
                <NumericalInput
                  disabled={!displayProps.es.leadingEdge.show}
                  value={displayProps.es.leadingEdge.fill.alpha}
                  placeholder="Opacity"
                  limit={[0, 1]}
                  step={0.1}
                  dp={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      es: {
                        ...displayProps.es,
                        leadingEdge: {
                          ...displayProps.es.leadingEdge,
                          fill: {
                            ...displayProps.es.leadingEdge.fill,
                            alpha: v,
                          },
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="genes-plot">
            <AccordionTrigger>Genes</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show"
                checked={displayProps.genes.show}
                onCheckedChange={state =>
                  setDisplayProps({
                    ...displayProps,
                    genes: {
                      ...displayProps.genes,
                      show: state,
                    },
                  })
                }
              />
              <PropRow title="Height" className="ml-2">
                <NumericalInput
                  value={displayProps.genes.height}
                  disabled={!displayProps.genes.show}
                  placeholder="Height"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      genes: {
                        ...displayProps.genes,
                        height: v,
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Stroke" className="ml-2">
                <NumericalInput
                  value={displayProps.genes.line.width}
                  disabled={!displayProps.genes.show}
                  placeholder="Stroke"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      genes: {
                        ...displayProps.genes,
                        line: { ...displayProps.genes.line, width: v },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <PropRow title="Positive color" className="ml-2">
                <ColorPickerButton
                  disabled={!displayProps.genes.show}
                  color={displayProps.genes.pos.color}
                  onColorChange={color =>
                    setDisplayProps({
                      ...displayProps,
                      genes: {
                        ...displayProps.genes,
                        pos: {
                          ...displayProps.genes.pos,
                          color,
                        },
                      },
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Positive color"
                />
              </PropRow>
              <PropRow title="Negative color" className="ml-2">
                <ColorPickerButton
                  disabled={!displayProps.genes.show}
                  color={displayProps.genes.neg.color}
                  onColorChange={color =>
                    setDisplayProps({
                      ...displayProps,
                      genes: {
                        ...displayProps.genes,
                        neg: {
                          ...displayProps.genes.neg,
                          color,
                        },
                      },
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Negative color"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rank-plot">
            <AccordionTrigger>Ranked Genes</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show"
                checked={displayProps.ranking.show}
                onCheckedChange={state =>
                  setDisplayProps({
                    ...displayProps,
                    ranking: {
                      ...displayProps.ranking,
                      show: state,
                    },
                  })
                }
              />

              <PropRow title="Color" className="ml-2">
                <ColorPickerButton
                  color={displayProps.ranking.fill.color}
                  disabled={!displayProps.ranking.show}
                  onColorChange={color =>
                    setDisplayProps({
                      ...displayProps,
                      ranking: {
                        ...displayProps.ranking,
                        fill: {
                          ...displayProps.ranking.fill,
                          color,
                        },
                      },
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Positive color"
                />
              </PropRow>

              <PropRow title="Opacity" className="ml-2">
                <NumericalInput
                  value={displayProps.ranking.fill.alpha}
                  disabled={!displayProps.ranking.show}
                  placeholder="Opacity"
                  limit={[0, 1]}
                  step={0.1}
                  dp={1}
                  onNumChanged={v =>
                    setDisplayProps({
                      ...displayProps,
                      ranking: {
                        ...displayProps.ranking,
                        fill: {
                          ...displayProps.ranking.fill,
                          alpha: v,
                        },
                      },
                    })
                  }
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <SwitchPropRow
                className="ml-2"
                title="Zero crossing"
                checked={displayProps.ranking.zeroCross.show}
                disabled={!displayProps.ranking.show}
                onCheckedChange={state =>
                  setDisplayProps({
                    ...displayProps,
                    ranking: {
                      ...displayProps.ranking,
                      zeroCross: {
                        ...displayProps.ranking.zeroCross,
                        show: state,
                      },
                    },
                  })
                }
              />
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
})
