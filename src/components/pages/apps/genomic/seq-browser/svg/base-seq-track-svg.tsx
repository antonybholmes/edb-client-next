import { type IDivProps } from '@/interfaces/div-props'

import { BaseCol } from '@/components/layout/base-col'
import {
  axisDomainToRange,
  axisLength,
  axisRangeToDomain,
  IAxis,
} from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import type { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { textJoin, truncate } from '@/lib/text/text'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { ITooltipState, useTooltip } from '@/providers/tooltip-provider'
import * as d3 from 'd3'
import { useCallback, useMemo, useRef } from 'react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import { useLocation, type ISignalTrack } from '../tracks-provider'
import { NO_TRACK_TOOLTIP } from '../use-tooltip'

export interface ISeqPos extends IPos {
  start: number
  end: number
  //x2: number
  realY: number
  //numPoints?: number
}

interface IProps extends IDivProps {
  tracks: {
    track: ISignalTrack
    positions: ISeqPos[]
  }[]

  //locTrackBins: ILocTrackBins | null
  xax: IAxis
  yax: IAxis
  pos: IPos
  titleHeight: number
}

export function BaseSeqTrackSvg({
  tracks,
  xax,
  yax,
  titleHeight,
  pos: plotPos,
}: IProps) {
  const { settings } = useSeqBrowserSettings()
  const { ref } = useSVG()
  const { coreTracks } = useLocation()
  const { showTooltip, hideTooltip } = useTooltip()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const tooltipFrame = useRef<number | null>(null)
  const pendingTooltip = useRef<ITooltipState | null>(null)

  //const currentLocation = useRef<GenomicLocation | null>(null)

  //const { setTooltip } = useTooltip()
  //const [tooltip, setTooltip] = useState({ ...NO_TRACK_TOOLTIP })

  //const rectRef = useRef<SVGRectElement>(null)
  //const [isMouseDown, setIsMouseDown] = useState(false)

  //const { pos: mousePos } = useMouseEvent()

  const xl = useMemo(() => axisLength(xax), [xax])

  // function handleMouseMove(e: React.MouseEvent<SVGRectElement> | MouseEvent) {
  //   const { clientX, target } = e

  //   const rect = (target as SVGRectElement).getBoundingClientRect()

  //   const relativeX = clientX - rect.left

  //   const pos = findClosestSeqPos(relativeX, tracks[0]!.positions)

  //   setTooltip({
  //     start: pos.start,
  //     end: pos.start,
  //     //x2: relativeX,
  //     x: relativeX, //e.clientX,
  //     y: rect.top - titleHeight,
  //     realY: pos.realY,
  //   })
  // }

  //const deboundedMousePos = useDebounce(mousePos, {delayMs})

  // const tooltip = useMemo(() => {
  //   const pos = findClosestSeqPos(
  //     mousePos.x,
  //     tracks[0]!.positions,
  //     settings.reverse
  //   )

  //   return {
  //     start: pos.start,
  //     end: pos.start,
  //     //x2: relativeX,
  //     x: mousePos.y !== -1 ? mousePos.x : -1, //e.clientX,
  //     y: pos.y, //-titleHeight,
  //     realY: pos.realY,
  //   }
  // }, [mousePos.x, mousePos.y, settings.reverse, tracks[0]?.positions])

  const _hideTooltip = useCallback(() => {
    hideTooltip()
    hideCrosshair()
  }, [hideTooltip, hideCrosshair])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const svgP = screenToSvgPoint(ref.current, { x: e.clientX, y: e.clientY })

      const plotP = {
        x: svgP.x - plotPos.x - settings.margin.left,
        y: svgP.y - plotPos.y - titleHeight - settings.margin.top,
      }

      //console.log(plotP)

      if (
        plotP.x < 0 ||
        plotP.y < 0 ||
        plotP.x > xl ||
        plotP.y > yax.range[1]
      ) {
        _hideTooltip()
        return
      }

      const trackPosMap = Object.fromEntries(
        coreTracks.map((t) => {
          const pos = findClosestSeqPos(plotP.x, t.positions, settings.reverse)
          return [t.track.id, pos]
        })
      )

      const { screenP, relativeP } = svgPointToScreen(ref.current, {
        x: plotP.x + plotPos.x + settings.margin.left,
        y: plotP.y + plotPos.y + titleHeight + settings.margin.top,
      })

      showCrosshair({ x: relativeP.x, y: relativeP.y })

      const x = axisRangeToDomain(xax, [plotP.x])[0]

      showTooltip({
        //className: '-translate-x-1/2',
        pos: { x: screenP.x + 5, y: screenP.y + 5 },
        content: (
          <>
            <span>x: {x.toFixed(0)}</span>
            {coreTracks.map((t) => (
              <BaseCol key={t.track.id}>
                <strong>{t.track.name}</strong>
                <span>y: {trackPosMap[t.track.id].realY}</span>
              </BaseCol>
            ))}
          </>
        ),
      })
    },
    [findClosestSeqPos, coreTracks, titleHeight, settings, xl, yax]
  )

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

      <SvgG pos={{ x: 0, y: titleHeight }}>
        {settings.titles.show && (
          <SvgG
            pos={{
              x:
                settings.titles.position === 'right'
                  ? xl + settings.titles.offset
                  : xl / 2,
              y:
                settings.titles.position === 'right'
                  ? tracks[0]!.track.displayOptions.height / 2
                  : -settings.titles.offset,
            }}
          >
            <SvgText
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
                textJoin(
                  tracks.map(
                    (t) =>
                      `${t.track.name} ${'platform' in t.track ? `(${t.track.platform})` : ''}`
                  )
                ),
                {
                  length: Math.round(xl / 10),
                }
              )}
            </SvgText>
          </SvgG>
        )}

        <SvgG id="plot" onMouseMove={onMouseMove} onMouseLeave={_hideTooltip}>
          <SvgRect
            id="mouse-rect"
            width={xl}
            height={tracks[0]!.track.displayOptions.height}
            fill="transparent"
            stroke="blue"
          />

          {tracks.map((t, ti) => {
            const points: ISeqPos[] = t.positions

            let line = d3
              .line<IPos>()
              .x((d: IPos) => d.x)
              .y((d: IPos) => d.y)

            if (settings.tracks.seqs.smoothing.on) {
              line = line.curve(d3.curveBasis)
            }

            const coords = line(points) ?? ''

            let area = d3
              .area<IPos>()
              .x((d: IPos) => d.x)
              .y0(axisDomainToRange(yax, 0))
              .y1((d: IPos) => d.y)

            if (settings.tracks.seqs.smoothing.on) {
              area = area.curve(d3.curveBasis)
            }

            const fillCoords = area(points) ?? ''

            return (
              <g key={ti}>
                {t.track.displayOptions.fill.show && (
                  <path
                    d={fillCoords}
                    fill={t.track.displayOptions.fill.value}
                    stroke="none"
                    fillOpacity={t.track.displayOptions.fill.opacity}
                  />
                )}

                {t.track.displayOptions.stroke.show && (
                  <path
                    d={coords}
                    fill="none"
                    stroke={t.track.displayOptions.stroke.value}
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
        </SvgG>
      </SvgG>

      {/* {tooltip.x !== -1 && (
        <SvgG pointerEvents="none">
          <line
            x1={tooltip.x}
            x2={tooltip.x}
            y1={28}
            y2={titleHeight + tracks[0]!.track.displayOptions.height}
            stroke="black"
            strokeDasharray="4,4"
            strokeWidth="1"
            shapeRendering={SVG_CRISP_EDGES}
          />
          <rect
            x={tooltip.x - 20}
            y={-4}
            width={40}
            height={23}
            //stroke=""
            strokeWidth="1"
            rx="1"
            ry="1"
            fill="white"
            fillOpacity="0.8"
            //stroke="green"
            //shapeRendering={SVG_CRISP_EDGES}
          />
          <rect
            x={tooltip.x - 20}
            y={-4}
            width={40}
            height={23}
            //stroke=""
            strokeWidth="1"
            rx="1"
            ry="1"
            fill="green"
            fillOpacity="0.2"
            stroke="darkgreen"
            //shapeRendering={SVG_CRISP_EDGES}
          />
          <text
            x={tooltip.x}
            y={12}
            textAnchor="middle"
            fontSize="small"
            //dominantBaseline="central"
            //fill="green"
            fillOpacity="0.9"
          >
            {Number.isInteger(tooltip.realY)
              ? tooltip.realY
              : tooltip.realY.toFixed(2)}
          </text>
        </SvgG>
      )} */}

      {/* for allowing mouse events to to be handled without affecting the svg output */}
      {/* <rect
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
        //onMouseMove={handleMouseMove}
      /> */}
    </>
  )
}

function findClosestSeqPos(
  x: number,
  refPoints: ISeqPos[],
  reverse: boolean
): ISeqPos {
  if (refPoints.length === 0) {
    return { ...NO_TRACK_TOOLTIP }
  }

  let left = 0
  let right = refPoints.length - 1

  // Binary search to find the closest index

  if (reverse) {
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
  if (left === 0) {
    return refPoints[0]!
  } // Closest is the first element

  if (left === refPoints.length) {
    return refPoints[refPoints.length - 1]! // Closest is the last element
  }

  // Compare the two closest candidates (left-1 and left) and return the one closer
  const prev = refPoints[left - 1]!
  const next = refPoints[left]!

  return Math.abs(x - prev.x) <= Math.abs(x - next.x) ? prev : next
}
