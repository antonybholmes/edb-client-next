import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialog/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { useState } from 'react'

import { NO_DIALOG, TEXT_OK, TEXT_RESET, type IDialogParams } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'

import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import { produce } from 'immer'
import { ColorMapMenu } from '../../matcalc/color-map-menu'

import { getColorMap } from '@/lib/color/colormap'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
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
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { settings, updateSettings, resetSettings } = useSingleCellSettings()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { setPalette } = usePlotGrid()

  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

  return (
    <>
      {showDialog.id.startsWith('reset') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              resetSettings()
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset all settings?
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2 pr-1">
        <VCenterRow className="justify-end pr-2">
          <LinkButton
            onClick={() => {
              setShowDialog({ id: 'reset', params: {} })
            }}
            title="Reset settings to default"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>
        <ScrollAccordion
          value={openTabs}
          onValueChange={v => setOpenTabs(v as string[])}
          variant="sidebar"
        >
          <AccordionItem value="plot">
            <AccordionTrigger variant="sidebar">Plot</AccordionTrigger>
            <AccordionContent variant="sidebar">
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
                title="Grid"
                checked={settings.grid.on}
                onCheckedChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.grid.on = v
                    })
                  )
                }}
              >
                <Label htmlFor="cols-input">Cols</Label>

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
            <AccordionTrigger variant="sidebar">Data</AccordionTrigger>
            <AccordionContent variant="sidebar">
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
                  color={settings.dots.color}
                  onColorChange={color => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.dots.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="clusters">
            <AccordionTrigger variant="sidebar">Clusters</AccordionTrigger>
            <AccordionContent variant="sidebar">
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
            <AccordionTrigger variant="sidebar">Legend</AccordionTrigger>
            <AccordionContent variant="sidebar">
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
    </>
  )
}
