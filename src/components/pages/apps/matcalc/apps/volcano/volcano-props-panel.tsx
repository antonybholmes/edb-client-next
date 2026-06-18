import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { type IVolcanoDisplayOptions } from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import { TEXT_CLEAR } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { TagIcon } from '@/icons/tag-icon'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { textToLines } from '@/lib/text/lines'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { Button } from '@/themed/v2/button'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'
import { useHistory } from '../../history/history-store'

import { getNumCol } from '@/lib/dataframe/dataframe-utils'
import { range } from '@/lib/math/range'
import { IconButton } from '@/themed/icon-button'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { useState } from 'react'
import { useVolcanoContext } from './volcano-provider'

export interface IProps {
  x: string
  y: string
  //plotId: string
}

export function VolcanoPropsPanel({ x, y }: IProps) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updatePlot } = useHistory()

  const { plot } = useVolcanoContext()

  const sheet = plot!.dataframes['main'] as BaseDataFrame

  const displayProps: IVolcanoDisplayOptions = plot.props

  const [text, setText] = useState<string>(
    displayProps.labels.values.join('\n')
  )

  function addLabels() {
    const values: string[] = textToLines(text, { trim: true })

    updatePlot(
      produce(plot, draft => {
        draft.props.labels.values = values
      })
    )
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
    const xdata = getNumCol(sheet, findCol(sheet, x))

    const ydata = getNumCol(sheet, findCol(sheet, y))

    const idx = new Set(
      range(sheet.shape[0]).filter(i => getShouldLabel(xdata[i]!, ydata[i]!))
    )

    const values = sheet.index.values
      .filter((_v, i) => idx.has(i))
      .map(l => l.toString())

    setText(values.join('\n'))

    updatePlot(
      produce(plot, draft => {
        draft.props.labels.values = values
      })
    )
  }

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'fold-change', 'p-value', 'labels']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                v1={displayProps.axes.xaxis.length}
                v2={displayProps.axes.yaxis.length}
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.xaxis.length = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.yaxis.length = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="X-axis limit">
              <DoubleNumericalInput
                id="x-limit"
                v1={displayProps.axes.xaxis.domain[0]}
                v2={displayProps.axes.xaxis.domain[1]}
                placeholder="Limit..."
                dp={0}
                limit={[-10000, 10000]}
                className="w-16 rounded-theme"
                onNumChanged1={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.xaxis.domain = [
                        v,
                        draft.props.axes.xaxis.domain[1],
                      ]
                    })
                  )
                }}
                onNumChanged2={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.xaxis.domain = [
                        draft.props.axes.xaxis.domain[0],
                        v,
                      ]
                    })
                  )
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
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.yaxis.domain = [0, v]
                    })
                  )
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
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.dots.size = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                colors={[
                  {
                    color: displayProps.dots.color,
                    onColorChange: v =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.dots.color = v
                        })
                      ),
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.border.show = v
                  })
                )
              }}
            >
              <ColorPickerButton
                colors={[
                  {
                    color: displayProps.border.value,
                    onColorChange: v =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.border.value = v
                        })
                      ),
                  },
                ]}
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
                updatePlot(
                  produce(plot, draft => {
                    draft.props.logFc.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(2, displayProps.logFc.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.logFc.threshold = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <PropRow title="Highlight">
              <ColorPickerButton
                colors={[
                  {
                    color: displayProps.logFc.neg.color,
                    onColorChange: v =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.logFc.neg.color = v
                        })
                      ),
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Points &lt; 0"
              />

              <ColorPickerButton
                colors={[
                  {
                    color: displayProps.logFc.pos.color,
                    onColorChange: v =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.logFc.pos.color = v
                        })
                      ),
                  },
                ]}
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
                updatePlot(
                  produce(plot, draft => {
                    draft.props.logP.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(10, -displayProps.logP.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.logP.threshold = -Math.log10(v)
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Line"
              checked={displayProps.logP.line.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.logP.line.show = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="labels">
          <AccordionTrigger>Labels</AccordionTrigger>
          <AccordionContent>
            <BaseCol className="gap-y-1">
              <Textarea
                id="labels"
                aria-label="Labels"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="List data labels to highlight"
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
                  <IconButton
                    aria-label="Load highlighted labels"
                    onClick={() => loadHighlightedLabels()}
                    title="Load highlighted labels from plot"
                  >
                    <TagIcon />
                  </IconButton>
                </ToolbarTabGroup>

                <Button
                  variant="link"
                  //size="sm"
                  onClick={() => {
                    setText('')

                    updatePlot(
                      produce(plot, draft => {
                        draft.props.labels.values = []
                      })
                    )
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
}
