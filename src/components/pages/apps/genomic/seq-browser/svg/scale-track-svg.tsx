import { type IDivProps } from '@interfaces/div-props'

import { sign } from '@lib/math/sign'
import { useContext } from 'react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import { LocationContext, type IScaleTrack } from '../tracks-provider'

interface IProps extends IDivProps {
  genome: string

  track: IScaleTrack
}

export function ScaleTrackSvg({ genome, track }: IProps) {
  const { settings } = useSeqBrowserSettings()
  const { location, xax } = useContext(LocationContext)

  const rulerBb: number = settings.scale.autoSize
    ? Math.pow(10, Math.floor(Math.log10(location.end - location.start)))
    : settings.scale.bp

  let x1 = xax.domainToRange(xax.domain[0])
  let x2 = xax.domainToRange(xax.domain[0] + rulerBb * sign(!settings.reverse))

  const w = Math.abs(x2 - x1)

  x1 += (xax.length - w) / 2
  x2 += (xax.length - w) / 2

  return (
    <>
      {/* {displayOptions.titles.show && (
        <g transform={`translate(0, -${displayOptions.titles.offset})`}>
          <text
            transform={`translate(${xax.width / 2}, 0)`}
            fill={COLOR_BLACK}
            //dominantBaseline="hanging"
            fontSize="small"
            textAnchor="middle"
            //fontWeight="bold"
          >
            {track.name}
          </text>
        </g>
      )} */}

      {/* <rect width={xax.width} height={track.displayOptions.height} stroke='black' fill='none'/> */}

      <g transform={`translate(0, ${track.displayOptions.height / 2})`}>
        <line
          x1={x1}
          x2={x2}
          stroke={track.displayOptions.stroke.color}
          strokeWidth={track.displayOptions.stroke.width}
        />

        {track.displayOptions.caps.show && (
          <g id="caps">
            <line
              x1={x1}
              x2={x1}
              y1={-track.displayOptions.caps.height}
              y2={track.displayOptions.caps.height}
              stroke={track.displayOptions.stroke.color}
              strokeWidth={track.displayOptions.stroke.width}
            />
            <line
              x1={x2}
              x2={x2}
              y1={-track.displayOptions.caps.height}
              y2={track.displayOptions.caps.height}
              stroke={track.displayOptions.stroke.color}
              strokeWidth={track.displayOptions.stroke.width}
            />
          </g>
        )}

        <text
          transform={`translate(${x1 - 10}, 0)`}
          fill={track.displayOptions.font.color}
          fontSize={track.displayOptions.font.size}
          dominantBaseline="middle"
          textAnchor="end"
          //fontWeight="bold"
        >
          {rulerBb.toLocaleString()} bp
        </text>

        <text
          transform={`translate(${x2 + 10}, 0)`}
          fill={track.displayOptions.font.color}
          fontSize={track.displayOptions.font.size}
          dominantBaseline="middle"

          //textAnchor="end"
          //fontWeight="bold"
        >
          {genome}
        </text>
      </g>
    </>
  )
}
