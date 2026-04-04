import { API_SEQS_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import {
  GenLoc,
  isGenomicLocation,
  parseGenLoc,
  toGenLoc,
  type IGenomicFeature,
  type IGenomicLocation,
} from '@/lib/genomic/genomic'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'

import { fill } from '@/lib/fill'
import { useEffect, useState } from 'react'
import {
  useSeqBrowserSettings,
  useSeqBrowserStore,
} from './seq-browser-settings'

import { API_GENOME_URL } from '@/lib/edb/genome'
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
  newTrackGroup,
  type AllDBSignalTrackTypes,
  type IDBTrack,
  type ITrackAction,
  type ITrackGroup,
  type TrackPlot,
} from './tracks-provider'

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

// const DEFAULT_GROUP_MAP = Object.fromEntries(
//   DEFAULT_GROUPS.map(g => [g.id, g] as [string, ITrackGroup])
// )

//const DEFAULT_GROUP_ORDER = DEFAULT_GROUPS.map(g => g.id)

export interface ITracksStore {
  groups: ITrackGroup[]
  //order: [],
  selectedGroups: Record<string, boolean>
  locations: GenLoc[]
  binSizes: number[]
  trackDb: AllDBSignalTrackTypes[]

  setLocations: (
    location: (GenLoc | IGenomicLocation | string)[]
  ) => Promise<void>
  setBinSizes: (binSizes: number[]) => void
  dispatch: (action: ITrackAction) => void
}

export const useTracksStore = create<ITracksStore>()(set => ({
  groups: [],
  //order: [],
  selectedGroups: {},
  trackDb: [],
  locations: useSeqBrowserStore.getState().locations.map(l => toGenLoc(l)),
  binSizes: [100],
  setLocations: async locs => {
    const settings = useSeqBrowserStore.getState()

    const locations: GenLoc[] = []

    for (const loc of locs) {
      if (loc instanceof GenLoc) {
        locations.push(loc)
      } else if (isGenomicLocation(loc)) {
        const l = loc as IGenomicLocation
        locations.push(new GenLoc(l.chr, l.start, l.end))
      } else {
        try {
          locations.push(parseGenLoc(loc as string))
        } catch {
          // see if gene symbol

          try {
            console.log(
              `${API_GENOME_URL}/assemblies/${settings.assembly}/search?q=${loc}&feature=gene`
            )
            const res = await httpFetch.getJson<{
              data: IGenomicFeature[]
            }>(
              `${API_GENOME_URL}/assemblies/${settings.assembly}/search?q=${loc}&feature=gene`
            )

            const features: IGenomicFeature[] = res.data

            if (features.length > 0) {
              const l = features[0]!.loc
              locations.push(new GenLoc(l.chr, l.start, l.end))
            }
          } catch {
            console.warn(`Could not parse location: ${loc}`)
          }
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
      return new GenLoc(location.chr, start, end)
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

    useSeqBrowserStore.getState().updateSettings({
      locations: locations.map(l => l.toGenomicLocation()),
    })

    set({
      locations,
      binSizes: settings.seqs.bins.autoSize
        ? locations.map(location => autoBinSize(location))
        : fill(settings.seqs.bins.size, locations.length),
    })
  },
  setBinSizes: (binSizes: number[]) => {
    set({ binSizes })
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
        // set(state =>
        //   produce(state, draft => {
        //     const trackIndex = state.groups.findIndex(
        //       t => t.id === action.group.id
        //     )

        //     console.log('update track group', action.group, trackIndex)

        //     if (trackIndex !== -1) {
        //       draft.groups[trackIndex] = action.group
        //     }
        //   })
        // )

        set(state =>
          produce(state, draft => {
            const group =
              draft.groups[
                draft.groups.findIndex(g => g.id === action.group.id)
              ]

            if (group) {
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
      // case 'order':
      //   set({ state: { ...state, order: action.order } })
      //   break
      case 'remove-groups':
        {
          //modify the steps, but do not
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
          //modify the steps, but do not
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
            //draft.order = [...DEFAULT_GROUP_ORDER]
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
  const { settings } = useSeqBrowserSettings()
  const locations = useTracksStore(state => state.locations)
  const binSizes = useTracksStore(state => state.binSizes)
  const setBinSizes = useTracksStore(state => state.setBinSizes)
  const setLocations = useTracksStore(state => state.setLocations)
  const groups = useTracksStore(state => state.groups)
  const selectedGroups = useTracksStore(state => state.selectedGroups)
  const dispatch = useTracksStore(state => state.dispatch)

  const { fetchAccessToken } = useEdbAuth()

  const [trackDb, setTrackDb] = useState<IDBTrack[]>([])

  //const [tooltip, setTooltip] = useState<ITrackTooltip>(NO_TRACK_TOOLTIP)

  const samplesQuery = useQuery({
    queryKey: ['tracks', settings.assembly],
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      //const token = await loadAccessToken()

      console.log('fetch tracks for assembly', settings.assembly)

      const res = await httpFetch.getJson<{ data: IDBTrack[] }>(
        `${API_SEQS_URL}/assemblies/${settings.assembly}/samples`,
        {
          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (samplesQuery.data) {
      //console.log('loaded tracks', samplesQuery.data)
      setTrackDb(samplesQuery.data)
    }
  }, [samplesQuery.data])

  // Update bin sizes when either bin size changes
  // or we change autosize
  useEffect(() => {
    setBinSizes(
      settings.seqs.bins.autoSize
        ? locations.map(location => autoBinSize(location))
        : fill(settings.seqs.bins.size, locations.length)
    )
  }, [settings.seqs.bins.size, settings.seqs.bins.autoSize])

  return {
    locations,
    setLocations,
    trackDb,
    binSizes,
    groups,
    selectedGroups,
    dispatch,
  }
}
