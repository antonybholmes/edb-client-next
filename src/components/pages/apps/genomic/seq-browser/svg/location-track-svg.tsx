import { axisLength, type IAxis } from '@/components/plot/axes/axis'
import { type IDivProps } from '@/interfaces/div-props'

import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { locStr } from '@/lib/genomic/genomic'
import { useContext } from 'react'
import { LocationContext, type ILocationTrack } from '../tracks-provider'

interface IProps extends IDivProps {
  track: ILocationTrack
  xax: IAxis
}

export function LocationTrackSvg({ track, xax }: IProps) {
  const { location } = useContext(LocationContext)
  const xl = axisLength(xax)
  return (
    <>
      <SvgG pos={{ x: xl / 2, y: track.displayOptions.height / 2 }}>
        <SvgText dominantBaseline="middle" font={track.displayOptions.text}>
          {locStr(location)} (
          {(location.end - location.start + 1).toLocaleString()} bp)
        </SvgText>
      </SvgG>
    </>
  )
}
