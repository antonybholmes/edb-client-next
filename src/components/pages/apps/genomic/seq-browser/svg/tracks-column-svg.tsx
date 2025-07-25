import { type IDivProps } from '@interfaces/div-props'

import { useContext, type ReactNode } from 'react'

import { cumsum } from '@lib/math/cumsum'
import type { IGeneDbInfo } from '../../annotate/annotate-page'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  LocationContext,
  TracksContext,
  type AllBedTrackTypes,
  type AllSignalTrackTypes,
  type IBedTrack,
  type ILocalBedTrack,
  type IRemoteBigBedTrack,
} from '../tracks-provider'
import { getBedTrackHeight } from './base-bed-track-svg'
import { BedTrackSvg } from './bed-track-svg'
import { CytobandsTrackSvg } from './cytobands-track-svg'
import { GenesTrackSvg, type IGenomicFeature } from './genes-track-svg'
import { LocationTrackSvg } from './location-track-svg'
import { RulerTrackSvg } from './ruler-track-svg'
import { ScaleTrackSvg } from './scale-track-svg'
import { SeqTrackSvg } from './seq-track-svg'

export type GenesMap = { [key: string]: IGeneDbInfo }

interface IProps extends IDivProps {
  genesMap: GenesMap
  //locTrackBins: ILocTrackBins | null
  features: IGenomicFeature[]
}

export function TracksColumnSvg({
  genesMap,
  //locTrackBins,
  features,
}: IProps) {
  const { state } = useContext(TracksContext)
  const { xax, location, geneYMap } = useContext(LocationContext)
  const { settings } = useSeqBrowserSettings()

  // let xax = new Axis()
  //   .setDomain([location.start, location.end])
  //   .setLength(settings.plot.width)
  //   .setTicks([location.start, location.end])

  //const { fetchAccessToken } = useEdbAuth()

  // const genesQuery = useQuery({
  //   queryKey: ['genes', location, settings.genome, settings.genes.canonical],
  //   queryFn: async () => {
  //     //console.log(API_GENES_OVERLAP_URL)
  //     const res = await httpFetch.postJson(
  //       `${API_GENES_OVERLAP_URL}/${settings.genome}?canonical=${settings.genes.canonical.only}`,
  //       {
  //         body: { locations: [location.loc] },
  //       }
  //     )

  //     //console.log('test genes', res.data, location.loc)

  //     return res.data
  //   },
  // })

  // // we need this here to calculate the height of the track rather than
  // // having the query inside the svg component
  // const features: IGenomicFeature[] = genesQuery.data ? genesQuery.data : []

  // useEffect(() => {
  //   if (genesQuery.data) {
  //     // const features: IGenomicFeature[] = genesQuery.data.map((f:unknown) => ({
  //     //   ...f,
  //     //   loc: parseLocation(f.loc),
  //     // }))
  //     console.log('draw these genes', genesQuery.data)

  //     setFeatures(genesQuery.data)
  //   }
  // }, [genesQuery.data])

  //console.log(state)

  // const seqs = state.order
  //   .map(gid => state.groups[gid]!)
  //   .map(tg => tg.order.map(id => tg.tracks[id]!))
  //   .flat()
  //   .filter(t => t.type === 'Seq') as ISeqTrack[]

  // force updates when seqs, location or bin size change
  // const binsQuery = useQuery({
  //   queryKey: ['bins', seqs, location, binSize],
  //   queryFn: async () => {
  //     if (seqs.length === 0) {
  //       return null
  //     }

  //     const accessToken = await fetchAccessToken()

  //     const res = await httpFetch.postJson(API_SEQS_BINS_URL, {
  //       body: {
  //         location: location.loc,
  //         bin: binSize,
  //         //scale: displayOptions.seq.applyScaling ? displayOptions.seq.scale : 0,
  //         tracks: seqs.map(t => t.seqId),
  //       },

  //       headers: bearerHeaders(accessToken),
  //     })

  //     return res.data
  //   },
  // })

  // use either the auto global or user fixed global
  // const globalY = useMemo(
  //   () =>
  //     settings.seqs.globalY.auto && locTrackBins
  //       ? getYMax(seqs, [locTrackBins], settings.seqs.scale.mode)
  //       : settings.seqs.globalY.ymax,
  //   [locTrackBins, settings.seqs.globalY, settings.seqs.scale]
  // )

  const tracks = state.order
    .map(gid => state.groups[gid]!)
    .map(tg => tg.order.map(id => tg.tracks[id]!))

  if (tracks.length === 0) {
    return null
  }

  const titleHeightUsingPosition =
    settings.titles.position === 'top' ? settings.titles.height : 0

  const trackHeights: number[] = []

  for (const ts of tracks) {
    // if there is a gene track, we need to calculate the height based on the features
    switch (ts[0]!.trackType) {
      case 'Seq':
      case 'Remote BigWig':
      case 'Local BigWig':
        trackHeights.push(
          ts[0]!.displayOptions.height +
            titleHeightUsingPosition +
            settings.axes.x.height +
            // Add some extra height when labels on right to account for x-axis labels
            (settings.titles.position === 'right' ? settings.titles.height : 0)
        )
        break
      case 'Scale':
      case 'Location':
        trackHeights.push(ts[0]!.displayOptions.height)
        break
      case 'Ruler':
      case 'Cytobands':
        trackHeights.push(ts[0]!.displayOptions.height + settings.titles.height)
        break
      case 'Gene':
        trackHeights.push(
          (geneYMap.get('height') ?? 0) +
            titleHeightUsingPosition +
            settings.genes.offset
        )
        break
      case 'BED':
      case 'Local BED':
      case 'Remote BigBed':
      case 'Local BigBed':
        trackHeights.push(
          getBedTrackHeight(
            ts as (
              | IBedTrack
              | ILocalBedTrack
              | IRemoteBigBedTrack
              | ILocalBedTrack
            )[],
            settings
          ) + titleHeightUsingPosition
        )
        break

      default:
        trackHeights.push(0)
        break
    }
  }

  const trackY = cumsum([0, ...trackHeights])

  return (
    <g id={`track-col-${location.loc}`}>
      {tracks.map((ts, ti) => {
        let plotSvg: ReactNode = <text>{ts[0]!.trackType} not implemented</text>
        switch (ts[0]!.trackType) {
          case 'Seq':
          case 'Remote BigWig':
          case 'Local BigWig':
            plotSvg = (
              <SeqTrackSvg
                tracks={ts as AllSignalTrackTypes[]}
                titleHeight={titleHeightUsingPosition}
                key={ti}
                scale={
                  ts[0]!.trackType === 'Remote BigWig' ||
                  ts[0]!.trackType === 'Local BigWig'
                    ? ts[0]!.scale
                    : 'Count'
                }
              />
            )
            break
          case 'BED':
          case 'Local BED':
          case 'Remote BigBed':
          case 'Local BigBed':
            plotSvg = (
              <BedTrackSvg
                key={ti}
                tracks={ts as AllBedTrackTypes[]}
                titleHeight={titleHeightUsingPosition}
              />
            )
            break

          case 'Gene':
            plotSvg = (
              <GenesTrackSvg
                db={genesMap[settings.genome]}
                genes={features}
                key={ti}
                track={ts[0]!}
                titleHeight={titleHeightUsingPosition}
                geneYMap={geneYMap}
              />
            )
            break
          case 'Location':
            plotSvg = <LocationTrackSvg key={ti} track={ts[0]!} xax={xax} />
            break
          case 'Scale':
            plotSvg = (
              <ScaleTrackSvg genome={settings.genome} key={ti} track={ts[0]!} />
            )
            break
          case 'Ruler':
            plotSvg = <RulerTrackSvg key={ti} track={ts[0]!} xax={xax} />
            break
          case 'Cytobands':
            plotSvg = <CytobandsTrackSvg key={ti} track={ts[0]!} />
            break

          default:
            break
        }

        return (
          <g transform={`translate(0, ${trackY[ti]!})`} key={ts[0]!.id}>
            {/* <rect width={xax.width} height={trackHeights[ti]} stroke='black' fill='none'/> */}
            {plotSvg}
          </g>
        )
      })}
    </g>
  )
}
