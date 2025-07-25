import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { useContext, useState } from 'react'

import { TEXT_RESET } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'
import { LinkButton } from '@themed/link-button'

import { NumericalPropRow } from '@/components/dialog/numerical-prop-row'
import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import type { ILim } from '@/lib/math/math'
import { produce } from 'immer'
import { ColorMapMenu } from '../matcalc/color-map-menu'

import { BWR_CMAP_V2 } from '@/lib/color/colormap'

import { PlotGridContext } from './plot-grid-provider'
import { useUmapSettings } from './single-cell-settings'

export function UmapPropsPanel() {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { settings, updateSettings, resetSettings } = useUmapSettings()

  const { plots, setPlots, setPalette } = useContext(PlotGridContext)!

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'axes',
    'data',
    'legend',
  ])

  return (
    <PropsPanel>
      <VCenterRow className="justify-end pb-2">
        <LinkButton
          onClick={() => {
            resetSettings()
          }}
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
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
                inputCls="rounded-theme"
                w="w-16"
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
              <NumericalPropRow
                title="Cols"
                onNumChanged={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.grid.cols = v
                    })
                  )
                }}
                value={settings.grid.cols}
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="axes">
          <AccordionTrigger>Axes</AccordionTrigger>
          <AccordionContent>
            <PropRow title="X">
              <DoubleNumericalInput
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

            <PropRow title="Y">
              <DoubleNumericalInput
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

            <SwitchPropRow
              title="Auto"
              checked={settings.autoAxes}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.autoAxes = checked
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data">
          <AccordionTrigger>Data</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Z-score"
              checked={settings.zscore.on}
              onCheckedChange={checked => {
                updateSettings(
                  produce(settings, draft => {
                    draft.zscore.on = checked
                  })
                )
              }}
            >
              <DoubleNumericalInput
                id="max"
                v1={settings.zscore.range[0]}
                v2={settings.zscore.range[1]}
                limit={[-10, 10]}
                inc={0.5}
                dp={1}
                placeholder="Max..."
                w="w-16"
                className="rounded-theme"
                onNumChanged1={v => {
                  const lim: ILim = [v, settings.zscore.range[1]]
                  updateSettings(
                    produce(settings, draft => {
                      draft.zscore.range = lim
                    })
                  )

                  setPlots(
                    plots.map(plot =>
                      plot.mode.includes('gex')
                        ? {
                            ...plot,
                            gexRange: lim,
                          }
                        : plot
                    )
                  )
                }}
                onNumChanged2={v => {
                  const lim: ILim = [settings.zscore.range[0], v]
                  updateSettings(
                    produce(settings, draft => {
                      draft.zscore.range = lim
                    })
                  )

                  setPlots(
                    plots.map(plot =>
                      plot.mode.includes('gex')
                        ? {
                            ...plot,
                            gexRange: lim,
                          }
                        : plot
                    )
                  )
                }}
              >
                to
              </DoubleNumericalInput>
            </SwitchPropRow>

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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legend">
          <AccordionTrigger>Legend</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Colormap">
              <ColorMapMenu
                align="end"
                cmap={plots[0]?.palette ?? BWR_CMAP_V2} // COLOR_MAPS[settings.cmap]!}
                onChange={cmap => {
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
                w="w-16"
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
              title="Color Bar"
              checked={settings.legend.colorbar.show}
              onCheckedChange={v => {
                updateSettings(
                  produce(settings, draft => {
                    draft.legend.colorbar.show = v
                  })
                )
              }}
            ></SwitchPropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
