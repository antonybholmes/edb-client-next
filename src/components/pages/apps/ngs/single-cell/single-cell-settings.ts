import { DEFAULT_COLORBAR_SIZE } from '@/components/plot/heatmap/heatmap-svg-props'
import {
  DEFAULT_SCATTER_PROPS,
  type IDisplayAxis,
  type IScatterDisplayOptions,
} from '@/components/plot/scatter/scatter-plot-svg'
import {
  DEFAULT_COLOR_PROPS,
  DEFAULT_MARGIN,
  DEFAULT_STROKE_PROPS,
  type IMarginProps,
  type IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import type { IDBEntity } from '@/interfaces/db-entity'
import type { IDim } from '@/interfaces/dim'
import { getAppName } from '@/lib/app-info'
import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'
import type { ILim } from '@/lib/math/math'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import APP_INFO from './manifest.json'

interface IGenome {
  name: string
  assembly: string
}

export type GeneSetMode = 'gex' | 'global-gex' | 'clusters'

export interface IScrnaGene {
  // ensembl
  geneId: string
  // gene symbol
  geneSymbol: string
}

/**
 * Gene expression data for a single gene
 */
export interface IScrnaGexGene extends IScrnaGene {
  // pair of (cell index, expression value) so that we can
  // store sparse matrices efficiently and ignore zeros
  //gex: [number, number][]
  indexes: number[]
  gex: number[]
}

export interface IGeneSet extends IDBEntity {
  mode: GeneSetMode
  genes: IScrnaGene[]
}

const SETTINGS_KEY = `${config.appId}:app:${getAppName(APP_INFO.name)}:v30`

// GEX - each plot use its own scale, Global GEX - all plots use the same scale, Cluster - draw clusters rather than GEX

export interface IScrnaClusterRoundel {
  show: boolean
  stroke: IStrokeProps
  fill: IPaintProps
  size: number
}

export const DEFAULT_ROUNDEL: IScrnaClusterRoundel = {
  show: true,
  stroke: { ...DEFAULT_STROKE_PROPS },
  fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_WHITE, opacity: 0.8 },
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
  gex: {
    // sort cells by expression value when drawing so that high expr values are not hidden
    sortByExpr: boolean
    autoRange: boolean
    useGlobalRange: boolean
    log: {
      mode: 'log1p' | 'log2' | 'log10' | 'ln'
      on: boolean
    }

    range: ILim
    zscore: { on: boolean; range: ILim }
    // how to display cells that belong to hidden clusters
    hiddenClusterDisplayMode: 'min' | 'max' | 'hidden' | 'default'
  }
  grid: {
    padding: number
    titles: { show: boolean; offset: number; color: string }
    on: boolean
    cols: number

    axes: { xaxis: { length: number }; yaxis: { length: number } }
  }
  umap: { clusters: { show: boolean; roundel: IScrnaClusterRoundel } }
  //mode: PlotMode

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
  genome: IGenome
  search: string
}

const GENOMES: readonly IGenome[] = Object.freeze([
  { name: 'Human', assembly: 'GRCh38' },
  { name: 'Mouse', assembly: 'GRCm38' },
])

export const DEFAULT_RANGE: ILim = [0, 10]

export const DEFAULT_LEGEND: ILegend = {
  show: true,
  width: 200,
  gap: 4,
  size: 8,
  height: 16,
  showUndetClusters: false,
  showClusterId: false,
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

const DEFAULT_GENE_SETS: readonly IGeneSet[] = Object.freeze([
  {
    id: '019d21d6-6769-7441-9815-0e3117cd5a44',
    name: 'Clusters',
    mode: 'clusters',
    genes: [],
  },
  {
    id: '019d21d6-8212-7ac5-9cb3-9a4510893f87',
    name: 'AICDA',
    genes: [{ geneId: 'ENSG00000111732', geneSymbol: 'AICDA' }],
    mode: 'global-gex',
  },
  {
    id: '019d21d6-bc11-7fb2-a454-b03d2d4cb348',
    name: 'AHR',
    genes: [{ geneId: 'ENSG00000106546', geneSymbol: 'AHR' }],
    mode: 'global-gex',
  },
])

export const DEFAULT_SETTINGS: ISingleCellSettings = {
  ...DEFAULT_SCATTER_PROPS,
  genesets: [...DEFAULT_GENE_SETS],
  autoAxes: true,

  margin: { ...DEFAULT_MARGIN },
  legend: { ...DEFAULT_LEGEND },
  gex: {
    sortByExpr: true,
    useGlobalRange: true,
    autoRange: true,
    range: [...DEFAULT_RANGE],
    log: { on: true, mode: 'log2' },
    zscore: {
      on: false,
      range: [-2, 2],
    },
    hiddenClusterDisplayMode: 'default',
  },
  //globalGexRange: [0, 10],

  cmap: 'BWR v2',
  //mode: 'clusters',
  umap: {
    clusters: {
      show: true,
      roundel: { ...DEFAULT_ROUNDEL },
    },
  },
  grid: {
    on: true,
    cols: 4,
    padding: 25,
    axes: {
      xaxis: {
        length: 250,
      },
      yaxis: {
        length: 250,
      },
    },
    titles: {
      show: true,
      offset: 10,
      color: COLOR_BLACK,
    },
  },

  dots: {
    size: 2,
    color: DOT_GRAY,
    opacity: 1,
  },
  genome: { ...GENOMES[0]! },
  search: '',
}

export interface ISingleCellSettingsStore extends ISingleCellSettings {
  updateSettings: (settings: Partial<ISingleCellSettings>) => void
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

export function useSingleCellSettings(): {
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
