import { type IDivProps } from '@/interfaces/div-props'

import { YAxis } from '@/components/plot/axis'
import { locStr } from '@/lib/genomic/genomic'
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
    switch (track.type) {
      case 'Remote BigWig':
      case 'Local BigWig':
        const reader =
          track.type === 'Remote BigWig'
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
          tracks: ltb.samples.filter(t => t.id === track.id),
        }))

        switch (scaleMode) {
          case 'BPM':
            const bpm = trackSpecificBins
              .map(ltb =>
                ltb.samples.length > 0
                  ? ltb.samples[0]!.bins.map(
                      b => (b.c / ltb.samples[0]!.binReads) * 1000000
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
                  ltb.samples.length > 0
                    ? (ltb.samples[0]!.ymax / track.reads) * 1000000
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
                  ltb.samples.length > 0 ? ltb.samples[0]!.ymax : 0
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
  // we can overlay multiple tracks on the same plot,
  // for example a signal track and a gene annotation track,
  // therefore we need to pass in an array
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
  }, [
    locStr(locTrackBins?.location),
    locTrackBins?.samples ,
    globalY,
    settings.seqs.globalY.on,
    settings.seqs.scale.mode,
    settings.seqs.scale,
    tracks ,
  ])

  const yax = new YAxis()
    .setDomain([0, ymax])
    .setLength(tracks[0]!.displayOptions.height)
    .setTicks([0, ymax])
    .setTitle(tracks[0]!.type === 'Seq' ? settings.seqs.scale.mode : scale)

  //const refPoints: ISeqPos[] = getPoints(yax, tracks[0]!, allBinCounts[0]!)

  useEffect(() => {
    async function getPoints() {
      let coreTracks: {
        track: AllSignalTrackTypes
        positions: ISeqPos[]
      }[] = []

      let reader: BaseSeqReader = EMPTY_SEQ_READER

      // since tracks can be overlaid get all the data
      for (const t of tracks) {
        switch (t.type) {
          case 'Remote BigWig':
          case 'Local BigWig':
            reader =
              t.type === 'Remote BigWig'
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
              locTrackBins!.samples.filter(ltb => ltb.id === t.id)[0]!
            )
            break
        }

        coreTracks.push({
          track: t,
          positions: await reader!.getPoints(location, xax, yax, binSize, {
            smoothingFactor: settings.seqs.smoothing.on
              ? settings.seqs.smoothing.factor
              : 0,
            mode: settings.seqs.scale.mode,
          }),
        })
      }

      setCoreTracks(coreTracks)
    }

    if (locTrackBins && tracks.length > 0) {
      getPoints()
    }
  }, [
    locStr(locTrackBins?.location),
    locTrackBins?.samples.map(s => s.id).join('|'),
    tracks,
    xax.domain[0],
    xax.domain[1],
    yax.domain[0],
    yax.domain[1],
    binSize,
    settings.seqs.smoothing.on,
    settings.seqs.smoothing.factor,
    settings.seqs.scale.mode,
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
