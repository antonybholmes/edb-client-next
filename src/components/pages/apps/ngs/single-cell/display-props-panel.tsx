import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { useState } from 'react'

import { TEXT_OK, TEXT_RESET } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'

import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { produce } from 'immer'
import { ColorMapMenu } from '../../matcalc/color-map-menu'

import { getColorMap } from '@/lib/color/colormap'

import { useDialogs } from '@/components/dialogs/dialogs'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { NumericalInput } from '@/themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { usePlotGrid } from './plot-grid-store'
import { useSingleCellSettings } from './single-cell-settings'

export function DisplayPropsPanel() {
  const { settings, updateSettings, resetSettings } = useSingleCellSettings()

  const { open: openDialog } = useDialogs()
  const { setPalette } = usePlotGrid()

  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

  return (
    <PropsPanel className="gap-y-2 pr-1">
      <VCenterRow className="justify-end pr-2">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Reset Settings',
                content: 'Are you sure you want to reset all settings?',
                callback: response => {
                  if (response === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset settings to default"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion
        value={openTabs}
        onValueChange={v => setOpenTabs(v as string[])}
      >
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size" id="plot-size">
              <DoubleNumericalInput
                id="plot-size"
                v1={
                  settings.grid.on
                    ? settings.grid.axes.xaxis.length
                    : settings.axes.xaxis.length
                }
                v2={
                  settings.grid.on
                    ? settings.grid.axes.yaxis.length
                    : settings.axes.yaxis.length
                }
                limit={[100, 10000]}
                dp={0}
                onNumChanged1={v => {
                  console.log(v)
                  updateSettings(
                    produce(settings, draft => {
                      if (settings.grid.on) {
                        draft.grid.axes.xaxis.length = v
                      } else {
                        draft.axes.xaxis.length = v
                      }
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateSettings(
                    produce(settings, draft => {
                      if (settings.grid.on) {
                        draft.grid.axes.yaxis.length = v
                      } else {
                        draft.axes.xaxis.length = v
                      }
                    })
                  )
                }}
              />
            </PropRow>
            <SwitchPropRow
              breakpoint={200}
              title="Grid columns"
              checked={settings.grid.on}
              onCheckedChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.grid.on = v
                  })
                )
              }}
            >
              <NumericalInput
                id="cols-input"
                className="rounded-theme"
                value={settings.grid.cols}
                onNumChanged={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.grid.cols = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Titles"
              checked={settings.grid.titles.show}
              onCheckedChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.grid.titles.show = v
                  })
                )
              }}
            />

            <SwitchPropRow
              title="Auto axes"
              checked={settings.autoAxes}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.autoAxes = checked
                  })
                )
              }}
            />

            <PropRow title="X-axis" id="x-axis-domain">
              <DoubleNumericalInput
                id="x-axis-domain"
                v1={settings.axes.xaxis.domain[0]}
                v2={settings.axes.xaxis.domain[1]}
                inputCls="rounded-theme"
                limit={[-1000, 1000]}
                dp={0}
                onNumChanged1={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.axes.xaxis.domain = [
                        v,
                        settings.axes.xaxis.domain[1],
                      ]
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.axes.xaxis.domain = [
                        settings.axes.xaxis.domain[0],
                        v,
                      ]
                    })
                  )
                }}
              >
                to
              </DoubleNumericalInput>
            </PropRow>

            <PropRow title="Y-axis" id="y-axis-domain">
              <DoubleNumericalInput
                id="y-axis-domain"
                v1={settings.axes.yaxis.domain[0]}
                v2={settings.axes.yaxis.domain[1]}
                inputCls="rounded-theme"
                limit={[-1000, 1000]}
                dp={0}
                onNumChanged1={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.axes.yaxis.domain = [
                        v,
                        settings.axes.yaxis.domain[1],
                      ]
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.axes.yaxis.domain = [
                        settings.axes.yaxis.domain[0],
                        v,
                      ]
                    })
                  )
                }}
              >
                to
              </DoubleNumericalInput>
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data">
          <AccordionTrigger>Data</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Log2 scale"
              checked={settings.gex.log.on}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.gex.log.on = checked
                  })
                )
              }}
            />
            <SwitchPropRow
              title="Z-score"
              checked={settings.gex.zscore.on}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.gex.zscore.on = checked
                  })
                )
              }}
            />
            <SwitchPropRow
              title="Auto range"
              checked={settings.gex.autoRange}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.gex.autoRange = checked
                  })
                )
              }}
            />
            <PropRow title="Range" id="gex-range">
              <DoubleNumericalInput
                id="gex-range"
                v1={
                  settings.gex.zscore.on
                    ? settings.gex.zscore.range[0]
                    : settings.gex.range[0]
                }
                v2={
                  settings.gex.zscore.on
                    ? settings.gex.zscore.range[1]
                    : settings.gex.range[1]
                }
                limit={[-1000, 1000]}
                inc={1}
                dp={1}
                placeholder="Max..."
                onNumChanged1={v => {
                  updateSettings(
                    produce(settings, draft => {
                      if (settings.gex.zscore.on) {
                        draft.gex.zscore.range[0] = v
                      } else {
                        draft.gex.range[0] = v
                      }

                      draft.gex.autoRange = false
                    })
                  )

                  // const lim: ILim = [
                  //   v,
                  //   settings.gex.zscore.on
                  //     ? settings.gex.zscore.range[1]
                  //     : settings.gex.range[1],
                  // ]

                  // setPlots(
                  //   produce(plots, draft => {
                  //     draft.forEach(plot => {
                  //       if (plot.mode.includes('gex')) {
                  //         plot.gex.range = lim
                  //       }
                  //     })
                  //   })
                  // )
                }}
                onNumChanged2={v => {
                  updateSettings(
                    produce(settings, draft => {
                      if (settings.gex.zscore.on) {
                        draft.gex.zscore.range[1] = v
                      } else {
                        draft.gex.range[1] = v
                      }

                      draft.gex.autoRange = false
                    })
                  )

                  // const lim: ILim = [
                  //   settings.gex.zscore.on
                  //     ? settings.gex.zscore.range[0]
                  //     : settings.gex.range[0],
                  //   v,
                  // ]

                  // setPlots(
                  //   produce(plots, draft => {
                  //     draft.forEach(plot => {
                  //       if (plot.mode.includes('gex')) {
                  //         plot.gex.range = lim
                  //       }
                  //     })
                  //   })
                  // )
                }}
              >
                to
              </DoubleNumericalInput>
            </PropRow>

            <SwitchPropRow
              title="Expression sort"
              tooltip="Draw more highly expressed cells are on top so they are easier to see"
              checked={settings.gex.sortByExpr}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.gex.sortByExpr = checked
                  })
                )
              }}
            />
            <PropRow
              title="Default dot color"
              tooltip="The default color for dots when no gene expression or cluster is mapped"
            >
              <ColorPickerButton
                colors={[
                  {
                    color: settings.dots.color,
                    onColorChange: color =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.dots.color = color
                        })
                      ),
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="clusters">
          <AccordionTrigger>Clusters</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Labels"
              checked={settings.umap.clusters.show}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.umap.clusters.show = checked
                  })
                )
              }}
            />
            <SwitchPropRow
              title="Roundels"
              checked={settings.umap.clusters.roundel.show}
              disabled={!settings.umap.clusters.show}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.umap.clusters.roundel.show = checked
                  })
                )
              }}
            />

            <PropRow title="Hidden mode">
              <Select
                value={settings.gex.hiddenClusterDisplayMode}
                onValueChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.gex.hiddenClusterDisplayMode = v as
                      | 'min'
                      | 'max'
                      | 'hidden'
                      | 'default'
                  })

                  updateSettings(newSettings)
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue data-placeholder="Choose hidden cluster style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="min">Min</SelectItem>
                  <SelectItem value="max">Max</SelectItem>

                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legend">
          <AccordionTrigger>Legend</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Colormap">
              <ColorMapMenu
                align="end"
                cmap={getColorMap(settings.cmap)} // COLOR_MAPS[settings.cmap]!}
                onChange={cmap => {
                  // store the cmap the user likes
                  updateSettings(
                    produce(settings, draft => {
                      draft.cmap = cmap.name
                    })
                  )

                  // set all plots to use the new cmap
                  setPalette(cmap)
                }}
              />
            </PropRow>

            {/* <PropRow title="Max">
              <NumericalInput
                id="max"
                value={globalGexRange[1]}
                limit={[0.5, 10000]}
                inc={0.5}
                dp={1}
                placeholder="Max..."
                className="rounded-theme"
                onNumChanged={v => {
                  if (settings.mode.includes('gex')) {
                    updateSettings(
                      produce(settings, draft => {
                        draft.globalGexRange = [-v, v]
                      })
                    )
                  }
                }}
              />
            </PropRow> */}

            <SwitchPropRow
              title="Color bar"
              checked={settings.legend.colorbar.show}
              onCheckedChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.legend.colorbar.show = v
                  })
                )
              }}
            />

            <SwitchPropRow
              title="Cluster ID"
              checked={settings.legend.showClusterId}
              onCheckedChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.legend.showClusterId = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
