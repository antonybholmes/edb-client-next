import { type IElementProps } from '@interfaces/element-props'

import { forwardRef, useContext, useMemo } from 'react'

import { API_GENES_OVERLAP_URL, API_SEQS_BINS_URL } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { sum } from '@/lib/math/sum'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import type { IGeneDbInfo } from '../../annotate/annotate'
import { SeqBrowserSettingsContext } from '../seq-browser-settings-provider'
import {
  LocationContext,
  TracksContext,
  type IBedTrack,
  type IGeneTrack,
  type ILocalBedTrack,
  type ILocTrackBins,
  type ISeqTrack,
} from '../tracks-provider'
import { getBedTrackHeight } from './core-bed-track-svg'
import {
  getGeneTrackHeight,
  type IGenomicFeatureSearch,
} from './genes-track-svg'
import { getYMax } from './seq-track-svg'
import { TracksColumnSvg } from './tracks-column-svg'

export type GenesMap = { [key: string]: IGeneDbInfo }

interface IProps extends IElementProps {
  genesMap: GenesMap
}

export const TracksSvg = forwardRef<SVGElement, IProps>(function TracksSvg(
  { genesMap, className, style }: IProps,
  svgRef
) {
  const { state, locations, binSizes, setLocations } = useContext(TracksContext)
  const { settings } = useContext(SeqBrowserSettingsContext)

  //const location = locations[0]!

  const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)

  const genesQuery = useQuery({
    queryKey: ['genes', locations, settings.genome, settings.genes.canonical],
    queryFn: async () => {
      //console.log(API_GENES_OVERLAP_URL)
      const res = await httpFetch.postJson<{ data: IGenomicFeatureSearch[] }>(
        `${API_GENES_OVERLAP_URL}/${settings.genome}?canonical=${settings.genes.canonical.only}`,
        {
          body: { locations: locations.map((l) => l.loc) },
        }
      )

      //console.log('test genes', res.data)

      return res.data
    },
  })

  // we need this here to calculate the height of the track rather than
  // having the query inside the svg component
  const featuresSearch: IGenomicFeatureSearch[] = genesQuery.data
    ? genesQuery.data
    : []

  const seqs = state.order
    .map((gid) => state.groups[gid]!)
    .map((tg) => tg.order.map((id) => tg.tracks[id]!))
    .flat()
    .filter((t) => t.type === 'Seq') as ISeqTrack[]

  // force updates when seqs, location or bin size change
  const binsQuery = useQuery({
    queryKey: ['bins', seqs, locations, binSizes],
    queryFn: async () => {
      // if (locations.length === 0 || seqs.length === 0) {
      //   return []
      // }

      const accessToken = await getAccessTokenAutoRefresh()

      const res = await httpFetch.postJson<{ data: ILocTrackBins[] }>(
        API_SEQS_BINS_URL,
        {
          body: {
            locations: locations.map((l) => l.loc),
            binSizes,
            //scale: displayOptions.seq.applyScaling ? displayOptions.seq.scale : 0,
            tracks: seqs.map((t) => t.seqId),
          },

          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  const allLocTrackBins: ILocTrackBins[] = binsQuery.data ? binsQuery.data : []

  // use either the auto global or user fixed global
  const globalY = useMemo(
    () =>
      settings.seqs.globalY.auto && allLocTrackBins.length > 0
        ? getYMax(seqs, allLocTrackBins, settings.seqs.scale.mode)
        : settings.seqs.globalY.ymax,
    [allLocTrackBins, settings.seqs.globalY, settings.seqs.scale]
  )

  const svg = useMemo(() => {
    const tracks = state.order
      .map((gid) => state.groups[gid]!)
      .map((tg) => tg.order.map((id) => tg.tracks[id]!))

    if (tracks.length === 0) {
      return null
    }

    const innerWidth = settings.plot.width
    const titleHeightUsingPosition =
      settings.titles.position === 'Top' ? settings.titles.height : 0

    // determine how much space in the svg is required by each
    // track
    const trackHeights: number[] = tracks.map((ts) => {
      switch (ts[0]!.type) {
        case 'Seq':
          return (
            ts[0]!.displayOptions.height +
            titleHeightUsingPosition +
            settings.titles.height +
            // Add some extra height when labels on right to account for x-axis labels
            (settings.titles.position === 'Right' ? settings.titles.height : 0)
          )
        case 'Scale':

        case 'Location':
          return ts[0]!.displayOptions.height
        case 'Ruler':
        case 'Cytobands':
          return ts[0]!.displayOptions.height + settings.titles.height
        case 'Gene':
          return (
            (featuresSearch.length > 0
              ? Math.max(
                  ...featuresSearch.map((featureSearch) =>
                    getGeneTrackHeight(
                      ts[0]! as IGeneTrack,
                      featureSearch.features
                    )
                  )
                )
              : 0) + titleHeightUsingPosition
          )
        case 'BED':
        case 'Local BED':
          return (
            getBedTrackHeight(ts as (IBedTrack | ILocalBedTrack)[], settings) +
            titleHeightUsingPosition
          )

        default:
          return 0
      }
    })

    //const trackY = cumsum([0, ...trackHeights])
    const innerHeight = sum(trackHeights)

    const width =
      (innerWidth + settings.plot.gap) * locations.length +
      settings.margin.left +
      settings.margin.right
    const height = innerHeight + settings.margin.top + settings.margin.bottom

    return (
      <svg
        fontFamily="Arial, Helvetica, sans-serif"
        // @ts-expect-error svg ref not checked properly
        ref={svgRef}
        width={width * settings.zoom}
        height={height * settings.zoom}
        viewBox={`0 0 ${width} ${height}`}
        style={style}
      >
        <g
          transform={`translate(${settings.margin.left}, ${
            settings.margin.top
          })`}
        >
          {locations.map((location, li) => {
            return (
              <g
                id={`loc-col-${location.loc}`}
                transform={`translate(${li * (innerWidth + settings.plot.gap)}, ${
                  settings.margin.top
                })`}
                key={li}
              >
                <LocationContext.Provider
                  value={{
                    location,
                    setLocation: (location) => {
                      // for individual tracks, we can update their location
                      // using, for example, the ruler to propogate its
                      // changes back to here, where they can be subsequently
                      // used to update the global locations
                      const newLocations = produce(locations, (draft) => {
                        draft[li] = location
                      })

                      setLocations(newLocations)
                    },
                  }}
                >
                  <TracksColumnSvg
                    binSize={binSizes[li]!}
                    genesMap={genesMap}
                    // locTrackBins={
                    //   allLocTrackBins.length > li ? allLocTrackBins[li]! : null
                    // }
                    features={
                      featuresSearch.length > li
                        ? featuresSearch[li]!.features
                        : []
                    }
                    globalY={globalY}
                  />
                </LocationContext.Provider>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }, [location, state, featuresSearch, settings, globalY])

  return <div className={className}>{svg}</div>
})
