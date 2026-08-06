import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { type IVolcanoDisplayOptions } from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { PropsPanel } from '@/components/props-panel'
import { TEXT_CLEAR } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { textToLines } from '@/lib/text/lines'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { Button } from '@/themed/v2/button'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { useHistory } from '../../history/history-provider/history-provider'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { useVolcanoContext } from './volcano-provider'

export function VolcanoPropsPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updatePlot } = useHistory()

  const { plot, displayLabels, setLabels } = useVolcanoContext()
  const { settings, updateSettings } = useMatcalcSettings()

  const displayProps: IVolcanoDisplayOptions = plot.props

  const [text, setText] = useState<string>(
    displayProps.labels.values.join('\n')
  )

  function addLabels() {
    const values: string[] = textToLines(text, { trim: true })

    //console.log(values)
    setLabels(values)
  }

  useEffect(() => {
    if (settings.apps.volcano.labels.auto) {
      setText(displayLabels.join('\n'))
    }
  }, [settings.apps.volcano.labels.auto, displayLabels])

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
                onNumChanged1={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.length = v
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
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
                onNumChanged1={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.domain = [
                        v,
                        draft.props.axes.xaxis.domain[1],
                      ]
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
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
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
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
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.dots.size = v
                    })
                  )
                }}
              />

              <FillButton
                colors={[
                  {
                    color: displayProps.dots.color,
                    onColorChange: ({ color }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.dots.color = color
                        })
                      ),
                  },
                ]}
              />
            </PropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.border.show = v
                  })
                )
              }}
            >
              <FillButton
                colors={[
                  {
                    color: displayProps.border.value,
                    onColorChange: ({ color }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.border.value = color
                        })
                      ),
                  },
                ]}
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
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.logFc.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={displayProps.logFc.threshold} //Math.pow(2, displayProps.logFc.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.logFc.threshold = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <PropRow title="Highlight">
              <FillButton
                colors={[
                  {
                    color: displayProps.logFc.neg.color,
                    onColorChange: ({ color }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.logFc.neg.color = color
                        })
                      ),
                  },
                ]}

                title="Points &lt; 0"
              />

              <FillButton
                colors={[
                  {
                    color: displayProps.logFc.pos.color,
                    onColorChange: ({ color }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.logFc.pos.color = color
                        })
                      ),
                  },
                ]}

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
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.logP.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(10, -displayProps.logP.threshold)}
                dp={3}
                step={0.001}
                limit={[0, 1]}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.logP.threshold = -Math.log10(v)
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Line"
              checked={displayProps.logP.line.show}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
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
              <SwitchPropRow
                title="Auto label"
                checked={settings.apps.volcano.labels.auto}
                onCheckedChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.volcano.labels.auto = v
                    })
                  )
                }}
              />
              <Textarea
                id="labels"
                aria-label="Labels"
                value={text}
                onTextChange={(v) => setText(v)}
                placeholder="Label points on plot..."
                className="h-48"
                //disabled={settings.volcano.labels.auto}
              />

              <VCenterRow className="justify-between">
                <Button
                  variant="app-theme"
                  aria-label="Add labels to plot"
                  onClick={() => addLabels()}
                >
                  Add labels to plot
                </Button>

                <Button
                  variant="link"
                  //size="sm"
                  onClick={() => {
                    setText('')

                    setLabels([])
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
