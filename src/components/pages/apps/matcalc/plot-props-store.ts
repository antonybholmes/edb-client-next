import { APP_ID } from '@/consts'
import type { IVolcanoDisplayOptions } from '@components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { type IHeatMapDisplayOptions } from '@components/plot/heatmap/heatmap-svg-props'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import type { IExtGseaDisplayOptions } from '../genes/gsea/ext-gsea-store'
import type { IBoxPlotDisplayOptions } from './apps/boxplot/boxplot-plot-svg'

const SETTINGS_KEY = `${APP_ID}.matcalc-heatmap-props-v3`

export type IPlotDisplayOptions =
  | IHeatMapDisplayOptions
  | IVolcanoDisplayOptions
  | IExtGseaDisplayOptions
  | IBoxPlotDisplayOptions

export type PlotDisplayOptionsMap<T extends IPlotDisplayOptions> = {
  [key: string]: T
}

const plotAtom = persistentAtom<PlotDisplayOptionsMap<IHeatMapDisplayOptions>>(
  SETTINGS_KEY,
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function updateProps(settings: PlotDisplayOptionsMap<IHeatMapDisplayOptions>) {
  plotAtom.set(settings)
}

function resetProps() {
  updateProps({})
}

export function usePlotPropsStore(): {
  props: PlotDisplayOptionsMap<IHeatMapDisplayOptions>
  updateProps: (settings: PlotDisplayOptionsMap<IHeatMapDisplayOptions>) => void
  resetProps: () => void
} {
  const props = useStore(plotAtom)

  return {
    props,
    updateProps,
    resetProps,
  }
}
