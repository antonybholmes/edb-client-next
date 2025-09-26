import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { BWR_CMAP_V2, ColorMap } from '@lib/color/colormap'

import type { IBlock } from '@components/plot/heatmap/heatmap-svg-props'
import { makeNanoIdLen12 } from '@lib/id'

import {
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type ColorBarPos,
  type IColorProps,
  type IStrokeProps,
  type LegendPos,
  type TopBottomPos,
} from '@components/plot/svg-props'
import type { LeftRightPos } from '@components/side'
import type { ILim } from '@lib/math/math'
import type { ILollipopStats } from './lollipop-stats'

export const COLOR_PALETTE: string[] = [
  '#000080',
  '#4682B4',
  '#87CEEB',
  '#FFE4B5',
  '#FFA500',
  '#FF4500',
]

export const DEFAULT_FEATURE_COLOR = COLOR_BLACK
export const DEFAULT_MUTATION_COLOR = COLOR_WHITE

// export const MUTATION_MISSENSE = 'Missense'
// export const MUTATION_FRAMESHIFT = 'Frameshift'
// export const MUTATION_NONSENSE = 'Nonsense'
// export const MUTATION_SPLICE = 'Splice'
// export const MUTATION_INFRAME_INDEL = 'Inframe indel'

export type VariantType =
  | 'Missense'
  | 'Frameshift'
  | 'Nonsense'
  | 'Splice'
  | 'Inframe indel'

export const DEFAULT_FEATURE_BG_COLOR = '#c0c0c0'

// export const DEFAULT_VARIANT_LEGEND_ORDER: VariantType[] = [
//   'Inframe indel',
//   'Nonsense',
//   'Splice',
//   'Frameshift',
//   'Missense',
// ] as VariantType[] // Reverse to have the most common mutation type first

export const DEFAULT_VARIANT_LEGEND_ORDER: VariantType[] = [
  'Missense',
  'Splice',
  'Frameshift',
  'Nonsense',
  'Inframe indel',
] as VariantType[] // Reverse to have the most common mutation type first

// export const DEFAULT_COLOR_MAP: Map<string, string> = new Map([
//   [MUTATION_MISSENSE, '#3cb371'],
//   [MUTATION_NONSENSE, '#000000'],
//   [MUTATION_SPLICE, '#FFD700'],
//   [MUTATION_FRAMESHIFT, '#ff0000'],
//   [MUTATION_INFRAME_INDEL, '#87CEEB'],
// ])

export const DEFAULT_COLOR_MAP: Record<VariantType, string> =
  Object.fromEntries([
    ['Inframe indel', '#3cb371'],
    ['Nonsense', '#000000'],
    ['Splice', '#9966CC'],
    ['Frameshift', '#ff0000'],
    ['Missense', '#87CEEB'],
  ] as [VariantType, string][]) as Record<VariantType, string>

export interface ILollipopDisplayProps {
  title: { show: boolean; offset: number }
  labels: {
    show: boolean
    height: number

    strokeWidth: number
    opacity: number
  }
  features: {
    background: IColorProps & { border: IStrokeProps }
    show: boolean
    positions: { show: boolean }
    height: number
    border: IStrokeProps
    rounding: number
  }
  seq: {
    height: number
    show: boolean
    border: {
      show: boolean
      color: string
      strokeWidth: number
      opacity: number
    }
  }
  mutations: {
    plot: {
      show: boolean
      height: number
      opacity: number
      border: IStrokeProps
      proportional: boolean // Whether to use proportional scaling for lollipop sizes
      showCounts: boolean // Whether to show counts for each mutation
    }
    types: VariantType[]
    colorMap: Record<string, string>
  }

  grid: {
    //spacing: IPos
    cell: IBlock
    padding: number
  }

  axes: {
    x: {
      show: boolean
      position: 'top' | 'bottom'
      width: number // optional width for x-axis
      showEndTick: boolean // Show end tick on x-axis
    }
    y: {
      show: boolean
      position: 'left' | 'right'
      ticks: {
        lines: IStrokeProps & { dash: number; showZeroLine: boolean }
      }
    }
  }

  rowLabels: { position: LeftRightPos; width: number; isColored: boolean }
  colLabels: { position: TopBottomPos; width: number; isColored: boolean }
  colorbar: {
    barSize: [number, number]
    width: number
    position: ColorBarPos
  }

  legend: {
    show: boolean
    offset: number
    position: LegendPos
    width: number
    gap: number
    mutations: {
      label: string
      show: boolean
    }
  }
  dotLegend: {
    sizes: number[]
    lim: ILim
    type: string
  }
  axisOffset: number

  scale: number
  cmap: ColorMap
  plotGap: number

  margin: { top: number; right: number; bottom: number; left: number }
}

export const DEFAULT_DISPLAY_PROPS: ILollipopDisplayProps = {
  grid: {
    cell: { w: 10, h: 10 },
    padding: 3,
  },

  rowLabels: { position: 'right', width: 100, isColored: false },
  colLabels: { position: 'top', width: 150, isColored: true },
  colorbar: { position: 'right', barSize: [160, 16], width: 100 },
  legend: {
    position: 'bottom',
    gap: 5,
    width: 120,
    mutations: {
      show: true,

      label: 'Mutations',
    },

    offset: 20,
    show: true,
  },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: '%',
  },

  scale: 1,
  cmap: BWR_CMAP_V2,
  axisOffset: 10,
  plotGap: 10,

  margin: { top: 100, right: 100, bottom: 100, left: 100 },

  mutations: {
    plot: {
      show: true,
      height: 200,
      opacity: 1,
      border: { ...DEFAULT_STROKE_PROPS },
      proportional: false,
      showCounts: false,
    },
    types: [...DEFAULT_VARIANT_LEGEND_ORDER],
    colorMap: { ...DEFAULT_COLOR_MAP },
  },

  seq: {
    show: true,
    border: {
      show: false,
      color: COLOR_BLACK,
      strokeWidth: 1,
      opacity: 1,
    },

    height: 20,
  },
  features: {
    show: true,
    height: 25,
    border: {
      show: true,
      color: COLOR_BLACK,
      width: 1,
      alpha: 1,
    },
    positions: { show: true },
    background: {
      show: true,
      color: '#dddddd',
      opacity: 1,
      border: {
        show: false,
        color: COLOR_BLACK,
        width: 1,
        alpha: 1,
      },
    },
    rounding: 3,
  },
  labels: {
    show: true,
    height: 30,

    strokeWidth: 1,
    opacity: 1,
  },
  title: {
    show: true,
    offset: 30,
  },
  axes: {
    x: {
      show: true,
      position: 'top',
      width: 2000,
      showEndTick: false, // Show end tick on x-axis
    },
    y: {
      show: true,
      position: 'left',
      ticks: {
        lines: {
          ...DEFAULT_STROKE_PROPS,
          alpha: 0.2,
          dash: 5,
          showZeroLine: false,
        },
      },
    },
  },
}

export interface IProtein {
  gene: string
  name: string
  sequence: string
  accession: string

  //sample: string
  organism: string
  taxonId: number
}

export const DEFAULT_PROTEIN: IProtein = {
  gene: '',
  name: '',
  accession: '',
  sequence: '', // AminoAcid[]
  // sample: '',
  organism: '',
  taxonId: -1,
}

export interface ILollipop {
  protein: IProtein
  databases: string[]
  databasesForUse: Record<string, boolean>
  mutationsForUse: Record<string, boolean>
  //protein: IBaseProtein
  aaStats: ILollipopStats[]
  features: IProteinFeature[]
  labels: IProteinLabel[]
  //displayProps: ILollipopDisplayProps
}

export const DEFAULT_LOLLIPOP: ILollipop = {
  protein: { ...DEFAULT_PROTEIN },
  databases: [],
  databasesForUse: {},
  aaStats: [],
  features: [],
  mutationsForUse: Object.fromEntries(
    DEFAULT_DISPLAY_PROPS.mutations.types.map((m) => [m, true])
  ),
  //displayProps: { ...DEFAULT_DISPLAY_PROPS },
  labels: [],
}

export interface ILegend {
  names: string[]
  colorMap: Map<string, string>
}

export interface IProteinFeatureColors {
  text: IColorProps
  fill: IColorProps
  border: IStrokeProps
}

export interface IProteinFeature extends IProteinFeatureColors {
  id: string
  name: string
  start: number
  end: number
  show: boolean
  z: number // z-index for stacking order
}

export const DEFAULT_PROTEIN_COLORS: IProteinFeatureColors = {
  text: { ...OPAQUE_FILL_PROPS },
  fill: { ...OPAQUE_FILL_PROPS, color: DEFAULT_FEATURE_BG_COLOR },
  border: { ...DEFAULT_STROKE_PROPS },
}

export const DEFAULT_PROTEIN_FEATURE: IProteinFeature = {
  ...DEFAULT_PROTEIN_COLORS,
  id: makeNanoIdLen12(),
  name: '',
  start: 1,
  end: 10,
  show: true,
  z: 1,
}

export interface IProteinLabel {
  id: string
  name: string
  start: number
  color: string
  show: boolean
}

export interface IOncoProps {
  //colormap: { [key: string]: { color: string; z: number } }
  plotorder: string[]
  aliases: { [key: string]: string }
}

export interface ILollipopColumns {
  gene: number
  variant: number
  database: number
  sample: number
  aa: number
}

export interface IAAVar {
  from: string
  to: string
  position: number
  variant: VariantType
  database: string
  sample: string
  // the original proteint change string, e.g. p.Ala123Val
  change: string
}

export const SUB_REGEX = /([^\d])(\d+)([^\d])/g
export const SUB_V2_REGEX = /(\d)([^\d]+)>([^\d])/g
export const SUB_SPLICE_REGEX = /X(\d+)/g
//const DEL_REGEX = /(\w)(\d+)_(\w)(\d+)del/g
//const INS_REGEX = /(\w)(\d+)_(\w)(\d+)ins/g

// export class LollipopDataFrame {

//   private _protein: IProtein
//   private _aaChanges: IAAVar[]

//   private _aaStats: LollipopStats[]
//   private _features: IProteinFeature[]

//   constructor(
//     protein: IProtein,
//     aaChanges: IAAVar[],
//     aaStats: LollipopStats[],
//     features: IProteinFeature[],
//   ) {
//     this._protein = protein
//     this._aaChanges = aaChanges
//     this._aaStats = aaStats
//     this._features = features
//   }

//   get protein(): IProtein {
//     return this._protein
//   }

//   get aaStats(): LollipopStats[] {
//     return this._aaStats
//   }

//   get features(): IProteinFeature[] {
//     return this._features
//   }

//   get shape(): [number, number] {
//     return [1, this._aaStats.length]
//   }
// }

export function parseVariant(variant: string): VariantType {
  variant = variant.toLowerCase()

  if (variant.includes('missense')) {
    return 'Missense'
  } else if (
    variant.includes('frameshift') ||
    variant.includes('frame_shift')
  ) {
    return 'Frameshift'
  } else if (variant.includes('in_frame')) {
    return 'Inframe indel'
  } else if (variant.includes('splice')) {
    return 'Splice'
  } else {
    // stop codons etc
    return 'Nonsense'
  }
}
