import { type IDivProps } from '@/interfaces/div-props'

import { type Axis } from '@/components/plot/axis'
import { SvgText } from '@/components/plot/svg-text'
import { locStr } from '@/lib/genomic/genomic'
import { useContext } from 'react'
import { LocationContext, type ILocationTrack } from '../tracks-provider'

interface IProps extends IDivProps {
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
        <SvgText dominantBaseline="middle" font={track.displayOptions.text}>
          {locStr(location)} (
          {(location.end - location.start + 1).toLocaleString()} bp)
        </SvgText>
      </g>
    </>
  )
}
