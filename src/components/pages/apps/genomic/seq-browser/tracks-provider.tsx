import {
  DEFAULT_FILL_PROPS,
  DEFAULT_FONT_PROPS,
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type IColorProps,
  type IFontProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_NAVY_BLUE,
  COLOR_RED,
} from '@/lib/color/color'
import {
  GenLoc,
  NO_LOCATION,
  parseGenLoc,
  type IGenomicFeature,
  type IGenomicLocation,
} from '@/lib/genomic/genomic'
import { makeUuid } from '@/lib/id'
import { produce } from 'immer'

import { Axis } from '@/components/plot/axis'
import type { IDBEntity } from '@/interfaces/db-entity'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { createContext } from 'react'
import type { BaseBedReader } from './readers/bed/base-bed-reader'
import type { BaseSeqReader } from './readers/seq/base-seq-reader'

export interface ITrack {
  /** A randomly assigned id for the track */
  id: string

  /** A human readable name for the track, e.g. Ruler */
  name: string
}

export interface IDBTrack extends ITrack {
  /** A database identifier */
  id: string
  //genome: string
  assembly: string
  technology: string
  institution: string
  dataset: string
  reads: number
  type: string
  url: string
  tags: string[]
}

// export interface IDBSignalTrack extends IDBTrack {
//   reads: number
//   stat: string
// }

// export interface ITrackGenome {
//   name: string
//   tracks: IDBTrack[]
// }

// export interface ITrackPlatforms {
//   name: string
//   genomes: ITrackGenome[]
// }

// export interface ITracksDB {
//   name: string
//   platforms: ITrackPlatforms[]
// }

export const DEFAULT_GENOMIC_LOCATION = parseGenLoc('chr3:187441954-187466041')

export interface ISignalTrack extends IDBTrack {
  type: 'Seq'
  displayOptions: ISeqTrackDisplayOptions
}

export interface IRemoteBigWigTrack extends IDBTrack {
  type: 'Remote BigWig'
  scale: string
  //reader: BaseSeqReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ISeqTrackDisplayOptions
}

export interface ILocalBigWigTrack extends ITrack {
  type: 'Local BigWig'
  scale: string

  reader: BaseSeqReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ISeqTrackDisplayOptions
}

export interface ISeqTrackDisplayOptions {
  smooth: boolean
  autoY: boolean
  useGlobalY: boolean
  ymax: number
  axes: { show: boolean }
  stroke: IStrokeProps
  fill: IColorProps
  height: number
}

export const DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS: ISeqTrackDisplayOptions = {
  stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_RED },
  fill: { ...DEFAULT_FILL_PROPS },
  height: 60,
  axes: {
    show: true,
  },
  useGlobalY: true,
  ymax: 10,
  autoY: true,
  smooth: true,
}

export interface IGeneTrack extends ITrack {
  type: 'Gene'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IGeneTrackDisplayOptions
}

export type GeneArrowStyle = 'lines' | 'filled'

export interface IGeneTrackDisplayOptions {
  // labels: {
  //   showGeneId: boolean
  //   font: IFontProps
  //   offset: number
  //   show: boolean
  // }
  //height: number

  //stroke: IStrokeProps
  // genes: {
  //   gap: number
  // }
  // transcripts: {
  //   height: number
  // }
  arrows: {
    style: GeneArrowStyle
    show: boolean
    stroke: IStrokeProps
    fill: IColorProps
    gap: number
    x: number
    y: number
  }
  endArrows: {
    firstTranscriptOnly: boolean
    show: boolean
    stroke: IStrokeProps
    fill: IColorProps
  }
  canonical: {
    isColored: boolean
    stroke: IStrokeProps
  }
}

export const DEFAULT_GENE_TRACK_DISPLAY_OPTIONS: IGeneTrackDisplayOptions = {
  arrows: {
    stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_NAVY_BLUE },
    fill: { ...OPAQUE_FILL_PROPS, color: COLOR_NAVY_BLUE },
    gap: 16,
    x: 2,
    y: 3,
    show: false,
    style: 'lines',
  },
  endArrows: {
    show: true,
    firstTranscriptOnly: true,
    stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_BLACK },
    fill: { ...OPAQUE_FILL_PROPS, color: COLOR_BLACK },
  },
  canonical: {
    isColored: true,
    stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_CORNFLOWER_BLUE },
  },
}

export interface IScaleTrack extends ITrack {
  type: 'Scale'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IScaleTrackDisplayOptions
}

export interface IScaleTrackDisplayOptions {
  autoSize: boolean
  bp: number
  height: number
  caps: {
    show: boolean
    height: number
  }
  stroke: IStrokeProps
  font: IFontProps
}

export const DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS: IScaleTrackDisplayOptions = {
  height: 30,
  caps: {
    height: 6,
    show: true,
  },
  stroke: { ...DEFAULT_STROKE_PROPS },
  font: { ...DEFAULT_FONT_PROPS, size: 'small' },
  autoSize: true,
  bp: 10000,
}

export interface IRulerTrack extends ITrack {
  type: 'Ruler'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IRulerTrackDisplayOptions
}

export interface IRulerTrackDisplayOptions {
  autoSize: boolean
  bp: number
  height: number
  minorTicks: {
    show: boolean
    height: number
  }
  majorTicks: {
    show: boolean
    height: number
  }
  stroke: IStrokeProps
  font: IFontProps
}

export const DEFAULT_RULER_TRACK_DISPLAY_OPTIONS: IRulerTrackDisplayOptions = {
  height: 20,
  minorTicks: {
    height: 6,
    show: true,
  },
  majorTicks: {
    height: 12,
    show: true,
  },
  stroke: { ...DEFAULT_STROKE_PROPS },
  font: { ...DEFAULT_FONT_PROPS, size: 'x-small' },
  autoSize: true,
  bp: 10000,
}

export interface ILocationTrack extends ITrack {
  type: 'Location'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ILocationTrackDisplayOptions
}

export interface ILocationTrackDisplayOptions {
  font: { weight: string | number }
  height: number
}

export const DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS: ILocationTrackDisplayOptions =
  {
    height: 20,
    font: {
      weight: 600,
    },
  }

export interface ICytobandsTrack extends ITrack {
  type: 'Cytobands'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ICytobandsTrackDisplayOptions
}

export type BandStyle = 'Rounded' | 'Square'

export interface ICytobandsTrackDisplayOptions {
  //band: { height: number }
  labels: {
    skip: { on: boolean; x: number }
    font: IFontProps
    show: boolean
  }
  style: BandStyle
  //height: number
  //height: number
  stroke: IStrokeProps
  location: {
    stroke: IStrokeProps
    fill: IColorProps
  }
  center: {
    fill: IColorProps
  }
}

export const DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS: ICytobandsTrackDisplayOptions =
  {
    //height: 50,
    stroke: { ...DEFAULT_STROKE_PROPS },
    //height: 24,

    location: {
      stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_RED },
      fill: { ...DEFAULT_FILL_PROPS, color: COLOR_RED },
    },
    center: {
      fill: { ...OPAQUE_FILL_PROPS, color: '#FA5F55' },
    },
    style: 'Rounded',
    labels: {
      show: true,
      font: { ...DEFAULT_FONT_PROPS, size: 'x-small' },
      skip: {
        on: true,
        x: 50,
      },
    },
    // band: {
    //   height: 16,
    // },
  }

export interface IBedTrack extends IDBTrack {
  type: 'BED'
  regions: number

  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IBedTrackDisplayOptions
}

export interface IRemoteBigBedTrack extends IDBTrack {
  type: 'Remote BigBed'
  displayOptions: IBedTrackDisplayOptions
}

export interface ILocalBigBedTrack extends ITrack {
  type: 'Local BigBed'

  reader: BaseBedReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IBedTrackDisplayOptions
}

export interface ILocalBedTrack extends ITrack {
  type: 'Local BED'
  reader: BaseBedReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IBedTrackDisplayOptions
}

export interface IBedTrackDisplayOptions {
  band: { height: number }
  height: number
  stroke: IStrokeProps
  fill: IColorProps
}

export const DEFAULT_BED_TRACK_DISPLAY_OPTIONS: IBedTrackDisplayOptions = {
  height: 24,
  stroke: { ...DEFAULT_STROKE_PROPS },
  band: {
    height: 12,
  },
  fill: { ...OPAQUE_FILL_PROPS },
}

export type AllDBSignalTrackTypes = ISignalTrack | IRemoteBigWigTrack

export type AllSignalTrackTypes = AllDBSignalTrackTypes | ILocalBigWigTrack

export type AllDBBedTrackTypes = IBedTrack | IRemoteBigBedTrack

export type AllBedTrackTypes =
  | AllDBBedTrackTypes
  | ILocalBedTrack
  | ILocalBigBedTrack

/**
 * All track types that represent sequenced data either as signal or regions.
 */
export type AllSeqTrackTypes = AllSignalTrackTypes | AllBedTrackTypes

export type TrackPlot =
  | AllSignalTrackTypes
  | AllBedTrackTypes
  | IGeneTrack
  | IScaleTrack
  | IRulerTrack
  | ILocationTrack
  | ICytobandsTrack

// export const EMPTY_TRACK_DB: ITracksDB = {
//   name: '',
//   platforms: [],
// }

// export function trackStr(track: ITrack): string {
//   return `${track.platform}:${track.genome}:${track.name}`
// }

// start, end, count
export interface ISeqBin {
  s: number
  e: number
  c: number
}

/**
 * The bins for a track
 */
export interface ISampleBinCounts extends IDBEntity {
  // the public id of a sample

  binSize: number
  //track: IDBTrack

  //reads: number
  //start: number
  bins: ISeqBin[] //ISeqBin[]
  ymax: number
  //bpmScaleFactor: number
  reads: number
  binReads: number
}

/**
 * The search results for a given location which
 * will contain the bins for
 */
export interface ILocTrackBins {
  /** The location for which to display track data */
  location: IGenomicLocation

  /** Represents all the tracks requested in the order requested */
  samples: ISampleBinCounts[]
}

export type ITrackAction =
  | {
      type: 'add'
      tracks: ITrackGroup[]
    }
  | {
      type: 'set'
      tracks: ITrackGroup[]
    }
  | {
      type: 'update'
      group: ITrackGroup
      track: TrackPlot
    }
  // | {
  //     type: 'update-display-props'
  //     id: string
  //     displayOptions: ISeqTrackDisplayOptions
  //   }
  | {
      type: 'order'
      order: string[]
    }
  | {
      type: 'remove-groups'
      ids: string[]
    }
  | {
      type: 'remove-tracks'
      group: ITrackGroup
      ids: string[]
    }
  | {
      type: 'select'
      ids: string[]
      selected: boolean
    }
  | {
      type: 'clear'
    }
  | {
      type: 'reset'
    }

export interface ITrackGroup {
  id: string
  type: 'Track Group' //optional, but useful for debugging
  name: string
  //order: string[]
  tracks: TrackPlot[] //{ [key: string]: TrackPlot } //Map<string, TrackPlot>

  //childOrder?: string[]
  //children?: { [key: string]: TrackPlot } // Map<string, ITrackGroup>
}

export function newTrackGroup(tracks: TrackPlot[]): ITrackGroup {
  return {
    id: makeUuid(),
    type: 'Track Group',
    name: tracks[0]!.name,
    //order: tracks.map(t => t.id),
    tracks: [...tracks], //: Object.fromEntries(tracks.map(t => [t.id, t])),
  }
}

export interface IPlotGroup {
  //order: string[]
  groups: ITrackGroup[] //Record<string, ITrackGroup> //Map<string, ITrackGroup>
}

export interface IPlotsState extends IPlotGroup {
  // Each index is a separate track, but to allow
  // plots to be combined into the same drawing, such as
  // overlaying signals, each index can contain multiple
  // plots, but in reality most will only contain 1

  selected: Record<string, boolean>
}

export function trackReducer(
  state: IPlotsState,
  action: ITrackAction
): IPlotsState {
  let groups: ITrackGroup[]
  let removeIds: Set<string>

  switch (action.type) {
    case 'add':
      groups = action.tracks //.map(ts => newTrackGroup(ts))

      return produce(state, draft => {
        // draft.groups = Object.fromEntries([
        //   ...Object.entries(state.groups),
        //   ...groups.map(g => [g.id, g] as [string, ITrackGroup]),
        // ])
        // draft.order = [...state.order, ...groups.map(g => g.id)]

        draft.groups = [...state.groups, ...groups]
      })
    case 'set':
      groups = action.tracks //.map(ts => newTrackGroup(ts))

      return produce(state, draft => {
        // draft.groups = Object.fromEntries(
        //   groups.map(g => [g.id, g] as [string, ITrackGroup])
        // )
        // draft.order = groups.map(g => g.id)
        draft.groups = [...state.groups, ...groups]
        draft.selected = {}
      })
    case 'update':
      return produce(state, draft => {
        draft.groups = state.groups.map(e =>
          e.id === action.group.id
            ? {
                ...e,
                tracks: [...e.tracks, action.track],
              }
            : e
        )
      })

    // case 'order':
    //   return { ...state, order: action.order }
    case 'remove-groups':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: state.groups.filter(e => !removeIds.has(e.id)),

        // see ifunknown groups were removed for having not tracks
        //order: state.order.filter(id => !removeIds.has(id)),
      }
    case 'remove-tracks':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: state.groups.map(e =>
          e.id === action.group.id
            ? {
                ...e,
                tracks: e.tracks.filter(e => !removeIds.has(e.id)),
                //order: e  .order.filter(id => !removeIds.has(id)),
              }
            : e
        ),
      }
    case 'select':
      return {
        ...state,
        selected: Object.fromEntries([
          ...Object.entries(state.selected),
          ...action.ids.map(id => [id, action.selected] as [string, boolean]),
        ]),
      }

    case 'clear':
      return { ...state, groups: [] }
    case 'reset':
      const tracks: TrackPlot[] = [
        {
          type: 'Location',
          name: 'Location',
          id: makeUuid(),
          displayOptions: {
            ...DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          type: 'Cytobands',
          name: 'Cytobands',
          id: makeUuid(),
          displayOptions: {
            ...DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          type: 'Scale',
          name: 'Scale',
          id: makeUuid(),
          displayOptions: {
            ...DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          type: 'Ruler',
          name: 'Ruler',
          id: makeUuid(),
          displayOptions: {
            ...DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
          },
        },

        {
          type: 'Gene',
          name: 'Genes',
          id: makeUuid(),
          displayOptions: {
            ...DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
          },
        },
      ]

      groups = tracks.map(t => ({ ...newTrackGroup([t]), name: t.name }))

      return {
        ...state,
        groups,
        selected: {},
      }
    default:
      return state
  }
}

// export function useMotifState(): {
//   state: ITracksState
//   dispatch: Dispatch<ITrackAction>
// } {
//   const [state, dispatch] = useReducer(trackReducer, {
//     tracks: [],
//     trackOrder: [],
//   })

//   return { state, dispatch }
// }

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

// export const MotifsDBContext = createContext<TrieNode<number> | undefined>(
//   undefined,
// )

// export const MotifSearchContext = createContext<string | undefined>(undefined)
// export const MotifUpdateSearchContext = createContext<
//   Dispatch<SetStateAction<string>> | undefined
// >(undefined)

// export const MotifSearchIdsContext = createContext<IMotifState | undefined>(
//   undefined,
// )

// export const MotifSearchIdsDispatchContext = createContext<
//   Dispatch<IMotifsAction> | undefined
// >(undefined)

// export const OrderedMotifSearchIdsContext = createContext<
//   IMotifState | undefined
// >(undefined)

// export const OrderedMotifSearchIdsDispatchContext = createContext<
//   Dispatch<IMotifsAction> | undefined
// >(undefined)

// const DEFAULT_STATE: IPlotsState = {
//   groups: {},
//   order: [],
//   selected: {},
// }

/**
 * Return a bin size for a given region on display
 *
 * @param location
 * @returns
 */
export function autoBinSize(location: GenLoc) {
  const w = location.end - location.start + 1

  // if (w / 50 < 1000) {
  //   return 50
  // }

  // if (w / 500 < 1000) {
  //   return 500
  // }

  // return 5000

  // if (w / 20 < 1000) {
  //   return 20
  // } else if (w / 200 < 1000) {
  //   return 200
  // } else if (w / 2000 < 1000) {
  //   return 2000
  // } else {
  //   return 20000
  // }

  if (w / 10 < 1000) {
    return 50
  } else if (w / 100 < 1000) {
    return 100
  } else if (w / 1000 < 1000) {
    return 1000
  } else {
    return 10000
  }

  // if (w / 16 <= 1000) {
  //   return 16
  // } else if (w / 64 <= 1000) {
  //   return 64
  // } else if (w / 256 < 1000) {
  //   return 256
  // } else if (w / 1024 < 1000) {
  //   return 1024
  // } else if (w / 4096 < 1000) {
  //   return 4096
  // } else {
  //   return 16384
  // }
}

export const LocationContext = createContext<{
  xax: Axis
  locTrackBins: ILocTrackBins | undefined
  globalY: number
  binSize: number
  location: GenLoc
  pos: IPos
  genes: IGenomicFeature[]
  geneYMap: Map<string, number>
  setLocation: (location: GenLoc) => void
}>({
  xax: new Axis(),
  locTrackBins: {
    location: NO_LOCATION,
    samples: [],
  },
  globalY: 1,
  binSize: 10,
  location: NO_LOCATION,
  pos: { ...ZERO_POS },
  genes: [],
  geneYMap: new Map<string, number>(),
  setLocation: () => {},
})

interface IMouseEventContext {
  pos: IPos
}

export const MouseEventContext = createContext<IMouseEventContext>({
  pos: { ...ZERO_POS },
})
