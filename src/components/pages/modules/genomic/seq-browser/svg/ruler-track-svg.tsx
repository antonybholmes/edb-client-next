import { type IElementProps } from '@interfaces/element-props'

import { autoTickInterval, type Axis } from '@/components/plot/axis'
import type { IPos } from '@/interfaces/pos'
import { GenomicLocation } from '@/lib/genomic/genomic'
import { range } from '@/lib/math/range'
import { useContext, useEffect, useRef, useState } from 'react'
import { SeqBrowserSettingsContext } from '../seq-browser-settings-provider'
import { LocationContext, type IRulerTrack } from '../tracks-provider'

interface IProps extends IElementProps {
  track: IRulerTrack
  xax: Axis
}

export function RulerTrackSvg({ track, xax }: IProps) {
  const { location, setLocation } = useContext(LocationContext)
  const { settings } = useContext(SeqBrowserSettingsContext)

  const startPos = useRef<IPos | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [_xax, setAx] = useState(xax)

  useEffect(() => {
    // here we don't want to clip coordinates
    setAx(xax.setClip(false))
  }, [xax])

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    // Get the initial mouse position when the mouse is pressed down
    startPos.current = { x: e.clientX, y: e.clientY }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  function handleMouseUp(e: MouseEvent) {
    setIsDragging(false)
    // Remove event listeners after drag ends
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)

    if (startPos.current) {
      // Calculate the new position based on the mouse movement
      const dx = e.clientX - startPos.current.x
      //const dy = e.clientY - startPos.current.y

      const domainX = (-dx / xax.length) * (xax.domain[1] - xax.domain[0] + 1)

      //console.log(dx, domainX)
      //console.log(new GenomicLocation(location.chr, _xax.domain[0], _xax.domain[1]))

      startPos.current = null

      setLocation(
        new GenomicLocation(
          location.chr,
          xax.domain[0] + domainX,
          xax.domain[1] + domainX
        )
      )
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (startPos.current) {
      // Calculate the new position based on the mouse movement
      const dx = e.clientX - startPos.current.x
      //const dy = e.clientY - startPos.current.y

      const domainX = (-dx / xax.length) * (xax.domain[1] - xax.domain[0] + 1)

      //console.log(dx, domainX)

      setAx(_xax.setDomain([xax.domain[0] + domainX, xax.domain[1] + domainX]))
    }
  }

  let rulerBb: number = settings.ruler.autoSize
    ? autoTickInterval([location.start, location.end])
    : settings.ruler.bp

  //console.log('ruler', rulerBb)

  if ((_xax.domain[1] - _xax.domain[0]) / rulerBb > 8) {
    rulerBb *= 2
  }

  const x1 = Math.floor(_xax.domain[0] / rulerBb) * rulerBb
  const x2 = (Math.floor(_xax.domain[1] / rulerBb) + 1) * rulerBb

  const ticks = range(x1, x2 + rulerBb, rulerBb)

  const dx1 = _xax.domainToRange(_xax.domain[0] - rulerBb / 4)
  const dx2 = _xax.domainToRange(_xax.domain[1] + rulerBb / 4)

  //let labelTicks = ticks.slice()

  // if it seems like there are too many ticks, take
  // every other one
  //while (labelTicks.length > 5) {
  //labelTicks = labelTicks.filter((_, i) => i % 2 === 0)
  //}

  const h = track.displayOptions.height / 2
  const majorH2 = track.displayOptions.majorTicks.height / 2

  const minX = _xax.domainToRange(_xax.domain[0])
  const maxX = _xax.domainToRange(_xax.domain[1])

  return (
    <>
      <defs>
        <clipPath id="ruler-clip">
          <rect
            width={_xax.length}
            height={settings.titles.height + track.displayOptions.height}
          />
        </clipPath>
      </defs>

      <rect
        width={_xax.length}
        height={settings.titles.height + track.displayOptions.height}
        stroke="none"
        fill="white"
        opacity="0"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'ew-resize' : 'auto' }}
      />

      {/* <g id="clip" clipPath="url(#ruler-clip)"> */}
      <g
        transform={`translate(0, ${settings.titles.height + h})`}
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <g id="minor-ticks">
          {range(1, ticks.length).map((ti) => {
            const previousTick = ticks[ti - 1]!
            const tick = ticks[ti]!
            const d = (tick - previousTick) / 8

            return (
              <g id="minor-tick" key={ti}>
                {range(1, 8)
                  .map((tti) => _xax.domainToRange(previousTick + tti * d))
                  .filter((px2) => px2 >= minX && px2 <= maxX)
                  .map((px2, tti) => {
                    return (
                      // <circle
                      //   cx={px2}
                      //   r={2.5}
                      //   fill={track.displayOptions.stroke.color}
                      //   opacity={0.3}
                      //   key={`${ti}:${tti}`}
                      // />

                      <line
                        key={`${ti}:${tti}`}
                        x1={px2}
                        x2={px2}
                        y1={majorH2 - track.displayOptions.minorTicks.height}
                        y2={majorH2}
                        stroke={track.displayOptions.stroke.color}
                        strokeWidth={track.displayOptions.stroke.width}
                        strokeOpacity={0.5}
                      />
                    )
                  })}
              </g>
            )
          })}
        </g>

        <g id="major-ticks">
          {ticks
            .map((tick) => _xax.domainToRange(tick))
            .filter((px1) => px1 >= minX && px1 <= maxX)
            .map((px1, pi) => {
              return (
                <line
                  id={`major-tick-${pi}`}
                  key={pi}
                  x1={px1}
                  x2={px1}
                  y1={-majorH2}
                  y2={majorH2}
                  stroke={track.displayOptions.stroke.color}
                  strokeWidth={track.displayOptions.stroke.width}
                />
              )
            })}
        </g>

        <g id="major-tick-labels">
          {ticks
            .map((tick) => [tick, _xax.domainToRange(tick)] as [number, number])
            .filter((t) => t[1]! >= dx1 && t[1]! <= dx2)
            .map((t, pi) => {
              const [tick, px1] = t
              return (
                <text
                  id={`major-tick-${pi}`}
                  key={pi}
                  transform={`translate(${px1}, ${-h - 5})`}
                  fill={track.displayOptions.font.color}
                  fontSize={track.displayOptions.font.size}
                  dominantBaseline="auto"
                  textAnchor="middle"
                  //fontWeight="bold"
                >
                  {tick.toLocaleString()}
                </text>
              )
            })}
        </g>
      </g>
      {/* </g> */}
    </>
  )
}
