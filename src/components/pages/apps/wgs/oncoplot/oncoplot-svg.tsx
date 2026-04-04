import { Axis, YAxis } from '@/components/plot/axis'
import { AxisLeftSvg, AxisTopSvg } from '@/components/plot/axis-svg'
import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'

import { BaseSvg } from '@/components/base-svg'
import type { IBlock } from '@/components/plot/heatmap/heatmap-svg-props'
import { SVG_CRISP_EDGES } from '@/consts'
import type { ISVGProps } from '@/interfaces/svg-props'
import { COLOR_BLACK } from '@/lib/color/color'
import { range } from '@/lib/math/range'
import {
  useImperativeHandle,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { clinicalLegendSvgs, clinicalTracksSvg } from './clinical-tracks-svg'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'
import {
  MULTI_MUTATION,
  NO_ALTERATIONS_TEXT,
  NO_ALTERATION_COLOR,
  OTHER_MUTATION,
  getEventLabel,
  mutationColorMapFromMutations,
  type IOncoplotDisplayProps,
  type OncoplotFrame,
} from './oncoplot-utils'

//const MIN_INNER_HEIGHT: number = 200

export interface ITooltip {
  pos: IPos
  cell: ICell & IPos
}

function makeMatrix(
  df: OncoplotFrame,
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  displayProps: IOncoplotDisplayProps,
  blockSize: IBlock,
  spacing: IPos
): ReactNode {
  const lcMutationsInUse = mutationsInUse.map(m => m.toLowerCase())
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

            if (displayProps.multi === 'equal-bars') {
              const names = lcMutationsInUse.filter(name =>
                stats.countMap.has(name)
              )

              //const events = [...stats.countMap.keys()].sort()

              const h = blockSize.h / names.length

              // if (stats.sample == 'SP59368') {
              //   console.log( stats.sample, events)
              // }

              return names.map((id, idi) => {
                const fill: string = colorMap[id] ?? colorMap[OTHER_MUTATION]!

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
                    pointerEvents="none"
                  />
                )
              })
            } else if (displayProps.multi === 'stacked-bars') {
              // draw stacked bars within each cell if necessary
              // this makes the svg larger

              const dist = stats.normCountDist(lcMutationsInUse)

              const yax: Axis = new YAxis()
                .setDomain([0, 1])
                .setLength(blockSize.h)

              const coords = [0]

              dist.map((_, di) => {
                coords.push(coords[coords.length - 1]! + dist[di]!.value)
              })

              return dist.map((d, di) => {
                const h =
                  yax.domainToRange(coords[di]!) -
                  yax.domainToRange(coords[di + 1]!)

                // only render if there was a count associated with the event
                if (h > 0) {
                  const color = colorMap[d.name] ?? NO_ALTERATION_COLOR

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
                      pointerEvents="none"
                    />
                  )
                } else {
                  return null
                }
              })
            } else {
              // multi mode draw black bars
              const fill: string =
                colorMap[MULTI_MUTATION] ?? colorMap[OTHER_MUTATION]!

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
                  pointerEvents="none"
                />
              )
            }
          } else {
            // single case draw one color
            const id = stats.maxEvent.name
            const fill: string =
              id != ''
                ? (colorMap[id] ?? NO_ALTERATION_COLOR)
                : colorMap[OTHER_MUTATION]!
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
                pointerEvents="none"
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
  let gridElem: ReactElement[] = []

  // no spacing so simple grid
  if (displayProps.grid.show) {
    if (displayProps.grid.spacing.x + displayProps.grid.spacing.y === 0) {
      range(blockSize.h, gridHeight, blockSize.h).forEach(y => {
        gridElem.push(
          <line
            key={y}
            x1={0}
            y1={y}
            x2={gridWidth}
            y2={y}
            stroke={displayProps.grid.color}
            shapeRendering={SVG_CRISP_EDGES}
            pointerEvents="none"
          />
        )
      })
      range(blockSize.w, gridWidth, blockSize.w).forEach(x => {
        gridElem.push(
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={gridHeight}
            stroke={displayProps.grid.color}
            shapeRendering={SVG_CRISP_EDGES}
            pointerEvents="none"
          />
        )
      })
    } else if (displayProps.grid.spacing.x === 0) {
      // grids for row blocks

      range(0, gridHeight, blockSize.h + spacing.y).forEach(y => {
        range(blockSize.w, gridWidth, blockSize.w).forEach(x => {
          gridElem.push(
            <line
              key={`${x}:${y}`}
              x1={x}
              y1={y}
              x2={x}
              y2={y + blockSize.h}
              stroke={displayProps.grid.color}
              strokeOpacity={displayProps.grid.opacity}
              shapeRendering={SVG_CRISP_EDGES}
              pointerEvents="none"
            />
          )
        })
      })
    } else {
      // draw border around every element

      range(0, gridWidth, blockSize.w + spacing.x).forEach(x => {
        range(0, gridHeight, blockSize.h + spacing.y).forEach(y => {
          gridElem.push(
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
              pointerEvents="none"
            />
          )
        })
      })
    }
  }

  if (displayProps.border.show) {
    gridElem.push(
      <rect
        key="border"
        id="border"
        x={0}
        y={0}
        width={gridWidth}
        height={gridHeight}
        stroke={displayProps.border.color}
        fill="none"
        shapeRendering={SVG_CRISP_EDGES}
        pointerEvents="none"
      />
    )
  }

  return gridElem
}

function colGraphs(
  df: OncoplotFrame,
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  yax: YAxis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  const lcMutationsInUse = mutationsInUse.map(m => m.toLowerCase())
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

          const names = lcMutationsInUse.filter(name =>
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
                fill={colorMap[name] ?? NO_ALTERATION_COLOR}
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
  df: OncoplotFrame,
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  xax: Axis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  const lcMutationsInUse = mutationsInUse.map(m => m.toLowerCase())

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

          const names = lcMutationsInUse.filter(name =>
            stats.countMap.has(name)
          )
          // get the non zero counts
          const counts = stats.countDist(names)

          counts.map(count => {
            coords.push(coords[coords.length - 1]! + count.value)
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
                fill={colorMap[count.name] ?? NO_ALTERATION_COLOR}
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

function legendSvg(
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
) {
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
          {displayProps.legend.variants.label}
        </text>
      </g>

      {mutationsInUse.map((name, ni) => {
        const fill: string = colorMap[name] ?? colorMap[OTHER_MUTATION]!

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
          mutationsInUse.length * displayProps.legend.width
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

function vLegendSvg(
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
) {
  return (
    <>
      <text
        dominantBaseline="central"
        fontSize="smaller"
        //textAnchor="end"
        fontWeight="bold"
      >
        {displayProps.legend.variants.label}
      </text>

      <g transform={`translate(0, ${displayProps.legend.title.height})`}>
        {mutationsInUse.map((name, ni) => {
          const fill: string = colorMap[name] ?? colorMap[OTHER_MUTATION]!

          return (
            <g
              key={ni}
              transform={`translate(0, ${ni * (blockSize.h + displayProps.plotGap)})`}
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
          transform={`translate(0, ${
            mutationsInUse.length * (blockSize.h + displayProps.plotGap)
          })`}
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
      </g>
    </>
  )
}

// interface IProps extends ISVGProps {
//   oncoProps: IOncoProps
// }

export function OncoplotSvg({ ref }: ISVGProps) {
  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!innerRef.current) {
      return
    }

    const rect = innerRef.current.getBoundingClientRect()

    let x =
      e.pageX - marginLeft * displayProps.scale - rect.left - window.scrollX

    let c = Math.floor(x / (scaledBlockSize.w + scaledPadding.x))

    if (c < 0 || c > (mf?.shape[1] ?? 0) - 1) {
      c = -1
    }

    let y = e.pageY - top * displayProps.scale - rect.top - window.scrollY

    let r = Math.floor(y / (scaledBlockSize.h + scaledPadding.y))

    if (r < 0 || r > (mf?.shape[0] ?? 0) - 1) {
      r = -1
    }

    if (r === -1 || c === -1) {
      setToolTipInfo(null)
    } else {
      x = (marginLeft + c * (blockSize.w + spacing.x)) * displayProps.scale
      y = (top + r * (blockSize.h + spacing.y)) * displayProps.scale
      setToolTipInfo({
        ...toolTipInfo,
        pos: {
          x: x + 5,
          y: y + 5,
        },
        cell: { x, y, row: r, col: c },
      })
    }
  }

  const { mutations, displayProps } = useOncoplotSettings()
  const { mutationFrame: mf, mutationsInUse, clinicalTracks } = useOncoplot()

  const colorMap = mutationColorMapFromMutations(mutations)

  console.log('oncoProps in OncoplotSvg:', displayProps)

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
            track =>
              displayProps.legend.clinical.tracks[track.name]?.show ?? false
          ).length *
            (displayProps.clinical.height + displayProps.clinical.gap) +
          displayProps.plotGap
        : 0)
  )

  // width of max clinical tracks
  let clinicalTracksWidth = 0

  for (const track of clinicalTracks) {
    clinicalTracksWidth = Math.max(
      clinicalTracksWidth,
      track.categoriesInUse.length * displayProps.legend.width
    )
  }

  let bottom = displayProps.margin.bottom

  bottom = Math.max(
    (mutationsInUse.length + 1) * (blockSize.h + displayProps.plotGap) +
      displayProps.legend.title.height,
    bottom
  )

  bottom = Math.max(
    clinicalTracks.length * (blockSize.h + displayProps.plotGap) +
      displayProps.legend.title.height,
    bottom
  )

  bottom += displayProps.legend.offset

  const cols = mf?.shape[1] ?? 0
  const gridWidth = cols * blockSize.w + (cols - 1) * spacing.x
  const rows = mf?.shape[0] ?? 0
  const gridHeight = rows * blockSize.h + (rows - 1) * spacing.y

  const width =
    Math.max(gridWidth, clinicalTracksWidth) + marginLeft + marginRight
  const height = gridHeight + top + bottom

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
    .setTitle(displayProps.samples.graphs.yaxis.label)
    .setTicks([0, maxSampleCount])

  const maxGeneCount = Math.round(
    Math.max(...mf.geneStats.map(stats => stats.sum))
  )

  const xax = new Axis()
    .setDomain([0, maxGeneCount])
    .setLength(displayProps.features.graphs.height)
    .setTitle('No. of samples')
    .setTicks([
      { v: 0, label: '0' },
      { v: maxGeneCount, label: `${maxGeneCount} / ${mf.shape[1]}` },
    ])
  //.setTickLabels([0, `${maxGeneCount} / ${mf.shape[1]}`])

  // get list of all events in use

  // make the grid

  //const legend = oncoProps.plotorder.filter(id => allEventsInUse.has(id))

  const svg = (
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
        <g
          transform={`translate(${marginLeft}, 10)`}
          //className="pointer-events-none"
          pointerEvents="none"
        >
          {clinicalTracksSvg(
            samples,
            clinicalTracks,
            displayProps.legend.clinical.tracks,
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
          {colGraphs(
            mf,
            mutationsInUse,
            colorMap,
            yax,
            blockSize,
            spacing,
            displayProps
          )}
        </g>
      )}

      {/* row graph */}
      {displayProps.features.graphs.show && (
        <g
          transform={`translate(${
            marginLeft + gridWidth + displayProps.plotGap
          }, ${top})`}
        >
          {rowGraphs(
            mf,
            mutationsInUse,
            colorMap,
            xax,
            blockSize,
            spacing,
            displayProps
          )}
        </g>
      )}

      {/* matrix */}

      <g transform={`translate(${marginLeft}, ${top})`}>
        {makeMatrix(
          mf,
          mutationsInUse,
          colorMap,
          displayProps,
          blockSize,
          spacing
        )}
      </g>

      {/* grid */}

      <g transform={`translate(${marginLeft}, ${top})`}>
        {makeGrid(displayProps, gridWidth, gridHeight, blockSize, spacing)}
      </g>

      {/* row labels */}

      <g
        transform={`translate(${marginLeft - displayProps.axisOffset}, ${top})`}
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
              {stats.feature}
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
          <g>{vLegendSvg(mutationsInUse, colorMap, blockSize, displayProps)}</g>

          <g
            transform={`translate(${displayProps.legend.width + displayProps.legend.gap}, 0)`}
          >
            {clinicalLegendSvgs(
              clinicalTracks,
              displayProps.legend.clinical.tracks,
              blockSize,
              displayProps
            )}
          </g>
        </g>
      )}
    </BaseSvg>
  )

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  const stats = toolTipInfo
    ? mf?.data(toolTipInfo.cell.row, toolTipInfo.cell.col)
    : null

  return (
    <>
      {svg}

      {toolTipInfo && (
        <>
          <div
            ref={tooltipRef}
            className="absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100 w-48 pointer-events-none"
            style={{
              left: toolTipInfo.pos.x + scaledBlockSize.w,
              top: toolTipInfo.pos.y + scaledBlockSize.h,
            }}
          >
            <p className="font-semibold">{stats!.sample}</p>
            <p>{stats!.feature}</p>
            <p className="truncate">
              {/* Let's show all mutations in the label */}
              {getEventLabel(stats!, mutationsInUse, 'single')}
            </p>
            <p>{`row: ${toolTipInfo.cell.row + 1}, col: ${
              toolTipInfo.cell.col + 1
            }`}</p>
          </div>

          <span
            ref={highlightRef}
            className="absolute z-50 border-black pointer-events-none"
            style={{
              top: 10,
              left: `${toolTipInfo.cell.x - 1}px`,
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
