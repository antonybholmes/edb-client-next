import { type IElementProps } from '@interfaces/element-props'

import { Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/consts'
import type { IStringMap } from '@/interfaces/string-map'
import { API_CYTOBANDS_URL } from '@/lib/edb/edb'
import { GenomicLocation, type IGenomicLocation } from '@/lib/genomic/genomic'
import { httpFetch } from '@/lib/http/http-fetch'
import { range } from '@/lib/math/range'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import {
  SeqBrowserSettingsContext,
  type ISeqBrowserSettings,
} from '../seq-browser-settings-provider'
import { LocationContext, type ICytobandsTrack } from '../tracks-provider'

const COLOR_MAP: IStringMap = {
  gneg: '#F8F8F8',
  gpos25: '#C0C0C0',
  gpos50: '#808080',
  gpos75: '#383838',
  gpos100: COLOR_BLACK,
}

// const GIE_LABEL_COLOR_MAP: IStringMap = {
//   gneg: COLOR_BLACK,
//   gpos25: COLOR_BLACK,
//   gpos50: COLOR_BLACK,
//   gpos75: COLOR_WHITE,
//   gpos100: COLOR_WHITE,
// }

interface ICytoband {
  loc: IGenomicLocation
  name: string
  giemsaStain: string
}

interface IProps extends IElementProps {
  genome: string

  track: ICytobandsTrack
  xax: Axis
}

export function CytobandsTrackSvg({ genome, track, xax }: IProps) {
  const { settings } = useContext(SeqBrowserSettingsContext)
  const { location } = useContext(LocationContext)

  const { data } = useQuery({
    queryKey: ['Cytobands'],
    queryFn: async () => {
      const res = await httpFetch.getJson(
        `${API_CYTOBANDS_URL}/${genome}/${location.chr}`
      )

      return res.data
    },
  })

  const cytobands: ICytoband[] = data ? data : []

  if (cytobands.length === 0) {
    return null
  }

  return (
    <>
      {/* <rect
        width={xax.width}
        height={track.displayOptions.height}
        stroke="black"
        fill="none"
      /> */}

      {settings.cytobands.style === 'Rounded' ? (
        <CytobandsRoundStyleTrackSvg
          genome={genome}
          location={location}
          track={track}
          xax={xax}
          settings={settings}
          cytobands={cytobands}
        />
      ) : (
        <CytobandsSquareStyleTrackSvg
          genome={genome}
          location={location}
          track={track}
          xax={xax}
          settings={settings}
          cytobands={cytobands}
        />
      )}
    </>
  )
}

export function CytobandsRoundStyleTrackSvg({
  location,
  track,
  xax,
  cytobands,
  settings,
}: IProps & {
  location: GenomicLocation
  settings: ISeqBrowserSettings
  cytobands: ICytoband[]
}) {
  const l1 = cytobands[0]!.loc
  const l2 = cytobands[cytobands.length - 1]!.loc

  const cytoAx = new Axis().setDomain([l1.start, l2.end]).setLength(xax.length)

  const centers1 = cytobands
    .filter(c => c.name.startsWith('p') && c.giemsaStain === 'acen')
    .map(c => c.loc)

  const centers2 = cytobands
    .filter(c => c.name.startsWith('q') && c.giemsaStain === 'acen')
    .map(c => c.loc)

  const centerx1s =
    centers1.length > 0
      ? cytoAx.domainToRange(Math.min(...centers1.map(l => l.start)))
      : 0

  const centerx1e =
    centers1.length > 0
      ? cytoAx.domainToRange(Math.max(...centers1.map(l => l.end)))
      : 0

  const centerx2s =
    centers2.length > 0
      ? cytoAx.domainToRange(Math.min(...centers2.map(l => l.start)))
      : 0

  const centerx2e =
    centers2.length > 0
      ? cytoAx.domainToRange(Math.max(...centers2.map(l => l.end)))
      : 0

  const qw = xax.length - centerx2s

  const pbands = cytobands.filter(
    c => c.name.startsWith('p') && c.giemsaStain !== 'acen'
  )

  const qbands = cytobands.filter(
    c => c.name.startsWith('q') && c.giemsaStain !== 'acen'
  )

  const h = settings.cytobands.band.height

  const locx1 = cytoAx.domainToRange(location.start)
  const locx2 = cytoAx.domainToRange(location.end)

  return (
    <>
      <defs>
        <clipPath id="p-arm">
          <rect width={centerx1e} height={h} rx={h / 2} />
        </clipPath>
        <clipPath id="q-arm">
          <rect x={centerx2s} width={qw} height={h} rx={h / 2} />
        </clipPath>
      </defs>

      <g
        id="p-arm"
        transform={`translate(0, ${(settings.cytobands.height - h) / 2})`}
      >
        <g id="p-bands" clipPath="url(#p-arm)">
          {pbands.map((b, bi) => {
            const l = b.loc
            const x1 = cytoAx.domainToRange(l.start)
            const x2 = cytoAx.domainToRange(l.end)

            return (
              <rect
                x={x1}
                width={x2 - x1}
                height={h}
                fill={COLOR_MAP[b.giemsaStain]}
                key={bi}
              >
                <title>{`${b.name}, ${b.giemsaStain}`}</title>
              </rect>
            )
          })}

          {centerx1s !== 0 && (
            <rect
              x={centerx1s}
              width={centerx1e - centerx1s}
              height={h}
              fill={track.displayOptions.center.fill.color}
              fillOpacity={track.displayOptions.center.fill.alpha}
              stroke="none"
            />
          )}
        </g>

        <rect
          width={centerx1e}
          height={h}
          stroke={track.displayOptions.stroke.color}
          strokeWidth={track.displayOptions.stroke.width}
          fill="none"
          rx={h / 2}
        />
      </g>

      <g
        id="q-arm"
        transform={`translate(0, ${(settings.cytobands.height - h) / 2})`}
      >
        <g id="q-bands" clipPath="url(#q-arm)">
          {qbands.map((b, bi) => {
            const l = b.loc
            const x1 = cytoAx.domainToRange(l.start)
            const x2 = cytoAx.domainToRange(l.end)

            return (
              <rect
                x={x1}
                width={x2 - x1}
                height={h}
                fill={COLOR_MAP[b.giemsaStain]}
                key={bi}
              >
                <title>{`${b.name}, ${b.giemsaStain}`}</title>
              </rect>
            )
          })}

          {centerx2s !== 0 && (
            <rect
              x={centerx2s}
              width={centerx2e - centerx2s}
              height={h}
              fill={track.displayOptions.center.fill.color}
              fillOpacity={track.displayOptions.center.fill.alpha}
              stroke="none"
            />
          )}
        </g>

        <rect
          x={centerx2s}
          width={qw}
          height={h}
          stroke={track.displayOptions.stroke.color}
          strokeWidth={track.displayOptions.stroke.width}
          fill="none"
          rx={h / 2}
        />
      </g>

      {settings.cytobands.labels.show && (
        <g
          id="q-labels"
          transform={`translate(0, ${settings.cytobands.height + settings.titles.offset})`}
        >
          <LabelSvg
            pbands={pbands}
            qbands={qbands}
            ax={cytoAx}
            settings={settings}
          />
        </g>
      )}

      <rect
        id="location"
        x={locx1}
        width={Math.min(1, locx2 - locx1)}
        height={settings.cytobands.height}
        stroke={track.displayOptions.location.stroke.color}
        fill={track.displayOptions.location.fill.color}
        fillOpacity={track.displayOptions.location.fill.alpha}
      />
    </>
  )
}

export function CytobandsSquareStyleTrackSvg({
  location,
  track,
  xax,
  cytobands,
  settings,
}: IProps & {
  location: GenomicLocation
  settings: ISeqBrowserSettings
  cytobands: ICytoband[]
}) {
  const l1 = cytobands[0]!.loc
  const l2 = cytobands[cytobands.length - 1]!.loc

  const cytoAx = new Axis().setDomain([l1.start, l2.end]).setLength(xax.length)

  const centers = cytobands
    .filter(c => c.giemsaStain === 'acen')
    .map(c => c.loc)

  const centerx1 = cytoAx.domainToRange(Math.min(...centers.map(l => l.start)))
  const centerx2 = cytoAx.domainToRange(Math.max(...centers.map(l => l.end)))

  const pbands = cytobands.filter(
    c => c.name.startsWith('p') && c.giemsaStain !== 'acen'
  )

  const qbands = cytobands.filter(
    c => c.name.startsWith('q') && c.giemsaStain !== 'acen'
  )

  const h = track.displayOptions.band.height

  const locx1 = cytoAx.domainToRange(location.start)
  const locx2 = cytoAx.domainToRange(location.end)

  return (
    <>
      <g
        id="p-bands"
        transform={`translate(0, ${(track.displayOptions.height - h) / 2})`}
      >
        {pbands.map((b, bi) => {
          const l = b.loc
          const x1 = cytoAx.domainToRange(l.start)
          const x2 = cytoAx.domainToRange(l.end)

          return (
            <rect
              x={x1}
              width={x2 - x1}
              height={h}
              fill={COLOR_MAP[b.giemsaStain]}
              key={bi}
            >
              <title>{`${b.name}, ${b.giemsaStain}`}</title>
            </rect>
          )
        })}
      </g>

      <g
        id="q-bands"
        transform={`translate(0, ${(track.displayOptions.height - h) / 2})`}
      >
        {qbands.map((b, bi) => {
          const l = b.loc
          const x1 = cytoAx.domainToRange(l.start)
          const x2 = cytoAx.domainToRange(l.end)

          return (
            <rect
              x={x1}
              width={x2 - x1}
              height={h}
              fill={COLOR_MAP[b.giemsaStain]}
              key={bi}
            >
              <title>{`${b.name}, ${b.giemsaStain}`}</title>
            </rect>
          )
        })}
      </g>

      {settings.cytobands.labels.show && (
        <g
          id="q-labels"
          transform={`translate(0, ${track.displayOptions.height + settings.titles.offset})`}
        >
          <LabelSvg
            pbands={pbands}
            qbands={qbands}
            ax={cytoAx}
            settings={settings}
          />
        </g>
      )}

      <g
        id="center"
        transform={`translate(0, ${(track.displayOptions.height - h) / 2})`}
      >
        <polygon
          points={`${centerx1},${h} ${centerx1},0 ${centerx2},${h} ${centerx2},0`}
          fill={track.displayOptions.center.fill.color}
          fillOpacity={track.displayOptions.center.fill.alpha}
          stroke="none"
        />

        <polygon
          points={`0,${h} 0,0 ${centerx1},0 ${centerx2},${h} ${xax.length},${h} ${xax.length},0 ${centerx2},0 ${centerx1},${h}`}
          fill="none"
          stroke={track.displayOptions.stroke.color}
          strokeWidth={track.displayOptions.stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <rect
        id="location"
        x={locx1}
        width={Math.min(1, locx2 - locx1)}
        height={track.displayOptions.height}
        stroke={track.displayOptions.location.stroke.color}
        fill={track.displayOptions.location.fill.color}
        fillOpacity={track.displayOptions.location.fill.alpha}
      />
    </>
  )
}

function LabelSvg({
  pbands,
  qbands,
  ax,
  settings,
}: {
  pbands: ICytoband[]
  qbands: ICytoband[]
  ax: Axis
  settings: ISeqBrowserSettings
}) {
  const bands = [...pbands, ...qbands]

  const labels = range(0, bands.length).map(i => {
    const b = bands[i]!
    const l = b.loc

    const x1 = ax.domainToRange(l.start)
    const x2 = ax.domainToRange(l.end)
    const x = (x1 + x2) / 2

    const name = b.name

    return { x, name }
  })

  //console.log(labels)

  const displayLabels: { x: number; name: string }[] = []

  let minX = -1000

  // Use an empirical method to space labels out nicely
  const thresholdX = settings.cytobands.labels.skip.auto
    ? Math.log2(ax.length) * 5
    : settings.cytobands.labels.skip.x

  for (const label of labels) {
    if (settings.cytobands.labels.skip.on && label.x - minX < thresholdX) {
      continue
    }

    displayLabels.push(label)

    minX = label.x
  }

  return (
    <>
      {displayLabels.map(label => {
        return (
          <text
            transform={`translate(${label.x}, 0)`}
            fill={settings.cytobands.labels.font.color}
            fontSize={settings.cytobands.labels.font.size}
            dominantBaseline="hanging"
            textAnchor="middle"
            //fontWeight="bold"
            key={label.name}
          >
            {label.name}
          </text>
        )
      })}
    </>
  )
}
