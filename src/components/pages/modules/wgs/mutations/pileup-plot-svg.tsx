import { forwardRef, useMemo, useRef, useState } from 'react'

import { type IElementProps } from '@interfaces/element-props'

import { COLOR_BLACK } from '@/consts'
import type { IDNA } from '@/lib/genomic/dna'
import type { GenomicLocation } from '@/lib/genomic/genomic'
import type { IPos } from '@interfaces/pos'
import { range } from '@lib/math/range'

const margin = { top: 100.5, right: 20.5, bottom: 20, left: 20.5 }

export interface IPileupProps {
  border: {
    show: boolean
    color: string
  }

  index: {
    show: boolean
  }

  cmap: string
  cmaps: {
    None: object
    COO: {
      ABC: string
      GCB: string
      UNCLASS: string
      UNC: string
      U: string
      NA: string
    }
    Lymphgen: {
      MCD: string
      BN2: string
      N1: string
      EZB: string
      ST2: string
      A53: string
      Other: string
    }
  }
  chrPrefix: {
    show: boolean
  }
}

export const DEFAULT_PILEUP_PROPS: IPileupProps = {
  border: {
    show: true,
    color: COLOR_BLACK,
  },

  index: {
    show: true,
  },

  cmaps: {
    None: {},
    COO: {
      ABC: 'royalblue',
      GCB: 'orange',
      UNC: 'seagreen',
      UNCLASS: 'seagreen',
      U: 'seagreen',
      NA: 'gray',
    },
    Lymphgen: {
      MCD: 'cornflowerblue',
      BN2: 'mediumorchid',
      N1: 'mediumseagreen',
      EZB: 'peru',
      ST2: 'firebrick',
      A53: COLOR_BLACK,
      Other: 'gainsboro',
    },
  },
  cmap: 'COO',
  chrPrefix: {
    show: true,
  },
}

export interface IMutation {
  chr: string
  start: number
  end: number
  ref: string
  tum: string
  tAltCount: number
  tDepth: number
  type: string
  vaf: number
  dataset: string
  sample: string
}

// export interface IMutationDataset {
//   name: string
//   use: boolean
// }

export interface IMutationSample {
  id: number
  uuid: string
  name: string
  coo: string
  lymphgen: string
  dataset: string
  sampleType: string
  institution: string
  pairedNormalDna: number
}

export interface IMutationDataset {
  id: number // a uuid to uniquely identify the database
  uuid: string // a public id for the database
  name: string // a human readable name for the database
  assembly: string // the genome assembly of the mutations
  description: string // a description of the database to give more details

  //datasets: IMutationDataset[]
  samples: IMutationSample[]
}

export interface IPileupResults {
  location: GenomicLocation
  //mutationDB: IMutationDB
  pileup: IMutation[][]
}

const TOOLTIP_OFFSET = 20

const BASE_W = 16
const HALF_BASE_W = 0.5 * BASE_W
const BASE_H = 20
const HALF_BASE_H = 0.5 * BASE_H

export interface IPileupPlot {
  dna: IDNA
  pileupResults: IPileupResults | null
}

export interface IMotifPattern {
  name: string
  regex: RegExp
  bgColor: string
  bgOpacity: number
  color: string
  show: boolean
}

export interface ITooltip {
  pos: IPos
  mutation: IMutation
}

interface IProps extends IElementProps {
  plot: IPileupPlot | null

  sampleMap: Map<string, IMutationSample>
  motifPatterns: IMotifPattern[]
  displayProps?: IPileupProps
  colorMap?: Map<string, string>
}

export const PileupPlotSvg = forwardRef<SVGElement, IProps>(
  function PileupPlotSvg(
    { plot, sampleMap, motifPatterns, colorMap, displayProps }: IProps,
    svgRef
  ) {
    const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

    const tooltipRef = useRef<HTMLDivElement>(null)
    const highlightRef = useRef<HTMLSpanElement>(null)

    const _displayProps: IPileupProps = {
      ...DEFAULT_PILEUP_PROPS,
      ...displayProps,
    }

    const svg = useMemo(() => {
      if (!plot) {
        return null
      }

      // need to split multiple snps and format insertions deletions

      let maxH = 0
      const maxHeightMap = new Map<number, number>()

      plot.pileupResults?.pileup.forEach((p, pi) => {
        maxH = Math.max(maxH, p.length)
        maxHeightMap.set(pi, p.length)
      })

      //console.log(maxHeightMap)

      const innerWidth = plot.dna.seq.length * BASE_W
      const innerHeight = (1 + maxH) * BASE_H
      const width = innerWidth + margin.left + margin.right
      const height = innerHeight + margin.top + margin.bottom

      const bgColors = Array(plot.dna.seq.length).fill('none')
      const fgColors = Array(plot.dna.seq.length).fill(COLOR_BLACK)

      // whether to show things like AID motifs or not

      motifPatterns.forEach((motifPattern) => {
        if (motifPattern.show) {
          const matches = [...plot.dna.seq.matchAll(motifPattern.regex)]

          matches.forEach((match) => {
            range(match[0].length).forEach((i) => {
              bgColors[match.index + i] = motifPattern.bgColor
              fgColors[match.index + i] = motifPattern.color
            })
          })
        }
      })

      // matching is case insensitive

      return (
        <svg
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          fontFamily="Arial, Helvetica, sans-serif"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ref={svgRef}
          width={width} //* _displayProps.scale}
          height={height} //* _displayProps.scale}
          viewBox={`0 0 ${width} ${height}`}
          //shapeRendering={SVG_CRISP_EDGES}
          className="absolute"
        >
          <g
            transform={`translate(${margin.left - HALF_BASE_W}, ${margin.top})`}
          >
            {plot.dna.seq.split('').map((_base, bi) => (
              <rect
                x={bi * BASE_W}
                y={-HALF_BASE_H}
                width={BASE_W}
                height={BASE_H}
                key={bi}
                rx={2}
                fill={bgColors[bi]}
                fillOpacity={0.1}
              />
            ))}
          </g>

          {_displayProps.index.show && (
            <g transform={`translate(${margin.left}, ${margin.top - BASE_H})`}>
              {plot.dna.seq.split('').map((_, bi) => (
                <text
                  x={bi * BASE_W}
                  y={1}
                  key={bi}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize="x-small"
                >
                  {bi + 1}
                </text>
              ))}
            </g>
          )}

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {plot.dna.seq.split('').map((base, bi) => (
              <text
                x={bi * BASE_W}
                y={1}
                key={bi}
                textAnchor="middle"
                alignmentBaseline="middle"
                //fontWeight="bold"
                fill={fgColors[bi]}
              >
                {base}
              </text>
            ))}
          </g>

          {_displayProps.border.show && (
            <g
              transform={`translate(${margin.left - HALF_BASE_W}, ${
                margin.top
              })`}
            >
              <line
                x1={0}
                y1={-HALF_BASE_H}
                y2={-HALF_BASE_H}
                x2={innerWidth}
                stroke={_displayProps.border.color}
                strokeWidth="1"
              />
              <line
                x1={0}
                y1={HALF_BASE_H}
                y2={HALF_BASE_H}
                x2={innerWidth}
                stroke={_displayProps.border.color}
                strokeWidth="1"
              />
            </g>
          )}

          <g transform={`translate(${margin.left}, ${margin.top + BASE_H})`}>
            {plot.pileupResults?.pileup.map((mp, mpi) => {
              const x = mpi * BASE_W

              return (
                <g transform={`translate(${x}, 0)`} key={mpi}>
                  {mp.map((m, mi) => {
                    let h = BASE_H * mi

                    h = m.type.includes('INS')
                      ? Math.max(
                          maxHeightMap.get(mpi) || h,
                          maxHeightMap.get(mpi + 1) || h
                        ) * BASE_H
                      : h

                    return (
                      <text
                        x={m.type.includes('INS') ? HALF_BASE_W : 0}
                        y={h}
                        key={mi}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        //fontWeight="bold"
                        className="cursor-pointer"
                        fill={
                          colorMap && colorMap.has(m.sample)
                            ? colorMap.get(m.sample)
                            : COLOR_BLACK
                        }
                        onMouseEnter={() =>
                          setToolTipInfo({
                            pos: {
                              x:
                                margin.left +
                                x +
                                (m.type.includes('INS') ? HALF_BASE_W : 0) -
                                HALF_BASE_W,
                              y: margin.top + BASE_H + h - HALF_BASE_H,
                            },
                            mutation: m,
                          })
                        }
                        onMouseLeave={() => setToolTipInfo(null)}
                      >
                        {m.tum[0]}
                      </text>
                    )
                  })}
                </g>
              )
            })}
          </g>
        </svg>
      )
    }, [plot, motifPatterns, _displayProps])

    return (
      <>
        {svg}

        {toolTipInfo && (
          <>
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
              style={{
                left: toolTipInfo.pos.x + TOOLTIP_OFFSET,
                top: toolTipInfo.pos.y + TOOLTIP_OFFSET,
              }}
            >
              <p className="font-semibold">
                {`${sampleMap.get(toolTipInfo.mutation.sample)!.name} (${sampleMap.get(toolTipInfo.mutation.sample)!.coo}, ${sampleMap.get(toolTipInfo.mutation.sample)!.lymphgen})`}
              </p>
              <p>Type: {toolTipInfo.mutation.type.split(':')[1]}</p>
              <p>
                {`Loc: ${toolTipInfo.mutation.chr}:${toolTipInfo.mutation.start.toLocaleString()}-${toolTipInfo.mutation.end.toLocaleString()}`}
              </p>
              <p>
                {`ref: ${toolTipInfo.mutation.ref}, tumor: ${toolTipInfo.mutation.tum.replace('^', '')}`}
              </p>
            </div>

            <span
              ref={highlightRef}
              className="pointer-events-none absolute z-40 border-black"
              style={{
                top: `${toolTipInfo.pos.y - 1}px`,
                left: `${toolTipInfo.pos.x - 1}px`,
                width: `${BASE_W + 1}px`,
                height: `${BASE_H + 1}px`,
                borderWidth: `1px`,
              }}
            />
          </>
        )}
      </>
    )
  }
)
