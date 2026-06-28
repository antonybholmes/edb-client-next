import {
  DEFAULT_CENTERD_FONT_PROPS,
  DEFAULT_CENTERED_TEXT_PROPS,
  DEFAULT_COLOR_PROPS,
  DEFAULT_FONT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type IFontProps,
  type IPaintProps,
  type IStrokeProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_NAVY_BLUE,
  COLOR_RED,
} from '@/lib/color/color'

import { makeUuid } from '@/lib/id'
import { produce } from 'immer'

import { Axis } from '@/components/plot/axis'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { IDBEntity } from '@/interfaces/db-entity'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { IGenomicFeature } from '@/lib/genomic/genomic-feature'
import {
  NO_LOCATION,
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { createContext, useContext } from 'react'
import type { BaseBedReader } from './readers/bed/base-bed-reader'
import type { BaseSeqReader } from './readers/seq/base-seq-reader'
import type { ReadScaleMode } from './seq-browser-settings'

export const DEFAULT_GENOMIC_LOCATION = parseGenomicLocation(
  'chr3:187441954-187466041'
)

export const MIN_Y = 1

export interface ITrack {
  /** A randomly assigned id for the track */
  id: string

  /** A human readable name for the track, e.g. Ruler */
  name: string
}

export interface ITag {
  name: string
  value: string
}

export interface ISeqTrackDisplayOptions {
  smooth: boolean
  autoY: boolean
  useGlobalY: boolean
  ymax: number
  axes: { show: boolean }
  stroke: IStrokeProps
  fill: IPaintProps
  height: number
}

export interface IDBTrack extends ITrack {
  /** A database identifier */
  id: string
  //genome: string
  assembly: string
  technology: string
  institution: string
  dataset: string
  reads?: number
  type: string
  url?: string
  tags: ITag[]
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

export interface ISeqTrack extends IDBTrack {
  type: 'Seq'
  displayOptions: ISeqTrackDisplayOptions
}

export interface IBaseBigWigTrack {
  scale: string
  displayOptions: ISeqTrackDisplayOptions
}

export interface IBigWigTrack extends IDBTrack, IBaseBigWigTrack {
  type: 'BigWig'
}

export interface IBaseRemoteBigWigTrack extends IBaseBigWigTrack {
  reader: BaseSeqReader
}

export interface IRemoteBigWigTrack extends IDBTrack, IBaseRemoteBigWigTrack {
  type: 'RemoteBigWig'
}

export interface ILocalBigWigTrack extends ITrack, IBaseRemoteBigWigTrack {
  type: 'LocalBigWig'
}

// These are tracks that the api can return signal
// data directly. Other types require specialized
// bigwig or local readers to get the data for display
export type ISeqDBDataTrack = ISeqTrack | IBigWigTrack

// The signal tracks that the seq db app can return
export type ISeqDBTrack = ISeqDBDataTrack | IRemoteBigWigTrack

// All the signal track types including being able to load from local files
export type SignalTrack = ISeqDBTrack | ILocalBigWigTrack

// The peak tracks that the peak db app can return
export type IBedDBTrack = IBedDBDataTrack | IRemoteBigBedTrack

// All the peak track types including being able to load from local files
export type IPeakTrack = IBedDBTrack | ILocalBigBedTrack | ILocalBedTrack

export const DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS: ISeqTrackDisplayOptions = {
  stroke: {
    ...DEFAULT_STROKE_PROPS,
    value: COLOR_RED,
  },
  fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_RED, opacity: 0.2 },
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
    fill: IPaintProps
    gap: number
    x: number
    y: number
  }
  endArrows: {
    firstTranscriptOnly: boolean
    show: boolean
    stroke: IStrokeProps
    fill: IPaintProps
  }
  canonical: {
    isColored: boolean
    stroke: IStrokeProps
  }
}

export const DEFAULT_GENE_TRACK_DISPLAY_OPTIONS: IGeneTrackDisplayOptions = {
  arrows: {
    stroke: {
      ...DEFAULT_STROKE_PROPS,
      value: COLOR_NAVY_BLUE,
    },
    fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
    gap: 16,
    x: 2,
    y: 3,
    show: false,
    style: 'lines',
  },
  endArrows: {
    show: true,
    firstTranscriptOnly: true,
    stroke: {
      ...DEFAULT_STROKE_PROPS,
      value: COLOR_BLACK,
    },
    fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_BLACK },
  },
  canonical: {
    isColored: true,
    stroke: {
      ...DEFAULT_STROKE_PROPS,
      value: COLOR_CORNFLOWER_BLUE,
    },
  },
}

export interface IScaleTrack extends ITrack {
  type: 'Scale'
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
  text: ITextProps
}

export const DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS: IScaleTrackDisplayOptions = {
  height: 32,
  caps: {
    height: 6,
    show: true,
  },
  stroke: { ...DEFAULT_STROKE_PROPS },
  text: { ...DEFAULT_TEXT_PROPS },
  autoSize: true,
  bp: 10000,
}

export interface IRulerTrack extends ITrack {
  type: 'Ruler'
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
  text: ITextProps
}

export const DEFAULT_RULER_TRACK_DISPLAY_OPTIONS: IRulerTrackDisplayOptions = {
  height: 24,
  minorTicks: {
    height: 6,
    show: true,
  },
  majorTicks: {
    height: 12,
    show: true,
  },
  stroke: { ...DEFAULT_STROKE_PROPS },
  text: { ...DEFAULT_CENTERED_TEXT_PROPS },
  autoSize: true,
  bp: 10000,
}

export interface ILocationTrack extends ITrack {
  type: 'Location'
  displayOptions: ILocationTrackDisplayOptions
}

export interface ILocationTrackDisplayOptions {
  text: ITextProps
  height: number
}

export const DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS: ILocationTrackDisplayOptions =
  {
    height: 24,
    text: {
      ...DEFAULT_CENTERED_TEXT_PROPS,
      font: { ...DEFAULT_CENTERD_FONT_PROPS, fontWeight: 'bold' },
    } as ITextProps,
  }

export interface ICytobandsTrack extends ITrack {
  type: 'Cytobands'
  displayOptions: ICytobandsTrackDisplayOptions
}

export type BandStyle = 'rounded' | 'square'

export interface ICytobandsTrackDisplayOptions {
  labels: {
    skip: { on: boolean; x: number }
    font: IFontProps
    show: boolean
  }
  style: BandStyle
  stroke: IStrokeProps
  location: {
    stroke: IStrokeProps
    fill: IPaintProps
  }
  center: {
    fill: IPaintProps
  }
}

export const DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS: ICytobandsTrackDisplayOptions =
  {
    stroke: { ...DEFAULT_STROKE_PROPS },
    location: {
      stroke: {
        ...DEFAULT_STROKE_PROPS,
        value: COLOR_RED,
      },
      fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_RED },
    },
    center: {
      fill: { ...DEFAULT_COLOR_PROPS, value: '#FA5F55' },
    },
    style: 'rounded',
    labels: {
      show: true,
      font: { ...DEFAULT_FONT_PROPS },
      skip: {
        on: true,
        x: 50,
      },
    },
  }

/**
 * Can return data directly from the database for display, or can be used
 * to load data from a local file or remote url using a reader.
 */
export interface IBedDBDataTrack extends IDBTrack {
  type: 'BED' | 'BigBed'
  regions?: number
  displayOptions: IBedTrackDisplayOptions
}

export interface IBaseBedTrack extends ITrack {
  reader: BaseBedReader
  displayOptions: IBedTrackDisplayOptions
}

export interface IRemoteBigBedTrack extends IBaseBedTrack {
  type: 'RemoteBigBed'
  url: string
}

export interface ILocalBigBedTrack extends IBaseBedTrack {
  type: 'LocalBigBed'
}

export interface ILocalBedTrack extends IBaseBedTrack {
  type: 'LocalBED'
}

export interface IBedTrackDisplayOptions {
  band: { height: number }
  height: number
  stroke: IStrokeProps
  fill: IPaintProps
}

export const DEFAULT_BED_TRACK_DISPLAY_OPTIONS: IBedTrackDisplayOptions = {
  height: 24,
  stroke: { ...DEFAULT_STROKE_PROPS },
  band: {
    height: 12,
  },
  fill: { ...DEFAULT_COLOR_PROPS },
}

/**
 * All track types that represent sequenced data either as signal or regions.
 */
export type SignalOrPeakTrack = SignalTrack | IPeakTrack

export type TrackPlot =
  | SignalTrack
  | IPeakTrack
  | IGeneTrack
  | IScaleTrack
  | IRulerTrack
  | ILocationTrack
  | ICytobandsTrack

// start, end, count
export interface ISeqBin {
  // start coordinate of bin (1-based)
  s: number
  // end coordinate of bin (1-based)
  e: number
  // Count value of bin
  c: number
}

/**
 * The bins for a track
 */
export interface ISampleSearchResult extends IDBEntity {
  binSize: number
  bins: ISeqBin[]
  ymax: number
  binReads?: number
}

/**
 * The search results for a given location which
 * will contain the bins for
 */
export interface ISeqSearchResult {
  // The location for which to display track data
  location: IGenomicLocation

  // Represents all the tracks requested in the order requested
  samples: ISampleSearchResult[]
}

export interface ISeqSearchResultMap {
  // The location for which to display track data
  location: IGenomicLocation

  // Represents all the tracks requested in the order requested
  samples: Record<string, ISampleSearchResult>
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
  type: 'Track Group'
  name: string
  tracks: TrackPlot[]
}

export function newTrackGroup(tracks: TrackPlot[]): ITrackGroup {
  return {
    id: makeUuid(),
    type: 'Track Group',
    name: tracks[0]!.name,
    tracks: [...tracks],
  }
}

export interface IPlotGroup {
  groups: ITrackGroup[]
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
      groups = action.tracks
      return produce(state, (draft) => {
        draft.groups = [...state.groups, ...groups]
      })
    case 'set':
      groups = action.tracks //.map(ts => newTrackGroup(ts))

      return produce(state, (draft) => {
        draft.groups = [...state.groups, ...groups]
        draft.selected = {}
      })
    case 'update':
      return produce(state, (draft) => {
        draft.groups = state.groups.map((e) =>
          e.id === action.group.id
            ? {
                ...e,
                tracks: [...e.tracks, action.track],
              }
            : e
        )
      })
    case 'remove-groups':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: state.groups.filter((e) => !removeIds.has(e.id)),
      }
    case 'remove-tracks':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: state.groups.map((e) =>
          e.id === action.group.id
            ? {
                ...e,
                tracks: e.tracks.filter((e) => !removeIds.has(e.id)),
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
          ...action.ids.map((id) => [id, action.selected] as [string, boolean]),
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

      groups = tracks.map((t) => ({ ...newTrackGroup([t]), name: t.name }))

      return {
        ...state,
        groups,
        selected: {},
      }
    default:
      return state
  }
}

/**
 * Return a bin size for a given region on display
 *
 * @param location
 * @returns
 */
export function autoBinSize(location: IGenomicLocation) {
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

/**
 * Scans across tracks and locations to find the largest y value
 * for setting a global y than works for all samples.
 *
 * @param tracks
 * @param seqSearchResults
 * @param binSizes
 * @param scaleMode
 * @param ymin
 * @returns
 */
export async function getYMax(
  tracks: SignalTrack[],
  seqSearchResults: ISeqSearchResultMap[],
  binSizes: number[],
  scaleMode: ReadScaleMode,
  ymin: number = 0
): Promise<number> {
  let ymax = MIN_Y

  for (const track of tracks) {
    switch (track.type) {
      case 'Seq':
        {
          // for all locations, filter to just have the samples matching
          // our track of interest then test bins in that
          const trackSpecificBins: ISampleSearchResult[] = seqSearchResults.map(
            (ltb) => ltb.samples[track.id]!
          )

          switch (scaleMode) {
            case 'BPM':
              // const bpm = trackSpecificBins
              //   .map(sample =>
              //     sample.bins.map(b => (b.c / sample.binReads!) * 1000000)
              //   )
              //   .flat()

              const bpm = trackSpecificBins
                .map((sample) => (sample.ymax / sample.binReads!) * 1000000)
                .flat()

              ymax = Math.max(ymax, ...bpm)

              break
            case 'CPM':
              // take the large
              const cpm = trackSpecificBins
                .map((sample) => (sample.ymax / track.reads!) * 1000000)
                .flat()

              // const cpm = trackSpecificBins
              //   .map(sample =>
              //     sample.bins.map(b => (b.c / track.reads!) * 1000000)
              //   )
              //   .flat()

              ymax = Math.max(ymax, ...cpm)
              break
            default:
              ymax = Math.max(
                ymax,
                ...trackSpecificBins.map((sample) => sample.ymax)
              )
              break
          }
        }
        break
      case 'BigWig':
        {
          // for all locations, filter to just have the samples matching
          // our track of interest then test bins in that
          // const trackSpecificBins: ISeqSearchResult[] = seqSearchResults.map(
          //   ltb => ({
          //     ...ltb,
          //     samples: ltb.samples.filter(t => t.id === track.id),
          //   })
          // )
          const trackSpecificBins: ISampleSearchResult[] = seqSearchResults.map(
            (ltb) => ltb.samples[track.id]!
          )

          ymax = Math.max(
            ymax,
            ...trackSpecificBins.map((sample) => sample.ymax)
          )
        }
        break
      case 'RemoteBigWig':
      case 'LocalBigWig':
        for (const [li, ltb] of seqSearchResults.entries()) {
          const data = await track.reader.getRealYPoints(
            ltb.location,
            binSizes[li]!
          )

          ymax = Math.max(ymax, ...data.map((p) => p.realY))
        }
        break
      default:
        console.warn('Unknown track type for auto y calculation', track)
        break
    }
  }

  ymax = Math.ceil(ymax) // / 2) * 2

  // make it an even number for nicer y axis ticks
  if (ymax % 2 === 1) {
    ymax += 1
  }

  // the yaxis must be above zero, otherwise we get
  // errors calculating limits and ticks since the
  // axis must represent a real space
  return Math.max(ymin, ymax)
}

interface ILocationContextProps {
  xax: Axis
  seqSearchResult: ISeqSearchResultMap | undefined

  binSize: number
  location: IGenomicLocation
  pos: IPos
  genes: IGenomicFeature[]
  geneYMap: Map<string, number>
  height: number
  trackY: number[]
  setLocation: (location: IGenomicLocation) => void
}

export const LocationContext = createContext<ILocationContextProps>({
  xax: new Axis(),
  seqSearchResult: {
    location: NO_LOCATION,
    samples: {},
  },

  binSize: 10,
  location: NO_LOCATION,
  pos: { ...ZERO_POS },
  genes: [],
  geneYMap: new Map<string, number>(),
  height: 0,
  trackY: [], // for determining where tracks are for mouse events
  setLocation: () => {},
})

export function LocationProvider({
  value,
  children,
}: { value: ILocationContextProps } & IChildrenProps) {
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)

  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider')
  }

  return ctx
}

interface IMouseEventContext {
  pos: IPos
}

export const MouseEventContext = createContext<IMouseEventContext>({
  pos: { ...ZERO_POS },
})

export function MouseEventProvider({
  value,
  children,
}: { value: IMouseEventContext } & IChildrenProps) {
  return (
    <MouseEventContext.Provider value={value}>
      {children}
    </MouseEventContext.Provider>
  )
}

export function useMouseEvent() {
  const ctx = useContext(MouseEventContext)

  if (!ctx) {
    throw new Error('useMouseEvent must be used within a MouseEventProvider')
  }

  return ctx
}
