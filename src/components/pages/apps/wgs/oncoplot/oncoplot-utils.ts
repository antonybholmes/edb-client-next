import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { LocationBinMap } from '@/lib/genomic/genomic'

import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type ColorBarPos,
  type IStrokeProps,
  type ITextProps,
  type LegendPos,
  type TopBottomPos,
} from '@/components/plot/svg-props'
import type { LeftRightPos } from '@/components/side'
import { BIG0, BIG1 } from '@/consts'
import type { IDBEntity } from '@/interfaces/db-entity'
import type { IPos } from '@/interfaces/pos'
import { COLOR_BLACK, randomHexColor } from '@/lib/color/color'
import { BWR_CMAP_V2, ColorMap } from '@/lib/color/colormap'
import { formatChr } from '@/lib/genomic/dna'
import {
  newGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { makeUuid } from '@/lib/id'
import type { ILim } from '@/lib/math/math'
import { range } from '@/lib/math/range'
import { NA } from '@/lib/text/text'
import type { ClinicalDataTrack } from './clinical-utils'

export const MULTI_MUTATION = 'Multi'

export const COLOR_PALETTE = Object.freeze([
  '#000080',
  '#4682B4',
  '#87CEEB',
  '#FFE4B5',
  '#FFA500',
  '#FF4500',
])

export const NO_ALTERATION_COLOR = '#eeeeee'
export const NO_ALTERATIONS_TEXT = 'No Alterations'
export const OTHER_MUTATION = 'OTHER'

// ideally 64, but limited by js use of double for all nums
export const MAX_MEMO_POWER = 32

// how should multiple mutations at a position be presented
export type MultiMode = 'single' | 'stacked-bars' | 'equal-bars' | 'multi'

export const MULTI_MODE_MAP: Record<MultiMode, string> = Object.freeze({
  single: 'Single bars',
  'stacked-bars': 'Stacked bars',
  'equal-bars': 'Equal bars',
  multi: 'Multi',
})

export interface IOncoGene extends IDBEntity {
  color: string
  show: boolean
}

export interface IMutation extends IDBEntity {
  color: string
  aliases: string[]
  show: boolean
}

// export const DEFAULT_COLOR_MAP = Object.freeze(
//   Object.fromEntries([
//     ['SNP', '#DA70D6'],
//     ['Intron_SNP', '#DA70D6'],
//     ['INS', '#EC7063'],
//     ['Frame_Shift_Ins', '#EC7063'],
//     ['Del', '#F5B041'],
//     ['Frame_Shift_Del', '#F5B041'],
//     ['Trunc', COLOR_BLACK],
//     ['Nonsense_Mutation', COLOR_BLACK],
//     ['MISSENSE', '#3cb371'],
//     ['Missense_Mutation', '#3cb371'],
//     ['Other', '#DA70D6'],
//     ['CNA', '#0000ff'],
//     ['EXP', '#ff0000'],
//     ['Multi', '#666666'],
//     ['Splice_Region', '#ff9900'],
//     ['Silent', '#6699ff'],
//   ])
// )

export const DEFAULT_MUTATIONS: readonly IMutation[] = Object.freeze([
  {
    id: '019b4d0f-768f-7c2d-934e-c23b46eec1b3',
    name: 'SNP',
    color: '#DA70D6',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d0f-99de-7ffb-954a-366dde5405e0',
    name: 'Intron_SNP',
    color: '#DA70D6',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d0f-bd17-7e7f-9964-8538a8e11c5a',
    name: 'INS',
    color: '#EC7063',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d0f-ddb3-7cfc-ab3f-2ee1ee8de9fe',
    name: 'Frame_Shift_Ins',
    color: '#EC7063',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-015f-7811-a14b-240caa75aaef',
    name: 'Del',
    color: '#F5B041',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-19cf-7271-a069-be77a29ef07e',
    name: 'Frame_Shift_Del',
    color: '#F5B041',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-35b8-7ad7-bf51-a2c521f46390',
    name: 'Trunc',
    color: COLOR_BLACK,
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-5129-710d-ac88-e2c46cde6901',
    name: 'Nonsense_Mutation',
    color: COLOR_BLACK,
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-6d6f-7634-97e9-a26f73b42608',
    name: 'MISSENSE',
    color: '#3cb371',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-85e2-7bd6-9ca9-309dc55385be',
    name: 'Missense_Mutation',
    color: '#3cb371',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-9dd1-7e05-9722-dfd681c653de',
    name: 'Other',
    color: '#DA70D6',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-b53f-7893-ae4e-ecdbc698cc6a',
    name: 'CNA',
    color: '#0000ff',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d10-c7e4-7a3a-8a2e-1f3e4b5d6f7a',
    name: 'EXP',
    color: '#ff0000',
    aliases: [],

    show: true,
  },
  {
    id: '019b4d11-014f-74b4-81f2-b8f7ae404164',
    name: 'Multi',
    color: '#666666',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d11-1b8d-7350-9005-6942c1e50ce2',
    name: 'Splice_Region',
    color: '#ff9900',
    aliases: [],
    show: true,
  },
  {
    id: '019b4d11-31d5-7377-9426-e4439bd4ba45',
    name: 'Silent',
    color: '#6699ff',
    aliases: [],
    show: true,
  },
])

export function mutationColorMapFromMutations(
  mutations: readonly IMutation[]
): Record<string, string> {
  const colorMap: Record<string, string> = {}

  for (const mutation of mutations) {
    colorMap[mutation.name.toLowerCase()] = mutation.color
    colorMap[mutation.name] = mutation.color
    for (const alias of mutation.aliases) {
      colorMap[alias.toLowerCase()] = mutation.color
      colorMap[alias] = mutation.color
    }
  }

  return colorMap
}

export interface ILegend {
  names: string[]
  colorMap: Record<string, string>
}

export interface IClinicalTrackProps {
  name: string
  show: boolean
  //colorMap: Record<string, string>

  color: string
  categoryColors: Record<string, string>
}

export interface IOncoplotSort {
  sortGenes: boolean
  sortSamples: boolean
}

export interface IOncoplotDisplayProps {
  text: ITextProps
  title: ITextProps
  samples: {
    graphs: {
      show: boolean
      height: number
      opacity: number
      border: IStrokeProps
      yaxis: {
        show: boolean
        label: string
      }
    }
  }
  features: {
    graphs: {
      show: boolean
      height: number
      opacity: number
      border: IStrokeProps
      percentages: {
        show: boolean
        width: number
      }
    }
  }

  multi: MultiMode
  sort: IOncoplotSort
  removeEmptySamples: boolean

  grid: IStrokeProps & {
    spacing: IPos
    cell: IBlock
  }
  border: IStrokeProps
  clinical: {
    show: boolean
    height: number
    gap: number
    border: IStrokeProps
  }
  rowLabels: { position: LeftRightPos; width: number; isColored: boolean }
  colLabels: { position: TopBottomPos; width: number; isColored: boolean }
  colorbar: {
    barSize: [number, number]
    width: number
    position: ColorBarPos
  }

  legend: ITextProps & {
    offset: number
    position: LegendPos
    width: number
    gap: number
    title: ITextProps & { height: number }
    variants: {
      show: boolean
      label: string
      //noAlterationColor: string
      // show: boolean
      //names: string[]
      //colorMap: Record<string, string>
    }
    clinical: {
      show: boolean
      tracks: Record<string, IClinicalTrackProps>
      trackOrder: string[]
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
  text: { ...DEFAULT_TEXT_PROPS },
  title: { ...DEFAULT_BOLD_TEXT_PROPS },
  sort: { sortGenes: true, sortSamples: true },
  removeEmptySamples: false,
  grid: {
    ...DEFAULT_STROKE_PROPS,
    show: false,
    cell: { w: 4, h: 16 },
    spacing: {
      x: 2,
      y: 2,
    },
  },

  border: { ...DEFAULT_STROKE_PROPS, show: false },
  rowLabels: { position: 'right', width: 100, isColored: false },
  colLabels: { position: 'top', width: 150, isColored: true },
  colorbar: { position: 'right', barSize: [160, 16], width: 100 },
  dotLegend: {
    sizes: [25, 50, 75, 100],
    lim: [0, 100],
    type: '%',
  },
  clinical: {
    show: true,
    height: 16,
    gap: 4,

    border: { ...DEFAULT_STROKE_PROPS, show: false },
  },
  legend: {
    ...DEFAULT_TEXT_PROPS,
    position: 'bottom',
    gap: 5,
    width: 200,
    title: { ...DEFAULT_BOLD_TEXT_PROPS, height: 20 },
    variants: {
      show: true,
      //names: [],
      //colorMap: {},
      //noAlterationColor: NO_ALTERATION_COLOR,
      label: 'Variants',
    },
    clinical: {
      show: true,
      tracks: {}, // Record<string, IClinicalTrackProps>
      trackOrder: [],
    },
    offset: 20,
  },

  scale: 1,
  cmap: BWR_CMAP_V2,
  axisOffset: 10,
  plotGap: 10,

  margin: { top: 100, right: 200, bottom: 100, left: 300 },

  samples: {
    graphs: {
      show: true,
      height: 50,
      opacity: 1,
      border: { ...DEFAULT_STROKE_PROPS },
      yaxis: {
        show: true,
        label: 'TMB',
      },
    },
  },
  features: {
    graphs: {
      show: true,
      height: 100,
      opacity: 1,
      border: { ...DEFAULT_STROKE_PROPS },
      percentages: {
        show: true,
        width: 60,
      },
    },
  },
}

// export interface IOncoProps {
//   //colormap: { [key: string]: { color: string; z: number } }
//   plotorder: string[]
//   //aliases: { [key: string]: string }
// }

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

/**
 * Represents a countable event
 */
export interface IEvent {
  name: string
  value: number
}

export class EventCountMap {
  private _countMap: Map<string, number> = new Map<string, number>()

  /**
   * For counting events such as mutations or clinical events. We can record
   * labels as well e.g. 'Breast cancer' by adding the event with the count
   * of 1 and ignoring the counts. This gives the flexibility to store
   * categorical and numerical data in the same object.
   * Events are stored in lowercase to make counting case insensitive because
   * there are huge inconsistencies in how mutations are named, so this
   * remove a fair amount of ambiguity.
   *
   * @param event   an event such as a deletion that needs to be counted. can
   *                unknown kind of mutation event.
   * @param count   the value to update the count by (defaults to 1), but in
   *                the case of a numerical value such as age, we might wish
   *                to set age to a specific amount
   */
  add(event: string, count: number = 1) {
    const lce = event.toLowerCase()
    this._countMap.set(lce, (this._countMap.get(lce) ?? 0) + count)

    //this._genes.add(gene)
    //this._samples.add(sample)
  }

  get countMap(): Map<string, number> {
    return new Map(this._countMap)
  }

  get events(): IEvent[] {
    return [...this._countMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((event) => ({ name: event[0], value: event[1] }))
  }

  /**
   * Returns the entry with the highest count
   *
   * @returns
   */
  get maxEvent(): IEvent {
    if (this._countMap.size === 0) {
      return { name: NA, value: -1 }
    }

    const m = [...this._countMap.entries()].sort((a, b) => b[1] - a[1])[0]!

    return { name: m[0]!, value: m[1]! }
  }

  get sum(): number {
    return [...this._countMap.entries()]
      .map((event) => event[1])
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  }

  /**
   * Return the counts for a list of ids where each
   * entry is a pair [id, count]
   * @param ids         a list of ids to return the counts of.
   * @param keepZeros   whether to include ids that have no counts. We
   *                    may wish to exclude zeros when making a dist plot for example
   *                    where we only care about values we found
   * @returns
   */
  countDist(ids: string[], keepZeros: boolean = true): IEvent[] {
    const dist = ids
      .map((id) => ({
        name: id,
        value: this._countMap.get(id.toLowerCase()) ?? 0,
      }))
      .filter((x: IEvent) => keepZeros || x.value > 0)

    return dist
  }

  /**
   * Returns a normalized count distribution of events.
   * Each event's count is divided by the total count to get a proportion.
   *
   * @param ids
   * @param keepZeros
   * @returns
   */
  normCountDist(ids: string[], keepZeros: boolean = true): IEvent[] {
    const total = this.sum

    return this.countDist(ids, keepZeros).map((x) => {
      return { name: x.name, value: x.value / total }
    })
  }
}

class OncoCellStats extends EventCountMap {
  private _feature: string
  private _sample: string
  //private _genes: Set<string> = new Set<string>()
  //private _samples: Set<string> = new Set<string>()

  constructor(feature: string, sample: string) {
    super()
    this._feature = feature
    this._sample = sample
  }

  get feature(): string {
    return this._feature
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
  mutationsInUse: string[],
  multiMode: MultiMode
): string {
  //const lcMutationsInUse = mutationsInUse.map(m => m.toLowerCase())

  const names = mutationsInUse.filter((m) =>
    stats.countMap.has(m.toLowerCase())
  )

  //const events = [...stats.countMap.keys()].sort()

  if (names.length === 0) {
    return ''
  }

  if (multiMode === 'multi' && names.length > 1) {
    return MULTI_MUTATION
  }

  return names.join(', ')

  //let event = stats.maxEvent[0]

  // try and aliases event name to something in the system
  //event = oncoProps.aliases[event] ?? event

  //return event
}

export class OncoplotFrame {
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
    // rows
    this._geneStats = geneStats
    // cols
    this._sampleStats = sampleStats
    this._geneOrder = geneOrder.length > 0 ? geneOrder : range(geneStats.length)
    this._sampleOrder =
      sampleOrder.length > 0 ? sampleOrder : range(sampleStats.length)
  }

  setGenes(genes: string[]): OncoplotFrame {
    const originalGeneOrder = new Map<string, number>(
      this._geneStats.map((stats, gi) => [stats.feature, gi])
    )

    const geneOrder = genes
      .filter((gene) => originalGeneOrder.has(gene))
      .map((gene) => originalGeneOrder.get(gene)!)

    return this.setGeneOrder(geneOrder)
  }

  /**
   * Set the gene/row order so that we can sort the
   * the data to appear more visually appealing. We don't want to mutate the original data
   * because we want to be able to reset the order to the original order.
   *
   * @param idx
   * @returns
   */
  setGeneOrder(idx: number[]): OncoplotFrame {
    const ret = new OncoplotFrame(
      this._data,
      this._geneStats,
      this._sampleStats,
      idx,
      this._sampleOrder
    )

    return ret
  }

  setSamples(samples: string[]): OncoplotFrame {
    const originalSampleOrder = new Map<string, number>(
      this._sampleStats.map((stats, si) => [stats.sample, si])
    )

    const sampleOrder = samples
      .filter((sample) => originalSampleOrder.has(sample))
      .map((sample) => originalSampleOrder.get(sample)!)

    return this.setSampleOrder(sampleOrder)
  }

  setSampleOrder(idx: number[]): OncoplotFrame {
    const ret = new OncoplotFrame(
      this._data,
      this._geneStats,
      this._sampleStats,
      this._geneOrder,
      idx
    )

    return ret
  }

  resetGeneOrder(): OncoplotFrame {
    return this.setGeneOrder(range(this._geneStats.length))
  }

  /**
   * Reset column order to original created.
   *
   * @returns A copy of the dataframe with the columns reordered
   */
  resetSampleOrder(): OncoplotFrame {
    return this.setSampleOrder(range(this._sampleStats.length))
  }

  get shape(): [number, number] {
    return [this._geneOrder.length, this._sampleOrder.length]
  }

  // get data(): OncoCellStats[][] {
  //   return this._geneOrder.map(this._data
  // }

  /**
   * Get the raw OncoCellStats for a specific gene and sample unordered
   * i.e. in the original order before we try to sort them.
   *
   * @param gene
   * @param sample
   * @returns
   */
  raw(gene: number, sample: number): OncoCellStats {
    return this._data[gene]![sample]!
  }

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

// function orderEvents(events: Set<string> ): string[] {
//   // first order by by what we know
//   //let ordered = oncoProps.plotorder.filter(mutation => events.has(mutation))

//   const orderedEvents = new Set<string>(ordered)

//   // order everything else alphabetically
//   ordered = ordered.concat(
//     [...events].sort().filter(mutation => !orderedEvents.has(mutation))
//   )

//   return ordered
// }

function createMarginals(
  oncotable: OncoCellStats[][],
  featureStats: OncoCellStats[],
  sampleStats: OncoCellStats[],
  multi: MultiMode
) {
  const rows = oncotable.length
  const cols = oncotable[0]!.length
  for (let geneIndex = 0; geneIndex < rows; ++geneIndex) {
    for (let sampleIndex = 0; sampleIndex < cols; ++sampleIndex) {
      const stats = oncotable[geneIndex]![sampleIndex]!

      if (multi === 'multi' && stats.events.length > 1) {
        // we only use multi mode if there are multiple events
        featureStats[geneIndex]!.add(MULTI_MUTATION)
        sampleStats[sampleIndex]!.add(MULTI_MUTATION)
      } else if (multi === 'equal-bars') {
        const f = 1 / stats.events.length

        for (const event of stats.events) {
          featureStats[geneIndex]!.add(event.name, f)
          sampleStats[sampleIndex]!.add(event.name, f)
        }
      } else {
        for (const event of stats.events) {
          const f = event.value / stats.sum
          featureStats[geneIndex]!.add(event.name, f)
          sampleStats[sampleIndex]!.add(event.name, f)
        }

        /* default:
          const event = stats.maxEvent[0]
          featureStats[geneIndex].set(event)
          sampleStats[sampleIndex].set(event)
          break */
      }
    }
  }
}

function getAllEventsInUse(
  geneMarginalStats: OncoCellStats[],
  sampleMarginalStats: OncoCellStats[],
  oncotable: OncoCellStats[][]
): Set<string> {
  const allEventsInUse = new Set<string>()
  let stats: OncoCellStats

  // add all events from the matrix and margins to our default
  // list of mutations that are shown on the legend

  for (let geneIndex = 0; geneIndex < geneMarginalStats.length; ++geneIndex) {
    stats = geneMarginalStats[geneIndex]!

    for (const event of stats.countMap.keys()) {
      allEventsInUse.add(event)
    }

    for (
      let sampleIndex = 0;
      sampleIndex < oncotable[0]!.length;
      ++sampleIndex
    ) {
      stats = oncotable[geneIndex]![sampleIndex]!

      for (const event of stats.countMap.keys()) {
        allEventsInUse.add(event)
      }
    }
  }

  // // add the sample marginals
  for (let sampleIndex = 0; sampleIndex < oncotable[0]!.length; ++sampleIndex) {
    stats = sampleMarginalStats[sampleIndex]!

    for (const event of stats.countMap.keys()) {
      allEventsInUse.add(event)
    }
  }

  return allEventsInUse
}

interface OncoplotResult {
  oncoFrame: OncoplotFrame
  mutationsInUse: string[]
  newMutations: IMutation[]
}

export function makeOncoPlot(
  df: BaseDataFrame,
  mutations: readonly IMutation[],
  columns: IOncoColumns,
  multi: MultiMode,
  sort: IOncoplotSort,
  removeEmptySamples: boolean,
  genes: IOncoGene[],
  clinicalTracks: ClinicalDataTrack[]
): OncoplotResult {
  let samples: string[] = [...new Set(df.col(columns.sample)?.strs)].sort()

  // const genesInTable: string[] =
  //   columns.gene !== -1
  //     ? [...new Set(df.col(columns.gene)?.strs)]
  //         .filter(x => x !== '' && (genesInUse[x] ?? true))
  //         .sort()
  //     : []

  const genesInUse = genes.filter((g) => g.show).map((g) => g.name)

  const geneIndexMap = new Map<string, number>(
    genesInUse.map((gene, si) => [gene, si])
  )

  const sampleIndexMap = new Map<string, number>(
    samples.map((sample, si) => [sample, si])
  )

  let oncotable: OncoCellStats[][] = []

  for (const gene of genesInUse) {
    // each location needs a representation of each sample
    oncotable.push(samples.map((sample) => new OncoCellStats(gene, sample)))
  }

  // we need row and column stats
  const geneMarginalStats: OncoCellStats[] = genesInUse.map(
    (gene) => new OncoCellStats(gene, gene)
  )

  let sampleMarginalStats: OncoCellStats[] = samples.map(
    (sample) => new OncoCellStats(sample, sample)
  )

  let sample: string
  let sampleIndex: number
  let gene: string
  let geneIndex: number | undefined
  let mutType: string

  for (let row = 0; row < df.shape[0]; ++row) {
    sample = df.col(columns.sample).str(row)
    sampleIndex = sampleIndexMap.get(sample) ?? -1

    if (sampleIndex === -1) {
      continue
    }

    gene = df.col(columns.gene).str(row)
    geneIndex = geneIndexMap.get(gene) ?? -1

    if (geneIndex === -1) {
      continue
    }

    mutType = df.col(columns.type).str(row)

    oncotable[geneIndex]![sampleIndex]!.add(mutType)

    // what locations do we overlap
  }

  createMarginals(oncotable, geneMarginalStats, sampleMarginalStats, multi)

  if (removeEmptySamples) {
    // keep only samples that have an event i.e are associated with a region

    const keepSamples = new Set<number>(
      range(samples.length).filter((si) => {
        return sampleMarginalStats[si]!.sum > 0
      })
    )

    samples = samples.filter((_, si) => keepSamples.has(si))

    //filter table
    oncotable = oncotable.map((row) =>
      row.filter((_, ci) => keepSamples.has(ci))
    )

    //filter colstats
    sampleMarginalStats = sampleMarginalStats.filter((_, si) =>
      keepSamples.has(si)
    )
  }

  let ret = new OncoplotFrame(oncotable, geneMarginalStats, sampleMarginalStats)

  // track all the events in use

  const allEventsInUse = getAllEventsInUse(
    geneMarginalStats,
    sampleMarginalStats,
    oncotable
  )

  const { mutationsInUse, newMutations } = getNewMutations(
    allEventsInUse,
    mutations
  )

  const { geneOrder, sampleOrder } = memoSort(ret, mutationsInUse, {
    clinicalTracks,
  })

  if (sort.sortGenes) {
    ret = ret.setGeneOrder(geneOrder)
  }

  if (sort.sortSamples) {
    ret = ret.setSampleOrder(sampleOrder)
  }

  // const colorMap = Object.fromEntries(
  //   ordered.map(event => [
  //     event,
  //     mutationColorMap[event.toLowerCase()] ??
  //       mutationColorMap[OTHER_MUTATION.toLowerCase()]!,
  //   ])
  // )

  return { oncoFrame: ret, mutationsInUse, newMutations }
}

export function makeLocationOncoPlot(
  mutDf: BaseDataFrame,
  clinicalDf: BaseDataFrame | undefined,
  features: IGenomicLocation[],
  mutations: readonly IMutation[],
  columns: IOncoColumns,
  //displayProps: IOncoplotDisplayProps,
  multi: MultiMode,
  sort: boolean,
  removeEmpty: boolean
): OncoplotResult {
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

  for (const loc of features) {
    // each location needs a representation of each sample
    oncotable.push(
      samples.map((sample) => new OncoCellStats(loc.toString(), sample))
    )
  }

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

  for (const row of range(mutDf.shape[0])) {
    sample = mutDf.col(columns.sample).values[row]!.toString()
    sampleIndex = sampleIndexMap.get(sample)!

    chr = formatChr(mutDf.col(columns.chr).values[row]!.toString())

    start = mutDf.col(columns.start).values[row] as number
    end = mutDf.col(columns.end).values[row] as number

    const loc = newGenomicLocation(chr, start, end)

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

    for (const l of overlaps) {
      overlapLocId = l.toString()
      locIndex = locIndexMap.get(overlapLocId)!

      oncotable[locIndex]![sampleIndex]!.add(mutType)
    }
  }

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

    //filter table
    oncotable = oncotable.map((row) =>
      row.filter((_, ci) => keepSamples.has(ci))
    )

    //filter colstats
    sampleStats = sampleStats.filter((_, si) => keepSamples.has(si))
  }

  const allEventsInUse = getAllEventsInUse(featureStats, sampleStats, oncotable)

  let ret = new OncoplotFrame(oncotable, featureStats, sampleStats)

  const { mutationsInUse, newMutations } = getNewMutations(
    allEventsInUse,
    mutations
  )

  if (sort) {
    const { geneOrder, sampleOrder } = memoSort(ret, mutationsInUse)

    ret = ret.setGeneOrder(geneOrder).setSampleOrder(sampleOrder)
  }

  // const colorMap = Object.fromEntries(
  //   ordered.map(event => [
  //     event,
  //     mutationColorMap[event.toLowerCase()] ??
  //       mutationColorMap[OTHER_MUTATION.toLowerCase()]!,
  //   ])
  // )

  return { oncoFrame: ret, mutationsInUse, newMutations }

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

/**
 * Check existing cached mutations, e.g. Missense against
 * what appears in the new file and add new ones if
 * neccessary. This is so colors etc, can be preserved
 * amonst runs.
 *
 * @param allEventsInUse
 * @param mutations
 * @returns
 */
function getNewMutations(
  allEventsInUse: Set<string>,
  mutations: readonly IMutation[]
): { mutationsInUse: string[]; newMutations: IMutation[] } {
  const ordered = [...allEventsInUse].sort()
  //orderEvents(allEventsInUse, oncoProps)

  const lcAllEventsInUse = new Set<string>(
    [...allEventsInUse].map((event) => event.toLowerCase())
  )

  // make a list of mutation types in use that have already been
  // assigned a color
  const mutationsInUse: string[] = []

  for (const m of mutations) {
    if (
      lcAllEventsInUse.has(m.name.toLowerCase()) ||
      m.aliases.map((a) => a.toLowerCase()).some((a) => lcAllEventsInUse.has(a))
    ) {
      mutationsInUse.push(m.name)
    }
  }

  const lcMutationsInUse = new Set(mutationsInUse.map((m) => m.toLowerCase()))

  const newMutations: IMutation[] = []

  // see if there are some new mutation
  for (const m of ordered) {
    if (!lcMutationsInUse.has(m.toLowerCase())) {
      mutationsInUse.push(m)

      newMutations.push({
        id: makeUuid(),
        name: m,
        color: randomHexColor(),
        aliases: [],
        show: true,
      })
    }
  }

  // const colorMap = Object.fromEntries(
  //   ordered.map(event => [
  //     event,
  //     mutationColorMap[event.toLowerCase()] ??
  //       mutationColorMap[OTHER_MUTATION.toLowerCase()]!,
  //   ])
  // )

  return { mutationsInUse, newMutations }
}

//https://gist.github.com/armish/564a65ab874a770e2c26
export function memoSort(
  df: OncoplotFrame,
  mutationsInUse: string[],
  //useEventScore: boolean = true,
  opts: { useEventScore?: boolean; clinicalTracks?: ClinicalDataTrack[] } = {}
): { geneOrder: number[]; sampleOrder: number[] } {
  const { useEventScore = true, clinicalTracks = [] } = opts

  // descending
  // sample with most mutations on top
  const geneOrder = df._geneStats
    .map((stats, si) => [si, stats.sum])
    .sort((a, b) => b[1]! - a[1]!)
    .map((x) => x[0]!)

  // sort rows first
  // let newTable: OncoplotDataframe = {
  //   data: geneOrder.map(r => df.data[r]),
  //   rowStats: geneOrder.map(r => df.geneStats[r]),
  //   colStats: df.sampleStats,
  // }

  //const rows = range(df.shape[0])

  // for every event give it a score between 0 and 1 but less than 1
  const maxEvent = mutationsInUse.length - 1

  const eventScoreMap: Map<string, bigint> = new Map(
    [...mutationsInUse].map((event, ei) => [
      event.toLowerCase(),
      BigInt(maxEvent - ei),
    ])
  )

  const maxPower = geneOrder.length - 1

  const sampleScores: { name: string; value: bigint }[][] = []

  const samples = df._sampleStats.map((s) => s.sample)

  for (let col = 0; col < df.shape[1]; ++col) {
    // find all non zero rows and use a bit flag to set whether
    // samples are there or not. Use bit pattern as score so that
    // cols with more genes towards the upper left of the matrix
    // are pushed towards the left edge.
    // Event scores will try to push similar events together if
    // the comb sort is not granular enough since it looks nicer
    // if multiple samples are kept together.

    let scores = [
      {
        name: 'comb',
        value: BigInt(0),
      },
    ]

    if (useEventScore) {
      scores.push({ name: 'block', value: BigInt(0) })
    }

    for (const [newIndex, originalIndex] of geneOrder.entries()) {
      const stats = df._data[originalIndex]![col]!

      if (stats.sum > 0) {
        // organize into blocks where the most mutated genes are at the left
        // of the matrix and share a pattern
        scores[0]!.value |= BIG1 << BigInt(maxPower - newIndex)
      }

      // scores[1].value +=
      //   stats.sum > 0 ? Math.pow(2, Math.max(0, MAX_MEMO_POWER - newIndex)) : 0

      // sort within blocks using event scores to group events rather
      // than randomly sorting them
      if (useEventScore) {
        for (const event of stats.events) {
          scores[1]!.value |= BIG1 << (eventScoreMap.get(event.name) ?? BIG0)
        }
      }
    }

    for (const track of clinicalTracks.filter((c) => c.type === 'category')) {
      const score = { name: track.name, value: BigInt(0) }

      const maxEvent = track.getEvents(samples[col]!).maxEvent.name

      const catIndex = track.categories.findIndex(
        (x) => x.toLowerCase() === maxEvent.toLowerCase()
      )

      score!.value |= BIG1 << BigInt(track.categories.length - catIndex)

      //for (const cat of categories) {
      //  scores[1]!.value |= BIG1 << (events.get(cat)  ?? BIG0)
      //}

      scores.push(score)
    }

    // const score: number = geneOrder
    //   .map((row, ri) => ({ originalIndex: row, index: ri })!)
    //   .filter(row => df._data[row.originalIndex]![col]!.sum > 0)
    //   .map(row => {
    //      const stats = df._data[row.originalIndex]![col]!

    //     //const id = getEventLabel(stats, oncoProps, displayProps.multi)

    //     return Math.pow(2, Math.max(0, MAX_MEMO_POWER - row.index))  +(useEventScore ? eventScoreMap[id]??0 : 0)
    //   })
    //   .reduce((accumulator, currentValue) => {
    //     return accumulator + currentValue
    //   }, 0)
    // }

    sampleScores.push(scores)
  }

  let diff: bigint

  const sampleOrder = sampleScores
    .map((scores, si) => ({ index: si, scores }))
    .sort((a, b) => {
      // use each score in order to sort and if there is a tie, use the next score as a tiebreaker
      for (const [si, scoreA] of a.scores.entries()) {
        const scoreB = b.scores[si]!

        diff = scoreB.value - scoreA.value

        if (diff !== BIG0) {
          return diff > BIG0 ? 1 : -1
        }
      }

      // if all scores are the same, keep the original order
      return -1
    })
    .map((x) => x.index)

  // newTable = {
  //   data: newTable.data.map(row => sampleOrder.map(c => row[c])),
  //   rowStats: newTable.geneStats,
  //   colStats: sampleOrder.map(c => newTable.sampleStats[c]),
  // }

  return { geneOrder, sampleOrder }

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
