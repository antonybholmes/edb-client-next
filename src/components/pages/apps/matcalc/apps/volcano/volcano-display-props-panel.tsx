import { VCenterRow } from '@/layout/v-center-row'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { type IVolcanoDisplayOptions } from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { PropsPanel } from '@/components/props-panel'
import { TEXT_CLEAR, TEXT_OK, TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { textToLines } from '@/lib/text/lines'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/baseui/accordion'
import { Button } from '@/themed/baseui/button'
import { NumericalInput } from '@/themed/numerical-input'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useDialogs } from '@/components/dialogs/dialogs'
import { BaseCol } from '@/components/layout/base-col'
import { AxesDisplayPropsPopover } from '@/components/plot/axes/plot/axes-groups-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { SmallSwitch } from '@/components/shadcn/ui/themed/baseui/small-switch'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { useHistory } from '../../history/history-provider/history-provider'
import APP_INFO from '../../manifest.json'
import { useVolcanoContext } from './volcano-provider'
import { useVolcanoSettings } from './volcano-settings-store'

export function VolcanoDisplayPropsPanel() {
  const { open: openDialog } = useDialogs()

  const [tabs, setTabs] = useState<string[]>([
    'plot',
    'fold-change',
    'p-value',
    'labels',
  ])

  const { updatePlot } = useHistory()

  const { plot, displayLabels, setLabels } = useVolcanoContext()
  const { settings, updateSettings, resetSettings } = useVolcanoSettings()

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
    if (settings.labels.auto) {
      setText(displayLabels.join('\n'))
    }
  }, [settings.labels.auto, displayLabels])

  // function declutter({ iterations = 50, padding = 1 } = {}) {
  //   const labelSet = new Set<string>(displayLabels.map((x) => x.toLowerCase()))

  //   const labelIdx = plot.volcano.entries
  //     ?.map((v, vi) => ({ index: vi, value: v.id }))
  //     .filter((v) => labelSet.has((v.value as string).toLowerCase()))
  //     .map((v) => v.index)

  //   const svgLabels = labelIdx.map((i) =>
  //     document.querySelector(`#label-text-${i}`)
  //   )
  //   const svgLines = labelIdx.map((i) =>
  //     document.querySelector(`#label-line-${i}`)
  //   )

  //   // labels: array of SVG <text> elements
  //   // remember each label's anchor so we can draw leader lines later
  //   const items = svgLabels.map((el) => {
  //     const x = +el.getAttribute('x')
  //     const y = +el.getAttribute('y')
  //     return { el, ax: x, ay: y, x, y }
  //   })

  //   const box = (it: {
  //     el: SVGTextElement
  //     ax: number
  //     ay: number
  //     x: number
  //     y: number
  //   }) => {
  //     const b = it.el.getBBox() // size only; position comes from it.x / it.y
  //     return {
  //       w: b.width + padding * 2,
  //       h: b.height + padding * 2,
  //       // bbox relative to the label's current x/y
  //       dx: b.x - +it.el.getAttribute('x'),
  //       dy: b.y - +it.el.getAttribute('y'),
  //     }
  //   }

  //   const sizes = items.map(box)

  //   for (let n = 0; n < iterations; n++) {
  //     let moved = false

  //     for (let [i, a] of items.entries()) {
  //       for (let j = i + 1; j < items.length; j++) {
  //         const b = items[j]
  //         const sa = sizes[i]
  //         const sb = sizes[j]

  //         const ax = a.x + sa.dx,
  //           ay = a.y + sa.dy

  //         const bx = b.x + sb.dx,
  //           by = b.y + sb.dy

  //         const overlapX = Math.min(ax + sa.w, bx + sb.w) - Math.max(ax, bx)
  //         const overlapY = Math.min(ay + sa.h, by + sb.h) - Math.max(ay, by)

  //         if (overlapX > 0 && overlapY > 0) {
  //           moved = true
  //           // push apart along the axis with the smaller overlap
  //           if (overlapX < overlapY) {
  //             const push = overlapX / 2 + 0.5
  //             const dir = ax + sa.w / 2 < bx + sb.w / 2 ? -1 : 1
  //             a.x += dir * push
  //             b.x -= dir * push
  //           } else {
  //             const push = overlapY / 2 + 0.5
  //             const dir = ay + sa.h / 2 < by + sb.h / 2 ? -1 : 1
  //             a.y += dir * push
  //             //b.y -= dir * push
  //           }
  //         }
  //       }
  //     }

  //     if (!moved) break
  //   }

  //   // apply positions
  //   items.forEach((it) => {
  //     it.el.setAttribute('x', it.x.toString())
  //     it.el.setAttribute('y', it.y.toString())
  //   })

  //   // move x2 of lines
  //   for (const [i, it] of items.entries()) {
  //     // update x2 of lines connected to this label
  //     svgLines[i].setAttribute('x2', it.x.toString())
  //     svgLines[i].setAttribute('y2', it.y.toString())
  //   }

  //   return items
  // }

  function declutterY({ padding = 0, gap = 0.1 } = {}) {
    const labelSet = new Set<string>(displayLabels.map((x) => x.toLowerCase()))

    const labelIdx = plot.volcano.entries
      ?.map((v, vi) => ({ index: vi, value: v.id }))
      .filter((v) => labelSet.has((v.value as string).toLowerCase()))
      .map((v) => v.index)

    const svgLabels: SVGGraphicsElement[] = labelIdx.map((i) =>
      document.querySelector(`#label-text-${i}`)
    )
    const svgLines = labelIdx.map((i) =>
      document.querySelector(`#label-line-${i}`)
    )

    const items = svgLabels.map((el) => {
      const x = +el.getAttribute('x')
      const y = +el.getAttribute('y')
      const b = el.getBBox()
      return {
        el,
        ax: x,
        ay: y,
        x,
        y,
        w: b.width + padding * 2,
        h: b.height + padding * 2,
        dx: b.x - x - padding,
        dy: b.y - y - padding,
      }
    })
    console.log(items)

    const left = (it) => it.x + it.dx
    const top = (it) => it.y + it.dy
    const overlaps = (a, b) =>
      left(a) < left(b) + b.w &&
      left(b) < left(a) + a.w &&
      top(a) < top(b) + b.h &&
      top(b) < top(a) + a.h

    const placed = []
    for (const it of [...items].sort((a, b) => b.ay - a.ay)) {
      let hit
      while ((hit = placed.find((p) => overlaps(it, p)))) {
        it.y = top(hit) - it.h - it.dy - gap // land clearly above, never exactly touching
      }
      placed.push(it)
    }
    items.forEach((it) => it.el.setAttribute('y', it.y.toString()))

    // move x2 of lines
    for (const [i, it] of items.entries()) {
      // update x2 of lines connected to this label
      svgLines[i].setAttribute('x2', it.x.toString())
      svgLines[i].setAttribute('y2', it.y.toString())
    }

    return items // ax/ay = original anchor, x/y = final position
  }

  return (
    <PropsPanel>
      <VCenterRow className="justify-end mb-1">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: APP_INFO.name,
                content: 'Are you sure you want to reset all settings?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset Properties to Defaults"
          className="text-xs"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion value={tabs} onValueChange={setTabs}>
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

            <PropRow title="Axes">
              <AxesDisplayPropsPopover
                plots={[
                  {
                    id: plot.id,
                    title: 'Volcano Plot',
                    groups: [
                      {
                        id: 'volcano',
                        title: 'Volcano',
                        axes: [
                          { id: 'x', title: 'X-axis' },
                          { id: 'y', title: 'Y-axis' },
                        ],
                      },
                    ],
                  },
                ]}
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

            <CheckPropRow
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
              <StrokeButton
                colors={[
                  {
                    color: displayProps.border.value,
                    width: displayProps.border.width,
                    dasharray: displayProps.border.dasharray,
                    show: displayProps.border.show,
                    onColorChange: ({ color, width, dasharray, show }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.border.value = color
                          draft.props.border.width = width
                          draft.props.border.dasharray = dasharray
                          draft.props.border.show = show
                        })
                      ),
                  },
                ]}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fold-change">
          <AccordionTrigger>Fold change</AccordionTrigger>
          <AccordionContent>
            <CheckPropRow
              title="Filter"
              checked={settings.logFc.show}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.logFc.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={settings.logFc.threshold} //Math.pow(2, displayProps.logFc.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.logFc.threshold = v
                    })
                  )
                }}
              />
            </CheckPropRow>

            <PropRow title="Highlight">
              <FillButton
                colors={[
                  {
                    color: settings.logFc.neg.fill.value,
                    onColorChange: ({ color }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.logFc.neg.fill.value = color
                        })
                      ),
                  },
                ]}

                title="Points &lt; 0"
              />

              <FillButton
                colors={[
                  {
                    color: settings.logFc.pos.fill.value,
                    onColorChange: ({ color }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.logFc.pos.fill.value = color
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
            <CheckPropRow
              title="Threshold"
              checked={settings.pvalue.show}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.pvalue.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                value={settings.pvalue.threshold} //Math.pow(10, -displayProps.logP.threshold)}
                dp={3}
                step={0.001}
                limit={[0, 1]}
                placeholder="Max..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.pvalue.threshold = v // -Math.log10(v)
                    })
                  )
                }}
              />

              {/* <SelectList
                value={displayProps.pvalue.threshold.toString()}
                onValueChange={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.pvalue.threshold = parseInt(v as string)
                    })
                  )
                }}
                w="lg"
              >
                <SelectItem value={5}>5%</SelectItem>
              </SelectList> */}
            </CheckPropRow>

            <CheckPropRow
              title="Line"
              checked={settings.pvalue.line.show}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.pvalue.line.show = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="labels">
          <AccordionTrigger
            rightChildren={
              <SmallSwitch
                className="font-normal"
                checked={settings.labels.auto}
                onCheckedChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.labels.auto = v
                    })
                  )
                }}
              >
                Auto Label
              </SmallSwitch>
            }
          >
            Labels
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="X-offset">
              <NumSlider
                value={settings.labels.offset.x}
                min={0}
                max={100}
                onNumChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.labels.offset.x = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Y-offset">
              <NumSlider
                value={settings.labels.offset.y}
                min={0}
                max={100}
                onNumChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.labels.offset.y = v
                    })
                  )
                }}
              />
            </PropRow>
            <VCenterRow className="justify-end">
              <LinkButton
                onClick={() => {
                  openDialog({
                    type: 'warning',
                    payload: {
                      title: APP_INFO.name,
                      content: 'Are you sure you want to reset all settings?',
                      callback: (response) => {
                        if (response === TEXT_OK) {
                          setText('')
                          setLabels([])
                        }
                      },
                    },
                  })
                }}
              >
                {TEXT_CLEAR}
              </LinkButton>
            </VCenterRow>
            <Textarea
              id="labels"
              aria-label="Labels"
              value={text}
              onTextChange={(v) => setText(v)}
              placeholder="Label points on plot..."
              className="mt-1 h-48"
              //disabled={settings.volcano.labels.auto}
            />

            <BaseCol className="mt-2 gap-y-1">
              <Button
                variant="app-theme"
                aria-label="Add labels to plot"
                onClick={() => addLabels()}
              >
                Add Labels
              </Button>

              <Button variant="secondary" onClick={() => declutterY()}>
                Organize Labels
              </Button>
            </BaseCol>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
