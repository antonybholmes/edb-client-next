import { useMemo, type ReactNode } from 'react'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { axisLength } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { locStr } from '@/lib/genomic/genomic'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  useLocation,
  useMouseEvent,
  type IPeakTrack,
  type ISeqDBTrack,
} from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { BedTrackSvg } from './bed-track-svg'
import { CytobandsTrackSvg } from './cytobands-track-svg'
import { GenesTrackSvg } from './genes-track-svg'
import { LocationTrackSvg } from './location-track-svg'
import { RulerTrackSvg } from './ruler-track-svg'
import { ScaleTrackSvg } from './scale-track-svg'
import { SeqTrackSvg } from './seq-track-svg'

/**
 * TrackColumns represent a single genomic location and contain all the tracks for that location.
 * We can have multiple columns to compare different locations.
 *
 * @returns
 */
export function TracksColumnSvg() {
  const { groups } = useTracks()
  const { pos, xax, location, geneYMap, height, trackY } = useLocation()
  const { settings } = useSeqBrowserSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { pos: mousePos } = useMouseEvent()

  const tracks = useMemo(() => groups.map((g) => g.tracks), [groups])

  const titleHeightUsingPosition =
    settings.titles.position === 'top' ? settings.titles.height : 0
  const xl = axisLength(xax)

  // const { trackY } = useMemo(() => {
  //   const trackHeights: number[] = []

  //   for (const ts of tracks) {
  //     // if there is a gene track, we need to calculate the height based on the features
  //     switch (ts[0]!.type) {
  //       case 'Seq':
  //       case 'BigWig':
  //       case 'RemoteBigWig':
  //       case 'LocalBigWig':
  //         trackHeights.push(
  //           ts[0]!.displayOptions.height +
  //             titleHeightUsingPosition +
  //             settings.axes.x.height +
  //             // Add some extra height when labels on right to account for x-axis labels
  //             (settings.titles.position === 'right'
  //               ? settings.titles.height
  //               : 0)
  //         )
  //         break
  //       case 'Scale':
  //       case 'Location':
  //         trackHeights.push(ts[0]!.displayOptions.height)
  //         break
  //       case 'Ruler':
  //       case 'Cytobands':
  //         trackHeights.push(
  //           settings.tracks.cytobands.height + settings.titles.height
  //         )
  //         break
  //       case 'Gene':
  //         trackHeights.push(
  //           (geneYMap.get('height') ?? 0) +
  //             titleHeightUsingPosition +
  //             settings.tracks.genes.offset
  //         )
  //         break
  //       case 'BED':
  //       case 'BigBed':
  //       case 'LocalBED':
  //       case 'RemoteBigBed':
  //       case 'LocalBigBed':
  //         trackHeights.push(
  //           getBedTrackHeight(ts as IPeakTrack[], settings) +
  //             titleHeightUsingPosition
  //         )
  //         break

  //       default:
  //         trackHeights.push(0)
  //         break
  //     }
  //   }

  //   const trackY = cumsum([0, ...trackHeights])
  //   return { trackHeights, trackY }
  // }, [tracks, geneYMap, settings, titleHeightUsingPosition])

  const colMousePos = useMemo(() => {
    let x = mousePos.x - pos.x

    if (x < 0 || x > xl) {
      x = -1
    }

    let y = mousePos.y - pos.y

    if (y < 0 || y > height) {
      y = -1
    }

    return { x, y }
  }, [mousePos.x, mousePos.y, pos.x, pos.y, xl, height])

  const mouseEventValue = useMemo(() => ({ pos: colMousePos }), [colMousePos])

  const trackSvg = useMemo(
    () =>
      tracks.map((ts, ti) => {
        let plotSvg: ReactNode = <text>{ts[0]!.type} not implemented</text>
        switch (ts[0]!.type) {
          case 'Seq':
          case 'BigWig':
          case 'RemoteBigWig':
          case 'LocalBigWig':
            plotSvg = (
              <SeqTrackSvg
                tracks={ts as ISeqDBTrack[]}
                titleHeight={titleHeightUsingPosition}
                key={ti}
                scale={ts[0]!.type === 'BigWig' ? ts[0]!.scale : 'Count'}
                pos={{ x: pos.x, y: pos.y + trackY[ti]! }}
              />
            )
            break
          case 'BED':
          case 'BigBed':
          case 'RemoteBigBed':
          case 'LocalBigBed':
          case 'LocalBED':
            plotSvg = (
              <BedTrackSvg
                key={ti}
                tracks={ts as IPeakTrack[]}
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
                genome={edbSettings.genomic.assembly}
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
          <SvgG pos={{ x: 0, y: trackY[ti]! }} key={ts[0]!.id}>
            {plotSvg}
          </SvgG>
        )
      }),
    [
      tracks,
      titleHeightUsingPosition,
      geneYMap,
      xax,
      edbSettings.genomic.assembly,
      trackY,
    ]
  )

  if (trackY.length === 0) {
    return null
  }

  return (
    // <MouseEventProvider value={mouseEventValue}>
    <SvgG id={`track-col-${locStr(location)}`} pos={pos}>
      {trackSvg}
    </SvgG>
    //  </MouseEventProvider>
  )
}
