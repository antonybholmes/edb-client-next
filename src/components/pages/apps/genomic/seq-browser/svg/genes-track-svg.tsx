import { type IDivProps } from '@interfaces/div-props'

import type { Axis } from '@/components/plot/axis'
import { COLOR_BLACK } from '@lib/color/color'
import { type IGenomicLocation } from '@lib/genomic/genomic'
import { range } from '@lib/math/range'
import { sign } from '@lib/math/sign'
import { useContext } from 'react'
import {
  useSeqBrowserSettings,
  type ISeqBrowserSettings,
} from '../seq-browser-settings'
import { LocationContext, type IGeneTrack } from '../tracks-provider'

const CHAR_W = 8

interface IGeneDBInfo {
  genome: string
  version: string
}

export interface IGenomicFeature {
  loc: IGenomicLocation
  level: string
  //strand: string
  geneSymbol?: string
  geneId?: string
  geneType?: string
  transcriptId?: string
  isCanonical?: boolean
  transcriptType?: string
  exonId?: string
  exonNumber?: number
  children?: IGenomicFeature[]
}

export interface IGenomicFeatureSearch {
  location: IGenomicLocation
  features: IGenomicFeature[]
}

/**
 * Global function to calculate the height of a gene track based on the number of genes and their transcripts.
 * This function returns a Map where the keys are gene identifiers of the form 'gene-0', 'gene-1' based on the
 * rendering order and the values are their respective Y positions.
 *
 * @param track
 * @param genes
 * @param settings
 * @param xax
 * @returns
 */
export function getGeneTrackHeight(
  track: IGeneTrack,
  genes: IGenomicFeature[],
  settings: ISeqBrowserSettings,
  xax: Axis
): Map<string, number> {
  const geneYMap: Map<string, number> = new Map()

  if (settings.genes.display === 'dense') {
    for (const [gi, gene] of genes.entries()) {
      //geneYMap.set(`gene-${gi}`, 0)
      for (const [ti, _] of (gene.children ?? []).entries()) {
        geneYMap.set(`gene-${gi}:transcript-${ti}`, 0)
      }
    }

    geneYMap.set(
      'height',
      track.displayOptions.transcripts.height + track.displayOptions.genes.gap
    )
  } else if (settings.genes.display === 'pack') {
    // pack

    const depths = range(0, xax.length).map(() => new Set<number>())
    let maxRow = 0
    for (const [gi, gene] of genes.entries()) {
      for (const [ti, t] of (gene.children ?? []).entries()) {
        let x1: number
        let x2: number

        // add an allowance for the label width
        if (settings.reverse) {
          x1 = Math.floor(xax.domainToRange(t.loc.end))
          x2 =
            Math.floor(xax.domainToRange(t.loc.start)) +
            (t.geneSymbol?.length ?? 0) * CHAR_W
        } else {
          x1 =
            Math.floor(xax.domainToRange(t.loc.start)) -
            (t.geneSymbol?.length ?? 0) * CHAR_W
          x2 = Math.floor(xax.domainToRange(t.loc.end))
        }

        x1 = Math.max(0, x1)
        x2 = Math.min(xax.length - 1, x2)

        // try all depths from 0 to maxDepth + 1 to find a free row
        for (let row = 0; row <= maxRow + 1; ++row) {
          // test every position from x1 to x2
          let found = true
          for (let x = x1; x <= x2; ++x) {
            if (depths[x]!.has(row)) {
              found = false
              break
            }
          }
          if (found) {
            // if we found a free row, add it to all positions
            for (let x = x1; x <= x2; ++x) {
              depths[x]!.add(row)
            }
            // and set the geneYMap for this transcript
            geneYMap.set(
              `gene-${gi}:transcript-${ti}`,
              row *
                (track.displayOptions.transcripts.height +
                  track.displayOptions.genes.gap)
            )
            // and update the maxRow if needed
            maxRow = Math.max(maxRow, row)
            break
          }
        }
      }
    }

    geneYMap.set(
      'height',
      maxRow *
        (track.displayOptions.transcripts.height +
          track.displayOptions.genes.gap)
    )
  } else {
    // full

    let idx = 0

    for (const [gi, gene] of genes.entries()) {
      // geneYMap.set(
      //   `gene-${gi}`,
      //   idx *
      //     (track.displayOptions.transcripts.height +
      //       track.displayOptions.genes.gap)
      // )

      for (const [ti, _] of (gene.children ?? []).entries()) {
        geneYMap.set(
          `gene-${gi}:transcript-${ti}`,
          idx *
            (track.displayOptions.transcripts.height +
              track.displayOptions.genes.gap)
        )
        ++idx
      }
    }

    geneYMap.set(
      'height',
      idx *
        (track.displayOptions.transcripts.height +
          track.displayOptions.genes.gap)
    )
  }

  //console.log('geneYMap', geneYMap)

  return geneYMap
}

// export function getGeneHeight(
//   track: IGeneTrack,
//   gene: IGenomicFeature,
//   settings: ISeqBrowserSettings
// ): number {
//   const transcriptCount = gene.children?.length ?? 0

//   return (
//     transcriptCount * track.displayOptions.transcripts.height +
//     track.displayOptions.genes.gap
//   )

//   const geneHeights: number[] = genes.map(gene => getGeneHeight(track, gene))

//   const geneY = cumsum([0, ...geneHeights])
// }

interface IProps extends IDivProps {
  db?: IGeneDBInfo | undefined
  track: IGeneTrack
  genes: IGenomicFeature[]
  titleHeight: number
  geneYMap: Map<string, number>
}

export function GenesTrackSvg({
  db,
  track,
  genes,
  titleHeight,
  geneYMap,
}: IProps) {
  const { settings } = useSeqBrowserSettings()
  const { xax } = useContext(LocationContext)

  return (
    <>
      {settings.titles.show && settings.titles.position === 'top' && (
        <g id="track-title" transform={`translate(0, ${titleHeight})`}>
          <text
            transform={`translate(${xax.length / 2}, 0)`}
            fill={COLOR_BLACK}
            dominantBaseline="baseline"
            fontSize="small"
            textAnchor="middle"
            //fontWeight="bold"
          >
            {track.name} ({db?.genome},{db?.version})
          </text>
        </g>
      )}

      {settings.genes.view === 'transcript' ? (
        <SimpleGeneTrackSvg
          track={track}
          genes={genes}
          titleHeight={titleHeight}
          geneYMap={geneYMap}
        />
      ) : (
        <GenesStructureTrackSvg
          track={track}
          genes={genes}
          titleHeight={titleHeight}
          geneYMap={geneYMap}
        />
      )}
    </>
  )
}

/**
 * Show genes in a simple view, i.e. with only the gene symbol and transcript as block.
 * @param param0
 * @returns
 */
export function SimpleGeneTrackSvg({
  track,
  genes,
  titleHeight,
  geneYMap,
}: IProps) {
  const { xax } = useContext(LocationContext)
  const { settings } = useSeqBrowserSettings()

  let x1: number
  let x2: number
  let w: number

  // const geneHeights: number[] = genes.map(gene =>
  //   getGeneHeight(track, gene, settings)
  // )

  // const geneY = cumsum([0, ...geneHeights])

  const sgn = sign(!settings.reverse)

  const arrowHy = track.displayOptions.arrows.y
  const arrowHx = track.displayOptions.arrows.x * sgn

  return (
    <>
      <defs>
        <polyline
          id={`${track.id}-arrow-left`}
          points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
          stroke="white"
          strokeWidth={track.displayOptions.arrows.stroke.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          id={`${track.id}-arrow-right`}
          points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
          stroke="white"
          strokeWidth={track.displayOptions.arrows.stroke.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </defs>

      <g transform={`translate(0, ${titleHeight + settings.genes.offset})`}>
        {genes.map((gene, gi) => {
          return (
            <g
              id={`gene-${gi}`}
              //transform={`translate(0, ${geneYMap.get(`gene-${gi}`) ?? 0})`}
              key={gi}
            >
              {gene.children?.map((transcript, ti) => {
                const transLoc = transcript.loc
                x1 = xax.domainToRange(transLoc.start)
                x2 = xax.domainToRange(transLoc.end)

                const arrowStart =
                  Math.round(
                    ((settings.reverse ? x2 : x1) +
                      track.displayOptions.arrows.gap) /
                      track.displayOptions.arrows.gap
                  ) * track.displayOptions.arrows.gap

                const arrowEnd =
                  Math.round(
                    (settings.reverse ? x1 : x2) /
                      track.displayOptions.arrows.gap
                  ) * track.displayOptions.arrows.gap

                const arrowXs = range(
                  arrowStart,
                  arrowEnd,
                  track.displayOptions.arrows.gap
                )

                const isCanonical =
                  settings.genes.canonical.isColored && transcript.isCanonical

                w = Math.abs(x2 - x1)

                return (
                  <g
                    id="transcript"
                    transform={`translate(0, ${geneYMap.get(`gene-${gi}:transcript-${ti}`) ?? 0})`}
                    key={ti}
                  >
                    <rect
                      id="transcript-block"
                      rx={w > 5 ? 2 : 0}
                      x={x1 - (settings.reverse ? w : 0)}
                      width={w}
                      height={track.displayOptions.transcripts.height}
                      fill={
                        isCanonical
                          ? settings.genes.canonical.stroke.color
                          : settings.genes.exons.fill.color
                      }
                    >
                      <title>{`${transcript.transcriptId}, strand ${transcript.loc.strand}`}</title>
                    </rect>

                    <g
                      transform={`translate(0, ${track.displayOptions.transcripts.height / 2})`}
                    >
                      {settings.genes.labels.show &&
                        settings.genes.display !== 'dense' && (
                          <text
                            transform={`translate(${Math.max(-settings.genes.labels.offset, x1 - settings.genes.labels.offset * sgn)}, 0)`}
                            //fill={track.displayOptions.labels.font.color}

                            fill={
                              isCanonical
                                ? settings.genes.canonical.stroke.color
                                : settings.genes.exons.fill.color
                            }
                            dominantBaseline="middle"
                            fontSize={settings.genes.labels.font.size}
                            textAnchor={settings.reverse ? 'start' : 'end'}
                            //fontWeight="bold"
                          >
                            {`${transcript.geneSymbol} ${settings.genes.labels.showGeneId ? `(${transcript.transcriptId})` : ''}`}
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
                                xlinkHref={`#${track.id}-arrow-${transcript.loc.strand === '+' ? 'right' : 'left'}`}
                                transform={`translate(${x},0)`}
                              />
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

/**
 * Show genes in a structure view, i.e. with transcripts and exons and arrows.
 * This is the default view for genes.
 * @param param0
 * @returns
 */
export function GenesStructureTrackSvg({
  track,
  genes,
  titleHeight,
  geneYMap,
}: IProps) {
  const { xax } = useContext(LocationContext)
  const { settings } = useSeqBrowserSettings()

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
  let w: number

  // const geneHeights: number[] = genes.map(gene =>
  //   getGeneHeight(track, gene, settings)
  // )

  // const geneY = cumsum([0, ...geneHeights])

  const sgn = sign(!settings.reverse)

  const arrowHy = track.displayOptions.arrows.y
  const arrowHx = track.displayOptions.arrows.x * sgn

  return (
    <>
      <defs>
        {settings.genes.arrows.style === 'lines' && (
          <>
            <polyline
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={settings.genes.canonical.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <polyline
              id={`${track.id}-arrow-right`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-right-canonical`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke={settings.genes.canonical.stroke.color}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {settings.genes.arrows.style === 'filled' && (
          <>
            <polygon
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.genes.canonical.stroke.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />

            <polygon
              id={`${track.id}-arrow-right`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-right-canonical`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.genes.canonical.stroke.color}
              fillOpacity={track.displayOptions.arrows.fill.alpha}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
          </>
        )}
      </defs>

      <g transform={`translate(0, ${titleHeight + settings.genes.offset})`}>
        {genes.map((gene, gi) => {
          // const geneLoc = feature.loc
          // x1 = xax.domainToRange(geneLoc.start)
          // x2 = xax.domainToRange(geneLoc.end)

          return (
            <g
              id={`gene-${gi}`}
              //transform={`translate(0, ${geneYMap.get(`gene-${gi}`) ?? 0})`}
              key={gi}
            >
              {gene.children?.map((transcript, ti) => {
                const transLoc = transcript.loc
                x1 = xax.domainToRange(transLoc.start)
                x2 = xax.domainToRange(transLoc.end)

                const exonCount = transcript.children?.length ?? 0

                const arrowStart =
                  Math.round(
                    ((settings.reverse ? x2 : x1) +
                      track.displayOptions.arrows.gap) /
                      track.displayOptions.arrows.gap
                  ) * track.displayOptions.arrows.gap

                const arrowEnd =
                  Math.round(
                    (settings.reverse ? x1 : x2) /
                      track.displayOptions.arrows.gap
                  ) * track.displayOptions.arrows.gap

                const arrowXs = range(
                  arrowStart,
                  arrowEnd,
                  track.displayOptions.arrows.gap
                )

                const isCanonical =
                  settings.genes.canonical.isColored && transcript.isCanonical

                w = Math.abs(x2 - x1)

                return (
                  <g
                    id="transcript"
                    transform={`translate(0, ${geneYMap.get(`gene-${gi}:transcript-${ti}`) ?? 0})`}
                    key={ti}
                  >
                    <rect
                      id="transcript-block"
                      x={x1 - (settings.reverse ? w : 0)}
                      width={w}
                      height={track.displayOptions.transcripts.height}
                      fill="white"
                    >
                      <title>{`${transcript.transcriptId}, strand ${transcript.loc.strand}`}</title>
                    </rect>

                    <g
                      transform={`translate(0, ${track.displayOptions.transcripts.height / 2})`}
                    >
                      {settings.genes.endArrows.show &&
                        settings.genes.display !== 'dense' &&
                        (!settings.genes.endArrows.firstTranscriptOnly ||
                          ti === 0) && (
                          <g
                            id="end-arrow"
                            transform={`translate(${gene.loc.strand === '+' ? x1 : x2}, 0) scale(${gene.loc.strand === '+' ? 1 : -1},1)`}
                          >
                            <polygon
                              points={`0,0 0,-10 ${10 * sgn},-10 ${10 * sgn},-14 ${15 * sgn},-10 ${10 * sgn},-6 ${10 * sgn},-10 0,-10`}
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

                      {settings.genes.labels.show &&
                        settings.genes.display !== 'dense' && (
                          <text
                            transform={`translate(${Math.max(-settings.genes.labels.offset, x1 - settings.genes.labels.offset * sgn)}, 0)`}
                            //fill={track.displayOptions.labels.font.color}

                            fill={
                              isCanonical
                                ? settings.genes.canonical.stroke.color
                                : settings.genes.exons.fill.color
                            }
                            dominantBaseline="middle"
                            fontSize={settings.genes.labels.font.size}
                            textAnchor={settings.reverse ? 'start' : 'end'}
                            //fontWeight="bold"
                          >
                            {`${transcript.geneSymbol} ${settings.genes.labels.showGeneId ? `(${transcript.transcriptId})` : ''}`}
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
                                xlinkHref={`#${track.id}-arrow-${transcript.loc.strand === '+' ? 'right' : 'left'}${isCanonical ? '-canonical' : ''}`}
                                transform={`translate(${x},0)`}
                              />
                            )
                          })}
                        </g>
                      )}

                      {settings.genes.stroke.show && (
                        <line
                          id="transcript-line"
                          x1={x1}
                          x2={x2}
                          stroke={
                            isCanonical
                              ? settings.genes.canonical.stroke.color
                              : settings.genes.stroke.color
                          }
                          strokeWidth={settings.genes.stroke.width}
                        />
                      )}

                      {settings.genes.exons.show && (
                        <g
                          id="exons"
                          transform={`translate(0, ${-track.displayOptions.transcripts.height / 2})`}
                        >
                          {transcript.children?.map((exon, ei) => {
                            const exonLoc = exon.loc
                            x1 = xax.domainToRange(exonLoc.start)
                            x2 = xax.domainToRange(exonLoc.end)
                            w = Math.abs(x2 - x1)
                            return (
                              <rect
                                id="exon"
                                rx={w > 5 ? 2 : 0}
                                x={x1 - (settings.reverse ? w : 0)}
                                width={w}
                                height={track.displayOptions.transcripts.height}
                                fill={
                                  isCanonical
                                    ? settings.genes.canonical.stroke.color
                                    : settings.genes.exons.fill.color
                                }
                                fillOpacity={settings.genes.exons.fill.alpha}
                                stroke="none"
                                key={ei}
                              >
                                <title>{`${exon.transcriptId}, strand ${exon.loc.strand}, exon ${exon.loc.strand === '+' ? ei + 1 : exonCount - ei} of ${exonCount}`}</title>
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
