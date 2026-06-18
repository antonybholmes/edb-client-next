import { API_SEQS_BINS_URL, API_SEQS_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'

import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'

import { vfill } from '@/lib/fill'
import { useMemo } from 'react'
import {
  useSeqBrowserSettings,
  useSeqBrowserStore,
} from './seq-browser-settings'

import { TIME_5_MINUTES_MS } from '@/consts'
import { useEdbSettings, useEdbSettingsStore } from '@/lib/edb/edb-settings'
import { API_GENOME_GTFS_URL, API_GENOME_URL } from '@/lib/edb/genome'
import { GenLoc, locStr, toGenomicLocation } from '@/lib/genomic/genomic'
import type { IGenomicFeature } from '@/lib/genomic/genomic-feature'
import {
  isGenomicLocation,
  LOC_REGEX,
  newGenomicLocation,
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { makeUuid } from '@/lib/id'
import { produce } from 'immer'
import { create } from 'zustand'
import {
  autoBinSize,
  DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
  DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
  DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
  DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
  getYMax,
  newTrackGroup,
  type IDBTrack,
  type ISeqDBDataTrack,
  type ISeqDBTrack,
  type ISeqSearchResult,
  type ISeqSearchResultMap,
  type ISeqTrack,
  type ITrackAction,
  type ITrackGroup,
  type TrackPlot,
} from './tracks-provider'

export interface IGenomicFeatureSearch {
  location: IGenomicLocation
  features: IGenomicFeature[]
}

/**
 * The track types that represent signals, which can either be the
 * db format, or bigwigs
 */
export const SEQ_TRACK_TYPES = new Set([
  'Seq',
  'BigWig',
  'RemoteBigWig',
  'LocalBigWig',
])

export const BED_TRACK_TYPES = new Set([
  'BED',
  'BigBed',
  'RemoteBigBed',
  'LocalBigBed',
  'LocalBED',
])

const DEFAULT_TRACKS: TrackPlot[] = [
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

const DEFAULT_GROUPS = DEFAULT_TRACKS.map(t => ({
  ...newTrackGroup([t]),
  name: t.name,
}))

export interface ISeqLocation extends IGenomicLocation {
  id: string
  search: string
}

export interface ITracksStore {
  groups: ITrackGroup[]
  //order: [],
  selectedGroups: Record<string, boolean>
  locations: ISeqLocation[]

  trackDb: ISeqDBTrack[]

  setLocations: (
    location: (IGenomicLocation | GenLoc | string)[]
  ) => Promise<void>

  dispatch: (action: ITrackAction) => void
}

export const useTracksStore = create<ITracksStore>()(set => ({
  groups: [],
  //order: [],
  selectedGroups: {},
  trackDb: [],
  locations: useSeqBrowserStore.getState().locations.map(l => ({
    ...l,
    id: makeUuid(),
    search: locStr(l),
  })),
  binSizes: [100],

  setLocations: async locs => {
    const settings = useEdbSettingsStore.getState()

    const locations: ISeqLocation[] = []

    for (const loc of locs) {
      if (loc instanceof GenLoc) {
        locations.push({
          ...toGenomicLocation(loc),
          id: makeUuid(),
          search: locStr(toGenomicLocation(loc)),
        })
      } else if (isGenomicLocation(loc)) {
        locations.push({
          ...(loc as IGenomicLocation),
          id: makeUuid(),
          search: locStr(loc as IGenomicLocation),
        })
      } else if (typeof loc === 'string') {
        try {
          // if a location parse it
          if (LOC_REGEX.test(loc)) {
            locations.push({
              ...parseGenomicLocation(loc),
              id: makeUuid(),
              search: locStr(parseGenomicLocation(loc)),
            })
            continue
          }

          // could be a gene name, so search for it and use the first result if found
          console.log(
            `${API_GENOME_URL}/assemblies/${settings.genomic.assembly}/search?q=${loc}&feature=gene`
          )
          const res = await httpFetch.getJson<{
            data: IGenomicFeature[]
          }>(
            `${API_GENOME_URL}/assemblies/${settings.genomic.assembly}/search?q=${loc}&feature=gene`
          )

          const features: IGenomicFeature[] = res.data

          if (features.length > 0) {
            const l = features[0]!.loc
            locations.push({
              ...newGenomicLocation(l.chr, l.start, l.end),
              id: makeUuid(),
              search: loc,
            })
          }
        } catch {
          console.warn(`Could not parse location: ${loc}`)
        }
      } else {
        console.warn(`Invalid location: ${loc}`)
      }
    }

    locations.map(location => {
      const start = Math.max(1, Math.round(location.start))
      const end = Math.max(
        start + 10,
        Math.min(300000000, Math.round(location.end))
      )
      //console.log(start, end)
      return newGenomicLocation(location.chr, start, end)
    })

    console.log('set locations', locations)

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
    useSeqBrowserStore.getState().updateSettings({
      locations,
    })

    set({ locations })
  },

  dispatch: action => {
    let groups: ITrackGroup[]

    switch (action.type) {
      case 'add':
        groups = action.tracks //.map(ts => newTrackGroup(ts))

        set(state =>
          produce(state, draft => {
            draft.groups.push(...groups)
          })
        )
        break
      case 'set':
        groups = action.tracks //.map(ts => newTrackGroup(ts))

        set(state =>
          produce(state, draft => {
            draft.groups = [...groups]
            draft.selectedGroups = {}
          })
        )

        break
      case 'update':
        set(state =>
          produce(state, draft => {
            const group =
              draft.groups[
                draft.groups.findIndex(g => g.id === action.group.id)
              ]

            if (group) {
              console.log('update track', action.track)
              const trackIndex = group.tracks.findIndex(
                t => t.id === action.track.id
              )

              if (trackIndex !== -1) {
                group.tracks[trackIndex] = action.track
              }
            }
          })
        )

        break
      case 'remove-groups':
        {
          const removeIds = new Set(action.ids)

          set(state =>
            produce(state, draft => {
              draft.groups = state.groups.filter(g => !removeIds.has(g.id))
            })
          )
        }
        break
      case 'remove-tracks':
        {
          const removeIds = new Set(action.ids)

          set(state =>
            produce(state, draft => {
              const group = draft.groups.find(g => g.id === action.group.id)!

              group.tracks = group.tracks.filter(t => !removeIds.has(t.id))
            })
          )
        }
        break
      case 'select':
        set(state =>
          produce(state, draft => {
            draft.selectedGroups = Object.fromEntries([
              ...Object.entries(draft.selectedGroups),
              ...action.ids.map(
                id => [id, action.selected] as [string, boolean]
              ),
            ])
          })
        )

        break
      case 'clear':
        set(state =>
          produce(state, draft => {
            draft.groups = []
          })
        )
        break
      case 'reset':
        set(state =>
          produce(state, draft => {
            draft.groups = [...DEFAULT_GROUPS]

            draft.selectedGroups = {}
          })
        )
        break
      default:
        break
    }
  },
}))

export function useTracks() {
  const { settings: edbSettings } = useEdbSettings()
  const { settings } = useSeqBrowserSettings()
  const locations = useTracksStore(state => state.locations)

  const setLocations = useTracksStore(state => state.setLocations)
  const groups = useTracksStore(state => state.groups)
  const selectedGroups = useTracksStore(state => state.selectedGroups)
  const dispatch = useTracksStore(state => state.dispatch)

  //const { gtf } = useGenomes()
  const { fetchAccessToken } = useEdbAuth()

  //const [tooltip, setTooltip] = useState<ITrackTooltip>(NO_TRACK_TOOLTIP)

  const locationStrs = useMemo(() => locations.map(l => locStr(l)), [locations])

  const { data: locationFeatures = [] } = useQuery({
    queryKey: [
      'gtf',
      edbSettings.genomic.assembly,
      locationStrs,
      edbSettings.genomic.assembly,
      settings.tracks.genes.canonical,
      settings.tracks.genes.types,
    ],
    enabled: locations.length > 0,
    placeholderData: [],
    queryFn: async () => {
      const url = new URL(
        `${API_GENOME_GTFS_URL}/${edbSettings.genomic.assembly}/overlap`
      )

      const params: Record<string, string> = {
        canonical: settings.tracks.genes.canonical.only ? 'true' : 'false',
      }

      if (settings.tracks.genes.types === 'protein-coding') {
        params.type = 'protein_coding'
      }

      url.search = new URLSearchParams(params).toString()

      const res = await httpFetch.postJson<{ data: IGenomicFeatureSearch[] }>(
        url.toString(),
        {
          body: { locations: locationStrs },
        }
      )

      return res.data
    },
  })

  const { data: trackDb = [] } = useQuery({
    queryKey: ['tracks', edbSettings.genomic.assembly],
    placeholderData: [],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.getJson<{ data: IDBTrack[] }>(
        `${API_SEQS_URL}/assemblies/${edbSettings.genomic.assembly}/samples`,
        {
          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  // Update bin sizes when either bin size changes
  // or we change autosize
  const binSizes = useMemo(
    () =>
      settings.tracks.seqs.bins.autoSize
        ? locations.map(location => autoBinSize(location))
        : vfill(settings.tracks.seqs.bins.size, locations.length),

    [
      locations,
      settings.tracks.seqs.bins.size,
      settings.tracks.seqs.bins.autoSize,
    ]
  )

  const tracks = useMemo(
    () =>
      groups
        .map(g => g.tracks)
        .flat()
        .filter(t => SEQ_TRACK_TYPES.has(t.type)) as ISeqTrack[],
    [groups]
  )

  // tracks that can be returned from the Seq API
  const seqDBDataTracks = useMemo(
    () =>
      tracks.filter(
        t => t.type === 'Seq' || t.type === 'BigWig'
      ) as ISeqDBDataTrack[],
    [tracks]
  )

  // force updates when seqs, location or bin size change
  const { data: seqSearchResults = [] } = useQuery({
    queryKey: ['bins', seqDBDataTracks.map(t => t.id), locationStrs, binSizes],
    staleTime: TIME_5_MINUTES_MS,
    placeholderData: [],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.postJson<{ data: ISeqSearchResult[] }>(
        API_SEQS_BINS_URL,
        {
          body: {
            locations: locationStrs,
            binSizes,
            samples: seqDBDataTracks.map(t => t.id),
          },

          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
    select: data => {
      // transform into map view
      return data.map(d => {
        return {
          location: d.location,
          samples: Object.fromEntries(d.samples.map(s => [s.id, s])),
        }
      }) as ISeqSearchResultMap[]
    },
  })

  const { data: globalY = settings.tracks.seqs.globalY.ymax } = useQuery({
    queryKey: [
      'globalY',
      seqSearchResults?.map(r => locStr(r.location)),
      tracks.map(t => t.id),
      binSizes,
      settings.tracks.seqs.scale.mode,
      settings.tracks.seqs.globalY.auto,
      settings.tracks.seqs.globalY.ymax,
    ],
    enabled: !!seqSearchResults && tracks.length > 0,
    placeholderData: settings.tracks.seqs.globalY.ymax,
    queryFn: async () => {
      if (!settings.tracks.seqs.globalY.auto) {
        return settings.tracks.seqs.globalY.ymax
      }

      return getYMax(
        tracks,
        seqSearchResults!,
        binSizes,
        settings.tracks.seqs.scale.mode
      )
    },
  })

  // // use either the auto global or user fixed global
  // useEffect(() => {
  //   async function updateY() {
  //     if (
  //       !settings.seqs.globalY.auto ||
  //       !seqSearchResults ||
  //       tracks.length === 0
  //     ) {
  //       setGlobalY(settings.seqs.globalY.ymax)
  //       return
  //     }

  //     const y = await getYMax(
  //       tracks,
  //       seqSearchResults,
  //       binSizes,
  //       settings.seqs.scale.mode
  //     )

  //     console.log('global y', y, 'd')

  //     setGlobalY(y)
  //   }

  //   updateY()
  // }, [
  //   seqSearchResults,
  //   settings.seqs.globalY.auto,
  //   settings.seqs.globalY.ymax,
  //   settings.seqs.scale,
  //   tracks,
  //   binSizes,
  // ])

  return {
    locations,
    trackDb,
    binSizes,
    groups,
    selectedGroups,
    locationFeatures,
    tracks,
    seqSearchResults,
    globalY,
    setLocations,
    dispatch,
  }
}
