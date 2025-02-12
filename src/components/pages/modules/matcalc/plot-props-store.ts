import type { IVolcanoDisplayOptions } from '@/components/pages/modules/matcalc/modules/volcano/volcano-plot-svg'
import { type IHeatMapDisplayOptions } from '@/components/plot/heatmap/heatmap-svg-props'
import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import type { IExtGseaDisplayOptions } from '../gene/gsea/ext-gsea-store'
import type { IBoxPlotDisplayOptions } from './modules/boxplot/boxplot-plot-svg'

const SETTINGS_KEY = `${APP_ID}-matcalc-heatmap-props-v3`

export type IPlotDisplayOptions =
  | IHeatMapDisplayOptions
  | IVolcanoDisplayOptions
  | IExtGseaDisplayOptions
  | IBoxPlotDisplayOptions

export type PlotDisplayOptionsMap<T extends IPlotDisplayOptions> = {
  [key: string]: T
}

const localPropsStore = persistentAtom<
  PlotDisplayOptionsMap<IHeatMapDisplayOptions>
>(
  SETTINGS_KEY,
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function usePlotPropsStore(): {
  props: PlotDisplayOptionsMap<IHeatMapDisplayOptions>
  updateProps: (settings: PlotDisplayOptionsMap<IHeatMapDisplayOptions>) => void
  resetProps: () => void
} {
  const props = useStore(localPropsStore)

  function updateProps(
    settings: PlotDisplayOptionsMap<IHeatMapDisplayOptions>
  ) {
    localPropsStore.set(settings)
  }

  function resetProps() {
    updateProps({})
  }

  return {
    props,
    updateProps,
    resetProps,
  }
}
