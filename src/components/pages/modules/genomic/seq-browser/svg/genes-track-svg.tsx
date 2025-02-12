import { type IElementProps } from '@interfaces/element-props'

import { type Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@/consts'
import { type IGenomicLocation } from '@/lib/genomic/genomic'
import { cumsum } from '@/lib/math/cumsum'
import { range } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'
import { useContext } from 'react'
import { SeqBrowserSettingsContext } from '../seq-browser-settings-provider'
import { type IGeneTrack } from '../tracks-provider'

interface IGeneDBInfo {
  genome: string
  version: string
}

export interface IGenomicFeature {
  loc: IGenomicLocation
  level: string
  strand: string
  geneSymbol?: string
  geneId?: string
  transcriptId?: string
  exonId?: string
  isCanonical?: boolean
  children?: IGenomicFeature[]
}

export interface IGenomicFeatureSearch {
  location: IGenomicLocation
  features: IGenomicFeature[]
}

export function getGeneTrackHeight(
  track: IGeneTrack,
  features: IGenomicFeature[]
): number {
  const transcripts = sum(features.map((gene) => gene.children?.length ?? 0))

  return (
    transcripts * track.displayOptions.transcripts.height +
    features.length * track.displayOptions.genes.gap
  )
}

export function getGeneHeight(
  track: IGeneTrack,
  gene: IGenomicFeature
): number {
  const transcripts = gene.children?.length ?? 0

  return (
    transcripts * track.displayOptions.transcripts.height +
    track.displayOptions.genes.gap
  )
}

interface IProps extends IElementProps {
  db: IGeneDBInfo | null
  track: IGeneTrack
  features: IGenomicFeature[]
  xax: Axis
  titleHeight: number
}

export function GenesTrackSvg({
  db,
  track,
  features,
  xax,
  titleHeight,
}: IProps) {
  const { settings } = useContext(SeqBrowserSettingsContext)

  // const genesQuery = useQuery({
  //   queryKey: ['db'],
  //   queryFn: async () => {
  //     const res = await httpFetch.getJson(`${API_GENES_DB_URL}/${genome}`)

  //     //console.log('test genes', res.data)

  //     return res.data
  //   },
  // })

  // we need this here to calculate the height of the track rather than
  // having the query inside the svg component
  // const info: IGeneDBInfo = genesQuery.data
  //   ? genesQuery.data
  //   : DEFAULT_DB_VERSION

  //console.log(info)

  let x1: number
  let x2: number

  const geneHeights: number[] = features.map((gene) =>
    getGeneHeight(track, gene)
  )

  const geneY = cumsum([0, ...geneHeights])

  const arrowHy = track.displayOptions.arrows.y / 2
  const arrowHx = track.displayOptions.arrows.x / 2

  return (
    <>
      <defs>
        {settings.genes.arrows.style === 'Lines' && (
          <>
            <polyline
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},-${arrowHy} -${arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},-${arrowHy} -${arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={settings.genes.canonical.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <polyline
              id={`${track.id}-arrow-right`}
              points={`-${arrowHx},-${arrowHy} ${arrowHx},0 -${arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-right-canonical`}
              points={`-${arrowHx},-${arrowHy} ${arrowHx},0 -${arrowHx},${arrowHy}`}
              stroke={settings.genes.canonical.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {settings.genes.arrows.style === 'Filled' && (
          <>
            <polygon
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},-${arrowHy} -${arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},-${arrowHy} -${arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.genes.canonical.stroke.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />

            <polygon
              id={`${track.id}-arrow-right`}
              points={`-${arrowHx},-${arrowHy} ${arrowHx},0 -${arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-right-canonical`}
              points={`-${arrowHx},-${arrowHy} ${arrowHx},0 -${arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.genes.canonical.stroke.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
          </>
        )}
      </defs>

      <g transform={`translate(0, ${titleHeight})`}>
        {settings.titles.show && settings.titles.position === 'Top' && (
          <g transform={`translate(0, -${settings.titles.offset})`}>
            <text
              transform={`translate(${xax.length / 2}, 0)`}
              fill={COLOR_BLACK}
              //dominantBaseline="hanging"
              fontSize="small"
              textAnchor="middle"
              //fontWeight="bold"
            >
              {track.name} ({db.genome},{db.version})
            </text>
          </g>
        )}

        {features.map((feature, fi) => {
          const geneLoc = feature.loc
          x1 = xax.domainToRange(geneLoc.start)
          x2 = xax.domainToRange(geneLoc.end)

          return (
            <g
              id={`gene-${fi}`}
              transform={`translate(0, ${geneY[fi]!})`}
              key={fi}
            >
              {feature.children?.map((transcript, ti) => {
                const transLoc = transcript.loc
                x1 = xax.domainToRange(transLoc.start)
                x2 = xax.domainToRange(transLoc.end)

                const exonCount = transcript.children?.length ?? 0

                const arrowStart =
                  Math.round(
                    (x1 + track.displayOptions.arrows.gap) /
                      track.displayOptions.arrows.gap
                  ) * track.displayOptions.arrows.gap

                const arrowEnd =
                  Math.round(x2 / track.displayOptions.arrows.gap) *
                  track.displayOptions.arrows.gap

                const arrowXs = range(
                  arrowStart,
                  arrowEnd,
                  track.displayOptions.arrows.gap
                )

                const isCanonical =
                  settings.genes.canonical.isColored && transcript.isCanonical

                return (
                  <g
                    id="transcript"
                    transform={`translate(0, ${ti * track.displayOptions.transcripts.height})`}
                    key={ti}
                  >
                    <rect
                      id="transcript-block"
                      x={x1}
                      width={x2 - x1}
                      height={track.displayOptions.exons.height}
                      fill="white"
                    >
                      <title>{`${transcript.transcriptId}, strand ${transcript.strand}`}</title>
                    </rect>

                    <g
                      transform={`translate(0, ${track.displayOptions.exons.height / 2})`}
                    >
                      {settings.genes.endArrows.show &&
                        (!settings.genes.endArrows.firstTranscriptOnly ||
                          ti === 0) && (
                          <g
                            id="end-arrow"
                            transform={`translate(${feature.strand === '+' ? x1 : x2}, 0) scale(${feature.strand === '+' ? 1 : -1},1)`}
                          >
                            <polygon
                              points="0,0 0,-10 10,-10 10,-14 15,-10 10,-6 10,-10 0,-10"
                              fill={
                                isCanonical
                                  ? settings.genes.canonical.stroke.color
                                  : settings.genes.endArrows.fill.color
                              }
                              fillOpacity={settings.genes.endArrows.fill.alpha}
                              stroke={
                                isCanonical
                                  ? settings.genes.canonical.stroke.color
                                  : settings.genes.endArrows.stroke.color
                              }
                            />
                          </g>
                        )}

                      {track.displayOptions.labels.show && (
                        <text
                          transform={`translate(${Math.max(-track.displayOptions.labels.offset, x1 - track.displayOptions.labels.offset)}, 0)`}
                          fill={track.displayOptions.labels.font.color}
                          dominantBaseline="middle"
                          fontSize={track.displayOptions.labels.font.size}
                          textAnchor="end"
                          //fontWeight="bold"
                        >
                          {transcript.geneSymbol}{' '}
                          {track.displayOptions.labels.showGeneId
                            ? `(${transcript.transcriptId})`
                            : ''}
                          <title>{`${transcript.geneSymbol} (${transcript.transcriptId})`}</title>
                        </text>
                      )}

                      {settings.genes.arrows.show && (
                        <g
                          id="arrows"
                          //transform={`translate(0,-${track.displayOptions.arrows.size})`}
                        >
                          {arrowXs.map((x) => {
                            return (
                              <use
                                key={`${x}`}
                                xlinkHref={`#${track.id}-arrow-${transcript.strand === '+' ? 'right' : 'left'}${isCanonical ? '-canonical' : ''}`}
                                transform={`translate(${x},0)`}
                              />
                            )
                          })}
                        </g>
                      )}

                      <line
                        id="transcript-line"
                        x1={x1}
                        x2={x2}
                        stroke={
                          isCanonical
                            ? settings.genes.canonical.stroke.color
                            : track.displayOptions.stroke.color
                        }
                        strokeWidth={track.displayOptions.stroke.width}
                      />

                      {settings.genes.exons.show && (
                        <g
                          id="exons"
                          transform={`translate(0, -${track.displayOptions.exons.height / 2})`}
                        >
                          {transcript.children?.map((exon, ei) => {
                            const exonLoc = exon.loc
                            x1 = xax.domainToRange(exonLoc.start)
                            x2 = xax.domainToRange(exonLoc.end)
                            return (
                              <rect
                                id="exon"
                                x={x1}
                                width={x2 - x1}
                                height={track.displayOptions.exons.height}
                                fill={
                                  isCanonical
                                    ? settings.genes.canonical.stroke.color
                                    : track.displayOptions.exons.fill.color
                                }
                                fillOpacity={
                                  track.displayOptions.exons.fill.alpha
                                }
                                stroke="none"
                                key={ei}
                              >
                                <title>{`${exon.transcriptId}, strand ${exon.strand}, exon ${exon.strand === '+' ? ei + 1 : exonCount - ei} of ${exonCount}`}</title>
                              </rect>
                            )
                          })}
                        </g>
                      )}
                    </g>
                  </g>
                )
              })}
            </g>
          )
        })}
      </g>
    </>
  )
}
