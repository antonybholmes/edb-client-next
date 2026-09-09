import {
  IAxis,
  axisDomainToRangeFunc,
  createAxis,
} from '@/components/plot/axes/axis'
import { AxisLeftSvg, AxisTopSvg } from '@/components/plot/axes/svg-axis'
import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'

import type { IBlock } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_BLACK } from '@/lib/color/color'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { range } from '@/lib/math/range'
import { useSVG } from '@/providers/svg-provider'
import { TOOLTIP_CLEAR_MS, useTooltip } from '@/providers/tooltip-provider'
import {
  useCallback,
  useMemo,
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
  const lcMutationsInUse = mutationsInUse.map((m) => m.toLowerCase())
  return (
    <>
      {range(df.shape[0]).map((ri) => {
        const y = ri * (blockSize.h + spacing.y)

        return range(df.shape[1]).map((ci) => {
          const x = ci * (blockSize.w + spacing.x)

          const stats = df.data(ri, ci)

          if (stats.events.length > 1 && displayProps.multi !== 'single') {
            // deal with multi only if there are multiple events in a cell
            // and user has specified a multi mode

            if (displayProps.multi === 'equal-bars') {
              const names = lcMutationsInUse.filter((name) =>
                stats.countMap.has(name)
              )

              //const events = [...stats.countMap.keys()].sort()

              const h = blockSize.h / names.length

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

              const yax: IAxis = createAxis({
                direction: 'y',
                domain: [0, 1],
                length: blockSize.h,
              })

              const coords = [0]

              dist.map((_, di) => {
                coords.push(coords[coords.length - 1]! + dist[di]!.value)
              })

              const yaf = axisDomainToRangeFunc(yax)

              return dist.map((d, di) => {
                const h = yaf(coords[di]!) - yaf(coords[di + 1]!)

                // only render if there was a count associated with the event
                if (h > 0) {
                  const color = colorMap[d.name] ?? NO_ALTERATION_COLOR

                  return (
                    <rect
                      key={`${ri}:${ci}:${di}`}
                      x={x}
                      y={y + yaf(coords[di + 1]!)}
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
      range(blockSize.h, gridHeight, blockSize.h).forEach((y) => {
        gridElem.push(
          <line
            key={y}
            x1={0}
            y1={y}
            x2={gridWidth}
            y2={y}
            stroke={displayProps.grid.value}
            shapeRendering={SVG_CRISP_EDGES}
            pointerEvents="none"
          />
        )
      })
      range(blockSize.w, gridWidth, blockSize.w).forEach((x) => {
        gridElem.push(
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={gridHeight}
            stroke={displayProps.grid.value}
            shapeRendering={SVG_CRISP_EDGES}
            pointerEvents="none"
          />
        )
      })
    } else if (displayProps.grid.spacing.x === 0) {
      // grids for row blocks

      range(0, gridHeight, blockSize.h + spacing.y).forEach((y) => {
        range(blockSize.w, gridWidth, blockSize.w).forEach((x) => {
          gridElem.push(
            <line
              key={`${x}:${y}`}
              x1={x}
              y1={y}
              x2={x}
              y2={y + blockSize.h}
              stroke={displayProps.grid.value}
              strokeOpacity={displayProps.grid.opacity}
              shapeRendering={SVG_CRISP_EDGES}
              pointerEvents="none"
            />
          )
        })
      })
    } else {
      // draw border around every element

      range(0, gridWidth, blockSize.w + spacing.x).forEach((x) => {
        range(0, gridHeight, blockSize.h + spacing.y).forEach((y) => {
          gridElem.push(
            <rect
              key={`${x}:${y}`}
              x={x}
              y={y}
              width={blockSize.w}
              height={blockSize.h}
              stroke={displayProps.border.value}
              strokeOpacity={displayProps.border.opacity}
              strokeWidth={displayProps.border.width}
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
        stroke={displayProps.border.value}
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
  yax: IAxis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  const lcMutationsInUse = mutationsInUse.map((m) => m.toLowerCase())

  const yaf = axisDomainToRangeFunc(yax)

  return (
    <>
      <g transform={`translate(${-5}, 0)`}>
        <AxisLeftSvg
          ax={yax}
          strokeWidth={displayProps.samples.graphs.border.width}
          labelFont={displayProps.title}
          font={displayProps.text}
        />
      </g>
      <g>
        {df.sampleStats.map((stats, ci) => {
          const coords = [0]

          const names = lcMutationsInUse.filter((name) =>
            stats.countMap.has(name)
          )

          names.map((name) => {
            coords.push(coords[coords.length - 1]! + stats.countMap.get(name)!)
          })

          return names.map((name, mi) => {
            const h = yaf(coords[mi]!) - yaf(coords[mi + 1]!)

            return (
              <rect
                key={mi}
                x={ci * (blockSize.w + spacing.x)}
                y={yaf(coords[mi + 1]!)}
                width={blockSize.w}
                height={h}
                fill={colorMap[name] ?? NO_ALTERATION_COLOR}
                stroke={displayProps.samples.graphs.border.value}
                strokeOpacity={displayProps.samples.graphs.border.opacity}
                opacity={displayProps.samples.graphs.opacity}
                strokeWidth={
                  displayProps.samples.graphs.border.show
                    ? displayProps.samples.graphs.border.width
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
  xax: IAxis,
  blockSize: IBlock,
  spacing: IPos,
  displayProps: IOncoplotDisplayProps
) {
  const lcMutationsInUse = mutationsInUse.map((m) => m.toLowerCase())

  const xaf = axisDomainToRangeFunc(xax)

  return (
    <>
      {displayProps.features.graphs.percentages.show && (
        <g>
          {df.geneStats.map((stats, ri) => {
            return (
              <SvgText
                key={ri}
                x={0}
                y={ri * (blockSize.h + spacing.y) + 0.5 * blockSize.h}
                dominantBaseline="central"
                font={displayProps.text}
              >
                {((stats.sum / df.sampleStats.length) * 100).toFixed(1)}%
              </SvgText>
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
          strokeWidth={displayProps.features.graphs.border.width}
          labelFont={displayProps.title}
          font={displayProps.text}
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

          const names = lcMutationsInUse.filter((name) =>
            stats.countMap.has(name)
          )
          // get the non zero counts
          const counts = stats.countDist(names)

          counts.map((count) => {
            coords.push(coords[coords.length - 1]! + count.value)
          })

          return counts.map((count, li) => {
            const w = xaf(coords[li + 1]!) - xaf(coords[li]!)

            return (
              <rect
                key={li}
                y={ri * (blockSize.h + spacing.y)}
                x={xaf(coords[li]!)}
                width={w}
                height={blockSize.h}
                fill={colorMap[count.name] ?? NO_ALTERATION_COLOR}
                shapeRendering={SVG_CRISP_EDGES}
                stroke={displayProps.features.graphs.border.value}
                strokeOpacity={displayProps.features.graphs.border.opacity}
                opacity={displayProps.features.graphs.opacity}
                strokeWidth={
                  displayProps.features.graphs.border.show
                    ? displayProps.features.graphs.border.width
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

// function legendSvg(
//   mutationsInUse: string[],
//   colorMap: Record<string, string>,
//   blockSize: IBlock,
//   displayProps: IOncoplotDisplayProps
// ) {
//   return (
//     <>
//       <g
//         transform={`translate(${-displayProps.axisOffset}, ${
//           0.5 * displayProps.clinical.height
//         })`}
//       >
//         <text
//           dominantBaseline="central"
//           fontSize="smaller"
//           textAnchor="end"
//           fontWeight="bold"
//         >
//           {displayProps.legend.variants.label}
//         </text>
//       </g>

//       {mutationsInUse.map((name, ni) => {
//         const fill: string = colorMap[name] ?? colorMap[OTHER_MUTATION]!

//         return (
//           <g
//             key={ni}
//             transform={`translate(${ni * displayProps.legend.width}, 0)`}
//           >
//             <rect
//               width={blockSize.w}
//               height={blockSize.h}
//               fill={fill}
//               shapeRendering={SVG_CRISP_EDGES}
//             />

//             <text
//               x={blockSize.w + 5}
//               y={0.5 * blockSize.h}
//               fill={COLOR_BLACK}
//               dominantBaseline="central"
//               fontSize="smaller"
//               //textAnchor="end"
//             >
//               {name}
//             </text>
//           </g>
//         )
//       })}
//       <g
//         transform={`translate(${
//           mutationsInUse.length * displayProps.legend.width
//         }, 0)`}
//       >
//         <rect
//           width={blockSize.w}
//           height={blockSize.h}
//           fill={NO_ALTERATION_COLOR}
//           shapeRendering={SVG_CRISP_EDGES}
//         />

//         <text
//           x={blockSize.w + 5}
//           y={0.5 * blockSize.h}
//           fill={COLOR_BLACK}
//           dominantBaseline="central"
//           fontSize="smaller"
//           //textAnchor="end"
//         >
//           {NO_ALTERATIONS_TEXT}
//         </text>
//       </g>
//     </>
//   )
// }

function vLegendSvg(
  mutationsInUse: string[],
  colorMap: Record<string, string>,
  blockSize: IBlock,
  displayProps: IOncoplotDisplayProps
) {
  return (
    <>
      <SvgText dominantBaseline="central" font={displayProps.legend.title}>
        {displayProps.legend.variants.label}
      </SvgText>

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

              <SvgText
                x={blockSize.w + 5}
                y={0.5 * blockSize.h}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                font={displayProps.legend}

                //textAnchor="end"
              >
                {name}
              </SvgText>
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

          <SvgText
            x={blockSize.w + 5}
            y={0.5 * blockSize.h}
            dominantBaseline="central"
            font={displayProps.legend}
            //textAnchor="end"
          >
            {NO_ALTERATIONS_TEXT}
          </SvgText>
        </g>
      </g>
    </>
  )
}

// interface IProps extends ISVGProps {
//   oncoProps: IOncoProps
// }

export function OncoplotSvg() {
  const { ref } = useSVG()

  const { mutations, displayProps } = useOncoplotSettings()
  const { mutationFrame: mf, mutationsInUse, clinicalTracks } = useOncoplot()

  const { axis: xax } = useAxis({
    plotId: 'oncoplot',
    groupId: 'oncoplot',
    axisId: 'x',
  })

  const { axis: yax } = useAxis({
    plotId: 'oncoplot',
    groupId: 'oncoplot',
    axisId: 'y',
  })

  const colorMap = useMemo(
    () => mutationColorMapFromMutations(mutations),
    [mutations]
  )

  const blockSize: IBlock = displayProps.grid.cell
  const spacing = displayProps.grid.spacing

  const blockSpaceSize: IBlock = useMemo(() => {
    return {
      w: blockSize.w + spacing.x,
      h: blockSize.h + spacing.y,
    }
  }, [blockSize.w, blockSize.h, spacing.x, spacing.y])

  // memoized so these keep stable references across hover-only re-renders
  const halfBlockSize: IBlock = useMemo(
    () => ({ w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }),
    [blockSize.w, blockSize.h]
  )
  const scaledBlockSize = useMemo(
    () => ({
      w: blockSize.w * displayProps.scale,
      h: blockSize.h * displayProps.scale,
    }),
    [blockSize.w, blockSize.h, displayProps.scale]
  )

  const scaledPadding = useMemo(
    () => ({
      x: spacing.x * displayProps.scale,
      y: spacing.y * displayProps.scale,
    }),
    [spacing.x, spacing.y, displayProps.scale]
  )

  const { showTooltip, hideTooltip: hideTooltipOrig } = useTooltip()

  //const highlightRef = useRef<HTMLSpanElement>(null)

  //const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  const marginTop = displayProps.margin.top
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
            (track) =>
              displayProps.legend.clinical.tracks[track.name]?.show ?? false
          ).length *
            (displayProps.clinical.height + displayProps.clinical.gap) +
          displayProps.plotGap
        : 0)
  )

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

  const width = gridWidth + marginLeft + marginRight

  const height = gridHeight + top + bottom

  const samples: string[] = useMemo(
    () => mf?.sampleStats.map((stats) => stats.sample) ?? [],
    [mf]
  )

  //.setTickLabels([0, `${maxGeneCount} / ${mf.shape[1]}`])

  // get list of all events in use

  // make the grid

  //const legend = oncoProps.plotorder.filter(id => allEventsInUse.has(id))

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  // const stats = toolTipInfo
  //   ? mf?.data(toolTipInfo.cell.row, toolTipInfo.cell.col)
  //   : null

  const [barPos, setBarPos] = useState<IPos | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // avoid re-rendering the whole svg tree when the hovered cell hasn't changed
  const lastCellRef = useRef<{ r: number; c: number } | null>(null)

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    timeoutRef.current = setTimeout(() => setBarPos(null), TOOLTIP_CLEAR_MS)
  }, [])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) {
        return
      }

      let svgPoint = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      svgPoint = {
        x: svgPoint.x - marginLeft,
        y:
          svgPoint.y -
          marginTop -
          displayProps.samples.graphs.height -
          displayProps.plotGap,
      }

      let row = Math.floor(svgPoint.y / blockSpaceSize.h)
      let col = Math.floor(svgPoint.x / blockSpaceSize.w)

      if (row < 0 || row > (mf?.shape[0] ?? 0) - 1) {
        row = -1
      }

      if (col < 0 || col > (mf?.shape[1] ?? 0) - 1) {
        col = -1
      }

      //console.log('svgPoint', svgPoint, row, col, blockSize)

      if (row === -1 || col === -1) {
        hideTooltip()
        hideTooltipOrig()
        return
      }

      if (lastCellRef.current?.r === row && lastCellRef.current?.c === col) {
        return
      }

      lastCellRef.current = { r: row, c: col }

      const blockXYMid = {
        x: col * blockSpaceSize.w + blockSize.w / 2 + marginLeft,
        y:
          row * blockSpaceSize.h +
          blockSize.h / 2 +
          marginTop +
          displayProps.samples.graphs.height +
          displayProps.plotGap,
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const { screenP: absoluteBlockScreenXY, relativeP: blockScreenXY } =
        svgPointToScreen(ref.current, blockXYMid)

      setBarPos(blockScreenXY)

      const stats = mf?.data(row, col)

      showTooltip({
        pos: { x: absoluteBlockScreenXY.x + 5, y: absoluteBlockScreenXY.y + 5 },
        content: (
          <>
            <p className="font-semibold">{stats!.sample}</p>
            <p>{stats!.feature}</p>
            <p className="truncate">
              {getEventLabel(stats!, mutationsInUse, 'single')}
            </p>
            <p>{`row: ${row + 1}, col: ${col + 1}`}</p>
          </>
        ),
      })
    },
    [
      ref,
      marginLeft,
      displayProps.scale,
      scaledBlockSize.w,
      scaledBlockSize.h,
      scaledPadding.x,
      scaledPadding.y,
      mf,
      top,
      blockSize.w,
      blockSize.h,
      spacing.x,
      spacing.y,
      hideTooltip,
      hideTooltipOrig,
    ]
  )

  const clinicalTracksSvgMemo = useMemo(
    () =>
      clinicalTracksSvg(
        samples,
        clinicalTracks,
        displayProps.legend.clinical.tracks,
        blockSize,
        spacing,
        displayProps
      ),
    [samples, clinicalTracks, displayProps, blockSize, spacing]
  )

  const colGraphsMemo = useMemo(
    () =>
      mf
        ? colGraphs(
            mf,
            mutationsInUse,
            colorMap,
            yax,
            blockSize,
            spacing,
            displayProps
          )
        : null,
    [mf, mutationsInUse, colorMap, yax, blockSize, spacing, displayProps]
  )

  const rowGraphsMemo = useMemo(
    () =>
      mf
        ? rowGraphs(
            mf,
            mutationsInUse,
            colorMap,
            xax,
            blockSize,
            spacing,
            displayProps
          )
        : null,
    [mf, mutationsInUse, colorMap, xax, blockSize, spacing, displayProps]
  )

  const matrixMemo = useMemo(
    () =>
      mf
        ? makeMatrix(
            mf,
            mutationsInUse,
            colorMap,
            displayProps,
            blockSize,
            spacing
          )
        : null,
    [mf, mutationsInUse, colorMap, displayProps, blockSize, spacing]
  )

  const gridMemo = useMemo(
    () => makeGrid(displayProps, gridWidth, gridHeight, blockSize, spacing),
    [displayProps, gridWidth, gridHeight, blockSize, spacing]
  )

  const rowLabelsMemo = useMemo(
    () =>
      mf?.geneStats.map((stats, ri) => {
        return (
          <SvgText
            key={ri}
            x={0}
            y={ri * (blockSize.h + spacing.y) + halfBlockSize.h}
            dominantBaseline="central"
            textAnchor="end"
            font={displayProps.title}
          >
            {stats.feature}
          </SvgText>
        )
      }),
    [mf, blockSize, spacing, halfBlockSize, displayProps]
  )

  const legendMemo = useMemo(
    () =>
      displayProps.legend.position === 'bottom' ? (
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
      ) : null,
    [
      displayProps,
      marginLeft,
      top,
      gridHeight,
      mutationsInUse,
      colorMap,
      blockSize,
      clinicalTracks,
    ]
  )

  if (!mf) {
    return null
  }

  const svgElem = (
    <SvgBase
      width={width}
      height={height}
      scale={displayProps.scale}
      //shapeRendering={SVG_CRISP_EDGES}
      onMouseMove={onMouseMove}
    >
      {/* clinical tracks */}
      {displayProps.clinical.show && (
        <g
          transform={`translate(${marginLeft}, 10)`}
          //className="pointer-events-none"
          pointerEvents="none"
        >
          {clinicalTracksSvgMemo}
        </g>
      )}

      {/* col graph */}
      {displayProps.samples.graphs.show && (
        <g
          transform={`translate(${marginLeft}, ${
            top - displayProps.plotGap - displayProps.samples.graphs.height
          })`}
        >
          {colGraphsMemo}
        </g>
      )}

      {/* row graph */}
      {displayProps.features.graphs.show && (
        <g
          transform={`translate(${
            marginLeft + gridWidth + displayProps.plotGap
          }, ${top})`}
        >
          {rowGraphsMemo}
        </g>
      )}

      {/* matrix */}

      <g transform={`translate(${marginLeft}, ${top})`}>{matrixMemo}</g>

      {/* grid */}

      <g transform={`translate(${marginLeft}, ${top})`}>{gridMemo}</g>

      {/* row labels */}

      <g
        transform={`translate(${marginLeft - displayProps.axisOffset}, ${top})`}
      >
        {rowLabelsMemo}
      </g>

      {/* legend */}

      {legendMemo}
    </SvgBase>
  )

  return (
    <>
      {svgElem}

      {barPos && (
        <>
          <span
            className="absolute z-50 border-r border-foreground/80 pointer-events-none w-px h-full top-0"
            style={{
              left: `${barPos.x}px`,

              //height: (gridHeight + top - 10) * displayProps.scale,
            }}
          ></span>

          <span
            className="absolute z-50 border-t border-foreground/80 pointer-events-none h-px w-full left-0"
            style={{
              top: `${barPos.y - 1}px`,

              //width: (gridWidth + top - 10) * displayProps.scale,
            }}
          ></span>
        </>
      )}
    </>
  )
}
