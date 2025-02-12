import { type IElementProps } from '@interfaces/element-props'

import { type Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/consts'
import { locStr, type IGenomicLocation } from '@/lib/genomic/genomic'
import { cumsum } from '@/lib/math/cumsum'
import { sum } from '@/lib/math/sum'
import { formattedList, truncate } from '@/lib/text/text'
import { useContext } from 'react'
import {
  SeqBrowserSettingsContext,
  type ISeqBrowserSettings,
} from '../seq-browser-settings-provider'
import { type IBedTrack, type ILocalBedTrack } from '../tracks-provider'

export function getBedTrackHeight(
  tracks: (IBedTrack | ILocalBedTrack)[],
  displayOptions: ISeqBrowserSettings
): number {
  if (tracks.length === 0) {
    return 0
  }

  return displayOptions.beds.collapsed
    ? tracks[0]!.displayOptions.height
    : sum(tracks.map((track) => track.displayOptions.height))
}

interface IProps extends IElementProps {
  tracks: (IBedTrack | ILocalBedTrack)[]
  allFeatures: IGenomicLocation[][]
  xax: Axis

  titleHeight: number
}

export function CoreBedTrackSvg({
  tracks,
  allFeatures,
  xax,
  titleHeight,
}: IProps) {
  const { settings } = useContext(SeqBrowserSettingsContext)

  const trackHeights: number[] = tracks.map((track) =>
    settings.beds.collapsed ? 0 : track.displayOptions.height
  )

  const trackYs = cumsum([0, ...trackHeights])

  return (
    <g transform={`translate(0, ${titleHeight})`}>
      {settings.titles.show && (
        <g
          transform={`translate(${settings.titles.position === 'Right' ? xax.length + settings.titles.offset : xax.length / 2}, ${settings.titles.position === 'Right' ? tracks[0]!.displayOptions.height / 2 : -settings.titles.offset})`}
        >
          <text
            fill={COLOR_BLACK}
            //dominantBaseline="hanging"
            fontSize={settings.titles.font.size}
            dominantBaseline={
              settings.titles.position === 'Right' ? 'middle' : 'auto'
            }
            textAnchor={
              settings.titles.position === 'Right' ? 'start' : 'middle'
            }
          >
            {truncate(formattedList(tracks.map((t) => t.name)), {
              length: Math.round(xax.length / 10),
            })}
          </text>
        </g>
      )}

      {tracks.map((track, ti) => {
        const features = allFeatures[ti]!
        const h = settings.beds.band.height

        return (
          <g
            id={`bed-${ti}`}
            transform={`translate(0, ${trackYs[ti]!})`}
            key={ti}
          >
            <g transform={`translate(0, ${(settings.beds.height - h) / 2})`}>
              {features.map((f, bi) => {
                const l = f
                const x1 = xax.domainToRange(l.start)
                const x2 = xax.domainToRange(l.end)

                return (
                  <rect
                    x={x1}
                    width={x2 - x1}
                    height={h}
                    rx={settings.beds.style === 'Rounded' ? h / 2 : 0}
                    fill={
                      track.displayOptions.fill.show
                        ? track.displayOptions.fill.color
                        : 'none'
                    }
                    fillOpacity={
                      track.displayOptions.fill.show
                        ? track.displayOptions.fill.alpha
                        : 0
                    }
                    stroke={track.displayOptions.stroke.color}
                    strokeWidth={
                      track.displayOptions.stroke.show
                        ? track.displayOptions.stroke.width
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
