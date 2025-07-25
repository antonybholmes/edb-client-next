import { Axis, YAxis } from '@/components/plot/axis'
import { AxisLeftSvg, AxisTopSvg } from '@components/plot/axis-svg'
import { type ICell } from '@interfaces/cell'
import { type IPos } from '@interfaces/pos'

import { BaseSvg } from '@/components/base-svg'
import { SVG_CRISP_EDGES } from '@/consts'
import type { ISVGProps } from '@/interfaces/svg-props'
import type { IBlock } from '@components/plot/heatmap/heatmap-svg-props'
import { COLOR_BLACK } from '@lib/color/color'
import { range } from '@lib/math/range'
import {
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { clinicalLegendSvgs, clinicalTracksSvg } from './clinical-tracks-svg'
import {
  MULTI_MUTATION,
  NO_ALTERATIONS_TEXT,
  NO_ALTERATION_COLOR,
  OTHER_MUTATION,
  getEventLabel,
  type IOncoProps,
  type IOncoplotDisplayProps,
  type OncoplotMutationFrame,
} from './oncoplot-utils'
import { PlotContext } from './plot-provider'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell
}

function makeMatrix(
  df: OncoplotMutationFrame,
  displayProps: IOncoplotDisplayProps,

  blockSize: IBlock,
  spacing: IPos
): ReactNode {
  return (
    <>
      {range(df.shape[0]).map(ri => {
        const y = ri * (blockSize.h + spacing.y)

        return range(df.shape[1]).map(ci => {
          const x = ci * (blockSize.w + spacing.x)

          const stats = df.data(ri, ci)

          if (stats.events.length > 1 && displayProps.multi !== 'single') {
            // deal with multi only if there are multiple events in a cell
            // and user has specified a multi mode

            if (displayProps.multi === 'equalbar') {
              const events = [...stats.countMap.keys()].sort()

              const h = blockSize.h / events.length

              //console.log(stats.sample, events)

              return events.map((id, idi) => {
                const fill: string =
                  displayProps.legend.mutations.colorMap.get(id) ??
                  displayProps.legend.mutations.colorMap.get(OTHER_MUTATION)!

                return (
                  <rect
                    id={`${ri}:${ci}:${idi}`}
                    key={`${ri}:${ci}:${idi}`}
                    x={x}
                    y={y + idi * h}
                    width={blockSize.w}
                    height={h}
                    fill={fill}
                    shapeRendering={SVG_CRISP_EDGES}
                  />
                )
              })
            } else if (displayProps.multi === 'stackedbar') {
              // draw stacked bars within each cell if necessary
              // this makes the svg larger

              const dist = stats.normCountDist(
                displayProps.legend.mutations.names
              )

              const yax: Axis = new YAxis()
                .setDomain([0, 1])
                .setLength(blockSize.h)

              const coords = [0]

              dist.map((_, di) => {
                coords.push(coords[coords.length - 1]! + dist[di]![1])
              })

              return dist.map((d, di) => {
                const h =
                  yax.domainToRange(coords[di]!) -
                  yax.domainToRange(coords[di + 1]!)

                // only render if there was a count associated with the event
                if (h > 0) {
                  const color =
                    displayProps.legend.mutations.colorMap.get(d[0]) ??
                    displayProps.legend.mutations.noAlterationColor

                  return (
                    <rect
                      key={`${ri}:${ci}:${di}`}
                      x={x}
                      y={y + yax.domainToRange(coords[di + 1]!)}
                      width={blockSize.w}
                      height={h}
                      //stroke={color}
                      fill={color}
                      shapeRendering={SVG_CRISP_EDGES}
                    />
                  )
                } else {
                  return null
                }
              })
            } else {
              // multi mode draw black bars
              const fill: string =
                displayProps.legend.mutations.colorMap.get(MULTI_MUTATION) ??
                displayProps.legend.mutations.colorMap.get(OTHER_MUTATION)!

              return (
                <rect
                  id={`${ri}:${ci}`}
                  key={`${ri}:${ci}`}
                  x={x}
                  y={y}
                  width={blockSize.w}
                  height={blockSize.h}
                  fill={fill}
                  shapeRendering={SVG_CRISP_EDGES}
                />
              )
            }
          } else {
            // single case draw one color
            const id = stats.maxEvent[0]
            const fill: string =
              id != ''
                ? (displayProps.legend.mutations.colorMap.get(id) ??
                  displayProps.legend.mutations.noAlterationColor)
                : displayProps.legend.mutations.colorMap.get(OTHER_MUTATION)!
            return (
              <rect
                id={`${ri}:${ci}`}
                key={`${ri}:${ci}`}
                x={x}
                y={y}
                width={blockSize.w}
                height={blockSize.h}
                fill={fill}
                shapeRendering={SVG_CRISP_EDGES}
              />
            )
          }
        })
      })}
    </>
  )
}

function makeGrid(
  displayProps: IOncoplotDisplayProps,
  gridWidth: number,
  gridHeight: number,

  blockSize: IBlock,
  spacing: IPos
): ReactNode {
  let gridElem: ReactNode = null

  // no spacing so simple grid

  if (displayProps.grid.spacing.x + displayProps.grid.spacing.y === 0) {
    if (displayProps.grid.show) {
      gridElem = (
        <>
          {range(blockSize.h, gridHeight, blockSize.h).map(y => (
            <line
              key={y}
              x1={0}
              y1={y}
              x2={gridWidth}
              y2={y}
              stroke={displayProps.grid.color}
              shapeRendering={SVG_CRISP_EDGES}
            />
          ))}
          {range(blockSize.w, gridWidth, blockSize.w).map(x => (
            <line
              key={x}
              x1={x}
              y1={0}
              x2={x}
              y2={gridHeight}
              stroke={displayProps.grid.color}
              shapeRendering={SVG_CRISP_EDGES}
            />
          ))}

          {displayProps.border.show && (
            <rect
              x={0}
              y={0}
              width={gridWidth}
              height={gridHeight}
              stroke={displayProps.border.color}
              fill="none"
              shapeRendering={SVG_CRISP_EDGES}
            />
          )}
        </>
      )
    }
  } else if (displayProps.grid.spacing.x === 0) {
    // grids for row blocks

    gridElem = (
      <>
        {range(0, gridHeight, blockSize.h + spacing.y).map(y => (
          <g key={y}>
            {displayProps.grid.show && (
              <>
                {range(blockSize.w, gridWidth, blockSize.w).map(x => (
                  <line
                    key={`${x}:${y}`}
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + blockSize.h}
                    stroke={displayProps.grid.color}
                    strokeOpacity={displayProps.grid.opacity}
                    shapeRendering={SVG_CRISP_EDGES}
                  />
                ))}
              </>
            )}

            {displayProps.border.show && (
              <rect
                key={y}
                x={0}
                y={y}
                width={gridWidth}
                height={blockSize.h}
                stroke={displayProps.border.color}
                strokeWidth={displayProps.border.strokeWidth}
                fill="none"
                shapeRendering={SVG_CRISP_EDGES}
              />
            )}
          </g>
        ))}
      </>
    )
  } else {
    // draw border around every element
    if (displayProps.border.show) {
      gridElem = (
        <>
          {range(0, gridWidth, blockSize.w + spacing.x).map(x => {
            return range(0, gridHeight, blockSize.h + spacing.y).map(y => (
              <rect
                key={`${x}:${y}`}
                x={x}
                y={y}
                width={blockSize.w}
                height={blockSize.h}
                stroke={displayProps.border.color}
                strokeOpacity={displayProps.border.opacity}
                strokeWidth={displayProps.border.strokeWidth}
                fill="none"
                shapeRendering={SVG_CRISP_EDGES}
              />
            ))
          })}
        </>
      )
    }
  }

  return gridElem
}

function colGraphs(
  df: OncoplotMutationFrame,
  yax: YAxis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  return (
    <>
      <g transform={`translate(${-5}, 0)`}>
        <AxisLeftSvg
          ax={yax}
          strokeWidth={displayProps.samples.graphs.border.strokeWidth}
        />
      </g>
      <g>
        {df.sampleStats.map((stats, ci) => {
          const coords = [0]

          const names = displayProps.legend.mutations.names.filter(name =>
            stats.countMap.has(name)
          )

          names.map(name => {
            coords.push(coords[coords.length - 1]! + stats.countMap.get(name)!)
          })

          return names.map((name, mi) => {
            const h =
              yax.domainToRange(coords[mi]!) -
              yax.domainToRange(coords[mi + 1]!)

            return (
              <rect
                key={mi}
                x={ci * (blockSize.w + spacing.x)}
                y={yax.domainToRange(coords[mi + 1]!)}
                width={blockSize.w}
                height={h}
                fill={
                  displayProps.legend.mutations.colorMap.get(name) ??
                  displayProps.legend.mutations.noAlterationColor
                }
                stroke={displayProps.samples.graphs.border.color}
                strokeOpacity={displayProps.samples.graphs.border.opacity}
                opacity={displayProps.samples.graphs.opacity}
                strokeWidth={
                  displayProps.samples.graphs.border.show
                    ? displayProps.samples.graphs.border.strokeWidth
                    : 0
                }
                shapeRendering={SVG_CRISP_EDGES}
              />
            )
          })
        })}
      </g>
    </>
  )
}

function rowGraphs(
  df: OncoplotMutationFrame,
  xax: Axis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  return (
    <>
      {displayProps.features.graphs.percentages.show && (
        <g>
          {df.geneStats.map((stats, ri) => {
            return (
              <text
                key={ri}
                x={0}
                y={ri * (blockSize.h + spacing.y) + 0.5 * blockSize.h}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                fontSize="smaller"
                //textAnchor="end"
              >
                {((stats.sum / df.sampleStats.length) * 100).toFixed(1)}%
              </text>
            )
          })}
        </g>
      )}

      <g
        transform={`translate(${
          displayProps.features.graphs.percentages.show
            ? displayProps.features.graphs.percentages.width
            : 0
        }, ${-displayProps.axisOffset})`}
      >
        <AxisTopSvg
          ax={xax}
          strokeWidth={displayProps.features.graphs.border.strokeWidth}
        />
      </g>

      <g
        transform={`translate(${
          displayProps.features.graphs.percentages.show
            ? displayProps.features.graphs.percentages.width
            : 0
        }, 0)`}
      >
        {df.geneStats.map((stats, ri) => {
          const coords = [0]

          const names = displayProps.legend.mutations.names.filter(name =>
            stats.countMap.has(name)
          )
          // get the non zero counts
          const counts = stats.countDist(names)

          counts.map(count => {
            coords.push(coords[coords.length - 1]! + count[1])
          })

          return counts.map((count, li) => {
            const w =
              xax.domainToRange(coords[li + 1]!) -
              xax.domainToRange(coords[li]!)

            return (
              <rect
                key={li}
                y={ri * (blockSize.h + spacing.y)}
                x={xax.domainToRange(coords[li]!)}
                width={w}
                height={blockSize.h}
                fill={
                  displayProps.legend.mutations.colorMap.get(count[0]) ??
                  displayProps.legend.mutations.noAlterationColor
                }
                shapeRendering={SVG_CRISP_EDGES}
                stroke={displayProps.features.graphs.border.color}
                strokeOpacity={displayProps.features.graphs.border.opacity}
                opacity={displayProps.features.graphs.opacity}
                strokeWidth={
                  displayProps.features.graphs.border.show
                    ? displayProps.features.graphs.border.strokeWidth
                    : 0
                }
              />
            )
          })
        })}
      </g>
    </>
  )
}

function legendSvg(blockSize: IBlock, displayProps: IOncoplotDisplayProps) {
  return (
    <>
      <g
        transform={`translate(${-displayProps.axisOffset}, ${
          0.5 * displayProps.clinical.height
        })`}
      >
        <text
          dominantBaseline="central"
          fontSize="smaller"
          textAnchor="end"
          fontWeight="bold"
        >
          {displayProps.legend.mutations.label}
        </text>
      </g>

      {displayProps.legend.mutations.names.map((name, ni) => {
        const fill: string =
          displayProps.legend.mutations.colorMap.get(name) ??
          displayProps.legend.mutations.colorMap.get(OTHER_MUTATION)!

        return (
          <g
            key={ni}
            transform={`translate(${ni * displayProps.legend.width}, 0)`}
          >
            <rect
              width={blockSize.w}
              height={blockSize.h}
              fill={fill}
              shapeRendering={SVG_CRISP_EDGES}
            />

            <text
              x={blockSize.w + 5}
              y={0.5 * blockSize.h}
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
      <g
        transform={`translate(${
          displayProps.legend.mutations.names.length * displayProps.legend.width
        }, 0)`}
      >
        <rect
          width={blockSize.w}
          height={blockSize.h}
          fill={NO_ALTERATION_COLOR}
          shapeRendering={SVG_CRISP_EDGES}
        />

        <text
          x={blockSize.w + 5}
          y={0.5 * blockSize.h}
          fill={COLOR_BLACK}
          dominantBaseline="central"
          fontSize="smaller"
          //textAnchor="end"
        >
          {NO_ALTERATIONS_TEXT}
        </text>
      </g>
    </>
  )
}

interface IProps extends ISVGProps {
  oncoProps: IOncoProps
}

export function OncoplotSvg({ ref, oncoProps }: IProps) {
  const { plotState } = useContext(PlotContext)

  const displayProps = plotState.displayProps
  const clinicalTracks = plotState.clinicalTracks
  const mf = plotState.mutationFrame

  const blockSize: IBlock = displayProps.grid.cell
  const spacing = displayProps.grid.spacing
  const halfBlockSize: IBlock = { w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }
  const scaledBlockSize = {
    w: blockSize.w * displayProps.scale,
    h: blockSize.h * displayProps.scale,
  }

  const scaledPadding = {
    x: spacing.x * displayProps.scale,
    y: spacing.y * displayProps.scale,
  }

  const innerRef = useRef<SVGSVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current! as SVGSVGElement)

  const tooltipRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  //const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  const marginLeft = displayProps.margin.left
  const marginRight = displayProps.margin.right

  const top = Math.max(
    displayProps.margin.top,
    10 +
      (displayProps.samples.graphs.show
        ? displayProps.samples.graphs.height + displayProps.plotGap
        : 0) +
      (displayProps.clinical.show
        ? clinicalTracks.filter(
            (_, ti) => displayProps.legend.clinical.tracks[ti]!.show
          ).length *
            (displayProps.clinical.height + displayProps.clinical.gap) +
          displayProps.plotGap
        : 0)
  )

  const bottom = Math.max(
    displayProps.margin.bottom +
      clinicalTracks.length * (blockSize.h + displayProps.plotGap) +
      displayProps.legend.offset
  )

  const gridWidth = mf.shape[1] * (blockSize.w + spacing.x)
  const gridHeight = mf.shape[0] * (blockSize.h + spacing.y)
  const width = gridWidth + marginLeft + marginRight
  const height = gridHeight + top + bottom

  const svg = useMemo(() => {
    if (!mf) {
      return null
    }

    const samples: string[] = mf.sampleStats.map(stats => stats.sample)

    // keep things simple and use ints for the graph limits
    const maxSampleCount = Math.round(
      Math.max(...mf.sampleStats.map(stats => stats.sum))
    )

    const yax = new YAxis()
      .setDomain([0, maxSampleCount])
      .setLength(displayProps.samples.graphs.height)
      .setTitle('TMB')
      .setTicks([0, maxSampleCount])

    const maxGeneCount = Math.round(
      Math.max(...mf.geneStats.map(stats => stats.sum))
    )

    const xax = new Axis()
      .setDomain([0, maxGeneCount])
      .setLength(displayProps.features.graphs.height)
      .setTitle('No. of samples')
      .setTicks([
        { v: 0, label: maxGeneCount.toLocaleString() },
        { v: maxGeneCount, label: `${maxGeneCount} / ${mf.shape[1]}` },
      ])
    //.setTickLabels([0, `${maxGeneCount} / ${mf.shape[1]}`])

    // get list of all events in use

    // make the grid

    //const legend = oncoProps.plotorder.filter(id => allEventsInUse.has(id))

    return (
      <BaseSvg
        ref={innerRef}
        width={width}
        height={height}
        scale={displayProps.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        onMouseMove={onMouseMove}
        className="absolute"
      >
        {/* clinical tracks */}
        {displayProps.clinical.show && (
          <g transform={`translate(${marginLeft}, 10)`}>
            {clinicalTracksSvg(
              samples,
              clinicalTracks,
              blockSize,
              spacing,
              displayProps
            )}
          </g>
        )}

        {/* col graph */}
        {displayProps.samples.graphs.show && (
          <g
            transform={`translate(${marginLeft}, ${
              top - displayProps.plotGap - displayProps.samples.graphs.height
            })`}
          >
            {colGraphs(mf, yax, blockSize, spacing, displayProps)}
          </g>
        )}

        {/* row graph */}
        {displayProps.features.graphs.show && (
          <g
            transform={`translate(${
              marginLeft + gridWidth + displayProps.plotGap
            }, ${top})`}
          >
            {rowGraphs(mf, xax, blockSize, spacing, displayProps)}
          </g>
        )}

        {/* matrix */}

        <g transform={`translate(${marginLeft}, ${top})`}>
          {makeMatrix(mf, displayProps, blockSize, spacing)}
        </g>

        {/* grid */}

        <g transform={`translate(${marginLeft}, ${top})`}>
          {makeGrid(displayProps, gridWidth, gridHeight, blockSize, spacing)}
        </g>

        {/* row labels */}

        <g
          transform={`translate(${
            marginLeft - displayProps.axisOffset
          }, ${top})`}
        >
          {mf.geneStats.map((stats, ri) => {
            return (
              <text
                key={ri}
                x={0}
                y={ri * (blockSize.h + spacing.y) + halfBlockSize.h}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                fontSize="smaller"
                textAnchor="end"
              >
                {stats.gene}
              </text>
            )
          })}
        </g>

        {/* legend */}

        {displayProps.legend.position === 'bottom' && (
          <g
            id="legend"
            transform={`translate(${marginLeft}, ${
              top + gridHeight + displayProps.legend.offset
            })`}
          >
            <g>{legendSvg(blockSize, displayProps)}</g>

            <g
              transform={`translate(0, ${
                blockSize.h + displayProps.legend.gap
              })`}
            >
              {clinicalLegendSvgs(clinicalTracks, blockSize, displayProps)}
            </g>
          </g>
        )}
      </BaseSvg>
    )
  }, [mf, clinicalTracks, displayProps])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!innerRef.current) {
      return
    }

    const rect = innerRef.current.getBoundingClientRect()

    let c = Math.floor(
      (e.pageX - marginLeft * displayProps.scale - rect.left - window.scrollX) /
        (scaledBlockSize.w + scaledPadding.x)
    )

    if (c < 0 || c > mf.shape[1] - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY - top * displayProps.scale - rect.top - window.scrollY) /
        (scaledBlockSize.h + scaledPadding.y)
    )

    if (r < 0 || r > mf.shape[0] - 1) {
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

  const stats = toolTipInfo
    ? mf.data(toolTipInfo.cell.row, toolTipInfo.cell.col)
    : null

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
            <p className="font-semibold">{stats!.sample}</p>
            <p>{stats!.gene}</p>
            <p>{getEventLabel(stats!, oncoProps, displayProps.multi)}</p>
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
}
