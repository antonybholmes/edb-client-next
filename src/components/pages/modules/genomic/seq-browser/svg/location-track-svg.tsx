import { type IElementProps } from '@interfaces/element-props'

import { type Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/consts'
import { useContext } from 'react'
import { LocationContext, type ILocationTrack } from '../tracks-provider'

interface IProps extends IElementProps {
  track: ILocationTrack
  xax: Axis
}

export function LocationTrackSvg({ track, xax }: IProps) {
  const { location } = useContext(LocationContext)
  return (
    <>
      {/* <rect width={xax.width} height={track.displayOptions.height} stroke='black' fill='none'/>    */}
      <g
        transform={`translate(${xax.length / 2}, ${track.displayOptions.height / 2})`}
      >
        <text
          fill={COLOR_BLACK}
          dominantBaseline="middle"
          fontSize="small"
          textAnchor="middle"
          fontWeight={track.displayOptions.font.weight}
        >
          {location.formatted} (
          {(location.end - location.start + 1).toLocaleString()} bp)
        </text>
      </g>
    </>
  )
}
