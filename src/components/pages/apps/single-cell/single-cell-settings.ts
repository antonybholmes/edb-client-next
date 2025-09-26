import { DEFAULT_COLORBAR_SIZE } from '@/components/plot/heatmap/heatmap-svg-props'
import {
  DEFAULT_SCATTER_PROPS,
  type IDisplayAxis,
  type IScatterDisplayOptions,
} from '@/components/plot/scatter/scatter-plot-svg'
import {
  DEFAULT_FILL_PROPS,
  DEFAULT_MARGIN,
  DEFAULT_STROKE_PROPS,
  type IColorProps,
  type IMarginProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { APP_ID } from '@/consts'
import type { IDim } from '@/interfaces/dim'
import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'
import type { ILim } from '@/lib/math/math'
import { getModuleName } from '@/lib/module-info'
import { makeNanoIdLen12 } from '@lib/id'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import MODULE_INFO from './module.json'
import { IGeneSet } from './plot-grid-provider'

const SETTINGS_KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:v14`

// GEX - each plot use its own scale, Global GEX - all plots use the same scale, Cluster - draw clusters rather than GEX

export interface IScrnaClusterRoundel {
  show: boolean
  stroke: IStrokeProps
  fill: IColorProps
  size: number
}

export const DEFAULT_ROUNDEL: IScrnaClusterRoundel = {
  show: true,
  stroke: { ...DEFAULT_STROKE_PROPS },
  fill: { ...DEFAULT_FILL_PROPS, color: COLOR_WHITE, opacity: 0.75 },
  size: 12,
}

export interface ILegend {
  colorbar: {
    size: IDim
    show: boolean
  }
  title: { show: boolean; text: string; color: string }
  showClusterId: boolean
  size: number
  gap: number
  height: number
  show: boolean
  width: number
  showUndetClusters: boolean
}

export interface ISingleCellSettings extends IScatterDisplayOptions {
  gex: { useGlobalRange: boolean }
  grid: {
    titles: { show: boolean; offset: number; color: string }
    on: boolean
    cols: number

    axes: { xaxis: { length: number }; yaxis: { length: number } }
  }
  umap: { clusters: { show: boolean } }
  //mode: PlotMode
  zscore: { on: boolean; range: ILim }
  //globalGexRange: ILim
  legend: ILegend
  axes: {
    xaxis: IDisplayAxis
    yaxis: IDisplayAxis
  }

  padding: number
  scale: number

  autoAxes: boolean
  genesets: IGeneSet[]
  //clusters: IScrnaCluster[]
  margin: IMarginProps
  roundel: IScrnaClusterRoundel
}

export const DEFAULT_RANGE: ILim = [-3, 3]

export const DEFAULT_LEGEND: ILegend = {
  show: true,
  width: 200,
  gap: 4,
  size: 8,
  height: 16,
  showUndetClusters: false,
  showClusterId: true,
  title: {
    show: true,
    text: 'Clusters',
    color: COLOR_BLACK,
  },
  colorbar: {
    show: true,
    size: { ...DEFAULT_COLORBAR_SIZE },
  },
}

const DOT_GRAY = '#e0e0e0'

export const DEFAULT_SETTINGS: ISingleCellSettings = {
  ...DEFAULT_SCATTER_PROPS,
  genesets: [
    {
      id: makeNanoIdLen12(),
      name: '',
      genes: [{ geneId: 'ENSG00000111732.10', geneSymbol: 'AICDA' }],
    },
    {
      id: makeNanoIdLen12(),
      name: '',
      genes: [{ geneId: 'ENSG00000057657.15', geneSymbol: 'PRDM1' }],
    },
  ],
  autoAxes: true,

  margin: { ...DEFAULT_MARGIN },
  legend: { ...DEFAULT_LEGEND },
  //globalGexRange: [0, 10],
  zscore: {
    on: false,
    range: [-3, 3],
  },
  cmap: 'BWR v2',
  //mode: 'clusters',
  umap: {
    clusters: {
      show: true,
    },
  },
  grid: {
    on: false,
    cols: 4,
    axes: {
      xaxis: {
        length: 200,
      },
      yaxis: {
        length: 200,
      },
    },
    titles: {
      show: true,
      offset: 10,
      color: COLOR_BLACK,
    },
  },
  gex: {
    useGlobalRange: true,
  },
  roundel: { ...DEFAULT_ROUNDEL },
  dots: {
    size: 2,
    color: DOT_GRAY,
    opacity: 1,
  },
}

export interface ISingleCellSettingsStore extends ISingleCellSettings {
  updateSettings: (settings: Partial<ISingleCellSettings>) => void
  //applyTheme: (theme: Theme) => void
}

export const useSingleCellSettingsStore = create<ISingleCellSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: Partial<ISingleCellSettings>) => {
        set((state) => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const settingsAtom = persistentAtom<ISingleCellSettings>(
//   SETTINGS_KEY,
//   {
//     ...DEFAULT_SETTINGS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function updateSettings(settings: ISingleCellSettings) {
//   settingsAtom.set(settings)
// }

// function resetSettings() {
//   updateSettings({ ...DEFAULT_SETTINGS })
// }

export function useUmapSettings(): {
  settings: ISingleCellSettings
  updateSettings: (settings: Partial<ISingleCellSettings>) => void
  resetSettings: () => void
} {
  const settings = useSingleCellSettingsStore((state) => state)
  const updateSettings = useSingleCellSettingsStore(
    (state) => state.updateSettings
  )
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  return { settings, updateSettings, resetSettings }
}
