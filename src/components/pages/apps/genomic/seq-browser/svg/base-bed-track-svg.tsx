import { type IDivProps } from '@/interfaces/div-props'

import { type Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/lib/color/color'
import { locStr, type IGenomicLocation } from '@/lib/genomic/genomic'
import { cumsum } from '@/lib/math/cumsum'
import { sum } from '@/lib/math/sum'
import { formattedList, truncate } from '@/lib/text/text'
import {
  useSeqBrowserSettings,
  type ISeqBrowserSettings,
} from '../seq-browser-settings'
import { type IPeakTrack } from '../tracks-provider'

export function getBedTrackHeight(
  tracks: IPeakTrack[],
  settings: ISeqBrowserSettings
): number {
  if (tracks.length === 0) {
    return 0
  }

  const h = settings.tracks.beds.collapsed
    ? tracks[0]!.displayOptions.height
    : sum(tracks.map(track => track.displayOptions.height))

  console.log('Calculated bed track height:', h)

  return h
}

interface IProps extends IDivProps {
  tracks: {
    track: IPeakTrack
    positions: IGenomicLocation[]
  }[]
  //allFeatures: IGenomicLocation[][]
  xax: Axis
  titleHeight: number
}

export function BaseBedTrackSvg({
  tracks,
  //allFeatures,
  xax,
  titleHeight,
}: IProps) {
  const { settings } = useSeqBrowserSettings()

  const trackHeights: number[] = tracks.map(track =>
    settings.tracks.beds.collapsed ? 0 : track.track.displayOptions.height
  )

  const trackYs = cumsum([0, ...trackHeights])

  return (
    <g transform={`translate(0, ${titleHeight})`}>
      {settings.titles.show && (
        <g
          transform={`translate(${settings.titles.position === 'right' ? xax.length + settings.titles.offset : xax.length / 2}, ${settings.titles.position === 'right' ? tracks[0]!.track.displayOptions.height / 2 : -settings.titles.offset})`}
        >
          <text
            fill={COLOR_BLACK}
            //dominantBaseline="hanging"
            fontSize={settings.titles.font.size}
            dominantBaseline={
              settings.titles.position === 'right' ? 'middle' : 'auto'
            }
            textAnchor={
              settings.titles.position === 'right' ? 'start' : 'middle'
            }
          >
            {truncate(formattedList(tracks.map(t => t.track.name)), {
              length: Math.round(xax.length / 10),
            })}
          </text>
        </g>
      )}

      {tracks.map((track, ti) => {
        const features = track.positions
        const h = settings.tracks.beds.band.height

        return (
          <g
            id={`bed-${ti}`}
            transform={`translate(0, ${trackYs[ti]!})`}
            key={ti}
          >
            <g
              transform={`translate(0, ${(settings.tracks.beds.height - h) / 2})`}
            >
              {features.map((f, bi) => {
                const l = f
                const x1 = xax.domainToRange(l.start)
                const x2 = xax.domainToRange(l.end)
                const w = Math.abs(x2 - x1)

                return (
                  <rect
                    x={x1 - (settings.reverse ? w : 0)}
                    width={w}
                    height={h}
                    rx={settings.tracks.beds.style === 'Rounded' ? h / 2 : 0}
                    fill={
                      track.track.displayOptions.fill.show
                        ? track.track.displayOptions.fill.value
                        : 'none'
                    }
                    fillOpacity={
                      track.track.displayOptions.fill.show
                        ? track.track.displayOptions.fill.opacity
                        : 0
                    }
                    stroke={track.track.displayOptions.stroke.value}
                    strokeWidth={
                      track.track.displayOptions.stroke.show
                        ? track.track.displayOptions.stroke.width
                        : 0
                    }
                    key={bi}
                  >
                    <title>{locStr(f)}</title>
                  </rect>
                )
              })}
            </g>
          </g>
        )
      })}
    </g>
  )
}
