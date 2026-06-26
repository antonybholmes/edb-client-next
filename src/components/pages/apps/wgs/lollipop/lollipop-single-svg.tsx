import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/svg-axis'
import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'

import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgText } from '@/components/plot/svg-text'
import type { ISVGProps } from '@/interfaces/svg-props'
import { COLOR_WHITE } from '@/lib/color/color'
import { range } from '@/lib/math/range'
import { forceCollide, forceSimulation } from 'd3'
import { gsap } from 'gsap'
import { useLollipopSettings } from './lollipop-settings-store'
import {
  featuresSvg,
  labelsSvg,
  legendSvg,
  seqSvg,
  Tooltip,
  yTickLinesSvg,
} from './lollipop-stack-svg'
import { aaSum, type IAAData } from './lollipop-stats'
import { useLollipopStore } from './lollipop-store'
import {
  DEFAULT_MUTATION_COLOR,
  type ILollipopDisplayProps,
  type VariantClass,
} from './lollipop-utils'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell
}

function ColGraphsSvg({
  yax,
  flattenedPileups,
  //blockSize,
  displayProps,
  showCounts = true,
  svgRef,
  circlesRef,
  linesRef,
  tooltipRef,
  setTooltipText,
}: {
  yax: YAxis
  flattenedPileups: {
    id: string
    p: number
    variant: VariantClass
    mutations: IAAData[]
    //x0: number // the unadjusted x position
    //y2: number // the y position of the top of the circle
    rect: {
      x: number
      y: number
      width: number
      height: number
    }
  }[]
  //blockSize: IBlock

  showCounts?: boolean
  displayProps: ILollipopDisplayProps
  svgRef: RefObject<SVGSVGElement | null>
  circlesRef: RefObject<(SVGGElement | null)[]>
  linesRef: RefObject<(SVGLineElement | null)[]>
  tooltipRef: RefObject<HTMLDivElement | null>
  setTooltipText: (text: string[]) => void
}) {
  useEffect(() => {
    const svg = svgRef.current
    const tooltip = tooltipRef.current
    if (!svg || !tooltip) {
      return
    }

    const handlePointerEnter = (e: PointerEvent) => {
      const group = (e.target as Element).closest('g[data-id]')
      if (group) {
        const idx = Number(group.getAttribute('data-id'))

        const entry = flattenedPileups[idx]
        if (entry) {
          const lines = entry.id?.split('|') ?? []

          if (lines.length > 0) {
            //lines[lines.length - 1] = `Position: ${lines[lines.length - 1]}`

            setTooltipText(lines)
          }
        }

        gsap.to(group, {
          scale: 1.5,
          transformOrigin: '50% 50%',
          duration: 0.3,
          ease: 'power2.out',
        })

        tooltip.style.display = 'block'
      }
    }

    const handlePointerLeave = (e: PointerEvent) => {
      const group = (e.target as Element).closest('g[data-id]')
      if (group) {
        gsap.to(group, {
          scale: 1,
          transformOrigin: '50% 50%',
          duration: 0.3,
          ease: 'power2.out',
        })
      }

      tooltip.style.display = 'none'
    }

    const handlePointerMove = (e: PointerEvent) => {
      const svg = svgRef.current

      if (!svg || !tooltip) {
        return
      }

      const rect = svg.getBoundingClientRect()

      // Mouse position relative to the container's top-left corner
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      tooltip.style.left = `${x + 10}px`
      tooltip.style.top = `${y + 10}px`
    }

    svg.addEventListener('pointerover', handlePointerEnter)
    svg.addEventListener('pointerout', handlePointerLeave)
    svg.addEventListener('pointermove', handlePointerMove)

    return () => {
      svg.removeEventListener('pointerover', handlePointerEnter)
      svg.removeEventListener('pointerout', handlePointerLeave)
      svg.removeEventListener('pointermove', handlePointerMove)
    }
  }, [flattenedPileups, svgRef, tooltipRef, setTooltipText])

  const y0 = yax.domainToRange(0) // 0.5 * blockSize.h
  const y1 = yax.domainToRange(1)

  return (
    <>
      <g id="col-graphs-lines">
        {flattenedPileups.map((entry, ei) => {
          const [mutType] = entry.id.split('|')

          //const tooltip = `${aa}, ${db}, ${sample}`

          return (
            <line
              transform={`translate(${entry.rect.x}, 0)`}
              ref={(el) => {
                linesRef.current[ei] = el
              }}
              key={entry.id}
              data-id={ei}
              y1={y0} // start at the bottom of the circle
              y2={y0} // end at the top of the circle
              stroke={
                displayProps.variants.colorMap[mutType!] ??
                DEFAULT_MUTATION_COLOR
              }
              strokeWidth={1}
            />
          )
        })}
      </g>

      <g id="col-graphs-circles">
        {flattenedPileups.map((entry, ei) => {
          const [mutType] = entry.id.split('|')

          //const tooltip = `${aa}, ${db}, ${sample}`

          return (
            <g
              ref={(el) => {
                circlesRef.current[ei] = el
              }}
              key={entry.id}
              data-id={ei}
              transform={`translate(${entry.rect.x}, ${y1})`}
            >
              <circle
                //cx={entry.rect.x} //pi * blockSize.w + 0.5 * blockSize.w}
                //cy={y1}
                r={0.5 * entry.rect.width} // 0.5 * blockSize.w}
                fill={
                  displayProps.variants.colorMap[mutType!] ??
                  DEFAULT_MUTATION_COLOR
                }
                stroke={displayProps.variants.plot.border.value}
                strokeOpacity={displayProps.variants.plot.border.opacity}
                opacity={displayProps.variants.plot.opacity}
                strokeWidth={
                  displayProps.variants.plot.border.show
                    ? displayProps.variants.plot.border.width
                    : 0
                }
              />

              {showCounts && (
                <text
                  dominantBaseline="central"
                  textAnchor="middle"
                  fontSize={Math.max(10, 0.5 * entry.rect.width)} // 0.5 * blockSize.w}
                  fontWeight="bold"
                  fill={COLOR_WHITE}
                >
                  {entry.mutations.length}
                </text>
              )}

              {/* <title>{tooltip}</title> */}
            </g>
          )
        })}
      </g>
    </>
  )
}

export function LollipopSingleSvg({ ref }: ISVGProps) {
  const {
    datasets,
    datasetsForUse,
    mutationsForUse,
    domains: features,
    aaStats,
    labels,
  } = useLollipopStore()

  const { protein, displayProps, aaColor, showMaxVariantOnly } =
    useLollipopSettings()
  const circlesRef = useRef<(SVGGElement | null)[]>([])
  const linesRef = useRef<(SVGLineElement | null)[]>([])

  const blockSize: IBlock = displayProps.grid.cell
  const proportionalBlockSize = displayProps.grid.cell.w * 3

  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipText, setTooltipText] = useState<string[]>([])

  // const scaledPadding = {
  //   x: spacing.x * displayProps.scale,
  //   y: spacing.y * displayProps.scale,
  // }

  const innerRef = useRef<SVGSVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!)

  //const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  const marginLeft = displayProps.margin.left
  const marginRight = displayProps.margin.right

  const top = Math.max(
    displayProps.margin.top,
    10 +
      (displayProps.variants.plot.show
        ? displayProps.variants.plot.height + displayProps.plotGap
        : 0)
  )

  const bottom = Math.max(
    displayProps.margin.bottom + displayProps.legend.offset
  )

  const n = Math.max(aaStats.length, protein?.sequence.length ?? 0)

  const gridWidth = displayProps.axes.x.width // n * blockSize.w
  //const gridHeight = 100 //df.shape[0] * (blockSize.h + spacing.y)
  const width = gridWidth + marginLeft + marginRight
  // const height =
  //   gridHeight +
  //   top +
  //   bottom +
  //   displayProps.margin.top +
  //   displayProps.margin.bottom

  // keep things simple and use ints for the graph limits

  const maxSampleCount = Math.round(
    Math.max(...aaStats.map((stats) => aaSum(stats)))
  )

  const graphHeight = maxSampleCount * blockSize.w //blockSize.w

  const yax = useMemo(() => {
    let yax = new YAxis()
      .setDomain([0, maxSampleCount])
      .setLength(graphHeight)
      .setTitle('Mutation count')

    // small plots look better with fewer ticks
    if (maxSampleCount < 10) {
      if (maxSampleCount % 2 === 0) {
        yax = yax.setTicks([0, maxSampleCount / 2, maxSampleCount])
      } else {
        yax = yax.setTicks([0, maxSampleCount])
      }

      yax = yax.setTicks([0, maxSampleCount])
    }

    return yax
  }, [blockSize.w, aaStats])

  const xax = useMemo(() => {
    let xax = new Axis()
      .setDomain([1, n])
      .setLength(gridWidth) //(n - 1) * blockSize.w)
      .setTitle('Positions')
    //.setTicks(ticks)

    let ticks = xax.ticks

    const dx = ticks[ticks.length - 1]!.v - ticks[ticks.length - 2]!.v

    // add last tick to end of plot if is more than half the distance btween the last two ticks
    // so that we add it, but only if it will not overlap with the label of the last tick. This
    // is a simple heuristic to avoid overlapping labels
    if (
      displayProps.axes.x.showEndTick &&
      xax.domain[1]! - ticks[ticks.length - 1]!.v > dx / 2
    ) {
      ticks = ticks.concat({ v: n, label: xax.domain[1]!.toString() })

      xax = xax.setTicks(ticks)
    }

    return xax
  }, [n, gridWidth, displayProps.axes.x.showEndTick])

  const flattenedPileups = useMemo(() => {
    const pileups: Record<number, Record<VariantClass, IAAData[]>> = {}

    const filteredDatasetsForUse = new Set<string>(
      Object.entries(datasetsForUse)

        .filter((e) => e[1])
        .map((e) => e[0])
    )

    const filteredMutationsForUse = new Set<string>(
      Object.entries(mutationsForUse)
        .filter((e) => e[1])
        .map((e) => e[0])
    )

    for (const stats of aaStats) {
      const variantTypes = displayProps.variants.types
        .toReversed()
        .filter(
          (mutType) =>
            mutType in stats.countMap && filteredMutationsForUse.has(mutType)
        )

      //const pileup: string[] = []

      // counts per group
      for (const variantType of variantTypes) {
        for (const db of Object.keys(stats.countMap[variantType]!)
          .sort()
          .filter((db) => filteredDatasetsForUse.has(db))) {
          for (const aaInfo of [...stats.countMap[variantType]![db]!].sort()) {
            if (!(stats.position in pileups)) {
              pileups[stats.position] = {} as Record<VariantClass, IAAData[]>
            }

            if (!(variantType in pileups[stats.position]!)) {
              pileups[stats.position]![variantType] = []
            }

            pileups[stats.position]![variantType]!.push(aaInfo)
          }
        }
      }
    }

    // flatten the pileups to get the number of entries
    //const y1 = yax.domainToRange(1) // 0.5 * blockSize.h
    //const y0 = yax.domainToRange(0) // 0.5 * blockSize.h
    const pileupList: {
      id: string
      p: number
      variant: VariantClass
      mutations: IAAData[]
      //x0: number // the unadjusted x position
      //y2: number // the y position of the top of the circle
      rect: {
        x: number
        y: number
        width: number
        height: number
      }
    }[][] = []

    for (const i of range(1, n + 1)) {
      if (!(i in pileups)) {
        continue
      }

      const x1 = xax.domainToRange(i) // i * blockSize.w

      let pileupEntries = [...Object.entries(pileups[i]!)]
        .map(([variantType, aaData]) => {
          const y2 = yax.domainToRange(aaData.length) // 0.5 * blockSize.h

          // count protein changes
          const changes = [...new Set(aaData.map((aa) => aa.aa))]
            .sort()
            .map((aa) => `${aa} (${aaData.filter((a) => a.aa === aa).length})`)
            .join(', ')

          const mutations = `${aaData.length} mutation${aaData.length === 1 ? '' : 's'}`

          console.log(
            `${variantType}|${mutations}|${changes}|x:${i}, y:${aaData.length}`
          )

          return {
            id: `${variantType}|${mutations}|${changes}|x:${i}, y:${aaData.length}`,
            p: i,

            variant: variantType as VariantClass,
            mutations: aaData,
            //x0: x1,
            //y2,
            rect: {
              x: x1,
              y: y2, // - y1,
              width: blockSize.w,
              height: blockSize.h,
            },
          }
        })
        .sort((a, b) => {
          // sort by number of mutations in descending order
          return b.mutations.length - a.mutations.length
        })

      if (showMaxVariantOnly) {
        pileupEntries = [pileupEntries[0]!]
      }

      pileupList.push(pileupEntries)
    }

    const flattenedPileups = pileupList.flat()

    if (displayProps.variants.plot.proportional) {
      const maxMutations = Math.max(
        ...flattenedPileups.map((e) => e.mutations.length)
      )

      for (const entry of flattenedPileups) {
        const s = Math.max(
          blockSize.w,
          proportionalBlockSize * (entry.mutations.length / maxMutations)
        )

        entry.rect.width = s
        entry.rect.height = s
      }
    }

    const simNodes = flattenedPileups.map((e) => e.rect)
    const ys = simNodes.map((n) => n.y)

    const sim = forceSimulation(simNodes)
      .force(
        'collide',
        forceCollide((d) => Math.max(d.width, d.height) / 8)
      )
      .stop()

    for (let i = 0; i < 120; i++) {
      sim.tick()
    }

    for (const [i, node] of simNodes.entries()) {
      flattenedPileups[i]!.rect = {
        ...flattenedPileups[i]!.rect,
        ...node,
        y: ys[i]!,
      }
    }

    return flattenedPileups
  }, [
    aaStats,
    datasetsForUse,
    mutationsForUse,
    displayProps.variants.types,
    blockSize,
    xax,
    yax,
    displayProps.variants.plot.show,
    displayProps.variants.plot.height,
    displayProps.variants.plot.opacity,
    displayProps.plotGap,
    showMaxVariantOnly,
    displayProps.variants.plot.proportional,
  ])

  useEffect(() => {
    if (
      !circlesRef.current ||
      circlesRef.current.length === 0 ||
      !flattenedPileups
    ) {
      return
    }

    gsap
      .timeline()
      .to(circlesRef.current, {
        y: (i: number) => flattenedPileups[i]?.rect.y || 0, // unique Y position (cy in SVG)
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)', //ease: 'power2.out',
        //stagger: 0.01,
      })
      .to(
        linesRef.current,
        {
          attr: { y2: (i: number) => flattenedPileups[i]?.rect.y || 0 }, // unique Y position (cy in SVG)
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)', //ease: 'power2.out',
          //stagger: 0.01,
        },
        '<'
      )
  }, [flattenedPileups, circlesRef])

  const height =
    graphHeight +
    top +
    bottom +
    displayProps.margin.top +
    displayProps.margin.bottom

  if (!protein) {
    return null
  }

  const svg = (
    <>
      <SvgBase
        ref={innerRef}
        width={width}
        height={height}
        scale={displayProps.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        //onMouseMove={onMouseMove}
        //className="absolute"
      >
        {displayProps.title.text.show && (
          <g
            id="title"
            transform={`translate(${marginLeft + gridWidth / 2}, ${top - displayProps.title.offset})`}
          >
            <SvgText
              dominantBaseline="central"
              //fontSize="large"
              textAnchor="middle"
              font={displayProps.title.text}
            >
              {protein.name}
            </SvgText>
          </g>
        )}

        {displayProps.labels.show && (
          <g
            transform={`translate(${marginLeft + 0.5 * blockSize.w}, ${
              top - displayProps.plotGap - displayProps.labels.height
            })`}
          >
            {labelsSvg(xax, labels, displayProps)}
          </g>
        )}

        {displayProps.axes.y.show && (
          <g
            transform={`translate(${marginLeft - displayProps.axisOffset}, ${top})`}
          >
            <AxisLeftSvg
              ax={yax}
              strokeWidth={displayProps.variants.plot.border.width}
            />
          </g>
        )}

        {displayProps.axes.y.ticks.lines.show && (
          <g transform={`translate(${marginLeft}, ${top})`}>
            {yTickLinesSvg(yax, gridWidth, displayProps)}
          </g>
        )}

        {displayProps.variants.plot.show && (
          <g transform={`translate(${marginLeft}, ${top})`}>
            <ColGraphsSvg
              yax={yax}
              flattenedPileups={flattenedPileups}
              svgRef={innerRef}
              showCounts={displayProps.variants.plot.showCounts}
              displayProps={displayProps}
              circlesRef={circlesRef}
              linesRef={linesRef}
              tooltipRef={tooltipRef}
              setTooltipText={setTooltipText}
            />
          </g>
        )}

        {displayProps.seq.show && (
          <g
            transform={`translate(${marginLeft}, ${
              top + graphHeight + displayProps.plotGap
            })`}
          >
            {seqSvg(xax, protein, aaColor, blockSize)}
          </g>
        )}

        {displayProps.features.show && (
          <g
            transform={`translate(${marginLeft}, ${
              top + graphHeight + displayProps.plotGap + 15
            })`}
          >
            {featuresSvg(xax, features, blockSize, displayProps)}
          </g>
        )}

        {displayProps.axes.x.show && (
          <g
            transform={`translate(${marginLeft}, ${
              top +
              graphHeight +
              displayProps.plotGap +
              displayProps.seq.height +
              displayProps.plotGap +
              displayProps.features.height +
              displayProps.plotGap
            })`}
          >
            <AxisBottomSvg
              ax={xax}
              strokeWidth={displayProps.variants.plot.border.width}
            />
          </g>
        )}

        {/* legend */}

        {displayProps.legend.show &&
          displayProps.legend.position === 'bottom' && (
            <g
              id="legend"
              transform={`translate(${marginLeft}, ${
                top + graphHeight + displayProps.plotGap + 120
              })`}
            >
              <g>{legendSvg(datasets, blockSize, displayProps)}</g>
            </g>
          )}
      </SvgBase>

      <Tooltip
        ref={tooltipRef}
        title={tooltipText.length > 0 ? tooltipText[0]! : ''}
      >
        {tooltipText.slice(1).map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </Tooltip>
    </>
  )

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  //const stats:LollipopStats =  null

  return svg
}
