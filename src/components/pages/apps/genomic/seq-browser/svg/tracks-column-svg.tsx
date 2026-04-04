import { type IDivProps } from '@/interfaces/div-props'

import { useContext, useEffect, useState, type ReactNode } from 'react'

import { cumsum } from '@/lib/math/cumsum'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  LocationContext,
  MouseEventContext,
  type AllBedTrackTypes,
  type AllSignalTrackTypes,
  type IBedTrack,
  type ILocalBedTrack,
  type IRemoteBigBedTrack,
} from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { getBedTrackHeight } from './base-bed-track-svg'
import { BedTrackSvg } from './bed-track-svg'
import { CytobandsTrackSvg } from './cytobands-track-svg'
import { GenesTrackSvg } from './genes-track-svg'
import { LocationTrackSvg } from './location-track-svg'
import { RulerTrackSvg } from './ruler-track-svg'
import { ScaleTrackSvg } from './scale-track-svg'
import { SeqTrackSvg } from './seq-track-svg'

//export type GenesMap = { [key: string]: IGeneDbInfo }

export function TracksColumnSvg(
  {
    //locTrackBins,
  }: IDivProps
) {
  const { groups } = useTracks()
  const { pos, xax, location, geneYMap } = useContext(LocationContext)
  const { settings } = useSeqBrowserSettings()

  const { pos: mousePos } = useContext(MouseEventContext)

  const [colMousePos, setColMousePos] = useState({ x: -1, y: -1 })

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

  // we need this here to calculate the height of the track rather than
  // having the query inside the svg component
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
  //   .map(gid => groups[gid]!)
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

  const tracks = groups.map(g => g.tracks)

  //.map(gid => groups[gid]!)
  //.map(tg => tg.order.map(id => tg.tracks[id]!))

  if (tracks.length === 0) {
    return null
  }

  const titleHeightUsingPosition =
    settings.titles.position === 'top' ? settings.titles.height : 0

  const trackHeights: number[] = []

  for (const ts of tracks) {
    // if there is a gene track, we need to calculate the height based on the features
    switch (ts[0]!.type) {
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
        trackHeights.push(settings.cytobands.height + settings.titles.height)
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

  useEffect(() => {
    let x = mousePos.x - pos.x

    if (x < 0 || x > xax.length) {
      x = -1
    }

    let y = mousePos.y - pos.y

    if (y < 0 || y > trackY[trackY.length - 1]!) {
      y = -1
    }

    setColMousePos({ x, y })
  }, [
    mousePos.x,
    mousePos.y,
    pos.x,
    pos.y,
    xax.length,
    trackY.map(h => h.toString()).join('|'),
  ])

  //console.log('col mouse pos', colMousePos)

  return (
    <MouseEventContext.Provider value={{ pos: colMousePos }}>
      <g
        id={`track-col-${location.loc}`}
        transform={`translate(${pos.x}, ${pos.y})`}
      >
        {tracks.map((ts, ti) => {
          let plotSvg: ReactNode = <text>{ts[0]!.type} not implemented</text>
          switch (ts[0]!.type) {
            case 'Seq':
            case 'Remote BigWig':
            case 'Local BigWig':
              plotSvg = (
                <SeqTrackSvg
                  tracks={ts as AllSignalTrackTypes[]}
                  titleHeight={titleHeightUsingPosition}
                  key={ti}
                  scale={
                    ts[0]!.type === 'Remote BigWig' ||
                    ts[0]!.type === 'Local BigWig'
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
                <ScaleTrackSvg
                  genome={settings.assembly}
                  key={ti}
                  track={ts[0]!}
                />
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

              {/* <rect
              width={xax.length}
              height={trackHeights[trackHeights.length - 1]!}
              fill="red"
            
            /> */}

              {plotSvg}
            </g>
          )
        })}
      </g>
    </MouseEventContext.Provider>
  )
}
