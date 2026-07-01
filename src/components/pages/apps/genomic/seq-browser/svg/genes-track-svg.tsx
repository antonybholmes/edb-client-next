import { type IDivProps } from '@/interfaces/div-props'

import type { Axis } from '@/components/plot/axis'

import { range } from '@/lib/math/range'
import { sign } from '@/lib/math/sign'
import { useContext } from 'react'

import { useGenomes } from '@/components/edb/genome'
import { SvgText } from '@/components/plot/svg-text'
import { IGenomicFeature } from '@/lib/genomic/genomic-feature'
import {
  useSeqBrowserSettings,
  type ISeqBrowserSettings,
} from '../seq-browser-settings'
import { LocationContext, type IGeneTrack } from '../tracks-provider'

const CHAR_W = 8

// interface IGeneDBInfo {
//   genome: string
//   version: string
// }

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
  genes: IGenomicFeature[],
  settings: ISeqBrowserSettings,
  xax: Axis
): Map<string, number> {
  const geneYMap: Map<string, number> = new Map()

  if (settings.tracks.genes.display === 'dense') {
    for (const [gi, gene] of genes.entries()) {
      //geneYMap.set(`gene-${gi}`, 0)
      for (const ti of range(
        0,
        gene.children?.filter((f) => f.type === 'transcript').length ?? 0
      )) {
        geneYMap.set(`gene-${gi}:transcript-${ti}`, 0)
      }
    }

    geneYMap.set(
      'height',
      settings.tracks.genes.transcripts.height + settings.tracks.genes.gap
    )
  } else if (settings.tracks.genes.display === 'pack') {
    // pack

    const depths = range(0, xax.length).map(() => new Set<number>())
    let maxRow = 0
    for (const [gi, gene] of genes.entries()) {
      for (const [ti, t] of (
        gene.children?.filter((f) => f.type === 'transcript') ?? []
      ).entries()) {
        let x1: number
        let x2: number

        // add an allowance for the label width
        if (settings.reverse) {
          x1 = Math.floor(xax.domainToRange(t.loc.end))
          x2 =
            Math.floor(xax.domainToRange(t.loc.start)) +
            (t.symbol?.length ?? 0) * CHAR_W
        } else {
          x1 =
            Math.floor(xax.domainToRange(t.loc.start)) -
            (t.symbol?.length ?? 0) * CHAR_W
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
                (settings.tracks.genes.transcripts.height +
                  settings.tracks.genes.gap)
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
        (settings.tracks.genes.transcripts.height + settings.tracks.genes.gap)
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

      for (const ti of range(
        0,
        gene.children?.filter((f) => f.type === 'transcript').length ?? 0
      )) {
        geneYMap.set(
          `gene-${gi}:transcript-${ti}`,
          idx *
            (settings.tracks.genes.transcripts.height +
              settings.tracks.genes.gap)
        )
        ++idx
      }
    }

    geneYMap.set(
      'height',
      idx *
        (settings.tracks.genes.transcripts.height + settings.tracks.genes.gap)
    )
  }

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
  track: IGeneTrack
  titleHeight: number
  geneYMap: Map<string, number>
}

export function GenesTrackSvg({ track, titleHeight, geneYMap }: IProps) {
  const { settings } = useSeqBrowserSettings()
  const { xax } = useContext(LocationContext)

  const { gtf } = useGenomes()

  return (
    <>
      {settings.titles.show && settings.titles.position === 'top' && (
        <g id="track-title" transform={`translate(0, ${titleHeight})`}>
          <SvgText
            transform={`translate(${xax.length / 2}, 0)`}
            //dominantBaseline="middle"
            textAnchor="middle"
            //fontWeight="bold"
            font={settings.tracks.genes.labels.text}
          >
            {/* {track.name} ({db?.genome},{db?.version}) */}
            {track.name} ({gtf?.name})
          </SvgText>
        </g>
      )}

      {settings.tracks.genes.view === 'transcript' ? (
        <SimpleGeneTrackSvg
          track={track}
          titleHeight={titleHeight}
          geneYMap={geneYMap}
        />
      ) : (
        <GenesStructureTrackSvg
          track={track}
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
export function SimpleGeneTrackSvg({ track, titleHeight, geneYMap }: IProps) {
  const { xax, genes } = useContext(LocationContext)
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

      <g
        transform={`translate(0, ${titleHeight + settings.tracks.genes.offset})`}
      >
        {genes.map((gene, gi) => {
          return (
            <g
              id={`gene-${gi}`}
              //transform={`translate(0, ${geneYMap.get(`gene-${gi}`) ?? 0})`}
              key={gi}
            >
              {gene.children
                ?.filter((f) => f.type === 'transcript')
                .map((transcript, ti) => {
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
                    settings.tracks.genes.canonical.isColored &&
                    transcript.isCanonical

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
                        height={settings.tracks.genes.transcripts.height}
                        fill={
                          isCanonical
                            ? settings.tracks.genes.canonical.fill.value
                            : settings.tracks.genes.exons.fill.value
                        }
                      >
                        <title>{`${transcript.transcript}, strand ${transcript.loc.strand}`}</title>
                      </rect>

                      <g
                        transform={`translate(0, ${settings.tracks.genes.transcripts.height / 2})`}
                      >
                        {settings.tracks.genes.labels.text.show &&
                          settings.tracks.genes.display !== 'dense' && (
                            <SvgText
                              transform={`translate(${Math.max(-settings.tracks.genes.labels.offset, x1 - settings.tracks.genes.labels.offset * sgn)}, 0)`}
                              //fill={track.displayOptions.labels.font.color}

                              fill={
                                isCanonical
                                  ? settings.tracks.genes.canonical.fill.value
                                  : settings.tracks.genes.exons.fill.value
                              }
                              dominantBaseline="middle"
                              font={settings.tracks.genes.labels.text}
                              textAnchor={settings.reverse ? 'start' : 'end'}
                              //fontWeight="bold"
                            >
                              {`${transcript.symbol} ${settings.tracks.genes.labels.showGeneId ? `(${transcript.transcript})` : ''}`}
                              <title>{`${transcript.symbol} (${transcript.transcript})`}</title>
                            </SvgText>
                          )}

                        {settings.tracks.genes.arrows.show && (
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
  titleHeight,
  geneYMap,
}: IProps) {
  const { xax, genes } = useContext(LocationContext)
  const { settings } = useSeqBrowserSettings()

  // const genesQuery = useQuery({
  //   queryKey: ['db'],
  //   queryFn: async () => {
  //     const res = await httpFetch.getJson(`${API_GENES_DB_URL}/${genome}`)

  //     return res.data
  //   },
  // })

  // we need this here to calculate the height of the track rather than
  // having the query inside the svg component
  // const info: IGeneDBInfo = genesQuery.data
  //   ? genesQuery.data
  //   : DEFAULT_DB_VERSION

  let x1: number
  let x2: number
  let w: number

  // const geneY = cumsum([0, ...geneHeights])

  const sgn = sign(!settings.reverse)

  const arrowHy = track.displayOptions.arrows.y
  const arrowHx = track.displayOptions.arrows.x * sgn

  return (
    <>
      <defs>
        {settings.tracks.genes.arrows.style === 'lines' && (
          <>
            <polyline
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.value}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke={settings.tracks.genes.canonical.fill.value}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <polyline
              id={`${track.id}-arrow-right`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke={track.displayOptions.arrows.stroke.value}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              id={`${track.id}-arrow-right-canonical`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke={settings.tracks.genes.canonical.fill.value}
              strokeWidth={track.displayOptions.arrows.stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {settings.tracks.genes.arrows.style === 'filled' && (
          <>
            <polygon
              id={`${track.id}-arrow-left`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.value}
              fillOpacity={track.displayOptions.arrows.fill.opacity}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-left-canonical`}
              points={`${arrowHx},${-arrowHy} ${-arrowHx},0 ${arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.tracks.genes.canonical.fill.value}
              fillOpacity={track.displayOptions.arrows.fill.opacity}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />

            <polygon
              id={`${track.id}-arrow-right`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke="none"
              fill={track.displayOptions.arrows.fill.value}
              fillOpacity={track.displayOptions.arrows.fill.opacity}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
            <polygon
              id={`${track.id}-arrow-right-canonical`}
              points={`${-arrowHx},${-arrowHy} ${arrowHx},0 ${-arrowHx},${arrowHy}`}
              stroke="none"
              fill={settings.tracks.genes.canonical.fill.value}
              fillOpacity={track.displayOptions.arrows.fill.opacity}
              //strokeLinecap="round"
              //strokeLinejoin="round"
            />
          </>
        )}
      </defs>

      <g
        transform={`translate(0, ${titleHeight + settings.tracks.genes.offset})`}
      >
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
              {gene.children
                ?.filter(
                  (f) =>
                    f.type === 'transcript' &&
                    (!settings.tracks.genes.canonical.only ||
                      (f.isCanonical ?? false))
                )
                .map((transcript, ti) => {
                  const transLoc = transcript.loc
                  x1 = xax.domainToRange(transLoc.start)
                  x2 = xax.domainToRange(transLoc.end)

                  const exonCount =
                    transcript.children?.filter((f) => f.type === 'exon')
                      .length ?? 0

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
                    settings.tracks.genes.canonical.isColored &&
                    (transcript.isCanonical ?? false)

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
                        height={settings.tracks.genes.transcripts.height}
                        fill="white"
                      >
                        <title>{`${transcript.transcript}, strand ${transcript.loc.strand}`}</title>
                      </rect>

                      <g
                        transform={`translate(0, ${settings.tracks.genes.transcripts.height / 2})`}
                      >
                        {settings.tracks.genes.endArrows.show &&
                          settings.tracks.genes.display !== 'dense' &&
                          (!settings.tracks.genes.endArrows
                            .firstTranscriptOnly ||
                            ti === 0) && (
                            <g
                              id="end-arrow"
                              transform={`translate(${gene.loc.strand === '+' ? x1 : x2}, 0) scale(${gene.loc.strand === '+' ? 1 : -1},1)`}
                            >
                              <polygon
                                points={`0,0 0,-10 ${10 * sgn},-10 ${10 * sgn},-14 ${15 * sgn},-10 ${10 * sgn},-6 ${10 * sgn},-10 0,-10`}
                                fill={
                                  isCanonical
                                    ? settings.tracks.genes.canonical.fill.value
                                    : settings.tracks.genes.endArrows.fill.value
                                }
                                fillOpacity={
                                  settings.tracks.genes.endArrows.fill.opacity
                                }
                                stroke={
                                  isCanonical
                                    ? settings.tracks.genes.canonical.fill.value
                                    : settings.tracks.genes.endArrows.stroke
                                        .value
                                }
                              />
                            </g>
                          )}

                        {settings.tracks.genes.labels.text.show &&
                          settings.tracks.genes.display !== 'dense' && (
                            <SvgText
                              transform={`translate(${Math.max(-settings.tracks.genes.labels.offset, x1 - settings.tracks.genes.labels.offset * sgn)}, 0)`}
                              //fill={track.displayOptions.labels.font.color}

                              fill={
                                isCanonical
                                  ? settings.tracks.genes.canonical.fill.value
                                  : settings.tracks.genes.exons.fill.value
                              }
                              dominantBaseline="middle"
                              font={settings.tracks.genes.labels.text}
                              textAnchor={settings.reverse ? 'start' : 'end'}
                              //fontWeight="bold"
                            >
                              {`${transcript.symbol} ${settings.tracks.genes.labels.showGeneId ? `(${transcript.transcript})` : ''}`}
                              <title>{`${transcript.symbol} (${transcript.transcript})`}</title>
                            </SvgText>
                          )}

                        {settings.tracks.genes.arrows.show && (
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

                        {settings.tracks.genes.stroke.show && (
                          <line
                            id="transcript-line"
                            x1={x1}
                            x2={x2}
                            stroke={
                              isCanonical
                                ? settings.tracks.genes.canonical.fill.value
                                : settings.tracks.genes.stroke.value
                            }
                            strokeWidth={settings.tracks.genes.stroke.width}
                          />
                        )}

                        <UTRSvg
                          transcript={transcript}
                          xax={xax}
                          exonCount={exonCount}
                          isCanonical={isCanonical}
                        />

                        <CDSSvg
                          transcript={transcript}
                          xax={xax}
                          exonCount={exonCount}
                          isCanonical={isCanonical}
                        />

                        <ExonsSvg
                          transcript={transcript}
                          xax={xax}
                          exonCount={exonCount}
                          isCanonical={isCanonical}
                        />
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

function ExonsSvg({
  transcript,
  xax,
  exonCount,
  isCanonical,
}: {
  transcript: IGenomicFeature
  xax: Axis
  exonCount: number
  isCanonical: boolean
}) {
  const { settings } = useSeqBrowserSettings()

  if (!settings.tracks.genes.exons.show) return null

  return (
    <g
      id="exons"
      transform={`translate(0, ${-settings.tracks.genes.exons.height / 2})`}
    >
      {transcript.children
        ?.filter((f) => f.type === 'exon')
        .map((exon, ei) => {
          const exonLoc = exon.loc
          const x1 = xax.domainToRange(exonLoc.start)
          const x2 = xax.domainToRange(exonLoc.end)
          const w = Math.abs(x2 - x1)
          return (
            <rect
              id="exon"
              rx={w > 5 ? 2 : 0}
              x={x1 - (settings.reverse ? w : 0)}
              width={w}
              height={settings.tracks.genes.exons.height}
              fill={
                isCanonical
                  ? settings.tracks.genes.canonical.fill.value
                  : settings.tracks.genes.exons.fill.value
              }
              fillOpacity={settings.tracks.genes.exons.fill.opacity}
              stroke="none"
              key={ei}
            >
              <title>{`${exon.transcript}, strand ${exon.loc.strand}, exon ${exon.loc.strand === '+' ? ei + 1 : exonCount - ei} of ${exonCount}`}</title>
            </rect>
          )
        })}
    </g>
  )
}

function CDSSvg({
  transcript,
  xax,
  exonCount,
  isCanonical,
}: {
  transcript: IGenomicFeature
  xax: Axis
  exonCount: number
  isCanonical: boolean
}) {
  const { settings } = useSeqBrowserSettings()

  if (!settings.tracks.genes.cds.show) return null

  return (
    <g
      id="cds"
      transform={`translate(0, ${-settings.tracks.genes.cds.height / 2})`}
    >
      {transcript.children
        ?.filter((f) => f.type === 'cds')
        .map((cds, ei) => {
          const cdsLoc = cds.loc
          const x1 = xax.domainToRange(cdsLoc.start)
          const x2 = xax.domainToRange(cdsLoc.end)
          const w = Math.abs(x2 - x1)
          return (
            <rect
              id="cds"
              rx={w > 5 ? 2 : 0}
              x={x1 - (settings.reverse ? w : 0)}
              width={w}
              height={settings.tracks.genes.cds.height}
              fill={
                isCanonical
                  ? settings.tracks.genes.canonical.fill.value
                  : settings.tracks.genes.cds.fill.value
              }
              fillOpacity={settings.tracks.genes.cds.fill.opacity}
              stroke="none"
              key={ei}
            >
              <title>{`${cds.transcript}, strand ${cds.loc.strand}, cds ${cds.loc.strand === '+' ? ei + 1 : exonCount - ei} of ${exonCount}`}</title>
            </rect>
          )
        })}
    </g>
  )
}

function UTRSvg({
  transcript,
  xax,
  exonCount,
  isCanonical,
}: {
  transcript: IGenomicFeature
  xax: Axis
  exonCount: number
  isCanonical: boolean
}) {
  const { settings } = useSeqBrowserSettings()

  if (!settings.tracks.genes.utrs.show) return null

  return (
    <g
      id="utrs"
      transform={`translate(0, ${-settings.tracks.genes.utrs.height / 2})`}
    >
      {transcript.children
        ?.filter((f) => f.type === 'utr')
        .map((utr, ei) => {
          const utrLoc = utr.loc
          const x1 = xax.domainToRange(utrLoc.start)
          const x2 = xax.domainToRange(utrLoc.end)
          const w = Math.abs(x2 - x1)
          return (
            <rect
              id="utr"
              rx={w > 5 ? 2 : 0}
              x={x1 - (settings.reverse ? w : 0)}
              width={w}
              height={settings.tracks.genes.utrs.height}
              fill={
                isCanonical
                  ? settings.tracks.genes.canonical.fill.value
                  : settings.tracks.genes.utrs.fill.value
              }
              fillOpacity={settings.tracks.genes.utrs.fill.opacity}
              stroke="none"
              key={ei}
            >
              <title>{`${utr.transcript}, strand ${utr.loc.strand}, utr ${utr.loc.strand === '+' ? ei + 1 : exonCount - ei} of ${exonCount}`}</title>
            </rect>
          )
        })}
    </g>
  )
}
