import { type IDivProps } from '@interfaces/div-props'

import { YAxis } from '@/components/plot/axis'
import { BigWig } from '@gmod/bbi'
import { RemoteFile } from 'generic-filehandle2'
import { useContext, useEffect, useState } from 'react'
import {
  EMPTY_SEQ_READER,
  type BaseSeqReader,
} from '../readers/seq/base-seq-reader'
import { BigWigReader } from '../readers/seq/bigwig-reader'
import { SeqReader } from '../readers/seq/seq-reader'
import {
  useSeqBrowserSettings,
  type ReadScaleMode,
} from '../seq-browser-settings'
import {
  LocationContext,
  type AllSignalTrackTypes,
  type ILocalBigWigTrack,
  type ILocTrackBins,
  type IRemoteBigWigTrack,
  type ISignalTrack,
} from '../tracks-provider'
import { BaseSeqTrackSvg, type ISeqPos } from './base-seq-track-svg'

/**
 * Scans across tracks and locations to find the largest y value
 * for setting a global y than works for all samples.
 *
 * @param tracks
 * @param locTrackBins
 * @param binSizes
 * @param scaleMode
 * @param ymin
 * @returns
 */
export async function getYMax(
  tracks: (ISignalTrack | IRemoteBigWigTrack | ILocalBigWigTrack)[],
  locTrackBins: ILocTrackBins[],
  binSizes: number[],
  scaleMode: ReadScaleMode,
  ymin: number = 0
): Promise<number> {
  let ymax = 0

  for (const track of tracks) {
    switch (track.trackType) {
      case 'Remote BigWig':
      case 'Local BigWig':
        const reader =
          track.trackType === 'Remote BigWig'
            ? new BigWigReader(
                new BigWig({
                  filehandle: new RemoteFile(track.url),
                })
              )
            : track.reader

        for (const [li, ltb] of locTrackBins.entries()) {
          const data = await reader.getRealYPoints(ltb.location, binSizes[li]!)

          ymax = Math.max(ymax, Math.max(...data.map(p => p.realY)))
        }
        break
      default:
        // for all locations, filter to just have the track matching
        // our track of interest then test bins in that
        const trackSpecificBins: ILocTrackBins[] = locTrackBins.map(ltb => ({
          ...ltb,
          tracks: ltb.tracks.filter(t => t.publicId === track.publicId),
        }))

        switch (scaleMode) {
          case 'BPM':
            const bpm = trackSpecificBins
              .map(ltb =>
                ltb.tracks.length > 0
                  ? ltb.tracks[0]!.bins.map(
                      b => b[2]! * ltb.tracks[0]!.bpmScaleFactor
                    )
                  : []
              )
              .flat()

            ymax = Math.max(ymax, Math.max(...bpm))
            break
          case 'CPM':
            ymax = Math.max(
              ymax,
              Math.max(
                ...trackSpecificBins.map(ltb =>
                  ltb.tracks.length > 0
                    ? (ltb.tracks[0]!.ymax / track.reads) * 1000000
                    : 0
                )
              )
            )
            break
          default:
            ymax = Math.max(
              ymax,
              Math.max(
                ...trackSpecificBins.map(ltb =>
                  ltb.tracks.length > 0 ? ltb.tracks[0]!.ymax : 0
                )
              )
            )
            break
        }
    }
  }

  ymax = Math.ceil(ymax) // / 2) * 2

  // the yaxis must be above zero, otherwise we get
  // errors calculating limits and ticks since the
  // axis must represent a real space
  return Math.max(ymin, ymax)
}

interface IProps extends IDivProps {
  tracks: (ISignalTrack | IRemoteBigWigTrack | ILocalBigWigTrack)[]
  scale?: string
  titleHeight: number
}

export function SeqTrackSvg({ tracks, scale = 'Count', titleHeight }: IProps) {
  const { xax, globalY, location, binSize, locTrackBins } =
    useContext(LocationContext)

  const { settings } = useSeqBrowserSettings()

  const [coreTracks, setCoreTracks] = useState<
    {
      track: ISignalTrack | IRemoteBigWigTrack | ILocalBigWigTrack
      positions: ISeqPos[]
    }[]
  >([])

  const [ymax, setYmax] = useState(Math.max(1, globalY))

  function updateYMax(newYmax: number) {
    setYmax(Math.max(1, newYmax))
  }

  // function getPoints(
  //   yax: YAxis,
  //   track: ISeqTrack,
  //   binCounts: ITrackBinCounts
  // ): ISeqPos[] {
  //   if (binCounts.bins.length === 0) {
  //     return []
  //   }

  //   const y0 = yax.domainToRange(0)

  //   // fill in the blanks, we could do this on server, but
  //   // may as well try to get user to do as much computation
  //   // as possible
  //   const bins: SeqBin[] = []

  //   for (const [bi, bin] of binCounts.bins.entries()) {
  //     bins.push(bin)

  //     if (bi < binCounts.bins.length - 1) {
  //       const nextBin = binCounts.bins[bi + 1]!

  //       if (nextBin[0]! - bin[1]! > 1) {
  //         // the next bin is not adjacent, so insert a gap
  //         bins.push([bin[1]! + 1, nextBin[0] - 1, 0])
  //       }
  //     }
  //   }

  //   let points: ISeqPos[] = bins
  //     .map(bin => {
  //       const s = bin[0]!
  //       const e = bin[1]!
  //       const reads = bin[2]!
  //       let y = 0

  //       switch (settings.seqs.scale.mode) {
  //         case 'BPM':
  //           y = reads * binCounts.bpmScaleFactor
  //           break
  //         case 'CPM':
  //           y = (reads / track.reads) * 1000000
  //           break
  //         default:
  //           y = reads
  //       }

  //       const x1 = xax.domainToRange(s)
  //       const x2 = xax.domainToRange(e)
  //       const y1 = yax.domainToRange(y)

  //       if (x2 !== x1) {
  //         // points map to different locations so
  //         // we want both points

  //         if (settings.seqs.smooth) {
  //           // to further smooth, use the mid point of the bin in addition
  //           // to d3
  //           return [
  //             {
  //               x: (x1 + x2) / 2,
  //               y: y1,
  //               realY: y,
  //             },
  //           ]
  //         } else {
  //           return [
  //             {
  //               x: x1,
  //               y: y1,
  //               realY: y,
  //             },
  //             {
  //               x: x2,
  //               y: y1,
  //               realY: y,
  //             },
  //           ]
  //         }
  //       } else {
  //         // points resolve to same location, so just
  //         // return one of them
  //         return [
  //           {
  //             x: x1,
  //             y: y1,
  //             realY: y,
  //           },
  //         ]
  //       }
  //     })
  //     .flat()

  //   // zero the ends
  //   points = [
  //     { x: points[0]!.x, y: y0, realY: 0 },
  //     ...points,
  //     { x: points[points.length - 1]!.x, y: y0, realY: 0 },
  //   ]

  //   return points
  // }

  // const res = useQuery({
  //   queryKey: ['seq', tracks, location, binSize],
  //   queryFn: async () => {
  //     //console.log(API_SEQS_BINS_URL)

  //     const accessToken = await fetchAccessToken()

  //     const res = await httpFetch.postJson<{ data: ILocTrackBins[] }>(
  //       API_SEQS_BINS_URL,
  //       {
  //         body: {
  //           locations: [location.loc],
  //           //scale: displayOptions.seq.applyScaling ? displayOptions.seq.scale : 0,
  //           binSizes: [binSize],
  //           tracks: tracks.map(t => t.publicId),
  //         },

  //         headers: bearerHeaders(accessToken),
  //       }
  //     )

  //     return res.data
  //   },
  // })

  // each entry is a location, bincounts represents the counts for
  // each track at a location
  // const allLocTrackBins: ILocTrackBins[] = res.data ? res.data : []

  // if (allLocTrackBins.length === 0) {
  //   return null
  // }

  //console.log(allLocTrackBins)

  //const locTrackBins = allLocTrackBins[0]!

  //console.log(locTrackBins)

  useEffect(() => {
    async function updateY() {
      // If global y is not in use, switch to finding the auto y
      if (settings.seqs.globalY.on && tracks[0]!.displayOptions.useGlobalY) {
        updateYMax(globalY)
      } else {
        if (tracks[0]!.displayOptions.autoY) {
          //ymax = getYMax(tracks, [locTrackBins], settings.seqs.scale.mode)

          updateYMax(
            await getYMax(
              tracks,
              [locTrackBins!],
              [binSize],
              settings.seqs.scale.mode
            )
          )
        } else {
          updateYMax(tracks[0]!.displayOptions.ymax)
        }
      }
    }

    if (locTrackBins) {
      updateY()
    }
  }, [locTrackBins, settings.seqs.globalY, settings.seqs.scale, tracks])

  //const allTracksBinCounts = locTrackBins.tracks

  const yax = new YAxis()
    .setDomain([0, ymax])
    .setLength(tracks[0]!.displayOptions.height)
    .setTicks([0, ymax])
    .setTitle(tracks[0]!.trackType === 'Seq' ? settings.seqs.scale.mode : scale)

  //const refPoints: ISeqPos[] = getPoints(yax, tracks[0]!, allBinCounts[0]!)

  useEffect(() => {
    async function getPoints() {
      let coreTracks: {
        track: AllSignalTrackTypes
        positions: ISeqPos[]
      }[] = []

      let reader: BaseSeqReader = EMPTY_SEQ_READER

      for (const t of tracks) {
        switch (t.trackType) {
          case 'Remote BigWig':
          case 'Local BigWig':
            reader =
              t.trackType === 'Remote BigWig'
                ? new BigWigReader(
                    new BigWig({
                      filehandle: new RemoteFile(t.url),
                    })
                  )
                : t.reader
            break
          default:
            // we have the tracks to display in this block and all
            // the tracks we downloaded for this location, therefore
            // we need to filter the locTrackBins to get the track with
            // the publicId matching the track we want to display
            reader = new SeqReader(
              t,
              locTrackBins!.tracks.filter(
                ltb => ltb.publicId === t.publicId
              )[0]!
            )
            break
        }

        coreTracks.push({
          track: t,
          positions: await reader!.getPoints(
            location,
            xax,
            yax,
            binSize,
            settings.seqs.smoothing.on ? settings.seqs.smoothing.factor : 0,
            {
              mode: settings.seqs.scale.mode,
            }
          ),
        })
      }

      setCoreTracks(coreTracks)
    }

    if (locTrackBins && tracks.length > 0) {
      getPoints()
    }
  }, [
    tracks,
    locTrackBins,
    xax.domain[0],
    xax.domain[1],
    yax.domain[0],
    yax.domain[1],
    binSize,
    settings.seqs.smoothing.on,
    settings.seqs.smoothing.factor,
  ])

  if (coreTracks.length === 0) {
    return null
  }

  // update y positions

  //)

  // const coreTracks = tracks.map((t, ti) => ({
  //   track: t,
  //   positions: getPoints(yax, t, allTracksBinCounts[ti]!),
  // }))

  // we allow some space to render titles
  return (
    <BaseSeqTrackSvg
      tracks={coreTracks}
      xax={xax}
      yax={yax}
      titleHeight={titleHeight}
    />
  )
}
