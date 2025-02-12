import { type IElementProps } from '@interfaces/element-props'

import { useContext, type ReactNode } from 'react'

import { cumsum } from '@/lib/math/cumsum'
import { Axis } from '@components/plot/axis'
import type { IGeneDbInfo } from '../../annotate/annotate'
import { SeqBrowserSettingsContext } from '../seq-browser-settings-provider'
import {
  LocationContext,
  TracksContext,
  type IBedTrack,
  type ILocalBedTrack,
  type ISeqTrack,
} from '../tracks-provider'
import { BedTrackSvg } from './bed-track-svg'
import { getBedTrackHeight } from './core-bed-track-svg'
import { CytobandsTrackSvg } from './cytobands-track-svg'
import {
  GenesTrackSvg,
  getGeneTrackHeight,
  type IGenomicFeature,
} from './genes-track-svg'
import { LocalBedTrackSvg } from './local-bed-track-svg'
import { LocationTrackSvg } from './location-track-svg'
import { RulerTrackSvg } from './ruler-track-svg'
import { ScaleTrackSvg } from './scale-track-svg'
import { SeqTrackSvg } from './seq-track-svg'

export type GenesMap = { [key: string]: IGeneDbInfo }

interface IProps extends IElementProps {
  binSize: number
  genesMap: GenesMap
  //locTrackBins: ILocTrackBins | null
  features: IGenomicFeature[]
  globalY: number
}

export function TracksColumnSvg({
  binSize,
  genesMap,
  //locTrackBins,
  features,
  globalY,
}: IProps) {
  const { state } = useContext(TracksContext)
  const { location } = useContext(LocationContext)
  const { settings } = useContext(SeqBrowserSettingsContext)

  const xax = new Axis()
    .setDomain([location.start, location.end])
    .setLength(settings.plot.width)
    .setTicks([location.start, location.end])

  //const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)

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

  //     const accessToken = await getAccessTokenAutoRefresh()

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
    .map((gid) => state.groups[gid]!)
    .map((tg) => tg.order.map((id) => tg.tracks[id]!))

  if (tracks.length === 0) {
    return null
  }

  const titleHeightUsingPosition =
    settings.titles.position === 'Top' ? settings.titles.height : 0

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
        return getGeneTrackHeight(ts[0]!, features) + titleHeightUsingPosition
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

  const trackY = cumsum([0, ...trackHeights])

  return (
    <g id={`track-col-${location.loc}`}>
      {tracks.map((ts, ti) => {
        let plotSvg: ReactNode = <text>{ts[0]!.type} not implemented</text>
        switch (ts[0]!.type) {
          case 'Seq':
            plotSvg = (
              <SeqTrackSvg
                binSize={binSize}
                tracks={ts as ISeqTrack[]}
                //locTrackBins={locTrackBins}
                xax={xax}
                ymax={globalY}
                titleHeight={titleHeightUsingPosition}
                key={ti}
              />
            )
            break
          case 'BED':
            plotSvg = (
              <BedTrackSvg
                key={ti}
                tracks={ts as IBedTrack[]}
                xax={xax}
                titleHeight={titleHeightUsingPosition}
              />
            )
            break
          case 'Local BED':
            plotSvg = (
              <LocalBedTrackSvg
                key={ti}
                tracks={ts as ILocalBedTrack[]}
                xax={xax}
                titleHeight={titleHeightUsingPosition}
              />
            )
            break
          case 'Gene':
            plotSvg = (
              <GenesTrackSvg
                db={genesMap[settings.genome] ?? null}
                features={features}
                key={ti}
                track={ts[0]!}
                xax={xax}
                titleHeight={titleHeightUsingPosition}
              />
            )
            break
          case 'Location':
            plotSvg = <LocationTrackSvg key={ti} track={ts[0]!} xax={xax} />
            break
          case 'Scale':
            plotSvg = (
              <ScaleTrackSvg
                genome={settings.genome}
                key={ti}
                track={ts[0]!}
                xax={xax}
              />
            )
            break
          case 'Ruler':
            plotSvg = <RulerTrackSvg key={ti} track={ts[0]!} xax={xax} />
            break
          case 'Cytobands':
            plotSvg = (
              <CytobandsTrackSvg
                genome={settings.genome}
                key={ti}
                track={ts[0]!}
                xax={xax}
              />
            )
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
