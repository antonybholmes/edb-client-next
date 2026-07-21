import { Axis } from '@/components/plot/axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgText } from '@/components/plot/svg-text'
import { useMergeRefs } from '@/hooks/merge-refs'
import type { IPos } from '@/interfaces/pos'
import type { ISVGProps } from '@/interfaces/svg-props'
import { formatChr } from '@/lib/genomic/dna'
import { locStr } from '@/lib/genomic/genomic'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  useDatasets,
  type IVariantDataset,
  type IVariantSample,
} from './dataset-store'
import { BASE_H, BASE_W, DNASvg, HALF_BASE_H, HALF_BASE_W } from './dna-svg'
import { MotifsSvg } from './motifs-svg'
import {
  pileup,
  sortByCOO,
  sortByDataset,
  sortByLymphgen,
  sortByVariantType,
} from './pileup'
import { PileupLegendSvg } from './pileup-legend-svg'
import { useVariantSettings } from './variant-settings-store'
import { useVariants, type IVariant } from './variant-store'

export const MAX_VARIANTS = 500
export const MAX_REGION_SIZE = 10000
export const TOOLTIP_OFFSET = 2

const MARGIN = { top: 100.5, right: 20.5, bottom: 300.5, left: 20.5 }

export interface ITooltip {
  pos: IPos
  variant: IVariant
}

export function PileupPlotSvg({ ref }: ISVGProps) {
  const { sampleMap, datasetMap } = useDatasets()

  const { settings } = useVariantSettings()
  let { variants: results, dna } = useVariants()

  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const innerRef = useRef<SVGSVGElement>(null)
  const setRefs = useMergeRefs(innerRef, ref)

  const scaledBlockSize = {
    w: BASE_W * settings.scale,
    h: BASE_H * settings.scale,
  }

  // turn cmap into a map from token to color for easier access in getColor
  const cmap: Record<string, string> = Object.fromEntries(
    settings.variants.cmap.colors.map((c) => [c.name, c.color])
  )

  const pileupResults = useMemo(() => {
    if (!results || results.variants.length === 0) {
      return null
    }
    let sortOrderMap: Record<string, number> = Object.fromEntries(
      settings.variants.cmap.colors.map((c, i) => [c.name, i])
    )

    switch (settings.variants.sortOrder) {
      case 'coo':
        results = sortByCOO(
          results,
          sampleMap,
          sortOrderMap,
          settings.variants.prioritizeVariantTypeOrder
        )
        break
      case 'lymphgen':
        results = sortByLymphgen(
          results,
          sampleMap,
          sortOrderMap,
          settings.variants.prioritizeVariantTypeOrder
        )
        break
      /*  case 'snv':
      variantResults = sortBySNV(
        variantResults,
        settings.variants.prioritizeVariantTypeOrder
      )
      break */
      case 'variant':
        results = sortByVariantType(
          results,
          settings.variants.prioritizeVariantTypeOrder
        )
        break
      case 'dataset':
        results = sortByDataset(
          results,
          datasetMap,
          sortOrderMap,
          settings.variants.prioritizeVariantTypeOrder
        )
        break
      default:
        break
    }

    return pileup(results)
  }, [
    settings.variants.sortOrder,
    results,
    sampleMap,
    datasetMap,
    settings.variants.prioritizeVariantTypeOrder,
  ])

  if (!results || results.variants.length === 0 || !dna || !pileupResults) {
    return null
  }

  // need to split multiple snps and format insertions deletions

  let maxH = 0
  const maxHeightMap = new Map<number, number>()

  pileupResults.pileup.forEach((p, pi) => {
    const y = Math.max(...p.variants.map((v) => v.y))
    maxH = Math.max(maxH, y)
    maxHeightMap.set(pi, y)
  })

  const innerWidth = dna.seq.length * BASE_W
  const plotHeight = (1 + maxH) * BASE_H

  const width = innerWidth + MARGIN.left + MARGIN.right
  const height = plotHeight + MARGIN.top + MARGIN.bottom

  const motifOffset = settings.motifs.show ? 60 : 0

  const handleVariantEnter = useCallback(
    (v: IVariant, x: number, h: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (!innerRef.current) {
        return
      }

      const pos = svgPointToScreen(
        innerRef.current,
        MARGIN.left + x,
        MARGIN.top + BASE_H - HALF_BASE_H + h + motifOffset
      )

      if (!pos) {
        return
      }

      setToolTipInfo({ pos, variant: v })
    },
    []
  )

  const handleVariantLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => setToolTipInfo(null), 300)
  }, [])

  let xax = new Axis()
    .setDomain([settings.location.start, settings.location.end])
    //.setTicks([settings.location.start, settings.location.end])
    //.setDomain([0, plot.dna.seq.length])
    .setLength(innerWidth)

  const svgContent = useMemo(() => {
    return (
      <>
        <g
          transform={`translate(${MARGIN.left + innerWidth * 0.5}, ${MARGIN.top * 0.5})`}
        >
          <text
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="small"
            fontWeight="bold"
          >
            {pileupResults ? locStr(pileupResults.location) : ''}
          </text>
        </g>

        <MotifsSvg
          xax={xax}
          pos={{
            x: MARGIN.left,
            y: MARGIN.top,
          }}
        />

        <DNASvg
          pos={{
            x: MARGIN.left,
            y: MARGIN.top + motifOffset,
          }}
        />

        <g
          transform={`translate(${MARGIN.left}, ${MARGIN.top + BASE_H + motifOffset})`}
        >
          {pileupResults?.pileup.map((mp, mpi) => {
            const x = mp.pos * BASE_W

            return (
              <g transform={`translate(${x}, 0)`} key={mpi}>
                {mp.variants.map((v, vi) => {
                  // we have precomputed the height to allow for
                  // deletions
                  let h = BASE_H * v.y

                  let color = getColor(
                    v,
                    settings.variants.colorBy,
                    cmap,
                    datasetMap,
                    sampleMap
                  )

                  return (
                    <Fragment key={vi}>
                      {/* invisible rect to capture mouse events for tooltip */}
                      <rect
                        x={-HALF_BASE_W}
                        y={h - HALF_BASE_H}
                        width={BASE_W}
                        height={BASE_H}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          handleVariantEnter(v, x, h)
                        }}
                        onMouseLeave={handleVariantLeave}
                      />
                      <SvgText
                        x={v.type.includes('INS') ? HALF_BASE_W : 0}
                        y={h + (v.type.includes('INS') ? 0 : 0)}
                        key={vi}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        //fontWeight="bold"
                        pointerEvents="none"
                        font={settings.dna.text}
                        fill={color}
                      >
                        {v.type.includes('INS') ? '^' : v.tum[0]}
                      </SvgText>
                    </Fragment>
                  )
                })}
              </g>
            )
          })}
        </g>

        <g
          transform={`translate(${MARGIN.left}, ${MARGIN.top + plotHeight + 50})`}
        >
          <PileupLegendSvg />
        </g>
      </>
    )
  }, [
    pileupResults,
    settings,
    sampleMap,
    datasetMap,
    handleVariantEnter,
    handleVariantLeave,
  ])

  // matching is case insensitive

  return (
    <>
      <SvgBase
        ref={setRefs}
        width={width} //* settings.scale}
        height={height} //* settings.scale}
        scale={settings.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        //className="absolute z-20"
        onMouseLeave={() => setToolTipInfo(null)}
      >
        {svgContent}
      </SvgBase>

      {settings.tooltips.show &&
        toolTipInfo &&
        createPortal(
          <>
            <div
              //ref={tooltipRef}
              className="pointer-events-none fixed z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
              style={{
                left:
                  toolTipInfo.pos.x +
                  HALF_BASE_W * settings.scale +
                  TOOLTIP_OFFSET,
                top:
                  toolTipInfo.pos.y + BASE_H * settings.scale + TOOLTIP_OFFSET,
              }}
            >
              <p className="font-semibold">
                {`${sampleMap[toolTipInfo.variant.sample]!.name} (${sampleMap[toolTipInfo.variant.sample]!.coo}, ${sampleMap[toolTipInfo.variant.sample]!.lymphgenClass})`}
              </p>
              <p>Type: {toolTipInfo.variant.type}</p>
              <p>COO: {sampleMap[toolTipInfo.variant.sample]!.coo}</p>
              <p>
                LymphGen: {sampleMap[toolTipInfo.variant.sample]!.lymphgenClass}
              </p>
              <p>
                {`Loc: ${settings.chrPrefix.show ? formatChr(toolTipInfo.variant.chr) : toolTipInfo.variant.chr}:${toolTipInfo.variant.start.toLocaleString()}-${toolTipInfo.variant.end.toLocaleString()}`}
              </p>
              <p>
                {`ref: ${toolTipInfo.variant.ref}, tumor: ${toolTipInfo.variant.tum.replace('^', '')}`}
              </p>
            </div>
            <span
              className="fixed z-40 border border-black pointer-events-none"
              style={{
                top: toolTipInfo.pos.y - 1,
                left: toolTipInfo.pos.x - HALF_BASE_W * settings.scale,
                width: scaledBlockSize.w,
                height: scaledBlockSize.h - 1,
              }}
            />
          </>,
          document.body
        )}
    </>
  )
}

/**
 * Using colorby and the variant, determine the color to use for this variant
 * based on the current cmap and sampleMap. For example if colorBy is 'coo'
 * extract the coo for the variant sample and see if color in colormap.
 * If color not found return black
 * @param variant
 * @param colorBy
 * @param cmap
 * @param sampleMap
 * @returns
 */
function getColor(
  variant: IVariant,
  colorBy: string,
  cmap: Record<string, string>,
  datasetMap: Record<string, IVariantDataset>,
  sampleMap: Record<string, IVariantSample>,
  defaultColor: string = 'black'
) {
  switch (colorBy) {
    case 'coo':
      return cmap[sampleMap[variant.sample]?.coo ?? ''] ?? defaultColor
    case 'lymphgen':
      const lymphgenClass = sampleMap[variant.sample]?.lymphgenClass ?? ''

      for (const token of lymphgenClass.split('/')) {
        if (token in cmap) {
          return cmap[token]!
        }
      }

      return defaultColor
    case 'variant':
      return cmap[variant.type] ?? defaultColor
    case 'snv':
      return cmap[variant.tum[0]!] ?? cmap[variant.type] ?? defaultColor
    case 'dataset':
      for (const d of variant.datasets) {
        const n = datasetMap[d]?.name ?? ''
        if (n in cmap) {
          return cmap[n]!
        }
      }

      return defaultColor
    default:
      return defaultColor
  }
}
