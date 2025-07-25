import { type IDivProps } from '@interfaces/div-props'

import { type Axis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import type { IPos } from '@interfaces/pos'
import { COLOR_BLACK } from '@lib/color/color'
import { formattedList, truncate } from '@lib/text/text'
import * as d3 from 'd3'
import { useRef, useState } from 'react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import { type AllSignalTrackTypes } from '../tracks-provider'
import { NO_TRACK_TOOLTIP } from '../use-tooltip'

export interface ISeqPos extends IPos {
  start: number
  end: number
  //x2: number
  realY: number
  numPoints?: number
}

interface IProps extends IDivProps {
  tracks: {
    track: AllSignalTrackTypes
    positions: ISeqPos[]
  }[]

  //locTrackBins: ILocTrackBins | null
  xax: Axis
  yax: Axis

  titleHeight: number
}

export function BaseSeqTrackSvg({ tracks, xax, yax, titleHeight }: IProps) {
  const { settings } = useSeqBrowserSettings()

  //const currentLocation = useRef<GenomicLocation | null>(null)

  //const { setTooltip } = useTooltip()
  const [tooltip, setTooltip] = useState({ ...NO_TRACK_TOOLTIP })

  const rectRef = useRef<SVGRectElement>(null)
  //const [isMouseDown, setIsMouseDown] = useState(false)

  function findClosestSeqPos(x: number, refPoints: ISeqPos[]): ISeqPos {
    if (refPoints.length === 0) {
      return { ...NO_TRACK_TOOLTIP }
    }

    let left = 0
    let right = refPoints.length - 1

    // Binary search to find the closest index

    if (settings.reverse) {
      // flip the search when coordinates inverted
      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        if (refPoints[mid]!.x === x) {
          return refPoints[mid]! // Exact match
        } else if (refPoints[mid]!.x > x) {
          left = mid + 1
        } else {
          right = mid - 1
        }
      }
    } else {
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

  function handleMouseMove(e: React.MouseEvent<SVGRectElement> | MouseEvent) {
    const { clientX, target } = e

    const rect = (target as SVGRectElement).getBoundingClientRect()

    const relativeX = clientX - rect.left

    //console.log('mouse move ctrl', isCtrlPressed)

    // simple mouse move to indicate position

    //const domainX = xax.rangeToDomain(relativeX)
    const pos = findClosestSeqPos(relativeX, tracks[0]!.positions)

    //console.log(pos, relativeX, 'tooltip', e.target)

    setTooltip({
      start: pos.start,
      end: pos.start,
      //x2: relativeX,
      x: relativeX, //e.clientX,
      y: rect.top - titleHeight,
      realY: pos.realY,
    })
  }

  // const clean = () => {
  //   //window.removeEventListener('keydown', handleKeyDown)
  //   //window.removeEventListener('keyup', handleKeyUp)
  //   //window.removeEventListener('mousemove', handleMouseMove)
  //   window.removeEventListener('mouseup', handleMouseUp)
  //   window.removeEventListener('mousedown', handleMouseDown)
  // }

  // useEffect(() => {
  //   // Add the global keydown event listener when mouse is over the rect
  //   if (isMouseDown) {
  //     window.addEventListener('mousemove', handleMouseMove)
  //   } else {
  //     window.removeEventListener('mousemove', handleMouseMove)
  //   }

  //   // Clean up listener when component is unmounted or mouse leaves
  //   return () => {
  //     window.removeEventListener('mousemove', handleMouseMove)
  //   }
  // }, [isMouseDown])

  //const y0 = yax.domainToRange(0)

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
            transform={`translate(${settings.titles.position === 'right' ? xax.length + settings.titles.offset : xax.length / 2}, ${settings.titles.position === 'right' ? tracks[0]!.track.displayOptions.height / 2 : -settings.titles.offset})`}
          >
            <text
              //transform={`translate(${xax.width / 2}, 0)`}
              fill={COLOR_BLACK}
              dominantBaseline={
                settings.titles.position === 'right' ? 'middle' : 'auto'
              }
              fontSize={settings.titles.font.size}
              textAnchor={
                settings.titles.position === 'right' ? 'start' : 'middle'
              }
              //fontWeight="bold"
            >
              {/* Estimate a reasonable label length as length px /10 so 800 gives 80 chars of space */}
              {truncate(
                formattedList(
                  tracks.map(
                    t =>
                      `${t.track.name} ${'platform' in t.track ? `(${t.track.platform})` : ''}`
                  )
                ),
                {
                  length: Math.round(xax.length / 10),
                }
              )}
            </text>
          </g>
        )}

        {tracks.map((t, ti) => {
          const points: ISeqPos[] = t.positions

          let line = d3
            .line<IPos>()
            .x((d: IPos) => d.x)
            .y((d: IPos) => d.y)

          if (settings.seqs.smoothing.on) {
            line = line.curve(d3.curveBasis)
          }

          //console.log(points.filter(p => p.realY === 0))

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
              {t.track.displayOptions.fill.show && (
                <path
                  d={coords}
                  fill={t.track.displayOptions.fill.color}
                  stroke="none"
                  fillOpacity={t.track.displayOptions.fill.alpha}
                />
              )}

              {t.track.displayOptions.stroke.show && (
                <path
                  d={coords}
                  fill="none"
                  stroke={t.track.displayOptions.stroke.color}
                  strokeWidth={t.track.displayOptions.stroke.width}
                />
              )}
            </g>
          )
        })}

        {tracks[0]!.track.displayOptions.axes.show && (
          <>
            <AxisLeftSvg ax={yax} />
            <AxisBottomSvg
              ax={xax}
              pos={{ x: 0, y: tracks[0]!.track.displayOptions.height }}
            />
          </>
        )}
      </g>

      {tooltip.x !== -1 && (
        <g>
          <line
            x1={tooltip.x}
            x2={tooltip.x}
            y1={titleHeight}
            y2={titleHeight + tracks[0]!.track.displayOptions.height}
            stroke="black"
            strokeDasharray="5,5"
            strokeWidth="2"
          />
          <rect
            x={tooltip.x - 20}
            y={titleHeight - 20}
            width="40"
            height="20"
            //stroke=""
            strokeWidth="1"
            rx="4"
            ry="4"
            fill="black"
            fillOpacity="0.70"
          />
          <text
            x={tooltip.x}
            y={titleHeight - settings.titles.offset}
            textAnchor="middle"
            fontSize="small"
            //dominantBaseline="central"
            fill="white"
          >
            {tooltip.realY.toFixed(2)}
          </text>
        </g>
      )}

      {/* for allowing mouse events to to be handled without affecting the svg output */}
      <rect
        ref={rectRef}
        width={xax.length}
        y={titleHeight}
        fill="white"
        opacity={0}
        height={tracks[0]!.track.displayOptions.height}
        // onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          setTooltip({ ...NO_TRACK_TOOLTIP })
        }}
        onMouseMove={handleMouseMove}
      />
    </>
  )
}
