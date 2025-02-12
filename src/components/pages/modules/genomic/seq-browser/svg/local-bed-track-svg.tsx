import { type IElementProps } from '@interfaces/element-props'

import { type Axis } from '@/components/plot/axis'
import { type IGenomicLocation } from '@/lib/genomic/genomic'
import { useContext } from 'react'
import { LocationContext, type ILocalBedTrack } from '../tracks-provider'
import { CoreBedTrackSvg } from './core-bed-track-svg'

interface IProps extends IElementProps {
  tracks: ILocalBedTrack[]
  xax: Axis
  titleHeight: number
}

export function LocalBedTrackSvg({ tracks, xax, titleHeight }: IProps) {
  const { location } = useContext(LocationContext)

  const allFeatures: IGenomicLocation[][] = tracks.map((track) =>
    track.index.getOverlappingFeatures(location)
  )

  return (
    <CoreBedTrackSvg
      tracks={tracks}
      allFeatures={allFeatures}
      xax={xax}
      titleHeight={titleHeight}
    />
  )
}

//   const h = track.displayOptions.band.height

//   return (
//     <g transform={`translate(0, ${titleHeight})`}>
//       {displayOptions.titles.show && (
//         <g
//           transform={`translate(${displayOptions.titles.position === 'Right' ? xax.width + displayOptions.titles.offset : xax.width / 2}, ${displayOptions.titles.position === 'Right' ? track.displayOptions.height / 2 : -displayOptions.titles.offset})`}
//         >
//           <text
//             fill={displayOptions.titles.font.color}
//             //dominantBaseline="hanging"
//             fontSize={displayOptions.titles.font.size}
//             dominantBaseline={
//               displayOptions.titles.position === 'Right' ? 'middle' : 'auto'
//             }
//             textAnchor={
//               displayOptions.titles.position === 'Right' ? 'start' : 'middle'
//             }
//           >
//             {track.name}
//           </text>
//         </g>
//       )}

//       <g transform={`translate(0, ${(track.displayOptions.height - h) / 2})`}>
//         {features.map((f, bi) => {
//           const x1 = xax.domainToRange(f.start)
//           const x2 = xax.domainToRange(f.end)

//           return (
//             <rect
//               x={x1}
//               width={x2 - x1}
//               height={h}
//               fill={track.displayOptions.fill.color}
//               key={bi}
//             />
//           )
//         })}
//       </g>
//     </g>
//   )
// }
