import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { COLOR_BLACK, COLOR_WHITE } from '@/consts'
import type { ILim } from '@components/plot/axis'
import type { IPos } from '@interfaces/pos'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { range } from '@lib/math/range'
import { NA } from '@lib/text/text'
import { nanoid } from '@lib/utils'

import {
  DEFAULT_STROKE_PROPS,
  type ColorBarPos,
  type IStrokeProps,
  type LegendPos,
  type TopBottomPos,
} from '@/components/plot/svg-props'
import type { LeftRightPos } from '@/components/side'
import type { ILollipopDataFrame } from './plot-context'
import type { IProtein } from './protein-context'

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

export const MUTATION_MISSENSE = 'Missense'
export const MUTATION_FRAMESHIFT = 'Frameshift'
export const MUTATION_NONSENSE = 'Nonsense'
export const MUTATION_SPLICE = 'Splice'
export const MUTATION_INFRAME_INDEL = 'Inframe indel'

export const DEFAULT_FEATURE_BG_COLOR = '#c0c0c0'

export const DEFAULT_MUTATION_LEGEND_ORDER = [
  MUTATION_INFRAME_INDEL,
  MUTATION_NONSENSE,
  MUTATION_SPLICE,
  MUTATION_FRAMESHIFT,
  MUTATION_MISSENSE,
]

export const DEFAULT_COLOR_MAP: Map<string, string> = new Map([
  [MUTATION_MISSENSE, '#3cb371'],
  [MUTATION_NONSENSE, '#000000'],
  [MUTATION_SPLICE, '#FFD700'],
  [MUTATION_FRAMESHIFT, '#ff0000'],
  [MUTATION_INFRAME_INDEL, '#87CEEB'],
])

export interface ILegend {
  names: string[]
  colorMap: Map<string, string>
}

export interface ILollipopDisplayProps {
  labels: {
    show: boolean
    height: number

    strokeWidth: number
    opacity: number
  }
  features: {
    background: {
      show: boolean
      color: string
      border: {
        show: boolean
        color: string
        strokeWidth: number
        opacity: number
      }
    }
    show: boolean
    positions: { show: boolean }
    height: number
    border: {
      show: boolean
      color: string
      strokeWidth: number
      opacity: number
    }
  }
  seq: {
    border: {
      show: boolean
      color: string
      strokeWidth: number
      opacity: number
    }
  }
  mutations: {
    graph: {
      show: boolean
      height: number
      opacity: number
      border: IStrokeProps
    }
  }

  grid: {
    spacing: IPos
    cell: IBlock
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
      types: string[]
      colorMap: Map<string, string>
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
    cell: { w: 8, h: 8 },
    spacing: {
      x: 2,
      y: 2,
    },
  },

  rowLabels: { position: 'Right', width: 100, isColored: false },
  colLabels: { position: 'Top', width: 150, isColored: true },
  colorbar: { position: 'Right', barSize: [160, 16], width: 100 },
  legend: {
    position: 'Bottom',
    gap: 5,
    width: 150,
    mutations: {
      show: true,
      types: [...DEFAULT_MUTATION_LEGEND_ORDER],
      colorMap: new Map<string, string>(DEFAULT_COLOR_MAP),

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
  cmap: BWR_CMAP,
  axisOffset: 10,
  plotGap: 10,

  margin: { top: 100, right: 200, bottom: 100, left: 300 },

  mutations: {
    graph: {
      show: true,
      height: 200,
      opacity: 1,
      border: { ...DEFAULT_STROKE_PROPS },
    },
  },

  seq: {
    border: {
      show: false,
      color: COLOR_BLACK,
      strokeWidth: 1,
      opacity: 1,
    },
  },
  features: {
    show: true,
    height: 25,
    border: {
      show: true,
      color: COLOR_BLACK,
      strokeWidth: 1,
      opacity: 1,
    },
    positions: { show: true },
    background: {
      show: true,
      color: '#dddddd',
      border: {
        show: false,
        color: COLOR_BLACK,
        strokeWidth: 1,
        opacity: 1,
      },
    },
  },
  labels: {
    show: true,
    height: 30,

    strokeWidth: 1,
    opacity: 1,
  },
}

export interface IProteinFeature {
  id: string
  name: string
  start: number
  end: number
  color: string
  bgColor: string
  show: boolean
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
  variant: number
  sample: number
  aa: number
}

export class LollipopStats {
  private _position: number
  private _aa: string
  private _countMap: Map<string, Set<string>> = new Map<string, Set<string>>()

  constructor(position: number, aa: string) {
    this._position = position
    this._aa = aa
  }

  get position(): number {
    return this._position
  }

  get aa(): string {
    return this._aa
  }

  get countMap(): Map<string, Set<string>> {
    return new Map(this._countMap)
  }

  set(event: string, sample: string) {
    if (!this._countMap.has(event)) {
      this._countMap.set(event, new Set<string>())
    }

    this._countMap.get(event)?.add(sample)
  }

  get eventCounts(): [string, number][] {
    return [...this._countMap.entries()]
      .map(entry => [entry[0], entry[1].size] as [string, number])
      .sort((a, b) => a[0].localeCompare(b[0]))
  }

  get maxEvent(): [string, number] {
    if (this._countMap.size === 0) {
      return [NA, -1]
    }

    return this.eventCounts.sort((a, b) => b[1] - a[1])[0]!
  }

  get sum(): number {
    return this.eventCounts
      .map(event => event[1])
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  }
}

export interface IAAVar {
  from: string
  to: string
  position: number
  variant: string
  sample: string
  ref: string
}

const SUB_REGEX = /([^\d]+)(\d+)([^\d]+)/g
const SUB_V2_REGEX = /(\d+)([^\d]+)>([^\d]+)/g
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

function parseVariant(variant: string): string {
  variant = variant.toLowerCase()

  if (variant.includes('missense')) {
    return MUTATION_MISSENSE
  } else if (variant.includes('frameshift')) {
    return MUTATION_FRAMESHIFT
  } else if (variant.includes('in_frame')) {
    return MUTATION_INFRAME_INDEL
  } else if (variant.includes('splice')) {
    return MUTATION_SPLICE
  } else {
    // stop codons etc
    return MUTATION_NONSENSE
  }
}

export function makeLollipopData(
  protein: IProtein,
  mutDf: BaseDataFrame,
  featuresDf: BaseDataFrame | null,
  columns: ILollipopColumns
): ILollipopDataFrame {
  const features: IProteinFeature[] = []
  const labels: IProteinLabel[] = []

  if (featuresDf) {
    range(featuresDf.shape[0]).forEach(i => {
      const name = featuresDf.get(i, 0).toString()
      const start = featuresDf.get(i, 1) as number
      const end = featuresDf.get(i, 2) as number
      const color = featuresDf.get(i, 3).toString() ?? DEFAULT_FEATURE_BG_COLOR

      features.push({
        id: nanoid(),
        name,
        start,
        end,
        color: COLOR_BLACK,
        bgColor: color,
        show: true,
      })
    })
  }

  const aaChanges: IAAVar[] = range(mutDf.shape[0])
    .map(row => {
      //console.log(mutDf.colNames, columns)

      let sample = mutDf.col(columns.sample).values[row]!.toString()

      let ref = mutDf.col(columns.aa).values[row]!.toString()

      let variant = parseVariant(
        mutDf.col(columns.variant).values[row]!.toString()
      )

      const aa = ref.replace('p.', '')

      let matchArray = [...aa.matchAll(SUB_REGEX)]

      if (matchArray) {
        const from = matchArray[0]![1]!
        const position = Number(matchArray[0]![2]!)
        const to = matchArray[0]![3]!
        return { ref, from, to, position, variant, sample }
      } else {
        // try v2

        matchArray = [...aa.matchAll(SUB_V2_REGEX)]

        if (matchArray) {
          const position = Number(matchArray[0]![1]!)
          const from = matchArray[0]![2]!
          const to = matchArray[0]![3]!

          return { ref, from, to, position, variant, sample }
        }
      }

      return null
    })
    .filter(x => x !== null)

  let length = -1

  if (protein) {
    length = protein.seq.length
  } else {
    // determine length from data
    length = Math.max(...aaChanges.map(ac => ac.position))
  }

  let aaStats: LollipopStats[] = range(length).map(
    i => new LollipopStats(i + 1, protein?.seq.charAt(i) ?? '')
  )

  aaChanges.forEach(aaChange => {
    aaStats[aaChange.position - 1]!.set(aaChange.variant, aaChange.sample)
  })

  return {
    protein,
    aaStats,
    features,
    labels,
    displayProps: { ...DEFAULT_DISPLAY_PROPS },
  }

  //   const d: SeriesType[][] = df.rowMap((row: SeriesType[], index: number) => {
  //     const n = df.index.get(index) as SeriesType
  //     return [n, n].concat(row)
  //   })

  //   // const d = df.values.map((r, ri) => {
  //   //   const n = df.index.get(ri)

  //   //   return [n, n].concat(r as )
  //   // })

  //   return new DataFrame({
  //     name: "GCT",
  //     data: [l1, l2, l3].concat(d),
  //   })
}
