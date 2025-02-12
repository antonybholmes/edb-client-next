import { GenomicLocation, LocationBinMap } from '@/lib/genomic/genomic'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import type {
  ColorBarPos,
  LegendPos,
  TopBottomPos,
} from '@/components/plot/svg-props'
import type { LeftRightPos } from '@/components/side'
import { COLOR_BLACK, COLOR_WHITE } from '@/consts'
import { formatChr } from '@/lib/genomic/dna'
import type { ILim } from '@components/plot/axis'
import type { IPos } from '@interfaces/pos'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { range } from '@lib/math/range'
import { NA } from '@lib/text/text'

//export type LegendPos = 'Bottom' | 'Off'

export const MULTI_MUTATION = 'Multi'

export const COLOR_PALETTE: string[] = [
  '#000080',
  '#4682B4',
  '#87CEEB',
  '#FFE4B5',
  '#FFA500',
  '#FF4500',
]

export const NO_ALTERATION_COLOR = '#eeeeee'
export const NO_ALTERATIONS_TEXT = 'No Alterations'
export const OTHER_MUTATION = 'OTHER'

// ideally 64, but limited by js use of double for all nums
export const MAX_MEMO_POWER = 50

export type MultiMode = 'single' | 'stackedbar' | 'equalbar' | 'multi'

export const DEFAULT_COLOR_MAP: Map<string, string> = new Map([
  ['SNP', '#85C1E9'],
  ['INS', '#EC7063'],
  ['DEL', '#F5B041'],
  ['TRUNC', COLOR_BLACK],
  ['MISSENSE', '#32CD32'],
  ['OTHER', '#DA70D6'],
  ['CNA', '#0000ff'],
  ['EXP', '#ff0000'],
  ['Multi', COLOR_BLACK],
])

export interface ILegend {
  names: string[]
  colorMap: Map<string, string>
}

export interface IClinicalTrackProps {
  show: boolean
  colorMap: Map<string, string>
}

export interface IOncoplotDisplayProps {
  samples: {
    graphs: {
      show: boolean
      height: number
      opacity: number
      border: {
        show: boolean
        color: string
        strokeWidth: number
        opacity: number
      }
    }
  }
  features: {
    graphs: {
      show: boolean
      height: number
      opacity: number
      border: {
        show: boolean
        color: string
        strokeWidth: number
        opacity: number
      }
      percentages: {
        show: boolean
        width: number
      }
    }
  }

  multi: MultiMode

  grid: {
    opacity: number
    show: boolean
    color: string
    strokeWidth: number
    spacing: IPos
    cell: IBlock
  }
  border: {
    show: boolean
    color: string
    strokeWidth: number
    opacity: number
  }
  clinical: {
    show: boolean
    height: number
    gap: number
    border: {
      show: boolean
      color: string
      strokeWidth: number
      opacity: number
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
      noAlterationColor: string
      show: boolean
      names: string[]
      colorMap: Map<string, string>
    }
    clinical: {
      show: boolean
      tracks: IClinicalTrackProps[]
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

export const DEFAULT_DISPLAY_PROPS: IOncoplotDisplayProps = {
  multi: 'multi',

  grid: {
    show: false,
    color: COLOR_BLACK,
    opacity: 1,
    strokeWidth: 1,
    cell: { w: 4, h: 16 },
    spacing: {
      x: 2,
      y: 2,
    },
  },

  border: { show: false, color: COLOR_WHITE, opacity: 1, strokeWidth: 1 },
  rowLabels: { position: 'Right', width: 100, isColored: false },
  colLabels: { position: 'Top', width: 150, isColored: true },
  colorbar: { position: 'Right', barSize: [160, 16], width: 100 },
  legend: {
    show: true,
    position: 'Bottom',
    gap: 5,
    width: 150,
    mutations: {
      show: true,
      names: [],
      colorMap: new Map<string, string>(),
      noAlterationColor: NO_ALTERATION_COLOR,
      label: 'Mutations',
    },
    clinical: {
      show: true,
      tracks: [],
    },
    offset: 20,
  },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: '%',
  },
  clinical: {
    height: 16,
    gap: 4,
    show: true,
    border: { show: false, color: COLOR_BLACK, opacity: 1, strokeWidth: 1 },
  },
  scale: 1,
  cmap: BWR_CMAP,
  axisOffset: 10,
  plotGap: 10,

  margin: { top: 100, right: 200, bottom: 100, left: 300 },

  samples: {
    graphs: {
      show: true,
      height: 50,
      opacity: 1,
      border: {
        show: true,
        color: COLOR_BLACK,
        strokeWidth: 1,
        opacity: 1,
      },
    },
  },
  features: {
    graphs: {
      show: true,
      height: 100,
      opacity: 1,
      border: {
        show: true,
        color: COLOR_BLACK,
        strokeWidth: 1,
        opacity: 1,
      },
      percentages: {
        show: true,
        width: 60,
      },
    },
  },
}

export interface IOncoProps {
  //colormap: { [key: string]: { color: string; z: number } }
  plotorder: string[]
  aliases: { [key: string]: string }
}

export interface IOncoColumns {
  sample: number
  chr: number
  start: number
  end: number
  ref: number
  tum: number
  gene: number
  type: number
}

export class EventCountMap {
  private _countMap: Map<string, number> = new Map<string, number>()

  /**
   * For counting events such as mutations or clinical events. We can record
   * labels as well e.g. 'Breast cancer' by adding the event with the count
   * of 1 and ignoring the counts. This gives the flexibility to store
   * categorical and numerical data in the same object.
   *
   * @param event   an event such as a deletion that needs to be counted. can
   *               unknown kind of mutation event
   * @param count   the value to update the count by (defaults to 1), but in
   *                the case of a numerical value such as age, we might wish
   *                to set age to a specific amount
   */
  set(event: string, count: number = 1) {
    this._countMap.set(event, (this._countMap.get(event) ?? 0) + count)

    //this._genes.add(gene)
    //this._samples.add(sample)
  }

  get countMap(): Map<string, number> {
    return this._countMap
  }

  get events(): [string, number][] {
    return [...this._countMap.entries()].sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  }

  /**
   * Returns the entry with the highest count
   *
   * @returns
   */
  get maxEvent(): [string, number] {
    if (this._countMap.size === 0) {
      return [NA, -1]
    }

    return [...this._countMap.entries()].sort((a, b) => b[1] - a[1])[0]!
  }

  get sum(): number {
    return [...this._countMap.entries()]
      .map((event) => event[1])
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  }

  /**
   * Return the counts for a list of ids where each
   * entry is a pair [id, count]
   * @param ids
   * @param keepZeros   whether to include ids that have no counts. We
   *                    may wish to exclude zeros when making a dist plot for example
   *                    where we only care about values we found
   * @returns
   */
  countDist(ids: string[], keepZeros: boolean = true): [string, number][] {
    return ids
      .map((id) => [id, this._countMap.get(id) ?? 0] as [string, number])
      .filter((x: [string, number]) => keepZeros || x[1] > 0) as [
      string,
      number,
    ][]
  }

  /**
   * Return a normalized distribution such that the entries sum to 1.
   *
   * @param ids
   * @returns
   */
  normCountDist(ids: string[], keepZeros: boolean = true): [string, number][] {
    const total = this.sum
    return this.countDist(ids, keepZeros).map((x) => {
      x[1] /= total

      return x
    })
  }
}

class OncoCellStats extends EventCountMap {
  private _gene: string
  private _sample: string
  //private _genes: Set<string> = new Set<string>()
  //private _samples: Set<string> = new Set<string>()

  constructor(gene: string, sample: string) {
    super()
    this._gene = gene
    this._sample = sample
  }

  get gene(): string {
    return this._gene
  }

  get sample(): string {
    return this._sample
  }
}

/**
 * If a cell contains multiple entries, e.g. a sample has a SNP
 * and a DEL, return that it is multi mutated, else if multi is
 * not required, return the label with the highest count.
 * @param stats
 * @param multiMode
 * @returns
 */
export function getEventLabel(
  stats: OncoCellStats,
  oncoProps: IOncoProps,
  multiMode: MultiMode
): string {
  const events = [...stats.countMap.keys()].sort()

  if (events.length === 0) {
    return ''
  }

  if (multiMode !== 'single' && events.length > 1) {
    return MULTI_MUTATION
  }

  let event = stats.maxEvent[0]

  // try and aliases event name to something in the system
  event = oncoProps.aliases[event] ?? event

  return event
}

export class OncoplotMutationFrame {
  _data: OncoCellStats[][]
  _geneStats: OncoCellStats[]
  _sampleStats: OncoCellStats[]
  //private _originalSampleOrder: Map<string, number>
  //private _originalGeneOrder: Map<string, number>
  private _geneOrder: number[]
  private _sampleOrder: number[]

  constructor(
    data: OncoCellStats[][],
    geneStats: OncoCellStats[],
    sampleStats: OncoCellStats[],
    geneOrder: number[] = [],
    sampleOrder: number[] = []
  ) {
    this._data = data
    this._geneStats = geneStats
    this._sampleStats = sampleStats
    this._geneOrder = geneOrder.length > 0 ? geneOrder : range(geneStats.length)
    this._sampleOrder =
      sampleOrder.length > 0 ? sampleOrder : range(sampleStats.length)
  }

  setGenes(genes: string[]): OncoplotMutationFrame {
    const originalGeneOrder = new Map<string, number>(
      this._geneStats.map((stats, gi) => [stats.gene, gi])
    )

    const geneOrder = genes
      .filter((gene) => originalGeneOrder.has(gene))
      .map((gene) => originalGeneOrder.get(gene)!)

    return this.setGeneOrder(geneOrder)
  }

  setGeneOrder(idx: number[]): OncoplotMutationFrame {
    const ret = new OncoplotMutationFrame(
      this._data,
      this._geneStats,
      this._sampleStats,
      idx,
      this._sampleOrder
    )

    return ret
  }

  setSamples(samples: string[]): OncoplotMutationFrame {
    const originalSampleOrder = new Map<string, number>(
      this._sampleStats.map((stats, si) => [stats.sample, si])
    )

    const sampleOrder = samples
      .filter((sample) => originalSampleOrder.has(sample))
      .map((sample) => originalSampleOrder.get(sample)!)

    return this.setSampleOrder(sampleOrder)
  }

  setSampleOrder(idx: number[]): OncoplotMutationFrame {
    const ret = new OncoplotMutationFrame(
      this._data,
      this._geneStats,
      this._sampleStats,
      this._geneOrder,
      idx
    )

    return ret
  }

  resetGeneOrder(): OncoplotMutationFrame {
    return this.setGeneOrder(range(this._geneStats.length))
  }

  /**
   * Reset column order to original created.
   *
   * @returns A copy of the dataframe with the columns reordered
   */
  resetSampleOrder(): OncoplotMutationFrame {
    return this.setSampleOrder(range(this._geneStats.length))
  }

  get shape(): [number, number] {
    return [this._geneOrder.length, this._sampleOrder.length]
  }

  // get data(): OncoCellStats[][] {
  //   return this._geneOrder.map(this._data
  // }

  data(gene: number, sample: number): OncoCellStats {
    return this._data[this._geneOrder[gene]!]![this._sampleOrder[sample]!]!
  }

  get geneStats(): OncoCellStats[] {
    return this._geneOrder.map((i) => this._geneStats[i]!)
  }

  get sampleStats(): OncoCellStats[] {
    return this._sampleOrder.map((i) => this._sampleStats[i]!)
  }

  // get sampleOrder(): number[] {
  //   return this._sampleOrder
  // }

  // get geneOrder(): number[] {
  //   return this._geneOrder
  // }
}

function orderEvents(events: Set<string>, oncoProps: IOncoProps): string[] {
  // first order by by what we know
  let ordered = oncoProps.plotorder.filter((mutation) => events.has(mutation))

  const orderedEvents = new Set<string>(ordered)

  // order everything else alphabetically
  ordered = ordered.concat(
    [...events].sort().filter((mutation) => !orderedEvents.has(mutation))
  )

  return ordered
}

function createMarginals(
  oncotable: OncoCellStats[][],
  featureStats: OncoCellStats[],
  sampleStats: OncoCellStats[],
  multi: MultiMode
) {
  for (let geneIndex = 0; geneIndex < oncotable.length; ++geneIndex) {
    for (let sampleIndex = 0; sampleIndex < oncotable.length; ++sampleIndex) {
      const stats = oncotable[geneIndex]![sampleIndex]!

      if (multi === 'multi' && stats.events.length > 1) {
        // we only use multi mode if there are multiple events
        featureStats[geneIndex]!.set(MULTI_MUTATION)
        sampleStats[sampleIndex]!.set(MULTI_MUTATION)
      } else if (multi === 'equalbar') {
        const f = 1 / stats.events.length

        stats.events.forEach((event) => {
          featureStats[geneIndex]!.set(event[0], f)
          sampleStats[sampleIndex]!.set(event[0], f)
        })
      } else {
        stats.events.forEach((event) => {
          const f = event[1] / stats.sum
          featureStats[geneIndex]!.set(event[0], f)
          sampleStats[sampleIndex]!.set(event[0], f)
        })

        /* default:
          const event = stats.maxEvent[0]
          featureStats[geneIndex].set(event)
          sampleStats[sampleIndex].set(event)
          break */
      }
    }
  }
}

export function makeLocationOncoPlot(
  mutDf: BaseDataFrame,
  clinicalDf: BaseDataFrame | null,
  features: GenomicLocation[],
  columns: IOncoColumns,

  //displayProps: IOncoplotDisplayProps,
  multi: MultiMode,
  sort: boolean,
  removeEmpty: boolean,
  oncoProps: IOncoProps
): [OncoplotMutationFrame, ILegend] {
  // merge all samples from the table and clinical
  const sampleSet = new Set([
    ...mutDf.col(columns.sample).strs,
    ...(clinicalDf?.col(0).strs ?? []),
  ])

  let samples: string[] = [...sampleSet].sort()

  const locBinMap = new LocationBinMap(features)

  const locIndexMap = new Map<string, number>(
    features.map((location, si) => [location.toString(), si])
  )

  const sampleIndexMap = new Map<string, number>(
    samples.map((sample, si) => [sample, si])
  )

  let oncotable: OncoCellStats[][] = []

  features.forEach((loc) => {
    // each location needs a representation of each sample
    oncotable.push(
      samples.map((sample) => new OncoCellStats(loc.toString(), sample))
    )
  })

  // we need row and column stats
  const featureStats: OncoCellStats[] = features.map(
    (loc) => new OncoCellStats(loc.toString(), loc.toString())
  )

  let sampleStats: OncoCellStats[] = samples.map(
    (sample) => new OncoCellStats(sample, sample)
  )

  let sample: string
  let sampleIndex: number
  let overlapLocId: string
  let locIndex: number
  let chr: string
  let start: number
  let end: number
  let ref: string
  let tum: string
  let mutType: string

  range(mutDf.shape[0]).forEach((row) => {
    sample = mutDf.col(columns.sample).values[row]!.toString()
    sampleIndex = sampleIndexMap.get(sample)!

    chr = formatChr(mutDf.col(columns.chr).values[row]!.toString())

    start = mutDf.col(columns.start).values[row] as number
    end = mutDf.col(columns.end).values[row] as number

    const loc = new GenomicLocation(chr, start, end)

    mutType = 'SNP'

    ref = mutDf.col(columns.ref).values[row]!.toString()
    tum = mutDf.col(columns.tum).values[row]!.toString()

    if (ref === '-') {
      mutType = 'INS'
    } else if (tum === '-') {
      mutType = 'DEL'
    } else {
      mutType = 'SNP'
    }

    // what locations do we overlap

    const overlaps = locBinMap.search(loc)

    overlaps.forEach((l) => {
      overlapLocId = l.toString()
      locIndex = locIndexMap.get(overlapLocId)!

      oncotable[locIndex]![sampleIndex]!.set(mutType)
    })
  })

  // range(features.length).forEach(geneIndex => {
  //   range(samples.length).forEach(sampleIndex => {
  //     const stats = oncotable[geneIndex][sampleIndex]

  //     if (displayProps.multi === "Multi" && stats.events.length > 1) {
  //       // we only use multi mode if there are multiple events
  //       featureStats[geneIndex].set(MULTI_MUTATION)
  //       sampleStats[sampleIndex].set(MULTI_MUTATION)
  //     } else if (displayProps.multi === "Bars") {
  //       const f = 1 / stats.events.length

  //       stats.events.forEach(event => {
  //         featureStats[geneIndex].set(event[0], f)
  //         sampleStats[sampleIndex].set(event[0], f)
  //       })
  //     } else {
  //       stats.events.forEach(event => {
  //         const f = event[1] / stats.sum
  //         featureStats[geneIndex].set(event[0], f)
  //         sampleStats[sampleIndex].set(event[0], f)
  //       })

  //       /* default:
  //         const event = stats.maxEvent[0]
  //         featureStats[geneIndex].set(event)
  //         sampleStats[sampleIndex].set(event)
  //         break */
  //     }
  //   })
  // })

  createMarginals(oncotable, featureStats, sampleStats, multi)

  if (removeEmpty) {
    // keep only samples that have an event i.e are associated with a region

    const keepSamples = new Set<number>(
      range(samples.length).filter((si) => {
        return sampleStats[si]!.sum > 0
      })
    )

    samples = samples.filter((_, si) => keepSamples.has(si))

    //console.log(samples.join(","))

    //filter table
    oncotable = oncotable.map((row) =>
      row.filter((_, ci) => keepSamples.has(ci))
    )

    //filter colstats
    sampleStats = sampleStats.filter((_, si) => keepSamples.has(si))
  }

  let ret = new OncoplotMutationFrame(oncotable, featureStats, sampleStats)

  if (sort) {
    const [geneOrder, sampleOrder] = memoSort(ret)

    ret = ret.setGeneOrder(geneOrder).setSampleOrder(sampleOrder)
  }

  const allEventsInUse = new Set<string>()
  let stats: OncoCellStats

  // add all events from the matrix and margins to our default
  // list of mutations that are shown on the legend

  range(features.length).forEach((featureIndex) => {
    stats = featureStats[featureIndex]!

    Array.from(stats.countMap.keys()).forEach((event) =>
      allEventsInUse.add(event)
    )

    range(samples.length).forEach((sampleIndex) => {
      stats = oncotable[featureIndex]![sampleIndex]!

      Array.from(stats.countMap.keys()).forEach((event) =>
        allEventsInUse.add(event)
      )
    })
  })

  range(samples.length).forEach((sampleIndex) => {
    stats = sampleStats[sampleIndex]!

    Array.from(stats.countMap.keys()).forEach((event) =>
      allEventsInUse.add(event)
    )
  })

  const ordered = orderEvents(allEventsInUse, oncoProps)

  const colorMap = new Map<string, string>(
    ordered.map((event) => [
      event,
      DEFAULT_COLOR_MAP.get(event) ?? DEFAULT_COLOR_MAP.get(OTHER_MUTATION)!,
    ])
  )

  return [ret, { names: ordered, colorMap }]

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

export function makeOncoPlot(
  df: BaseDataFrame,
  columns: IOncoColumns,
  multi: MultiMode,
  sort: boolean,
  removeEmpty: boolean,
  oncoProps: IOncoProps
): [OncoplotMutationFrame, ILegend] {
  let samples: string[] = [...new Set(df.col(columns.sample)?.strs)].sort()

  console.log(columns)

  console.log(df.colNames)

  const genes: string[] = [...new Set(df.col(columns.gene)?.strs)]
    .filter((x) => x !== '')
    .sort()

  const geneIndexMap = new Map<string, number>(
    genes.map((gene, si) => [gene, si])
  )

  const sampleIndexMap = new Map<string, number>(
    samples.map((sample, si) => [sample, si])
  )

  let oncotable: OncoCellStats[][] = []

  genes.forEach((gene) => {
    // each location needs a representation of each sample
    oncotable.push(samples.map((sample) => new OncoCellStats(gene, sample)))
  })

  // we need row and column stats
  const geneStats: OncoCellStats[] = genes.map(
    (gene) => new OncoCellStats(gene, gene)
  )

  let sampleStats: OncoCellStats[] = samples.map(
    (sample) => new OncoCellStats(sample, sample)
  )

  let sample: string
  let sampleIndex: number
  let gene: string
  let geneIndex: number | undefined
  let mutType: string

  range(df.shape[0]).forEach((row) => {
    sample = df.col(columns.sample)?.values[row]!.toString()
    sampleIndex = sampleIndexMap.get(sample)!

    gene = df.col(columns.gene).values[row]!.toString()
    geneIndex = geneIndexMap.get(gene)

    if (geneIndex) {
      mutType = df.col(columns.type).values[row]!.toString()

      oncotable[geneIndex]![sampleIndex]!.set(mutType)
    }
    // what locations do we overlap
  })

  /* range(genes.length).forEach(geneIndex => {
    range(samples.length).forEach(sampleIndex => {
      const stats = oncotable[geneIndex][sampleIndex]

      // const id = getEventLabel(stats, oncoProps, "Multi")

      // // we count samples at the marginals rather than all events for all samples
      // if (id !== "") {
      //   geneStats[geneIndex].set(id)
      //   sampleStats[sampleIndex].set(id)
      // }

      switch (displayProps.multi) {
        case "Multi":
          geneStats[geneIndex].set(MULTI_MUTATION)
          sampleStats[sampleIndex].set(MULTI_MUTATION)
          break
        case "Bars":
          const f = 1 / stats.events.length

          stats.events.forEach(event => {
            geneStats[geneIndex].set(event[0], f)
            sampleStats[sampleIndex].set(event[0], f)
          })
          break
        case "Dist":
          // we count samples at the marginals rather than all events for all samples
          // so we use fractions

          stats.events.forEach(event => {
            const f = event[1] / stats.sum
            geneStats[geneIndex].set(event[0], f)
            sampleStats[sampleIndex].set(event[0], f)
          })
          break
        default:
          const event = stats.maxEvent[0]
          geneStats[geneIndex].set(event)
          sampleStats[sampleIndex].set(event)
          break
      }
    })
  }) */

  createMarginals(oncotable, geneStats, sampleStats, multi)

  if (removeEmpty) {
    // keep only samples that have an event i.e are associated with a region

    const keepSamples = new Set<number>(
      range(samples.length).filter((si) => {
        return sampleStats[si]!.sum > 0
      })
    )

    samples = samples.filter((_, si) => keepSamples.has(si))

    //console.log(samples.join(","))

    //filter table
    oncotable = oncotable.map((row) =>
      row.filter((_, ci) => keepSamples.has(ci))
    )

    //filter colstats
    sampleStats = sampleStats.filter((_, si) => keepSamples.has(si))
  }

  let ret = new OncoplotMutationFrame(oncotable, geneStats, sampleStats)

  if (sort) {
    const [geneOrder, sampleOrder] = memoSort(ret)

    ret = ret.setGeneOrder(geneOrder).setSampleOrder(sampleOrder)
  }

  const allEventsInUse = new Set<string>()
  let stats: OncoCellStats

  // add all events from the matrix and margins to our default
  // list of mutations that are shown on the legend

  range(genes.length).forEach((geneIndex) => {
    stats = geneStats[geneIndex]!

    Array.from(stats.countMap.keys()).forEach((event) =>
      allEventsInUse.add(event)
    )

    range(samples.length).forEach((sampleIndex) => {
      stats = oncotable[geneIndex]![sampleIndex]!

      Array.from(stats.countMap.keys()).forEach((event) =>
        allEventsInUse.add(event)
      )
    })
  })

  range(samples.length).forEach((sampleIndex) => {
    stats = sampleStats[sampleIndex]!

    Array.from(stats.countMap.keys()).forEach((event) =>
      allEventsInUse.add(event)
    )
  })

  const ordered = orderEvents(allEventsInUse, oncoProps)

  const colorMap = new Map<string, string>(
    ordered.map((event) => [
      event,
      DEFAULT_COLOR_MAP.get(event) ?? DEFAULT_COLOR_MAP.get(OTHER_MUTATION)!,
    ])
  )

  return [ret, { names: ordered, colorMap }]
}

//https://gist.github.com/armish/564a65ab874a770e2c26
export function memoSort(df: OncoplotMutationFrame): [number[], number[]] {
  // descending
  const geneOrder = df.geneStats
    .map((stats, si) => [si, stats.sum])
    .sort((a, b) => b[1]! - a[1]!)
    .map((x) => x[0]!)

  // sort rows first
  // let newTable: OncoplotDataframe = {
  //   data: geneOrder.map(r => df.data[r]),
  //   rowStats: geneOrder.map(r => df.geneStats[r]),
  //   colStats: df.sampleStats,
  // }

  const sampleScores: number[] = []

  //const rows = range(df.shape[0])

  // const eventScoreMap: { [key: string]: number } = Object.fromEntries(
  //   oncoProps.plotorder.map((event, ei) => [event, ei / 100]),
  // )

  range(df.shape[1]).map((col) => {
    // find all non zero rows and use a bit flag to set whether
    // samples are there or not. Use bit pattern as score so that
    // cols with more genes towards the upper left of the matrix
    // are pushed towards the left edge.
    // Event scores will try to push similar events together if
    // the comb sort is not granular enough since it looks nicer
    // if multiple samples are kept together.
    const score: number = geneOrder
      .map((row, ri) => ({ originalIndex: row!, index: ri })!)
      .filter((row) => df._data[row.originalIndex]![col]!.sum > 0)
      .map((row) => {
        //const stats = df._data[row][col]

        //const id = getEventLabel(stats, oncoProps, displayProps.multi)

        return Math.pow(2, Math.max(0, MAX_MEMO_POWER - row.index)) // +
        //(useEventScore ? eventScoreMap[id] : 0)
      })
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue
      }, 0)

    sampleScores.push(score)
  })

  const sampleOrder = sampleScores
    .map((score, si) => [si, score])
    .sort((a, b) => b[1]! - a[1]!)
    .map((x) => x[0]!)

  // newTable = {
  //   data: newTable.data.map(row => sampleOrder.map(c => row[c])),
  //   rowStats: newTable.geneStats,
  //   colStats: sampleOrder.map(c => newTable.sampleStats[c]),
  // }

  return [geneOrder, sampleOrder]!

  // scoreCol <- function(x) {
  // 	score <- 0;
  // 	for(i in 1:length(x)) {
  // 		if(x[i]) {
  // 			score <- score + 2^(length(x)-i);
  // 		}
  // 	}
  // 	return(score);
  // }
  // scores <- apply(M[geneOrder, ], 2, scoreCol);
  // sampleOrder <- sort(scores, decreasing=TRUE, index.return=TRUE)$ix;
  // return(M[geneOrder, sampleOrder]);
}
