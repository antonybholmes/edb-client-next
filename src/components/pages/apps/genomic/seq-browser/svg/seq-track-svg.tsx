import { type IDivProps } from '@/interfaces/div-props'

import { YAxis } from '@/components/plot/axis'
import { locStr } from '@/lib/genomic/genomic'

import { useEffect, useState } from 'react'
import {
  EMPTY_SEQ_READER,
  type BaseSeqReader,
} from '../readers/seq/base-seq-reader'

import { SeqReader } from '../readers/seq/seq-reader'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import {
  getYMax,
  MIN_Y,
  useLocation,
  type SignalTrack,
} from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { BaseSeqTrackSvg, type ISeqPos } from './base-seq-track-svg'

interface IProps extends IDivProps {
  // we can overlay multiple tracks on the same plot,
  // for example a signal track and a gene annotation track,
  // therefore we need to pass in an array
  tracks: SignalTrack[]
  scale?: string
  titleHeight: number
}

export function SeqTrackSvg({ tracks, scale = 'Count', titleHeight }: IProps) {
  const { xax, location, binSize, seqSearchResult } = useLocation()

  const { globalY } = useTracks()

  const { settings } = useSeqBrowserSettings()

  const [coreTracks, setCoreTracks] = useState<
    {
      track: SignalTrack
      positions: ISeqPos[]
    }[]
  >([])

  const [ymax, setYmax] = useState(globalY!)

  function updateYMax(newYmax: number) {
    setYmax(Math.max(MIN_Y, newYmax))
  }

  useEffect(() => {
    async function updateY() {
      // If global y is not in use, switch to finding the auto y
      if (
        settings.tracks.seqs.globalY.on &&
        tracks[0]!.displayOptions.useGlobalY
      ) {
        updateYMax(globalY!)
      } else {
        if (tracks[0]!.displayOptions.autoY) {
          //ymax = getYMax(tracks, [locTrackBins], settings.tracks.seqs.scale.mode)

          updateYMax(
            await getYMax(
              tracks,
              [seqSearchResult!],
              [binSize],
              settings.tracks.seqs.scale.mode
            )
          )
        } else {
          updateYMax(tracks[0]!.displayOptions.ymax)
        }
      }
    }

    if (seqSearchResult) {
      updateY()
    }
  }, [
    locStr(seqSearchResult?.location),
    seqSearchResult?.samples,
    globalY,
    settings.tracks.seqs.globalY.on,
    settings.tracks.seqs.scale.mode,
    settings.tracks.seqs.scale,
    tracks,
  ])

  const yax = new YAxis()
    .setDomain([0, ymax])
    .setLength(tracks[0]!.displayOptions.height)
    .setTicks([0, ymax])
    .setTitle(
      tracks[0]!.type === 'Seq' ? settings.tracks.seqs.scale.mode : scale
    )

  //const refPoints: ISeqPos[] = getPoints(yax, tracks[0]!, allBinCounts[0]!)

  useEffect(() => {
    async function getPoints() {
      let coreTracks: {
        track: SignalTrack
        positions: ISeqPos[]
      }[] = []

      let reader: BaseSeqReader = EMPTY_SEQ_READER

      // since tracks can be overlaid get all the data
      for (const t of tracks) {
        switch (t.type) {
          case 'Seq':
          case 'BigWig':
            // we have the tracks to display in this block and all
            // the tracks we downloaded for this location, therefore
            // we need to filter the locTrackBins to get the track with
            // the publicId matching the track we want to display

            reader = new SeqReader(t, seqSearchResult!.samples[t.id]!)
            break
          case 'RemoteBigWig':
          case 'LocalBigWig':
            reader = t.reader
            break
          default:
            console.warn('Unknown track type for point retrieval', t)
            break
        }

        coreTracks.push({
          track: t,
          positions: await reader!.getPoints(location, xax, yax, binSize, {
            mode: settings.tracks.seqs.scale.mode,
            smoothingFactor: settings.tracks.seqs.smoothing.on
              ? settings.tracks.seqs.smoothing.factor
              : 0,
          }),
        })
      }

      setCoreTracks(coreTracks)
    }

    if (seqSearchResult && tracks.length > 0) {
      getPoints()
    }
  }, [
    seqSearchResult?.location,
    seqSearchResult?.samples,
    tracks,
    xax.domain[0],
    xax.domain[1],
    yax.domain[0],
    yax.domain[1],
    binSize,
    settings.tracks.seqs.smoothing.on,
    settings.tracks.seqs.smoothing.factor,
    settings.tracks.seqs.scale.mode,
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
