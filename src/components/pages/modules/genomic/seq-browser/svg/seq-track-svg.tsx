import { type IElementProps } from '@interfaces/element-props'

import { HCenterCol } from '@/components/layout/h-center-col'
import { YAxis, type Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/consts'
import type { IPos } from '@/interfaces/pos'
import { API_SEQS_BINS_URL } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { formattedList, truncate } from '@/lib/text/text'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { useQuery } from '@tanstack/react-query'
import * as d3 from 'd3'
import { useContext } from 'react'
import {
  SeqBrowserSettingsContext,
  type ReadScaleMode,
} from '../seq-browser-settings-provider'
import {
  LocationContext,
  NO_TRACK_TOOLTIP,
  TracksContext,
  type IBinCounts,
  type ILocTrackBins,
  type ISeqTrack,
  type SeqBin,
} from '../tracks-provider'

export function getYMax(
  seqs: ISeqTrack[],
  locTrackBins: ILocTrackBins[],
  scaleMode: ReadScaleMode,
  ymin: number = 1
): number {
  let ymax = Math.max(
    ...seqs.map((seq, si) => {
      switch (scaleMode) {
        case 'BPM':
          const bpm = locTrackBins
            .map(ltb =>
              ltb.binCounts[si]!.bins.map(
                b => b[2]! * ltb.binCounts[si]!.bpmScaleFactor
              )
            )
            .flat()

          return Math.max(...bpm)
        case 'CPM':
          return Math.max(
            ...locTrackBins.map(
              ltb => (ltb.binCounts[si]!.ymax / seq.reads) * 1000000
            )
          )
        default:
          return Math.max(...locTrackBins.map(ltb => ltb.binCounts[si]!.ymax))
      }
    })
  )
  ymax = Math.ceil(ymax) // / 2) * 2

  // the yaxis must be above zero, otherwise we get
  // errors calculating limits and ticks since the
  // axis must represent a real space
  return Math.max(ymin, ymax)
}

interface ISeqPos extends IPos {
  realY: number
}

interface IProps extends IElementProps {
  binSize: number
  tracks: ISeqTrack[]
  //locTrackBins: ILocTrackBins | null
  xax: Axis
  ymax?: number

  titleHeight: number
}

export function SeqTrackSvg({
  binSize,
  tracks,
  //locTrackBins,
  xax,
  ymax = 100,
  titleHeight,
}: IProps) {
  const { location } = useContext(LocationContext)

  const { getAccessTokenAutoRefresh } = useContext(EdbAuthContext)
  const { settings } = useContext(SeqBrowserSettingsContext)

  const { setTooltip } = useContext(TracksContext)

  const res = useQuery({
    queryKey: ['seq', tracks, location, binSize],
    queryFn: async () => {
      //console.log(API_SEQS_BINS_URL)

      const accessToken = await getAccessTokenAutoRefresh()

      const res = await httpFetch.postJson(API_SEQS_BINS_URL, {
        body: {
          locations: [location.loc],
          //scale: displayOptions.seq.applyScaling ? displayOptions.seq.scale : 0,
          binSizes: [binSize],
          tracks: tracks.map(t => t.seqId),
        },

        headers: bearerHeaders(accessToken),
      })

      return res.data
    },
  })

  const allLocTrackBins: ILocTrackBins[] = res.data ? res.data : []

  if (allLocTrackBins.length === 0) {
    return null
  }

  const locTrackBins = allLocTrackBins[0]!

  const allBinCounts = locTrackBins.binCounts

  if (!settings.seqs.globalY.on || !tracks[0]!.displayOptions.useGlobalY) {
    if (tracks[0]!.displayOptions.autoY) {
      ymax = getYMax(tracks, [locTrackBins], settings.seqs.scale.mode)
    } else {
      ymax = tracks[0]!.displayOptions.ymax
    }
  }

  let yax = new YAxis()
    .setDomain([0, ymax])
    .setLength(tracks[0]!.displayOptions.height)
    .setTicks([0, ymax])
    .setTitle(settings.seqs.scale.mode)

  const y0 = yax.domainToRange(0)

  function getPoints(
    yax: YAxis,
    track: ISeqTrack,
    binCounts: IBinCounts
  ): ISeqPos[] {
    if (binCounts.bins.length === 0) {
      return []
    }

    // fill in the blanks, we could do this on server, but
    // may as well try to get user to do as much computation
    // as possible
    const bins: SeqBin[] = []

    for (const [bi, bin] of binCounts.bins.entries()) {
      bins.push(bin)

      if (bi < binCounts.bins.length - 1) {
        const nextBin = binCounts.bins[bi + 1]!

        if (nextBin[0]! - bin[1]! > 1) {
          // the next bin is not adjacent, so insert a gap
          bins.push([bin[1]! + 1, nextBin[0] - 1, 0])
        }
      }
    }

    let points: ISeqPos[] = bins
      .map(bin => {
        const s = bin[0]!
        const e = bin[1]!
        const reads = bin[2]!
        let y = 0

        switch (settings.seqs.scale.mode) {
          case 'BPM':
            y = reads * binCounts.bpmScaleFactor
            break
          case 'CPM':
            y = (reads / track.reads) * 1000000
            break
          default:
            y = reads
        }

        const x1 = xax.domainToRange(s)
        const x2 = xax.domainToRange(e)
        const y1 = yax.domainToRange(y)

        if (x2 > x1) {
          // points map to different locations so
          // we want both points

          if (settings.seqs.smooth) {
            // to further smooth, use the mid point of the bin in addition
            // to d3
            return [
              {
                x: (x1 + x2) / 2,
                y: y1,
                realY: y,
              },
            ]
          } else {
            return [
              {
                x: x1,
                y: y1,
                realY: y,
              },
              {
                x: x2,
                y: y1,
                realY: y,
              },
            ]
          }
        } else {
          // points resolve to same location, so just
          // return one of them
          return [
            {
              x: x1,
              y: y1,
              realY: y,
            },
          ]
        }
      })
      .flat()

    // zero
    points = [
      { x: points[0]!.x, y: y0, realY: 0 },
      ...points,
      { x: points[points.length - 1]!.x, y: y0, realY: 0 },
    ]

    return points
  }

  let refPoints: ISeqPos[] = getPoints(yax, tracks[0]!, allBinCounts[0]!)

  function findClosestSeqPos(x: number): ISeqPos {
    let left = 0
    let right = refPoints.length - 1

    // Binary search to find the closest index
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (refPoints[mid]!.x === x) {
        return refPoints[mid]! // Exact match
      } else if (refPoints[mid]!.x < x) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    // After binary search, left will be the position of the closest coordinate
    const closestIndex = left
    if (closestIndex === 0) return refPoints[0]! // Closest is the first element
    if (closestIndex === refPoints.length)
      return refPoints[refPoints.length - 1]! // Closest is the last element

    // Compare the two closest candidates (left-1 and left) and return the one closer
    const prev = refPoints[closestIndex - 1]!
    const next = refPoints[closestIndex]!

    return Math.abs(x - prev.x) <= Math.abs(x - next.x) ? prev : next
  }

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()

    const relativeX = e.clientX - rect.left
    //const domainX = xax.rangeToDomain(relativeX)
    const pos = findClosestSeqPos(relativeX)

    //console.log(pos, 'tooltip')

    setTooltip({
      x: e.clientX,
      y: rect.top - titleHeight,
      content: (
        <HCenterCol className="text-xs gap-y-1">
          {/* <VCenterRow className="bg-blue-800/80 gap-x-1 p-1 px-2 rounded text-white justify-between">
            <span>x</span>
            <span className="w-18">{Math.round(domainX).toLocaleString()}</span>
            <span>y</span>
            <span className="w-10">{(pos.realY + 100).toFixed(2)}</span>
          </VCenterRow> */}
          <span
            className="border border-border shadow-md bg-white/90 p-1 w-14 text-center rounded-theme"
            style={{ color: 'black' }}
          >
            {pos.realY.toFixed(2)}
          </span>
          <span
            className="w-0 border-l border-black/90 border-dashed"
            style={{ height: rect.height }}
          />
        </HCenterCol>
      ),
    })
  }

  // we allow some space to render titles
  return (
    <>
      {/* <rect
        width={xax.width}
        height={displayOptions.titles.height}
        stroke="red"
        fill="none"
      /> */}
      <g transform={`translate(0, ${titleHeight})`}>
        {settings.titles.show && (
          <g
            transform={`translate(${settings.titles.position === 'Right' ? xax.length + settings.titles.offset : xax.length / 2}, ${settings.titles.position === 'Right' ? tracks[0]!.displayOptions.height / 2 : -settings.titles.offset})`}
          >
            <text
              //transform={`translate(${xax.width / 2}, 0)`}
              fill={COLOR_BLACK}
              dominantBaseline={
                settings.titles.position === 'Right' ? 'middle' : 'auto'
              }
              fontSize={settings.titles.font.size}
              textAnchor={
                settings.titles.position === 'Right' ? 'start' : 'middle'
              }
              //fontWeight="bold"
            >
              {/* Estimate a reasonable label length as length px /10 so 800 gives 80 chars of space */}
              {truncate(
                formattedList(tracks.map(t => `${t.name} (${t.platform})`)),
                {
                  length: Math.round(xax.length / 10),
                }
              )}
            </text>
          </g>
        )}

        {tracks.map((track, ti) => {
          const binCounts = allBinCounts[ti]!

          let points: IPos[] = getPoints(yax, track, binCounts)

          let line = d3
            .line<IPos>()
            .x(d => d.x)
            .y(d => d.y)

          if (settings.seqs.smooth) {
            line = line.curve(d3.curveBasis)
          }

          const coords = line(points) ?? ''

          // let smoothedPoints: string = ''

          // if (track.displayOptions.smooth) {
          //   const line = d3
          //     .line<IPos>()
          //     .x(d => d.x)
          //     .y(d => d.y)
          //     .curve(d3.curveBasis)

          //   smoothedPoints = line(points) ?? ''
          // } else {
          //   smoothedPoints = points
          //     .map((p, pi) => `${pi === 0 ? 'M' : 'L'}${p.x},${p.y}`)
          //     .join(' ')
          // }

          // console.log(smoothedPoints)

          //similar to points, but we add zero ends to ensure a nice polygon can be
          // formed
          // const polyPoints: IPos[] = [
          //   { x: points[0]!.x, y: y0 },
          //   ...points,
          //   { x: points[points.length - 1]!.x, y: y0 },
          // ]

          // let smoothedPolyPoints: string = ''

          // if (track.displayOptions.smooth) {
          //   const line = d3
          //     .line<IPos>()
          //     .x(d => d.x)
          //     .y(d => d.y)
          //     .curve(d3.curveBasis)

          //     smoothedPolyPoints = line(polyPoints) ?? ''
          // } else {
          //   smoothedPolyPoints = polyPoints
          //     .map((p, pi) => `${pi === 0 ? 'M' : 'L'}${p.x},${p.y}`)
          //     .join(' ')
          // }

          return (
            <g key={ti}>
              {track.displayOptions.fill.show && (
                <path
                  d={coords}
                  fill={track.displayOptions.fill.color}
                  stroke="none"
                  fillOpacity={track.displayOptions.fill.alpha}
                />
              )}

              {track.displayOptions.stroke.show && (
                <path
                  d={coords}
                  fill="none"
                  stroke={track.displayOptions.stroke.color}
                  strokeWidth={track.displayOptions.stroke.width}
                />
              )}
            </g>
          )
        })}

        {tracks[0]!.displayOptions.axes.show && (
          <>
            <AxisLeftSvg ax={yax} />
            <AxisBottomSvg
              ax={xax}
              pos={{ x: 0, y: tracks[0]!.displayOptions.height }}
            />
          </>
        )}
      </g>

      <rect
        width={xax.length}
        y={titleHeight}
        fill="blue"
        opacity="0"
        height={tracks[0]!.displayOptions.height}
        //onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setTooltip({ ...NO_TRACK_TOOLTIP })}
        onMouseMove={handleMouseMove}
      />
    </>
  )
}
