import { useMemo, useRef, useState } from 'react'

import { BaseSvg } from '@/components/base-svg'
import { ISVGProps } from '@/interfaces/svg-props'
import type { IPos } from '@interfaces/pos'
import { COLOR_BLACK } from '@lib/color/color'
import { formatChr, type IDNA } from '@lib/genomic/dna'
import {
  locStr,
  type GenomicLocation,
  type IGenomicLocation,
} from '@lib/genomic/genomic'
import { range } from '@lib/math/range'
import { IPileupProps, useMutations } from './mutation-store'

const MARGIN = { top: 100.5, right: 20.5, bottom: 20.5, left: 20.5 }

export interface IMutation extends IGenomicLocation {
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
  //id: number
  publicId: string
  name: string
  coo: string
  lymphgen: string
  dataset: string
  sampleType: string
  institution: string
  pairedNormalDna: number
}

export interface IMutationDataset {
  //id: number // a uuid to uniquely identify the database
  publicId: string // a public id for the database
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

const TOOLTIP_OFFSET = 2

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

interface IProps extends ISVGProps {
  plot: IPileupPlot | null

  sampleMap: Map<string, IMutationSample>
  motifPatterns: IMotifPattern[]
  displayProps?: IPileupProps
  colorMap?: Map<string, string>
}

export function PileupPlotSvg({
  ref,
  plot,
  sampleMap,
  motifPatterns,
  colorMap,
  displayProps,
}: IProps) {
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const tooltipRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)

  const { settings } = useMutations()

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
    const width = innerWidth + MARGIN.left + MARGIN.right
    const height = innerHeight + MARGIN.top + MARGIN.bottom

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
      <BaseSvg
        ref={ref}
        width={width} //* settings.scale}
        height={height} //* settings.scale}
        scale={settings.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute z-20"
      >
        <g
          transform={`translate(${MARGIN.left + width * 0.5}, ${MARGIN.top * 0.5})`}
        >
          <text
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="small"
            fontWeight="bold"
          >
            {plot.pileupResults ? locStr(plot.pileupResults.location) : ''}
          </text>
        </g>

        <g transform={`translate(${MARGIN.left - HALF_BASE_W}, ${MARGIN.top})`}>
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

        {settings.index.show && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top - BASE_H})`}>
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

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
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

        {settings.border.show && (
          <g
            transform={`translate(${MARGIN.left - HALF_BASE_W}, ${MARGIN.top})`}
          >
            <line
              x1={0}
              y1={-HALF_BASE_H}
              y2={-HALF_BASE_H}
              x2={innerWidth}
              stroke={settings.border.color}
              strokeWidth="1"
            />
            <line
              x1={0}
              y1={HALF_BASE_H}
              y2={HALF_BASE_H}
              x2={innerWidth}
              stroke={settings.border.color}
              strokeWidth="1"
            />
          </g>
        )}

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top + BASE_H})`}>
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

                  let color = COLOR_BLACK

                  if (displayProps?.cmap === 'SNP') {
                    // color by snp type

                    if (m.type.includes('DEL')) {
                      color = colorMap?.get('DEL') ?? COLOR_BLACK
                    } else if (m.type.includes('INS')) {
                      color = colorMap?.get('INS') ?? COLOR_BLACK
                    } else {
                      color = colorMap?.get(m.tum) ?? COLOR_BLACK
                    }
                  } else {
                    color = colorMap?.get(m.sample) ?? COLOR_BLACK
                  }

                  return (
                    <text
                      x={m.type.includes('INS') ? HALF_BASE_W : 0}
                      y={h + 1}
                      key={mi}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      //fontWeight="bold"
                      className="cursor-pointer"
                      fill={color}
                      onMouseEnter={() =>
                        setToolTipInfo({
                          pos: {
                            x:
                              (MARGIN.left +
                                x +
                                (m.type.includes('INS') ? HALF_BASE_W : 0) -
                                HALF_BASE_W) *
                              settings.scale,
                            y:
                              (MARGIN.top + BASE_H + h - HALF_BASE_H) *
                              settings.scale,
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
      </BaseSvg>
    )
  }, [plot, motifPatterns, settings])

  return (
    <>
      {svg}

      {settings.showTooltips && toolTipInfo && (
        <>
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
            style={{
              left:
                toolTipInfo.pos.x + BASE_W * settings.scale + TOOLTIP_OFFSET,
              top: toolTipInfo.pos.y + BASE_H * settings.scale + TOOLTIP_OFFSET,
            }}
          >
            <p className="font-semibold">
              {`${sampleMap.get(toolTipInfo.mutation.sample)!.name} (${sampleMap.get(toolTipInfo.mutation.sample)!.coo}, ${sampleMap.get(toolTipInfo.mutation.sample)!.lymphgen})`}
            </p>
            <p>Type: {toolTipInfo.mutation.type.split(':')[1]}</p>
            <p>
              {`Loc: ${displayProps?.chrPrefix.show ? formatChr(toolTipInfo.mutation.chr) : toolTipInfo.mutation.chr}:${toolTipInfo.mutation.start.toLocaleString()}-${toolTipInfo.mutation.end.toLocaleString()}`}
            </p>
            <p>
              {`ref: ${toolTipInfo.mutation.ref}, tumor: ${toolTipInfo.mutation.tum.replace('^', '')}`}
            </p>
          </div>

          <span
            ref={highlightRef}
            className="pointer-events-none absolute z-10 bg-muted border-none rounded-sm"
            style={{
              top: `${toolTipInfo.pos.y - 1}px`,
              left: `${toolTipInfo.pos.x}px`,
              width: `${BASE_W * settings.scale + 1}px`,
              height: `${BASE_H * settings.scale + 1}px`,
              borderWidth: `1px`,
            }}
          />
        </>
      )}
    </>
  )
}
