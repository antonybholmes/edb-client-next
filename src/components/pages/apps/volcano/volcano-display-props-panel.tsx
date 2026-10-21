import { VCenterRow } from '@/layout/v-center-row'
import { DEFAULT_VOLCANO_PROPS } from './volcano-plot-svg'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { type IVolcanoDisplayOptions } from '@/components/pages/apps/volcano/volcano-plot-svg'
import { PropsPanel } from '@/components/props-panel'
import { TEXT_CLEAR, TEXT_OK, TEXT_RESET, TEXT_UPDATE } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { textToLines } from '@/lib/text/lines'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/baseui/accordion'
import { NumericalInput } from '@/themed/numerical-input'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useDialogs } from '@/components/dialogs/dialogs'

import { ElbowConnectorIcon } from '@/components/icons/shapes/elbow-connector-icon'
import { StraightConnectorIcon } from '@/components/icons/shapes/straight-connector-icon'
import { AxesDisplayPropsPopover } from '@/components/plot/axes/props/axes-groups-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { Checkbox } from '@/components/shadcn/ui/themed/baseui/check-box'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/baseui/percent-slider'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/baseui/toggle-group'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { getCmapFromColorMap } from '@/lib/color/colormap'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import { BetweenHorizonalStart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ColorMapMenu } from '../matcalc/color-map-menu'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import APP_INFO from '../matcalc/manifest.json'
import { useVolcanoContext } from './volcano-provider'
import { useVolcanoSettings } from './volcano-settings'

const TABS = ['plot', 'thresholds', 'colors', 'labels']

export function VolcanoDisplayPropsPanel() {
  const { open: openDialog } = useDialogs()

  const [tabs, setTabs] = useState<string[]>(TABS)

  const { updatePlot } = useHistory()

  const {
    plot,
    displayLabels,
    highlightedLabels,
    setLabels,
    addHighlightedLabels,
  } = useVolcanoContext()

  const { settings, cmap, updateSettings, resetSettings } = useVolcanoSettings()

  const displayProps: IVolcanoDisplayOptions = plot?.props ?? {
    ...DEFAULT_VOLCANO_PROPS,
  }

  const [text, setText] = useState<string>(
    displayProps.labels.values.join('\n')
  )

  function addLabels() {
    const values: string[] = textToLines(text, { trim: true })

    setLabels(values.sort())

    // updateSettings(
    //   produce(settings, (draft) => {
    //     draft.labels.auto = false
    //   })
    // )
  }

  useEffect(() => {
    setText(displayLabels.join('\n'))
  }, [displayLabels])

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

    const labelIdx = (plot?.volcano.entries ?? [])
      .map((v, vi) => ({ index: vi, value: v.label }))
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
                h="toolbar"
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
              {plot && (
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
              )}
            </PropRow>

            <PropRow title="Dots" contentCls="gap-x-2">
              <NumSlider
                min={1}
                max={50}

                value={settings.dots.size}

                dp={0}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.dots.size = v
                    })
                  )
                }}
              />
              <FillButton
                colors={[
                  {
                    color: settings.dots.color.value,
                    onColorChange: ({ color, opacity }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.dots.color.value = color
                          draft.dots.color.opacity = opacity
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

        <AccordionItem value="thresholds">
          <AccordionTrigger>Thresholds</AccordionTrigger>
          <AccordionContent>
            <CheckPropRow
              title="Fold Change"
              checked={settings.thresholds.logFc.show}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.thresholds.logFc.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="max"
                h="toolbar"
                value={settings.thresholds.logFc.threshold}
                dp={2}
                placeholder="Max..."

                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.thresholds.logFc.threshold = v
                    })
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="P-value Line"
              checked={settings.thresholds.pvalue.show}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.thresholds.pvalue.show = v
                  })
                )
              }}
            >
              <PercentSlider
                min={0.0000000001}
                dp={1}
                step={0.001}
                //inputW="sm"

                value={settings.thresholds.pvalue.threshold}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.thresholds.pvalue.threshold = v
                    })
                  )
                }}
              />
              <StrokeButton
                colors={[
                  {
                    color: settings.thresholds.pvalue.line.value,
                    width: settings.thresholds.pvalue.line.width,
                    opacity: settings.thresholds.pvalue.line.opacity,
                    dasharray: settings.thresholds.pvalue.line.dasharray,
                    show: settings.thresholds.pvalue.line.show,
                    onColorChange: ({
                      color,
                      width,
                      dasharray,
                      show,
                      opacity,
                    }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.thresholds.pvalue.line.value = color
                          draft.thresholds.pvalue.line.width = width
                          draft.thresholds.pvalue.line.dasharray = dasharray
                          draft.thresholds.pvalue.line.show = show
                          draft.thresholds.pvalue.line.opacity = opacity
                        })
                      ),
                  },
                ]}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Mode" contentCls="gap-x-2">
              <ToggleGroup
                variant="outline"
                size="toolbar"
                value={[settings.colors.mode]}
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      if (v[0] !== 'colors' && v[0] !== 'colormap') {
                        return
                      }

                      draft.colors.mode = v[0] as 'colors' | 'colormap'
                    })
                  )
                }}
                className="gap-x-px"
              >
                <GroupToggle
                  key="colors"
                  value="colors"
                  title="Colors"
                  className="w-16"
                >
                  Colors
                </GroupToggle>
                <GroupToggle
                  key="colormap"
                  value="colormap"
                  title="Colormap"
                  className="w-16"
                >
                  Colormap
                </GroupToggle>
              </ToggleGroup>
            </PropRow>
            <PropRow title="Colors" contentCls="gap-x-2">
              <FillButton
                colors={[
                  {
                    color: settings.colors.neg.fill.value,
                    opacity: settings.colors.neg.fill.opacity,
                    onColorChange: ({ color, opacity }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.colors.neg.fill.value = color
                          draft.colors.neg.fill.opacity = opacity
                        })
                      ),
                  },
                ]}

                title="Points &lt; 0"
              />

              <FillButton
                colors={[
                  {
                    color: settings.colors.pos.fill.value,
                    opacity: settings.colors.pos.fill.opacity,
                    onColorChange: ({ color, opacity }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.colors.pos.fill.value = color
                          draft.colors.pos.fill.opacity = opacity
                        })
                      ),
                  },
                ]}

                title="Points &ge; 0"
              />
            </PropRow>
            <PropRow title="Colormap" contentCls="gap-x-2">
              <Checkbox
                checked={settings.colors.gradient.on}
                onCheckedChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.colors.gradient.on = v
                    })
                  )
                }
              >
                Gradient
              </Checkbox>
              <ColorMapMenu
                cmap={cmap}
                onChange={(cmap) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.colors.cmap = getCmapFromColorMap(cmap)
                    })
                  )
                }
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="labels">
          <AccordionTrigger>Labels</AccordionTrigger>
          <AccordionContent>
            <VCenterRow className="justify-between">
              <VCenterRow className="gap-x-0.5">
                <ToolbarButton
                  variant="app-theme"
                  title="Add labels to plot"
                  onClick={() => addLabels()}
                >
                  {TEXT_UPDATE}
                </ToolbarButton>
                <ToolbarButton
                  variant="secondary"
                  title="Add labels for highlighted points"
                  onClick={() => {
                    addHighlightedLabels()
                  }}
                >
                  {/* <Tags size={18} /> */}
                  <span>Highlighted</span>
                </ToolbarButton>
                <ToolbarButton
                  variant="secondary"
                  title="Organize Labels"
                  onClick={() => declutterY()}
                >
                  <BetweenHorizonalStart size={18} />
                  <span>Organize</span>
                </ToolbarButton>
              </VCenterRow>

              <LinkButton
                onClick={() => {
                  openDialog({
                    type: 'warning',
                    payload: {
                      title: APP_INFO.name,
                      content: 'Are you sure you want to clear labels?',
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
              className="mt-1 h-40"
            />

            <CheckPropRow
              title="Auto Label Highlighted Points"
              checked={settings.labels.auto}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.labels.auto = v
                  })
                )
              }}
              tooltip="Automatically label highlighted points"
            />

            <CheckPropRow
              title="Only Color Labeled Points"
              checked={settings.colors.onlyLabeled}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.colors.onlyLabeled = v
                  })
                )
              }}
              tooltip="Only color labeled points"
            />
            <PropRow title="X-offset">
              <NumSlider
                value={settings.labels.offset.x}
                min={0}
                max={200}
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
                max={200}
                onNumChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.labels.offset.y = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Connector" contentCls="gap-x-3">
              <StrokeButton
                title="Line Style"
                colors={[
                  {
                    color: settings.labels.connector.stroke.value,
                    width: settings.labels.connector.stroke.width,
                    opacity: settings.labels.connector.stroke.opacity,
                    dasharray: settings.labels.connector.stroke.dasharray,
                    show: settings.labels.connector.stroke.show,
                    onColorChange: ({
                      color,
                      width,
                      dasharray,
                      show,
                      opacity,
                    }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.labels.connector.stroke.value = color
                          draft.labels.connector.stroke.width = width
                          draft.labels.connector.stroke.dasharray = dasharray
                          draft.labels.connector.stroke.show = show
                          draft.labels.connector.stroke.opacity = opacity
                        })
                      ),
                  },
                ]}
              />

              <ToggleGroup
                variant="outline"
                size="toolbar"
                aspect="icon"
                value={[settings.labels.connector.type]}
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      if (v[0] !== 'straight' && v[0] !== 'elbow') {
                        return
                      }

                      draft.labels.connector.type = v[0] as 'straight' | 'elbow'
                    })
                  )
                }}
                className="gap-x-px"
              >
                <GroupToggle
                  key="straight"
                  value="straight"
                  title="Straight Connector"
                >
                  <StraightConnectorIcon />
                </GroupToggle>
                <GroupToggle key="elbow" value="elbow" title="Elbow Connector">
                  <ElbowConnectorIcon />
                </GroupToggle>
              </ToggleGroup>
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
