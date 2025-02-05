import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { type IVolcanoDisplayOptions } from '@/components/pages/modules/matcalc/modules/volcano/volcano-plot-svg'
import { TEXT_CLEAR } from '@/consts'
import { textToLines } from '@/lib/text/lines'
import {
  getPlotFromAddr,
  HistoryContext,
  type IHistItemAddr,
} from '@/providers/history-provider'
import { DoubleNumericalInput } from '@components/double-numerical-input'
import { TagIcon } from '@components/icons/tag-icon'
import { PropRow } from '@components/prop-row'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Button } from '@components/shadcn/ui/themed/button'
import { NumericalInput } from '@components/shadcn/ui/themed/numerical-input'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import { SwitchPropRow } from '@components/switch-prop-row'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { findCol, getNumCol } from '@lib/dataframe/dataframe-utils'
import { range } from '@lib/math/range'
import { produce } from 'immer'
import { forwardRef, useContext, useState, type ForwardedRef } from 'react'

export interface IProps {
  plotAddr: IHistItemAddr

  x: string
  y: string
  //plotId: string
}

export const VolcanoPropsPanel = forwardRef(function HeatmapPropsPanel(
  { x, y, plotAddr }: IProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)!

  const df = plot.customProps.df as BaseDataFrame

  const displayProps: IVolcanoDisplayOptions = plot.customProps
    .displayOptions as IVolcanoDisplayOptions

  const [text, setText] = useState<string>(
    displayProps.labels.values.join('\n')
  )

  function addLabels() {
    const values: string[] = textToLines(text, { trim: true })

    historyDispatch({
      type: 'update-custom-prop',
      addr: plotAddr,
      name: 'displayOptions',

      prop: produce(displayProps, draft => {
        draft.labels.values = values
      }),
    })
  }

  function getShouldLabel(logFc: number, logP: number): boolean {
    if (displayProps!.logP.show && displayProps!.logFc.show) {
      if (
        logP > displayProps!.logP.threshold &&
        Math.abs(logFc) > displayProps!.logFc.threshold
      ) {
        return true
      }
    } else {
      if (
        (displayProps!.logP.show && logP > displayProps!.logP.threshold) ||
        (displayProps!.logFc.show &&
          Math.abs(logFc) > displayProps!.logFc.threshold)
      ) {
        return true
      }
    }

    return false
  }

  function loadHighlightedLabels() {
    const xdata = getNumCol(df, findCol(df, x))

    const ydata = getNumCol(df, findCol(df, y))

    const idx = new Set(
      range(df.shape[0]).filter(i => getShouldLabel(xdata[i]!, ydata[i]!))
    )

    const values = df.index.values
      .filter((_v, i) => idx.has(i))
      .map(l => l.toString())

    setText(values.join('\n'))

    historyDispatch({
      type: 'update-custom-prop',
      addr: plotAddr,
      name: 'displayOptions',
      prop: produce(displayProps, draft => {
        draft.labels.values = values
      }),
    })
  }

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'fold-change', 'p-value', 'labels']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                v1={displayProps.axes.xaxis.range[1]}
                v2={displayProps.axes.yaxis.range[1]}
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={v => {
                  console.log(v, displayProps.axes.xaxis.range[1])
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.axes.xaxis.range = [0, v]
                    }),
                  })
                }}
                onNumChanged2={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.axes.yaxis.range = [0, v]
                    }),
                  })
                }}
              />
            </PropRow>

            <PropRow title="Y-max">
              <NumericalInput
                id="size"
                value={displayProps.axes.yaxis.domain[1]}
                placeholder="Size..."
                dp={0}
                limit={[1, 10000]}
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.axes.yaxis.domain = [0, v]
                    }),
                  })
                }}
              />
            </PropRow>

            <PropRow title="Dots">
              <NumericalInput
                id="size"
                value={displayProps.dots.size}
                placeholder="Size..."
                dp={0}
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.dots.size = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                color={displayProps.dots.color}
                onColorChange={v =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.dots.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={v => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, draft => {
                    draft.border.show = v
                  }),
                })
              }}
            >
              <ColorPickerButton
                color={displayProps.border.color}
                onColorChange={v =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.border.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fold-change">
          <AccordionTrigger>Fold change</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Filter"
              checked={displayProps.logFc.show}
              onCheckedChange={v => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, draft => {
                    draft.logFc.show = v
                  }),
                })
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(2, displayProps.logFc.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.logFc.threshold = v
                    }),
                  })
                }}
              />
            </SwitchPropRow>

            <PropRow title="Highlight">
              <ColorPickerButton
                color={displayProps.logFc.neg.color}
                onColorChange={v =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.logFc.neg.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Points &lt; 0"
              />

              <ColorPickerButton
                color={displayProps.logFc.pos.color}
                onColorChange={v =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.logFc.pos.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Points &ge; 0"
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="p-value">
          <AccordionTrigger>P-value</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Filter"
              checked={displayProps.logP.show}
              onCheckedChange={v => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, draft => {
                    draft.logP.show = v
                  }),
                })
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(10, -displayProps.logP.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, draft => {
                      draft.logP.threshold = -Math.log10(v)
                    }),
                  })
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Line"
              checked={displayProps.logP.line.show}
              onCheckedChange={v => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, draft => {
                    draft.logP.line.show = v
                  }),
                })
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="labels">
          <AccordionTrigger>Labels</AccordionTrigger>
          <AccordionContent>
            <BaseCol className="gap-y-1">
              <Textarea3
                id="labels"
                aria-label="Labels"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Labels to highlight"
                className="h-48"
              />

              <VCenterRow className="justify-between">
                <ToolbarTabGroup className="gap-x-1">
                  <Button
                    variant="theme"
                    aria-label="Add labels to plot"
                    onClick={() => addLabels()}
                  >
                    Add labels to plot
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Load highlighted labels"
                    onClick={() => loadHighlightedLabels()}
                    title="Load highlighted labels from plot"
                  >
                    <TagIcon />
                  </Button>
                </ToolbarTabGroup>

                <Button
                  variant="link"
                  size="sm"
                  pad="none"
                  onClick={() => {
                    setText('')

                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, draft => {
                        draft.labels.values = []
                      }),
                    })
                  }}
                >
                  {TEXT_CLEAR}
                </Button>
              </VCenterRow>
            </BaseCol>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
