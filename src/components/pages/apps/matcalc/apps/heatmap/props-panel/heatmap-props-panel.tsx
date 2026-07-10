import { PropsPanel } from '@/components/props-panel'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { ScrollAccordion } from '@/themed/v2/accordion'

import { useState } from 'react'

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { TEXT_OK, TEXT_RESET } from '@/consts'
import { LinkButton } from '@/themed/link-button'

import { useDialogs } from '@/components/dialogs/dialogs'
import { produce } from 'immer'

import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { useHistory } from '../../../history/history-provider/history-provider'
import APP_INFO from '../../../manifest.json'
import { useHeatmapContext } from '../heatmap-provider'
import { CellSettingsPanel } from './cell-settings'
import { ColGroupsSettingsPanel } from './col-group-settings'
import { ColLabelsSettingsPanel } from './col-labels-settings'
import { ColTreeSettingsPanel } from './col-tree-settings'
import { ColormapSettingsPanel } from './colormap-settings'
import { DotLegendSettingsPanel } from './dot-legend-settings'
import { LegendSettingsPanel } from './legend-settings'
import { PlotSettingsPanel } from './plot-settings'
import { RowLabelsSettingsPanel } from './row-labels-settings'
import { RowTreeSettingsPanel } from './row-tree-settings'

export function HeatmapPropsPanel() {
  const { updatePlot } = useHistory()

  const { open: openDialog } = useDialogs()

  const { plot } = useHeatmapContext()

  const cf = plot?.dataframes['main'] as IClusterFrame

  const displayProps: IHeatMapDisplayOptions = plot.props
  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

  function reset() {
    const props: IHeatMapDisplayOptions = {
      ...DEFAULT_HEATMAP_PROPS,
      mode: displayProps.mode,
      dot: displayProps.dot,
    }

    updatePlot(
      produce(plot, (draft) => {
        draft.props = props
      })
    )
  }

  return (
    <PropsPanel className="pr-1 gap-y-2">
      <SideBarHeader className="justify-end">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: APP_INFO.name,
                content: 'Are you sure you want to reset all heatmap settings?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    reset()
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
      </SideBarHeader>
      <ScrollAccordion
        value={openTabs}
        onValueChange={(v) => setOpenTabs(v as string[])}
      >
        <PlotSettingsPanel />
        <CellSettingsPanel />
        <LegendSettingsPanel />
        {plot.style === 'dot' && <DotLegendSettingsPanel />}
        <ColormapSettingsPanel />
        <RowLabelsSettingsPanel />
        {cf?.rowTree && <RowTreeSettingsPanel />}
        <ColLabelsSettingsPanel />
        <ColGroupsSettingsPanel />
        {cf?.colTree && <ColTreeSettingsPanel />}
      </ScrollAccordion>
    </PropsPanel>
  )
}
