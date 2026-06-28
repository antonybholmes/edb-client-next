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

import { BaseCol } from '@/components/layout/base-col'
import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { SvgBase } from '@/components/plot/svg-base'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { IRect } from '@/interfaces/rect'
import type { ISVGProps } from '@/interfaces/svg-props'
import { COLOR_WHITE } from '@/lib/color/color'

import { SvgText } from '@/components/plot/svg-text'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { gsap } from 'gsap'
import { useLollipopSettings, type IAAColor } from './lollipop-settings-store'
import { aaSum } from './lollipop-stats'
import { useLollipopStore } from './lollipop-store'
import {
  DEFAULT_MUTATION_COLOR,
  type IDomain,
  type ILollipopDisplayProps,
  type IProtein,
  type IProteinLabel,
  type VariantClass,
} from './lollipop-utils'
import { DEFAULT_AA_COLOR } from './variants'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell
}

export function yTickLinesSvg(
  yax: YAxis,
  width: number,
  displayProps: ILollipopDisplayProps
) {
  return (
    <g>
      {yax.ticks
        .slice(displayProps.axes.y.ticks.lines.showZeroLine ? 0 : 1)
        .map((tick, ti) => {
          const y = yax.domainToRange(tick.v)

          return (
            <line
              key={ti}
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              strokeDasharray={displayProps.axes.y.ticks.lines.dash}
              stroke={displayProps.axes.y.ticks.lines.value}
              strokeOpacity={displayProps.axes.y.ticks.lines.opacity}
              strokeWidth={
                displayProps.axes.y.ticks.lines.show
                  ? displayProps.axes.y.ticks.lines.width
                  : 0
              }
            />
          )
        })}
    </g>
  )
}

function ColGraphsSvg({
  yax,
  flattenedPileups,
  blockSize,
  displayProps,
  svgRef,
  //circlesRef,
  tooltipRef,
  setTooltipText,
}: {
  yax: YAxis
  flattenedPileups: {
    id: string
    pos: IPos
    rect: IRect
  }[]
  blockSize: IBlock
  displayProps: ILollipopDisplayProps
  svgRef: RefObject<SVGSVGElement | null>
  //circlesRef: RefObject<(SVGGElement | null)[]>
  tooltipRef: RefObject<HTMLDivElement | null>
  setTooltipText: (text: string[]) => void
}) {
  const circlesRef = useRef<(SVGGElement | null)[]>([])
  const initial = useRef<boolean>(true)

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
          const lines = entry.id?.split('|')

          if (lines.length > 0) {
            //lines[lines.length - 1] = `Position: ${lines[lines.length - 1]}`

            setTooltipText([...lines, `x: ${entry.pos.x}, y: ${entry.pos.y}`])
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

  useEffect(() => {
    if (
      !circlesRef.current ||
      circlesRef.current.length === 0 ||
      !flattenedPileups
    ) {
      return
    }

    gsap.timeline().to(circlesRef.current, {
      x: (i: number) => flattenedPileups[i]?.rect.x || 0, // unique X position (cx in SVG)
      y: (i: number) => flattenedPileups[i]?.rect.y || 0, // unique Y position (cy in SVG)
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)', //ease: 'power2.out',
      //stagger: 0.01,
    })

    initial.current = false
  }, [flattenedPileups, circlesRef])

  // default them all to 1
  const dy = yax.domainToRange(1) // - yax.domainToRange(0) // 0.5 * blockSize.h

  return (
    <>
      {flattenedPileups.map((entry, ei) => {
        const [mutType] = entry.id.split('|')

        return (
          <g
            ref={(el) => {
              circlesRef.current[ei] = el
            }}
            key={entry.id}
            data-id={ei}
            transform={`translate(${entry.rect.x}, ${dy})`}
          >
            <circle
              //cx={entry.rect.x} //pi * blockSize.w + 0.5 * blockSize.w}
              //cy={y}
              r={0.5 * blockSize.w}
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
            >
              {/* <title>{tooltip}</title> */}
            </circle>
          </g>
        )
      })}
    </>
  )
}

export function seqSvg(
  xax: Axis,
  protein: IProtein,
  aaColor: IAAColor,
  blockSize: IBlock
) {
  const { displayProps } = useLollipopSettings()
  return (
    <g id="aa-sequence">
      {protein.sequence.split('').map((aa, aai) => {
        const color: string =
          aaColor.show && aa in aaColor.scheme
            ? aaColor.scheme[aa]!
            : DEFAULT_AA_COLOR

        const textColor = aaColor.invert ? COLOR_WHITE : color
        const blockColor = aaColor.invert ? color : COLOR_WHITE

        const x = xax.domainToRange(aai + 1) //   aai * blockSize.w

        return (
          <g id={`aa-${aai}`} key={aai} transform={`translate(${x}, 0)`}>
            {aaColor.invert && (
              <rect
                x={-0.5 * blockSize.w}
                y={-0.5 * blockSize.h}
                width={blockSize.w}
                height={blockSize.h}
                fill={blockColor}
                //stroke={aaColor.invert ? COLOR_BLACK : 'none'}
                //strokeWidth={aaColor.invert ? 1 : 0}
                //strokeOpacity={1}
                shapeRendering="crispEdges"
              >
                <title>{`Position ${aai + 1}: ${aa}`}</title>
              </rect>
            )}

            <SvgText
              fill={textColor}
              dominantBaseline="central"
              textAnchor="middle"
              font={displayProps.seq.text}
            >
              {aa}
              <title>{`Position ${aai + 1}: ${aa}`}</title>
            </SvgText>
          </g>
        )
      })}
    </g>
  )
}

export function labelsSvg(
  xax: Axis,
  labels: IProteinLabel[],

  displayProps: ILollipopDisplayProps
) {
  return (
    <g>
      {labels
        .filter((label) => label.show)
        .map((label, li) => {
          const x = xax.domainToRange(label.start) // (label.start - 1) * blockSize.w
          return (
            <g key={li} transform={`translate(${x}, 0)`}>
              <line
                y1={5}
                y2={displayProps.labels.height}
                stroke={label.color}
                strokeOpacity={displayProps.labels.opacity}
                opacity={displayProps.labels.opacity}
                strokeWidth={
                  displayProps.labels.show ? displayProps.labels.strokeWidth : 0
                }
              />

              <SvgText
                //y={-displayProps.labels.height}
                transform="rotate(270)"
                //text-anchor="middle"
                dominantBaseline="central"
                fontSize="smaller"
                textAnchor="start"
                //fontWeight="bold"
                fill={label.color}
              >
                {label.name}
              </SvgText>
            </g>
          )
        })}
    </g>
  )
}

export function featuresSvg(
  xax: Axis,
  features: IDomain[],

  blockSize: IBlock,
  displayProps: ILollipopDisplayProps
) {
  const filteredFeatures = features.filter((f) => f.show).toReversed() // [...df.features].sort((a, b) => a.z - b.z)

  return (
    <g transform={`translate(${-0 * blockSize.w}, 0)`}>
      {displayProps.features.background.show && (
        <rect
          y={3}
          width={xax.length}
          height={displayProps.features.height - 6}
          fill={displayProps.features.background.value}
          stroke={displayProps.features.background.border.value}
          strokeOpacity={displayProps.features.background.border.opacity}
          opacity={displayProps.features.background.opacity}
          strokeWidth={
            displayProps.features.background.border.show
              ? displayProps.features.background.border.width
              : 0
          }
          rx={displayProps.features.rounding}
        />
      )}
      {filteredFeatures.map((feature, fi) => {
        //const width = Math.abs(feature.end - feature.start + 1) * blockSize.w
        const x = xax.domainToRange(feature.start) // (feature.start - 1) * blockSize.w
        const x2 = xax.domainToRange(feature.end) // (feature.end - 1) * blockSize.w
        const width = Math.max(0, x2 - x)

        return (
          <g key={fi} transform={`translate(${x}, 0)`}>
            <rect
              width={width}
              height={displayProps.features.height}
              fill={feature.fill.show ? feature.fill.value : 'none'}
              opacity={feature.fill.opacity}
              stroke={feature.border.show ? feature.border.value : 'none'} //displayProps.features.border.value}
              strokeOpacity={feature.border.opacity}
              strokeWidth={feature.border.show ? feature.border.width : 0}
              rx={displayProps.features.rounding}
            />
            {feature.text.show && feature.name && (
              <SvgText
                x={0.5 * width}
                y={0.5 * displayProps.features.height}
                dominantBaseline="central"
                textAnchor="middle"
                font={feature.text}
              >
                {feature.name}
              </SvgText>
            )}

            {displayProps.features.positions.show && (
              <g
                transform={`translate(${0.5 * blockSize.w}, ${displayProps.features.height + displayProps.axisOffset})`}
              >
                <SvgText
                  dominantBaseline="central"
                  textAnchor="middle"
                  font={displayProps.axes.labels}
                >
                  {feature.start}
                </SvgText>

                <SvgText
                  x={width - blockSize.w}
                  dominantBaseline="central"
                  textAnchor="middle"
                  font={displayProps.axes.labels}
                >
                  {feature.end}
                </SvgText>
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}

export function legendSvg(
  datasets: string[],
  blockSize: IBlock,
  displayProps: ILollipopDisplayProps
) {
  return (
    <>
      <g id="mutations-legend">
        <g transform={`translate(60, 0)`}>
          <SvgText
            dominantBaseline="central"
            textAnchor="end"
            font={displayProps.axes.title}
          >
            {displayProps.legend.variants.label}
          </SvgText>
        </g>

        <g transform={`translate(${0.5 * blockSize.w + 80}, 0)`}>
          {displayProps.variants.types.toReversed().map((name, ni) => {
            const fill: string =
              displayProps.variants.colorMap[name] ?? DEFAULT_MUTATION_COLOR

            return (
              <g
                key={ni}
                transform={`translate(${ni * displayProps.legend.width}, 0)`}
              >
                <circle
                  r={0.5 * blockSize.w}
                  fill={fill}
                  stroke={displayProps.variants.plot.border.value}
                  strokeOpacity={displayProps.variants.plot.border.opacity}
                  opacity={displayProps.variants.plot.opacity}
                  strokeWidth={
                    displayProps.variants.plot.border.show
                      ? displayProps.variants.plot.border.width
                      : 0
                  }
                />

                <SvgText
                  x={blockSize.w}
                  dominantBaseline="central"
                  font={displayProps.axes.labels}
                  //textAnchor="end"
                >
                  {name}
                </SvgText>
              </g>
            )
          })}
        </g>
      </g>

      <g id="datasets-legend" transform={`translate(0, 30)`}>
        <g transform={`translate(60, 0)`}>
          <text
            dominantBaseline="central"
            fontSize="smaller"
            textAnchor="end"
            fontWeight="bold"
          >
            Datasets
          </text>
        </g>

        <g transform={`translate(80, 0)`}>
          <SvgText dominantBaseline="central" font={displayProps.axes.labels}>
            {datasets.join(', ')}
          </SvgText>
        </g>
      </g>
    </>
  )
}

export function vLegendSvg(
  datasets: string[],
  blockSize: IBlock,
  displayProps: ILollipopDisplayProps
) {
  return (
    <>
      <g id="mutations-legend">
        <SvgText dominantBaseline="central" font={displayProps.axes.title}>
          {displayProps.legend.variants.label}
        </SvgText>

        <g transform={`translate(${blockSize.w / 2}, 20)`}>
          {displayProps.variants.types.map((name, ni) => {
            const fill: string =
              displayProps.variants.colorMap[name] ?? DEFAULT_MUTATION_COLOR

            return (
              <g
                key={ni}
                transform={`translate(0, ${ni * (blockSize.w + displayProps.legend.gap)})`}
              >
                <circle
                  r={0.5 * blockSize.w}
                  fill={fill}
                  stroke={displayProps.variants.plot.border.value}
                  strokeOpacity={displayProps.variants.plot.border.opacity}
                  opacity={displayProps.variants.plot.opacity}
                  strokeWidth={
                    displayProps.variants.plot.border.show
                      ? displayProps.variants.plot.border.width
                      : 0
                  }
                />

                <SvgText
                  x={blockSize.w}
                  y={-1}
                  dominantBaseline="central"
                  font={displayProps.axes.labels}
                  //textAnchor="end"
                >
                  {name}
                </SvgText>
              </g>
            )
          })}
        </g>
      </g>

      <g id="datasets-legend" transform={`translate(200, 0)`}>
        <text
          dominantBaseline="central"
          fontSize="smaller"
          //textAnchor="end"
          fontWeight="bold"
        >
          Datasets
        </text>

        <g transform={`translate(0, 20)`}>
          {datasets.map((dataset, di) => {
            return (
              <g
                key={di}
                transform={`translate(0, ${di * (blockSize.w + displayProps.legend.gap)})`}
              >
                <SvgText
                  dominantBaseline="central"
                  font={displayProps.axes.labels}
                >
                  {dataset}
                </SvgText>
              </g>
            )
          })}
        </g>
      </g>
    </>
  )
}

export function Tooltip({
  title = '',
  ref,
  children,
}: {
  title?: string
  ref: RefObject<HTMLDivElement | null>
} & IChildrenProps) {
  return (
    <BaseCol
      className="absolute text-sm z-10 min-w-56 p-3 bg-black/40 backdrop-blur-md pointer-events-none pre-line text-white rounded-theme shadow-lg left-0 top-0 hidden"
      ref={ref}
    >
      {title && <Label className="font-bold">{title}</Label>}
      {children}
    </BaseCol>
  )
}

export function LollipopStackSvg({ ref }: ISVGProps) {
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

  const blockSize: IBlock = displayProps.grid.cell

  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipText, setTooltipText] = useState<string[]>([])

  // const scaledBlockSize = {
  //   w: blockSize.w * displayProps.scale,
  //   h: blockSize.h * displayProps.scale,
  // }

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
      .autoDomain([0, maxSampleCount])
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

    // make sure first tick is shown at 1
    if (ticks[0]!.v !== 1) {
      ticks = [{ v: 1, label: '1' }].concat(ticks)
    }

    if (displayProps.axes.x.showEndTick) {
      ticks = ticks.concat({ v: n, label: xax.domain[1]!.toString() })
    }

    xax = xax.setTicks(ticks)

    return xax
  }, [n, gridWidth, displayProps.axes.x.showEndTick])

  const flattenedPileups = useMemo(() => {
    const pileups: { variantType: VariantClass; mutations: string[] }[][] = []

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
      const mutTypes = displayProps.variants.types
        .toReversed()
        .filter(
          (mutType) =>
            mutType in stats.countMap && filteredMutationsForUse.has(mutType)
        )

      let pileup: { variantType: VariantClass; mutations: string[] }[] = []

      // counts per group
      for (const mutType of mutTypes) {
        if (!(mutType in pileup)) {
          pileup.push({ variantType: mutType, mutations: [] })
        }

        for (const db of Object.keys(stats.countMap[mutType]!)
          .sort()
          .filter((db) => filteredDatasetsForUse.has(db))) {
          for (const aaInfo of [...stats.countMap[mutType]![db]!].sort()) {
            pileup[pileup.length - 1]!.mutations.push(
              `${mutType}|${db}|${aaInfo.sample}|${aaInfo.aa}`
            )
          }
        }
      }

      if (showMaxVariantOnly) {
        const max = Math.max(...pileup.map((p) => p.mutations.length))
        pileup = pileup.filter((p) => p.mutations.length === max)
      }

      pileups.push(pileup)
    }

    // flatten the pileups to get the number of entries

    //const y1 = yax.domainToRange(1) // 0.5 * blockSize.h

    const flattenedPileups: {
      id: string
      pos: IPos
      rect: IRect
    }[] = []

    for (const [pi, pileup] of pileups.entries()) {
      let ei = 1
      const x = xax.domainToRange(pi + 1)

      for (const variantBlock of pileup) {
        for (const mutation of variantBlock.mutations) {
          const y2 = yax.domainToRange(ei)

          const rect = {
            x,
            y: y2, // - y1,
            w: blockSize.w,
            h: blockSize.h,
          }

          // add y to id
          // flattenedPileups.push({ id: `${entry.variantType}:${ei}`, rect })

          flattenedPileups.push({
            id: mutation,
            pos: { x: pi + 1, y: ei },
            rect,
          })

          ei++
        }
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
  ])

  const height =
    graphHeight +
    top +
    bottom +
    displayProps.margin.top +
    displayProps.margin.bottom

  if (!protein) {
    return null
  }

  return (
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
              {protein?.name ?? ''}
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
              font={displayProps.axes.labels}
              labelFont={displayProps.axes.title}
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
              blockSize={blockSize}
              displayProps={displayProps}
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
              font={displayProps.axes.labels}
              labelFont={displayProps.axes.title}
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
              <g>{vLegendSvg(datasets, blockSize, displayProps)}</g>
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
}
