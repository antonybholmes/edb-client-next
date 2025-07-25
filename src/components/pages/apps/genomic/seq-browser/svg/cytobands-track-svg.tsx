import { type IDivProps } from '@interfaces/div-props'

import { Axis } from '@/components/plot/axis'
import type { IStringMap } from '@interfaces/string-map'
import { COLOR_BLACK } from '@lib/color/color'
import { API_CYTOBANDS_URL } from '@lib/edb/edb'
import { type IGenomicLocation } from '@lib/genomic/genomic'
import { httpFetch } from '@lib/http/http-fetch'
import { range } from '@lib/math/range'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import {
  useSeqBrowserSettings,
  type ISeqBrowserSettings,
} from '../seq-browser-settings'
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

interface IProps extends IDivProps {
  track: ICytobandsTrack
}

export function CytobandsTrackSvg({ track }: IProps) {
  const { settings } = useSeqBrowserSettings()
  const { location } = useContext(LocationContext)

  const { data } = useQuery({
    queryKey: ['Cytobands'],
    queryFn: async () => {
      const res = await httpFetch.getJson<{ data: ICytoband[] }>(
        `${API_CYTOBANDS_URL}/${settings.genome}/${location.chr}`
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
        <CytobandsRoundStyleTrackSvg track={track} cytobands={cytobands} />
      ) : (
        <CytobandsSquareStyleTrackSvg track={track} cytobands={cytobands} />
      )}
    </>
  )
}

function CytobandsRoundStyleTrackSvg({
  track,
  cytobands,
}: IProps & {
  cytobands: ICytoband[]
}) {
  const { settings } = useSeqBrowserSettings()
  const { location, xax } = useContext(LocationContext)

  const l1 = cytobands[0]!.loc
  const l2 = cytobands[cytobands.length - 1]!.loc

  let cytoAx = new Axis().setLength(xax.length)

  if (settings.reverse) {
    cytoAx = cytoAx.setDomain([l2.end, l1.start])
  } else {
    cytoAx = cytoAx.setDomain([l1.start, l2.end])
  }

  const pcenters = cytobands
    .filter((c) => c.name.startsWith('p') && c.giemsaStain === 'acen')
    .map((c) => c.loc)

  const qcenters = cytobands
    .filter((c) => c.name.startsWith('q') && c.giemsaStain === 'acen')
    .map((c) => c.loc)

  const pcenterxs =
    pcenters.length > 0
      ? cytoAx.domainToRange(Math.min(...pcenters.map((l) => l.start)))
      : 0

  const pcenterxe =
    pcenters.length > 0
      ? cytoAx.domainToRange(Math.max(...pcenters.map((l) => l.end)))
      : 0

  const qcenterxs =
    qcenters.length > 0
      ? cytoAx.domainToRange(Math.min(...qcenters.map((l) => l.start)))
      : 0

  const qcentersxe =
    qcenters.length > 0
      ? cytoAx.domainToRange(Math.max(...qcenters.map((l) => l.end)))
      : 0

  const pw = Math.max(1, Math.abs(pcenterxe - cytoAx.domainToRange(l1.start)))
  const qw = Math.max(1, Math.abs(cytoAx.domainToRange(l2.end) - qcenterxs))

  const pbands = cytobands.filter(
    (c) => c.name.startsWith('p') && c.giemsaStain !== 'acen'
  )

  const qbands = cytobands.filter(
    (c) => c.name.startsWith('q') && c.giemsaStain !== 'acen'
  )

  const h = settings.cytobands.band.height

  const locx1 = cytoAx.domainToRange(location.start)
  const locx2 = cytoAx.domainToRange(location.end)
  const locw = Math.max(1, locx2 - locx1)

  return (
    <>
      <defs>
        <clipPath id="p-arm">
          <rect
            x={cytoAx.domainToRange(l1.start) - (settings.reverse ? pw : 0)}
            width={pw}
            height={h}
            rx={h / 2}
          />
        </clipPath>
        <clipPath id="q-arm">
          <rect
            x={qcenterxs - (settings.reverse ? qw : 0)}
            width={qw}
            height={h}
            rx={h / 2}
          />
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
            const w = Math.abs(x2 - x1)

            return (
              <rect
                x={x1 - (settings.reverse ? w : 0)}
                width={w}
                height={h}
                fill={COLOR_MAP[b.giemsaStain]}
                key={bi}
              >
                <title>{`${b.name}, ${b.giemsaStain}`}</title>
              </rect>
            )
          })}

          {pcenterxs !== 0 && (
            <rect
              x={
                pcenterxs -
                (settings.reverse ? Math.abs(pcenterxe - pcenterxs) : 0)
              }
              width={Math.abs(pcenterxe - pcenterxs)}
              height={h}
              fill={track.displayOptions.center.fill.color}
              fillOpacity={track.displayOptions.center.fill.alpha}
              stroke="none"
            />
          )}
        </g>

        <rect
          x={cytoAx.domainToRange(l1.start) - (settings.reverse ? pw : 0)}
          width={pw}
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
            const w = Math.abs(x2 - x1)

            return (
              <rect
                x={x1 - (settings.reverse ? w : 0)}
                width={w}
                height={h}
                fill={COLOR_MAP[b.giemsaStain]}
                key={bi}
              >
                <title>{`${b.name}, ${b.giemsaStain}`}</title>
              </rect>
            )
          })}

          {qcenterxs !== 0 && (
            <rect
              x={
                qcenterxs -
                (settings.reverse ? Math.abs(qcentersxe - qcenterxs) : 0)
              }
              width={Math.abs(qcentersxe - qcenterxs)}
              height={h}
              fill={track.displayOptions.center.fill.color}
              fillOpacity={track.displayOptions.center.fill.alpha}
              stroke="none"
            />
          )}
        </g>

        <rect
          x={qcenterxs - (settings.reverse ? qw : 0)}
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
        x={locx1 - (settings.reverse ? locw : 0)}
        width={locw}
        height={settings.cytobands.height}
        stroke={track.displayOptions.location.stroke.color}
        fill={track.displayOptions.location.fill.color}
        fillOpacity={track.displayOptions.location.fill.alpha}
      />
    </>
  )
}

function CytobandsSquareStyleTrackSvg({
  track,
  cytobands,
}: IProps & {
  cytobands: ICytoband[]
}) {
  const { settings } = useSeqBrowserSettings()
  const { location, xax } = useContext(LocationContext)

  const l1 = cytobands[0]!.loc
  const l2 = cytobands[cytobands.length - 1]!.loc

  let cytoAx = new Axis().setLength(xax.length)

  if (settings.reverse) {
    cytoAx = cytoAx.setDomain([l2.end, l1.start])
  } else {
    cytoAx = cytoAx.setDomain([l1.start, l2.end])
  }

  const centers = cytobands
    .filter((c) => c.giemsaStain === 'acen')
    .map((c) => c.loc)

  const centerx1 = cytoAx.domainToRange(
    Math.min(...centers.map((l) => l.start))
  )
  const centerx2 = cytoAx.domainToRange(Math.max(...centers.map((l) => l.end)))

  const pbands = cytobands.filter(
    (c) => c.name.startsWith('p') && c.giemsaStain !== 'acen'
  )

  const qbands = cytobands.filter(
    (c) => c.name.startsWith('q') && c.giemsaStain !== 'acen'
  )

  const h = track.displayOptions.band.height

  const locx1 = cytoAx.domainToRange(location.start)
  const locx2 = cytoAx.domainToRange(location.end)
  const locw = Math.max(1, locx2 - locx1)

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
          const w = Math.abs(x2 - x1)

          return (
            <rect
              x={x1 - (settings.reverse ? w : 0)}
              width={w}
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
          const w = Math.abs(x2 - x1)

          return (
            <rect
              x={x1 - (settings.reverse ? w : 0)}
              width={w}
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
          points={`0,${h} 0,0 ${settings.reverse ? centerx2 : centerx1},0 ${settings.reverse ? centerx1 : centerx2},${h} ${xax.length},${h} ${xax.length},0 ${settings.reverse ? centerx1 : centerx2},0 ${settings.reverse ? centerx2 : centerx1},${h}`}
          fill="none"
          stroke={track.displayOptions.stroke.color}
          strokeWidth={track.displayOptions.stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <rect
        id="location"
        x={locx1 - (settings.reverse ? locw : 0)}
        width={locw}
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

  const labels = range(0, bands.length).map((i) => {
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
    if (
      settings.cytobands.labels.skip.on &&
      Math.abs(label.x - minX) < thresholdX
    ) {
      continue
    }

    displayLabels.push(label)

    minX = label.x
  }

  return (
    <>
      {displayLabels.map((label) => {
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
