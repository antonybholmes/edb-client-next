import { Axis, makeTicks, YAxis } from '@components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { type ICell } from '@interfaces/cell'
import { type IPos } from '@interfaces/pos'
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { COLOR_BLACK } from '@/consts'
import {
  DEFAULT_MUTATION_COLOR,
  type ILollipopDisplayProps,
} from './lollipop-utils'
import { PlotContext, type ILollipopDataFrame } from './plot-context'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell
}

function colGraphs(
  df: ILollipopDataFrame,
  yax: YAxis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: ILollipopDisplayProps
) {
  //console.log(aaStats)

  const pileups: string[][] = []

  df.aaStats.forEach((stats) => {
    //console.log(si, stats.countMap.keys(), displayProps.legend.mutations.types)

    const mutTypes = displayProps.legend.mutations.types.filter((mutType) =>
      stats.countMap.has(mutType)
    )

    const pileup: string[] = []

    // counts per group
    mutTypes.forEach((mutType) => {
      ;[...stats.countMap.get(mutType)!].sort().forEach((sample) => {
        pileup.push(`${mutType}:${sample}`)
      })
    })

    pileups.push(pileup)
  })

  return (
    <>
      <g transform={`translate(${-displayProps.axisOffset}, 0)`}>
        <AxisLeftSvg
          ax={yax}
          strokeWidth={displayProps.mutations.graph.border.width}
        />
      </g>
      <g>
        {pileups.map((pileup, pi) => {
          return pileup.map((entry, ei) => {
            const [mutType] = entry.split(':')
            const y1 = yax.domainToRange(ei)

            return (
              <circle
                key={`${pi}:${ei}`}
                cx={pi * (blockSize.w + spacing.x) + 0.5 * blockSize.w}
                cy={y1 - 0.5 * blockSize.w}
                r={0.5 * blockSize.w}
                fill={
                  displayProps.legend.mutations.colorMap.get(mutType!) ??
                  DEFAULT_MUTATION_COLOR
                }
                stroke={displayProps.mutations.graph.border.color}
                strokeOpacity={displayProps.mutations.graph.border.opacity}
                opacity={displayProps.mutations.graph.opacity}
                strokeWidth={
                  displayProps.mutations.graph.border.show
                    ? displayProps.mutations.graph.border.width
                    : 0
                }
                //shapeRendering={SVG_CRISP_EDGES}
              />
            )
          })
        })}
      </g>
    </>
  )
}

function seq(
  df: ILollipopDataFrame,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: ILollipopDisplayProps
) {
  return (
    <g>
      <g>
        {df.protein.seq.split('').map((aa, aai) => {
          return (
            <text
              key={aai}
              x={aai * (blockSize.w + spacing.x)}
              fill={COLOR_BLACK}
              dominantBaseline="central"
              fontSize="x-small"
              textAnchor="middle"
              fontWeight="bold"
            >
              {aa}
            </text>
          )
        })}
      </g>
      <g>
        <rect
          x={-0.5 * blockSize.w - 4}
          y={-8}
          width={df.aaStats.length * (blockSize.w + spacing.x) + 7}
          height={16}
          fill="none"
          stroke={displayProps.seq.border.color}
          strokeOpacity={displayProps.seq.border.opacity}
          opacity={displayProps.seq.border.opacity}
          strokeWidth={
            displayProps.seq.border.show
              ? displayProps.seq.border.strokeWidth
              : 0
          }
        />
      </g>
    </g>
  )
}

function labels(
  df: ILollipopDataFrame,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: ILollipopDisplayProps
) {
  return (
    <g>
      {df.labels
        .filter((label) => label.show)
        .map((label, li) => {
          return (
            <g
              key={li}
              transform={`translate(${
                (label.start - 1) * (blockSize.w + spacing.x)
              }, 0)`}
            >
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

              <text
                //y={-displayProps.labels.height}
                transform="rotate(270)"
                //text-anchor="middle"
                dominantBaseline="central"
                fontSize="smaller"
                textAnchor="Left"
                //fontWeight="bold"
                fill={label.color}
              >
                {label.name}
              </text>
            </g>
          )
        })}
    </g>
  )
}

function features(
  df: ILollipopDataFrame,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: ILollipopDisplayProps
) {
  return (
    <g>
      {df.displayProps.features.background.show && (
        <rect
          y={2}
          width={df.aaStats.length * (blockSize.w + spacing.x)}
          height={displayProps.features.height - 4}
          fill={df.displayProps.features.background.color}
          stroke={displayProps.features.background.border.color}
          strokeOpacity={displayProps.features.background.border.opacity}
          opacity={displayProps.features.background.border.opacity}
          strokeWidth={
            displayProps.features.background.border.show
              ? displayProps.features.background.border.strokeWidth
              : 0
          }
        />
      )}
      {df.features
        .filter((feature) => feature.show)
        .map((feature, fi) => {
          const width =
            Math.abs(feature.end - feature.start) * (blockSize.w + spacing.x)
          return (
            <g
              key={fi}
              transform={`translate(${
                (feature.start - 1) * (blockSize.w + spacing.x)
              }, 0)`}
            >
              <rect
                width={width}
                height={displayProps.features.height}
                fill={feature.bgColor}
                stroke={displayProps.features.border.color}
                strokeOpacity={displayProps.features.border.opacity}
                opacity={displayProps.features.border.opacity}
                strokeWidth={
                  displayProps.features.border.show
                    ? displayProps.features.border.strokeWidth
                    : 0
                }
              />
              {feature.name && (
                <text
                  x={0.5 * width}
                  y={0.5 * displayProps.features.height}
                  dominantBaseline="central"
                  fontSize="smaller"
                  textAnchor="middle"
                  fontWeight="bold"
                  fill={feature.color}
                >
                  {feature.name}
                </text>
              )}

              {displayProps.features.positions.show && (
                <g>
                  <text
                    y={displayProps.features.height + displayProps.axisOffset}
                    dominantBaseline="central"
                    fontSize="smaller"
                    textAnchor="middle"
                    //fontWeight="bold"
                  >
                    {feature.start}
                  </text>

                  <text
                    x={width}
                    y={displayProps.features.height + displayProps.axisOffset}
                    dominantBaseline="central"
                    fontSize="smaller"
                    textAnchor="middle"
                    //fontWeight="bold"
                  >
                    {feature.end}
                  </text>
                </g>
              )}
            </g>
          )
        })}
    </g>
  )
}

function legendSvg(blockSize: IBlock, displayProps: ILollipopDisplayProps) {
  return (
    <>
      <g transform={`translate(${-displayProps.axisOffset}, 0)`}>
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {displayProps.legend.mutations.label}
        </text>
      </g>

      {displayProps.legend.mutations.types.map((name, ni) => {
        const fill: string =
          displayProps.legend.mutations.colorMap.get(name) ??
          DEFAULT_MUTATION_COLOR

        return (
          <g
            key={ni}
            transform={`translate(${ni * displayProps.legend.width}, 0)`}
          >
            <circle
              r={0.5 * blockSize.w}
              fill={fill}
              stroke={displayProps.mutations.graph.border.color}
              strokeOpacity={displayProps.mutations.graph.border.opacity}
              opacity={displayProps.mutations.graph.opacity}
              strokeWidth={
                displayProps.mutations.graph.border.show
                  ? displayProps.mutations.graph.border.width
                  : 0
              }
            />

            <text
              x={blockSize.w + 5}
              fill={COLOR_BLACK}
              dominantBaseline="central"
              fontSize="smaller"
              //textAnchor="end"
            >
              {name}
            </text>
          </g>
        )
      })}
    </>
  )
}

export const LollipopSvg = forwardRef<SVGElement>(function LollipopSvg(
  {},
  ref
) {
  const { plotState } = useContext(PlotContext)

  const df = plotState.df
  const displayProps = plotState.df.displayProps

  const blockSize: IBlock = displayProps.grid.cell
  const spacing = displayProps.grid.spacing

  const scaledBlockSize = {
    w: blockSize.w * displayProps.scale,
    h: blockSize.h * displayProps.scale,
  }

  const scaledPadding = {
    x: spacing.x * displayProps.scale,
    y: spacing.y * displayProps.scale,
  }

  const innerRef = useRef<SVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const tooltipRef = useRef<HTMLDivElement>(null)
  //const canvasRef = useRef(null)
  //const downloadRef = useRef<HTMLAnchorElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  //const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  const marginLeft = displayProps.margin.left
  const marginRight = displayProps.margin.right

  const top = Math.max(
    displayProps.margin.top,
    10 +
      (displayProps.mutations.graph.show
        ? displayProps.mutations.graph.height + displayProps.plotGap
        : 0)
  )

  const bottom = Math.max(
    displayProps.margin.bottom + displayProps.legend.offset
  )

  const gridWidth = df.aaStats.length * (blockSize.w + spacing.x)
  const gridHeight = 100 //df.shape[0] * (blockSize.h + spacing.y)
  const width = gridWidth + marginLeft + marginRight
  const height = gridHeight + top + bottom

  const svg = useMemo(() => {
    // keep things simple and use ints for the graph limits
    const maxSampleCount = Math.round(
      Math.max(...df.aaStats.map((stats) => stats.sum))
    )

    const graphHeight = maxSampleCount * (blockSize.w + spacing.y)

    const yax = new YAxis()
      .setDomain([0, maxSampleCount])
      .setLength(graphHeight)
      .setTitle('Mutation count')
      .setTicks([0, maxSampleCount])

    const xax = new Axis()
      .setDomain([1, df.aaStats.length])
      .setLength((df.aaStats.length - 1) * (blockSize.w + spacing.x))
      .setTitle('Positions')
      .setTicks(
        [1]
          .concat(makeTicks([0, df.aaStats.length - 1]).slice(1))
          .concat([df.aaStats.length])
      )

    // get list of all events in use

    // make the grid

    //const legend = oncoProps.plotorder.filter(id => allEventsInUse.has(id))

    return (
      <svg
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={innerRef}
        width={width * displayProps.scale}
        height={height * displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering={SVG_CRISP_EDGES}
        onMouseMove={onMouseMove}
        className="absolute"
      >
        {displayProps.labels.show && (
          <g
            transform={`translate(${marginLeft + 0.5 * blockSize.w}, ${
              top - displayProps.plotGap - displayProps.labels.height
            })`}
          >
            {labels(df, blockSize, spacing, displayProps)}
          </g>
        )}

        {displayProps.mutations.graph.show && (
          <g transform={`translate(${marginLeft}, ${top})`}>
            {colGraphs(df, yax, blockSize, spacing, displayProps)}
          </g>
        )}

        <g
          transform={`translate(${marginLeft + 0.5 * blockSize.w}, ${
            top + graphHeight + displayProps.plotGap
          })`}
        >
          {seq(df, blockSize, spacing, displayProps)}
        </g>

        {displayProps.features.show && (
          <g
            transform={`translate(${marginLeft + 0.5 * blockSize.w}, ${
              top + graphHeight + displayProps.plotGap + 15
            })`}
          >
            {features(df, blockSize, spacing, displayProps)}
          </g>
        )}

        <g
          transform={`translate(${marginLeft + 0.5 * blockSize.w}, ${
            top + graphHeight + displayProps.plotGap + 80
          })`}
        >
          <AxisBottomSvg
            ax={xax}
            strokeWidth={displayProps.mutations.graph.border.width}
          />
        </g>

        {/* legend */}

        {displayProps.legend.position === 'Bottom' && (
          <g
            id="legend"
            transform={`translate(${marginLeft}, ${
              top + graphHeight + displayProps.plotGap + 150
            })`}
          >
            <g>{legendSvg(blockSize, displayProps)}</g>
          </g>
        )}
      </svg>
    )
  }, [df, displayProps])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!innerRef.current) {
      return
    }

    const rect = innerRef.current.getBoundingClientRect()

    let c = Math.floor(
      (e.pageX - marginLeft * displayProps.scale - rect.left - window.scrollX) /
        (scaledBlockSize.w + scaledPadding.x)
    )

    if (c < 0 || c > df.aaStats.length - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY - top * displayProps.scale - rect.top - window.scrollY) /
        (scaledBlockSize.h + scaledPadding.y)
    )

    if (r < 0 || r > 0) {
      r = -1
    }

    if (r === -1 || c === -1) {
      setToolTipInfo(null)
    } else {
      setToolTipInfo({
        ...toolTipInfo,
        pos: {
          x: (marginLeft + c * (blockSize.w + spacing.x)) * displayProps.scale,
          y: (top + r * (blockSize.h + spacing.y)) * displayProps.scale,
        },
        cell: { row: r, col: c },
      })
    }
  }

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  //const stats:LollipopStats =  null

  return (
    <>
      {svg}

      {toolTipInfo && (
        <>
          <div
            ref={tooltipRef}
            className="absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
            style={{
              left: toolTipInfo.pos.x + scaledBlockSize.w,
              top: toolTipInfo.pos.y + scaledBlockSize.h,
            }}
          >
            {/* <p className="font-semibold">{stats!.position}</p>
            <p>{stats!.gene}</p>
            <p>{getEventLabel(stats!, oncoProps, displayProps.multi)}</p> */}
            <p>{`row: ${toolTipInfo.cell.row + 1}, col: ${
              toolTipInfo.cell.col + 1
            }`}</p>
          </div>

          <span
            ref={highlightRef}
            className="absolute z-50 border-black"
            style={{
              top: 10,
              left: `${toolTipInfo.pos.x - 1}px`,
              width: `${scaledBlockSize.w + 1}px`,
              height: (gridHeight + top - 10) * displayProps.scale,
              borderWidth: `${Math.max(1, displayProps.scale)}px`,
            }}
          />
        </>
      )}
    </>
  )
})
