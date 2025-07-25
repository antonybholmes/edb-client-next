import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type IColorProps,
  type IFontProps,
  type IStrokeProps,
} from '@components/plot/svg-props'
import { type IChildrenProps } from '@interfaces/children-props'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_NAVY_BLUE,
  COLOR_RED,
} from '@lib/color/color'
import { API_GENOME_INFO_URL, API_SEQS_SEARCH_URL } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import {
  GenomicLocation,
  NO_LOCATION,
  parseLocation,
  type IGenomicLocation,
} from '@lib/genomic/genomic'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { nanoid } from '@lib/utils'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'

import { queryClient } from '@/query'
import { fill } from '@lib/fill'
import {
  createContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
} from 'react'
import { useSeqBrowserSettings } from './seq-browser-settings'
import type { IGenomicFeature } from './svg/genes-track-svg'

import { Axis } from '@/components/plot/axis'
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
  publicId: string
  genome: string
  platform: string
  dataset: string
  trackType: string
  url: string
  tags: string[]
}

export interface IDBSignalTrack extends IDBTrack {
  reads: number
  stat: string
}

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

export const DEFAULT_GENOMIC_LOCATION = parseLocation(
  'chr3:187441954-187466041'
)

export interface ISignalTrack extends IDBSignalTrack {
  trackType: 'Seq'
  displayOptions: ISeqTrackDisplayOptions
}

export interface IRemoteBigWigTrack extends IDBTrack {
  trackType: 'Remote BigWig'
  scale: string
  //reader: BaseSeqReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ISeqTrackDisplayOptions
}

export interface ILocalBigWigTrack extends ITrack {
  trackType: 'Local BigWig'
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
  trackType: 'Gene'
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
  genes: {
    gap: number
  }
  transcripts: {
    height: number
  }
  // exons: {
  //   show: boolean
  //   //height: number
  //   fill: IFillProps
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
  //height: 30,
  // stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_CORNFLOWER_BLUE },
  // exons: {
  //   show: true,
  //   //height: 15,
  //   fill: { ...OPAQUE_FILL_PROPS, color: COLOR_CORNFLOWER_BLUE },
  // },
  arrows: {
    stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_NAVY_BLUE },
    fill: { ...OPAQUE_FILL_PROPS, color: COLOR_NAVY_BLUE },
    gap: 16,
    x: 2,
    y: 3,
    show: false,
    style: 'lines',
  },
  /* labels: {
    show: true,
    offset: 6,
    font: {
      size: 'x-small',
      color: COLOR_BLACK,
    },
    showGeneId: false,
  }, */
  genes: {
    gap: 3,
  },
  transcripts: {
    height: 15,
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
  trackType: 'Scale'
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
  font: {
    size: 'small',
    color: COLOR_BLACK,
  },
  autoSize: true,
  bp: 10000,
}

export interface IRulerTrack extends ITrack {
  trackType: 'Ruler'
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
  font: {
    size: 'x-small',
    color: COLOR_BLACK,
  },
  autoSize: true,
  bp: 10000,
}

export interface ILocationTrack extends ITrack {
  trackType: 'Location'
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
  trackType: 'Cytobands'
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: ICytobandsTrackDisplayOptions
}

export type BandStyle = 'Rounded' | 'Square'

export interface ICytobandsTrackDisplayOptions {
  band: { height: number }
  labels: {
    skip: { on: boolean; x: number }
    font: IFontProps
    show: boolean
  }
  style: BandStyle
  height: number
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
    height: 24,

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
      font: {
        size: 'x-small',
        color: COLOR_BLACK,
      },
      skip: {
        on: true,
        x: 50,
      },
    },
    band: {
      height: 16,
    },
  }

export interface IBedTrack extends IDBTrack {
  trackType: 'BED'
  regions: number

  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IBedTrackDisplayOptions
}

export interface IRemoteBigBedTrack extends IDBTrack {
  trackType: 'Remote BigBed'
  displayOptions: IBedTrackDisplayOptions
}

export interface ILocalBigBedTrack extends ITrack {
  trackType: 'Local BigBed'

  reader: BaseBedReader
  //index: GenomicFeatureIndex<GenomicLocation>
  displayOptions: IBedTrackDisplayOptions
}

export interface ILocalBedTrack extends ITrack {
  trackType: 'Local BED'
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
export type SeqBin = [number, number, number]

/**
 * The bins for a track
 */
export interface ITrackBinCounts {
  name: string
  // the public id of a sample
  publicId: string
  binSize: number
  //track: IDBTrack

  //reads: number
  //start: number
  bins: SeqBin[] //ISeqBin[]
  ymax: number
  bpmScaleFactor: number
}

export interface ILocTrackBins {
  /** The location for which to display track data */
  location: IGenomicLocation

  /** Represents all the tracks requested in the order requested */
  tracks: ITrackBinCounts[]
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
  trackType: 'Track Group' //optional, but useful for debugging
  name: string
  order: string[]
  tracks: { [key: string]: TrackPlot } //Map<string, TrackPlot>

  //childOrder?: string[]
  //children?: { [key: string]: TrackPlot } // Map<string, ITrackGroup>
}

export function newTrackGroup(tracks: TrackPlot[]): ITrackGroup {
  return {
    id: nanoid(),
    trackType: 'Track Group',
    name: tracks[0]!.name,
    order: tracks.map(t => t.id),
    tracks: Object.fromEntries(tracks.map(t => [t.id, t])),
  }
}

interface IPlotGroup {
  order: string[]
  groups: { [key: string]: ITrackGroup } //Map<string, ITrackGroup>
}

interface IPlotsState extends IPlotGroup {
  // Each index is a separate track, but to allow
  // plots to be combined into the same drawing, such as
  // overlaying signals, each index can contain multiple
  // plots, but in reality most will only contain 1

  selected: Map<string, boolean>
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
        draft.groups = Object.fromEntries([
          ...Object.entries(state.groups),
          ...groups.map(g => [g.id, g] as [string, ITrackGroup]),
        ])
        draft.order = [...state.order, ...groups.map(g => g.id)]
      })
    case 'set':
      groups = action.tracks //.map(ts => newTrackGroup(ts))

      return produce(state, draft => {
        draft.groups = Object.fromEntries(
          groups.map(g => [g.id, g] as [string, ITrackGroup])
        )
        draft.order = groups.map(g => g.id)
        draft.selected = new Map<string, boolean>()
      })
    case 'update':
      return produce(state, draft => {
        draft.groups = Object.fromEntries(
          Object.entries(state.groups).map(e =>
            e[0] === action.group.id
              ? [
                  e[0],
                  {
                    ...e[1],
                    tracks: Object.fromEntries([
                      ...Object.entries(e[1].tracks),
                      [action.track.id, action.track],
                    ]),
                  },
                ]
              : e
          )
        )
      })

    case 'order':
      return { ...state, order: action.order }
    case 'remove-groups':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: Object.fromEntries(
          Object.entries(state.groups).filter(e => !removeIds.has(e[0]))
        ),
        // see ifunknown groups were removed for having not tracks
        order: state.order.filter(id => !removeIds.has(id)),
      }
    case 'remove-tracks':
      //modify the steps, but do not
      removeIds = new Set(action.ids)

      return {
        ...state,
        groups: Object.fromEntries(
          Object.entries(state.groups).map(e =>
            e[0] === action.group.id
              ? [
                  e[0],
                  {
                    ...e[1],
                    tracks: Object.fromEntries(
                      Object.entries(e[1].tracks).filter(
                        e => !removeIds.has(e[0])
                      )
                    ),
                    order: e[1].order.filter(id => !removeIds.has(id)),
                  },
                ]
              : e
          )
        ),
      }
    case 'select':
      return {
        ...state,
        selected: new Map<string, boolean>([
          ...state.selected.entries(),
          ...action.ids.map(id => [id, action.selected] as [string, boolean]),
        ]),
      }

    case 'clear':
      return { ...state, groups: {}, order: [] }
    case 'reset':
      const tracks: TrackPlot[] = [
        {
          trackType: 'Location',
          name: 'Location',
          id: nanoid(),
          displayOptions: {
            ...DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          trackType: 'Cytobands',
          name: 'Cytobands',
          id: nanoid(),
          displayOptions: {
            ...DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          trackType: 'Scale',
          name: 'Scale',
          id: nanoid(),
          displayOptions: {
            ...DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
          },
        },
        {
          trackType: 'Ruler',
          name: 'Ruler',
          id: nanoid(),
          displayOptions: {
            ...DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
          },
        },

        {
          trackType: 'Gene',
          name: 'Genes',
          id: nanoid(),
          displayOptions: {
            ...DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
          },
        },
      ]

      groups = tracks.map(t => ({ ...newTrackGroup([t]), name: t.name }))

      return {
        ...state,
        groups: Object.fromEntries(
          groups.map(g => [g.id, g] as [string, ITrackGroup])
        ),
        order: groups.map(g => g.id),
        selected: new Map<string, boolean>(),
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

const DEFAULT_STATE = {
  groups: {},
  order: [],
  selected: new Map<string, boolean>(),
}

export const TracksContext = createContext<{
  locations: GenomicLocation[]
  setLocations: (location: (GenomicLocation | string)[]) => void
  trackDb: AllDBSignalTrackTypes[]

  binSizes: number[]
  state: IPlotsState
  dispatch: Dispatch<ITrackAction>
  //tooltip: ITrackTooltip
  //setTooltip: (tooltip: ITrackTooltip) => void
}>({
  locations: [],
  setLocations: () => {},
  trackDb: [],
  binSizes: [],
  state: { ...DEFAULT_STATE },
  dispatch: () => {},
  //tooltip: { ...NO_TRACK_TOOLTIP },
  //setTooltip: () => {},
})

export const LocationContext = createContext<{
  xax: Axis
  locTrackBins: ILocTrackBins | undefined
  globalY: number
  binSize: number
  location: GenomicLocation
  geneYMap: Map<string, number>
  setLocation: (location: GenomicLocation) => void
}>({
  xax: new Axis(),
  locTrackBins: {
    location: NO_LOCATION,
    tracks: [],
  },
  globalY: 1,
  binSize: 10,
  location: NO_LOCATION,
  geneYMap: new Map<string, number>(),
  setLocation: () => {},
})

/**
 * Return a bin size for a given region on display
 *
 * @param location
 * @returns
 */
export function autoBinSize(location: GenomicLocation) {
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

  // if (w / 10 <= 1000) {
  //   return 10
  // } else if (w / 100 <= 1000) {
  //   return 100
  // } else if (w / 1000 < 1000) {
  //   return 1000
  // } else {
  //   return 10000
  // }

  if (w / 16 <= 1000) {
    return 16
  } else if (w / 64 <= 1000) {
    return 64
  } else if (w / 256 < 1000) {
    return 256
  } else if (w / 1024 < 1000) {
    return 1024
  } else if (w / 4096 < 1000) {
    return 4096
  } else {
    return 16384
  }
}

export function TracksProvider({ children }: IChildrenProps) {
  const { settings, updateSettings } = useSeqBrowserSettings()

  const { fetchAccessToken } = useEdbAuth()

  const [state, dispatch] = useReducer(trackReducer, { ...DEFAULT_STATE })

  const [trackDb, setTrackDb] = useState<AllDBSignalTrackTypes[]>([])
  const [locations, setLocations] = useState<GenomicLocation[]>(
    settings.locations.map(l => parseLocation(l))
  )
  const [binSizes, setBinSizes] = useState<number[]>([128])

  //const [tooltip, setTooltip] = useState<ITrackTooltip>(NO_TRACK_TOOLTIP)

  useEffect(() => {
    dispatch({ type: 'reset' })
  }, [settings.genome])

  const tracksQuery = useQuery({
    queryKey: ['tracks', settings.genome],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      //const token = await loadAccessToken()
      //console.log(API_SEQS_SEARCH_URL)

      const res = await httpFetch.getJson<{ data: AllDBSignalTrackTypes[] }>(
        `${API_SEQS_SEARCH_URL}/${settings.genome}`,
        {
          headers: bearerHeaders(accessToken),
        }
      )

      //console.log('tracks', res.data)

      return res.data
    },
  })

  useEffect(() => {
    if (tracksQuery.data) {
      setTrackDb(tracksQuery.data)
    }
  }, [tracksQuery.data])

  async function _setLocations(locs: (GenomicLocation | string)[]) {
    const locations: GenomicLocation[] = []

    for (const loc of locs) {
      if (loc instanceof GenomicLocation) {
        locations.push(loc)
      } else {
        try {
          locations.push(parseLocation(loc))
        } catch {
          // see if gene symbol

          try {
            const res = await queryClient.fetchQuery({
              queryKey: ['genes', settings.genome, loc],
              queryFn: async () => {
                console.log(
                  `${API_GENOME_INFO_URL}/${settings.genome}?search=${loc}&level=gene`
                )
                const res = await httpFetch.getJson<{
                  data: IGenomicFeature[]
                }>(
                  `${API_GENOME_INFO_URL}/${settings.genome}?search=${loc}&level=gene`
                )

                //console.log('search genes', res.data)

                return res.data
              },
            })

            const features: IGenomicFeature[] = res

            if (features.length > 0) {
              const l = features[0]!.loc
              locations.push(new GenomicLocation(l.chr, l.start, l.end))
            }
          } catch {}
        }
      }
    }

    locations.map(location => {
      const start = Math.max(1, Math.round(location.start))
      const end = Math.max(
        start + 10,
        Math.min(300000000, Math.round(location.end))
      )
      //console.log(start, end)
      return new GenomicLocation(location.chr, start, end)
    })

    // remove duplicates
    // const used = new Set<string>()

    // const uniqueLocations: GenomicLocation[] = []

    // for (const l of locations) {
    //   if (used.has(l.loc)) {
    //     continue
    //   }

    //   uniqueLocations.push(l)
    //   used.add(l.loc)
    // }

    // Cache locations as user might be interested in them
    updateSettings(
      produce(settings, draft => {
        draft.locations = locations.map(l => l.loc)
      })
    )

    setLocations(locations)
  }

  useEffect(() => {
    setBinSizes(
      settings.seqs.bins.autoSize
        ? locations.map(location => autoBinSize(location))
        : fill(settings.seqs.bins.size, locations.length)
    )
  }, [locations, settings.seqs.bins.size, settings.seqs.bins.autoSize])

  //const [orderedMotifSearchIds, orderedMotifSearchIdsDispatch] =
  // useMotifSearchIds()

  // useEffect(() => {
  //   const rpn = toRPN(search)

  //   //console.log(rpn)

  //   const stack: number[][] = []
  //   let idset: Set<number>
  //   let ids1: number[]
  //   let ids2: number[]

  //   for (let n of rpn) {
  //     switch (n.op) {
  //       case "AND":
  //         if (stack.length > 1) {
  //           idset = new Set(stack.pop()!)
  //           ids2 = stack.pop()!
  //           stack.push(ids2.filter(id => idset.has(id)))
  //         }
  //         break
  //       case "OR":
  //         if (stack.length > 1) {
  //           ids1 = stack.pop()!
  //           idset = new Set(ids1)
  //           ids2 = stack.pop()!
  //           stack.push(ids1.concat(ids2.filter(id => !idset.has(id))))
  //         }
  //         break
  //       default:
  //         if (n.v) {
  //           stack.push(motifDB.find(n.v)) //search))
  //         }
  //         break
  //     }
  //   }

  //   if (stack.length > 0) {
  //     const ids = stack.pop()! //motifDB.find(search)
  //     // limit search results for rendering purposes
  //     motifSearchIdsDispatch({ type: "set", ids: ids.slice(0, 20) })
  //   }
  //   //orderedMotifSearchIdsDispatch({ type: "add", ids: ids.slice(0, 20) })
  // }, [motifDB, search])

  return (
    <TracksContext.Provider
      value={{
        locations,
        setLocations: _setLocations,
        trackDb,
        binSizes,

        state,
        dispatch,
        ///tooltip,
        //setTooltip,
      }}
    >
      {children}
    </TracksContext.Provider>
  )
}
