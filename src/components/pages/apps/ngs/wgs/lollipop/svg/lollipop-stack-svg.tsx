import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  axisLength,
  getAxisTicks,
  IAxis,
} from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'
import { useEffect, useMemo, useRef } from 'react'

import type { IBlock } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgZoomCanvas } from '@/components/plot/svg-base'
import type { IRect } from '@/interfaces/rect'
import { COLOR_WHITE } from '@/lib/color/color'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { gsap } from 'gsap'
import { useLollipopSettings, type IAAColor } from '../lollipop-settings-store'
import { aaSum } from '../lollipop-stats'
import { useLollipop } from '../lollipop-store'
import {
  DEFAULT_MUTATION_COLOR,
  type IDomain,
  type ILollipopDisplayProps,
  type IProtein,
  type IProteinLabel,
  type VariantClass,
} from '../lollipop-utils'
import { DEFAULT_AA_COLOR } from '../variants'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell
}

export function yTickLinesSvg(
  yax: IAxis,
  width: number,
  displayProps: ILollipopDisplayProps
) {
  const yaf = axisDomainToRangeFunc(yax)
  const ticks = getAxisTicks(yax)
  return (
    <g>
      {ticks
        .slice(displayProps.axes.y.ticks.lines.showZeroLine ? 0 : 1)
        .map((tick, ti) => {
          const y = yaf(tick.v)

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
  pos,
  yax,
  flattenedPileups,
  blockSize,
  displayProps,
}: {
  pos: IPos
  yax: IAxis
  flattenedPileups: {
    id: string
    pos: IPos
    rect: IRect
  }[]
  blockSize: IBlock
  displayProps: ILollipopDisplayProps
}) {
  const { ref: svgRef } = useSVG()
  const circlesRef = useRef<(SVGGElement | null)[]>([])
  const initial = useRef<boolean>(true)
  const { showCrosshair, hideCrosshair } = useCrosshair()
  const lollipopRef = useRef<SVGGElement | null>(null)

  // animate each circle into position after React has populated the refs
  useEffect(() => {
    if (!circlesRef.current || flattenedPileups.length === 0) {
      return
    }

    const nodes = circlesRef.current.filter(Boolean) as SVGGElement[]

    gsap.timeline().to(nodes, {
      x: (i: number) => flattenedPileups[i]?.rect.x || 0,
      y: (i: number) => flattenedPileups[i]?.rect.y || 0,
      duration: 0.3,
      ease: 'power2.out',
      stagger: 0.01,
    })

    initial.current = false
  }, [flattenedPileups])

  // default them all to 1
  const dy = axisDomainToRange(yax, 1) // - yax.domainToRange(0) // 0.5 * blockSize.h

  return (
    <SvgG pos={pos}>
      <SvgG id="lollipop" ref={lollipopRef}>
        {flattenedPileups.map((entry, ei) => {
          const [mutType] = entry.id.split('|')

          return (
            <SvgG
              ref={(el) => {
                circlesRef.current[ei] = el
              }}
              key={entry.id}
              data-id={ei}
              pos={{ x: entry.rect.x, y: dy }}

              onPointerEnter={(e) => {
                gsap.to(circlesRef.current[ei], {
                  scale: 1.5,
                  transformOrigin: 'center',
                  duration: 0.3,
                  ease: 'power2.out',
                })

                const p = {
                  x: flattenedPileups[ei]?.rect.x + pos.x,
                  y: flattenedPileups[ei]?.rect.y + pos.y,
                }

                const { relativeP, screenP } = svgPointToScreen(
                  svgRef.current,
                  p
                )

                const lines = entry.id?.split('|')

                showCrosshair({
                  pos: relativeP,
                  screenPos: screenP,
                  content: (
                    <>
                      {lines.map((line, index) => (
                        <span key={index}>{line}</span>
                      ))}
                    </>
                  ),
                })
              }}
              onPointerLeave={() => {
                gsap.to(circlesRef.current[ei], {
                  scale: 1,
                  transformOrigin: 'center',
                  duration: 0.3,
                  ease: 'power2.out',
                })

                hideCrosshair()
              }}
            >
              <SvgCircle
                //cx={entry.rect.x} //pi * blockSize.w + 0.5 * blockSize.w}
                //cy={y}
                r={0.5 * blockSize.w}
                fill={
                  displayProps.variants.colorMap[mutType!] ??
                  DEFAULT_MUTATION_COLOR
                }
                sp={displayProps.variants.plot.border}

                opacity={displayProps.variants.plot.opacity}
              />
            </SvgG>
          )
        })}
      </SvgG>
    </SvgG>
  )
}

export function seqSvg(
  xax: IAxis,
  protein: IProtein,
  aaColor: IAAColor,
  blockSize: IBlock
) {
  const { displayProps } = useLollipopSettings()
  const xaf = axisDomainToRangeFunc(xax)
  return (
    <g id="aa-sequence">
      {protein.sequence.split('').map((aa, aai) => {
        const color: string =
          aaColor.show && aa in aaColor.scheme
            ? aaColor.scheme[aa]!
            : DEFAULT_AA_COLOR

        const textColor = aaColor.invert ? COLOR_WHITE : color
        const blockColor = aaColor.invert ? color : COLOR_WHITE

        const x = xaf(aai + 1) //   aai * blockSize.w

        return (
          <g id={`aa-${aai}`} key={aai} transform={`translate(${x}, 0)`}>
            {aaColor.invert && (
              <SvgRect
                x={-0.5 * blockSize.w}
                y={-0.5 * blockSize.h}
                width={blockSize.w}
                height={blockSize.h}
                fill={blockColor}
                //stroke={aaColor.invert ? COLOR_BLACK : 'none'}
                //strokeWidth={aaColor.invert ? 1 : 0}
                //strokeOpacity={1}
                shapeRendering={SVG_CRISP_EDGES}
              >
                <title>{`Position ${aai + 1}: ${aa}`}</title>
              </SvgRect>
            )}

            <SvgText
              fill={textColor}

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
  xax: IAxis,
  labels: IProteinLabel[],

  displayProps: ILollipopDisplayProps
) {
  const xaf = axisDomainToRangeFunc(xax)

  return (
    <g>
      {labels
        .filter((label) => label.show)
        .map((label, li) => {
          const x = xaf(label.start) // (label.start - 1) * blockSize.w
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
  xax: IAxis,
  features: IDomain[],
  blockSize: IBlock,
  displayProps: ILollipopDisplayProps
) {
  const xaf = axisDomainToRangeFunc(xax)

  const filteredFeatures = features.filter((f) => f.show).toReversed() // [...df.features].sort((a, b) => a.z - b.z)

  return (
    <g transform={`translate(${-0 * blockSize.w}, 0)`}>
      {displayProps.features.background.show && (
        <rect
          y={3}
          width={axisLength(xax)}
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
        const x = xaf(feature.start) // (feature.start - 1) * blockSize.w
        const x2 = xaf(feature.end) // (feature.end - 1) * blockSize.w
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

export function LollipopStackContent() {
  const {
    datasets,
    datasetsForUse,
    mutationsForUse,
    domains: features,
    aaStats,
    labels,
  } = useLollipop()

  const { axis: xax } = useAxis({
    plotId: 'lollipop',
    groupId: 'lollipop',
    axisId: 'x',
  })
  const { axis: yax } = useAxis({
    plotId: 'lollipop',
    groupId: 'lollipop',
    axisId: 'y',
  })

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])
  const yaf = useMemo(() => axisDomainToRangeFunc(yax), [yax])

  const { protein, displayProps, aaColor, showMaxVariantOnly } =
    useLollipopSettings()

  const blockSize: IBlock = displayProps.grid.cell

  // const scaledBlockSize = {
  //   w: blockSize.w * displayProps.scale,
  //   h: blockSize.h * displayProps.scale,
  // }

  // const scaledPadding = {
  //   x: spacing.x * displayProps.scale,
  //   y: spacing.y * displayProps.scale,
  // }

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

  const gridWidth = displayProps.axes.x.width // n * blockSize.w
  //const gridHeight = 100 //df.shape[0] * (blockSize.h + spacing.y)
  const width = gridWidth + marginLeft + marginRight

  // keep things simple and use ints for the graph limits

  const maxSampleCount = Math.round(
    Math.max(...aaStats.map((stats) => aaSum(stats)))
  )

  const graphHeight = maxSampleCount * blockSize.w //blockSize.w

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
      const x = xaf(pi + 1)

      for (const variantBlock of pileup) {
        for (const mutation of variantBlock.mutations) {
          const y2 = yaf(ei)

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
      <SvgZoomCanvas
        size={{ w: width, h: height }}

        //shapeRendering={SVG_CRISP_EDGES}
        //onPointerMove={onPointerMove}
        //className="absolute"
      >
        {displayProps.title.text.show && (
          <SvgG
            id="title"
            pos={{
              x: marginLeft + gridWidth / 2,
              y: top - displayProps.title.offset,
            }}
          >
            <SvgText
              dominantBaseline="central"
              //fontSize="large"
              textAnchor="middle"
              font={displayProps.title.text}
            >
              {protein?.name ?? ''}
            </SvgText>
          </SvgG>
        )}

        {displayProps.labels.show && (
          <SvgG
            pos={{
              x: marginLeft + 0.5 * blockSize.w,
              y: top - displayProps.plotGap - displayProps.labels.height,
            }}
          >
            {labelsSvg(xax, labels, displayProps)}
          </SvgG>
        )}

        {displayProps.axes.y.show && (
          <SvgG pos={{ x: marginLeft - displayProps.axisOffset, y: top }}>
            <AxisLeftSvg
              ax={yax}
              strokeWidth={displayProps.variants.plot.border.width}
              font={displayProps.axes.labels}
              labelFont={displayProps.axes.title}
            />
          </SvgG>
        )}

        {displayProps.axes.y.ticks.lines.show && (
          <SvgG pos={{ x: marginLeft, y: top }}>
            {yTickLinesSvg(yax, gridWidth, displayProps)}
          </SvgG>
        )}

        {displayProps.variants.plot.show && (
          <ColGraphsSvg
            pos={{ x: marginLeft, y: top }}
            yax={yax}
            flattenedPileups={flattenedPileups}

            blockSize={blockSize}
            displayProps={displayProps}
          />
        )}

        {displayProps.seq.show && (
          <SvgG
            pos={{ x: marginLeft, y: top + graphHeight + displayProps.plotGap }}
          >
            {seqSvg(xax, protein, aaColor, blockSize)}
          </SvgG>
        )}

        {displayProps.features.show && (
          <SvgG
            pos={{
              x: marginLeft,
              y: top + graphHeight + displayProps.plotGap + 15,
            }}
          >
            {featuresSvg(xax, features, blockSize, displayProps)}
          </SvgG>
        )}

        {displayProps.axes.x.show && (
          <SvgG
            pos={{
              x: marginLeft,
              y:
                top +
                graphHeight +
                displayProps.plotGap +
                displayProps.seq.height +
                displayProps.plotGap +
                displayProps.features.height +
                displayProps.plotGap,
            }}
          >
            <AxisBottomSvg
              ax={xax}
              strokeWidth={displayProps.variants.plot.border.width}
              font={displayProps.axes.labels}
              labelFont={displayProps.axes.title}
            />
          </SvgG>
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
      </SvgZoomCanvas>
    </>
  )
}

export function LollipopStackSvg() {
  return (
    <CrosshairProvider>
      <LollipopStackContent />
    </CrosshairProvider>
  )
}
