import {
  IAxis,
  axisDomainToRangeFunc,
  createAxis,
} from '@/components/plot/axes/axis'
import { AxisLeftSvg, AxisTopSvg } from '@/components/plot/axes/svg-axis'
import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'

import type { IBlock } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgZoomCanvas } from '@/components/plot/svg-base'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_BLACK } from '@/lib/color/color'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { range } from '@/lib/math/range'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'

import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { useCallback, useMemo, type ReactElement, type ReactNode } from 'react'
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

function MakeMatrix({
  df,
  mutationsInUse,
  colorMap,
  displayProps,
  blockSize,
  spacing,
}: {
  df: OncoplotFrame
  mutationsInUse: string[]
  colorMap: Record<string, string>
  displayProps: IOncoplotDisplayProps
  blockSize: IBlock
  spacing: IPos
}) {
  const lcMutationsInUse = mutationsInUse.map((m) => m.toLowerCase())

  let y = 0
  let x = 0

  const elems: ReactNode[] = []

  range(df.shape[0]).map((ri) => {
    x = 0
    range(df.shape[1]).map((ci) => {
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

          names.map((id, idi) => {
            const fill: string = colorMap[id] ?? colorMap[OTHER_MUTATION]!

            elems.push(
              <SvgRect
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

              elems.push(
                <SvgRect
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
            }
          })
        } else {
          // multi mode draw black bars
          const fill: string =
            colorMap[MULTI_MUTATION] ?? colorMap[OTHER_MUTATION] ?? COLOR_BLACK

          elems.push(
            <SvgRect
              id={`${ri}:${ci}`}
              key={`${ri}:${ci}`}
              x={x}
              y={y}
              size={blockSize}
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
        elems.push(
          <SvgRect
            id={`${ri}:${ci}`}
            key={`${ri}:${ci}`}
            x={x}
            y={y}
            size={blockSize}
            fill={fill}
            shapeRendering={SVG_CRISP_EDGES}
            pointerEvents="none"
          />
        )
      }

      x += blockSize.w + spacing.x
    })

    y += blockSize.h + spacing.y
  })

  return elems
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
        <SvgG>
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
        </SvgG>
      )}

      <SvgG
        pos={{
          x: displayProps.features.graphs.percentages.show
            ? displayProps.features.graphs.percentages.width
            : 0,
          y: -displayProps.axisOffset,
        }}
      >
        <AxisTopSvg
          ax={xax}
          strokeWidth={displayProps.features.graphs.border.width}
          labelFont={displayProps.title}
          font={displayProps.text}
        />
      </SvgG>

      <SvgG
        pos={{
          x: displayProps.features.graphs.percentages.show
            ? displayProps.features.graphs.percentages.width
            : 0,
          y: 0,
        }}
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
              <SvgRect
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
      </SvgG>
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

      <SvgG pos={{ x: 0, y: displayProps.legend.title.height }}>
        {mutationsInUse.map((name, ni) => {
          const fill: string = colorMap[name] ?? colorMap[OTHER_MUTATION]!

          return (
            <SvgG
              key={ni}
              pos={{ x: 0, y: ni * (blockSize.h + displayProps.plotGap) }}
            >
              <SvgRect
                size={blockSize}
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
            </SvgG>
          )
        })}
        <SvgG
          pos={{
            x: 0,
            y: mutationsInUse.length * (blockSize.h + displayProps.plotGap),
          }}
        >
          <SvgRect
            size={blockSize}
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
        </SvgG>
      </SvgG>
    </>
  )
}

// interface IProps extends ISVGProps {
//   oncoProps: IOncoProps
// }

function OncoplotSvgContent() {
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

  // const scaledBlockSize = useMemo(
  //   () => ({
  //     w: blockSize.w * displayProps.scale,
  //     h: blockSize.h * displayProps.scale,
  //   }),
  //   [blockSize.w, blockSize.h, displayProps.scale]
  // )

  // const scaledPadding = useMemo(
  //   () => ({
  //     x: spacing.x * displayProps.scale,
  //     y: spacing.y * displayProps.scale,
  //   }),
  //   [spacing.x, spacing.y, displayProps.scale]
  // )

  const { showCrosshair, cancelCrosshair } = useCrosshair()

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

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
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

      if (row === -1 || col === -1) {
        cancelCrosshair()

        return
      }

      const blockXYMid = {
        x: col * blockSpaceSize.w + blockSize.w / 2 + marginLeft,
        y:
          row * blockSpaceSize.h +
          blockSize.h / 2 +
          marginTop +
          displayProps.samples.graphs.height +
          displayProps.plotGap,
      }

      const { screenP, relativeP: blockScreenXY } = svgPointToScreen(
        ref.current,
        blockXYMid
      )
      const stats = mf?.data(row, col)

      showCrosshair({
        pos: blockScreenXY,
        screenPos: screenP,
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

      mf,
      top,
      blockSize.w,
      blockSize.h,
      spacing.x,
      spacing.y,
      cancelCrosshair,

      showCrosshair,
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
      mf ? (
        <MakeMatrix
          df={mf}
          mutationsInUse={mutationsInUse}
          colorMap={colorMap}
          displayProps={displayProps}
          blockSize={blockSize}
          spacing={spacing}
        />
      ) : null,
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
        <SvgG
          id="legend"
          pos={{
            x: marginLeft,
            y: top + gridHeight + displayProps.legend.offset,
          }}
        >
          <g>{vLegendSvg(mutationsInUse, colorMap, blockSize, displayProps)}</g>

          <SvgG
            pos={{
              x: displayProps.legend.width + displayProps.legend.gap,
              y: 0,
            }}
          >
            {clinicalLegendSvgs(
              clinicalTracks,
              displayProps.legend.clinical.tracks,
              blockSize,
              displayProps
            )}
          </SvgG>
        </SvgG>
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
    <SvgZoomCanvas
      size={{ w: width, h: height }}

      //shapeRendering={SVG_CRISP_EDGES}
      onPointerMove={onPointerMove}
    >
      {/* clinical tracks */}
      {displayProps.clinical.show && (
        <SvgG pos={{ x: marginLeft, y: 10 }} pointerEvents="none">
          {clinicalTracksSvgMemo}
        </SvgG>
      )}

      {/* col graph */}
      {displayProps.samples.graphs.show && (
        <SvgG
          pos={{
            x: marginLeft,
            y: top - displayProps.plotGap - displayProps.samples.graphs.height,
          }}
        >
          {colGraphsMemo}
        </SvgG>
      )}

      {/* row graph */}
      {displayProps.features.graphs.show && (
        <SvgG
          pos={{ x: marginLeft + gridWidth + displayProps.plotGap, y: top }}
        >
          {rowGraphsMemo}
        </SvgG>
      )}

      {/* matrix */}

      <SvgG pos={{ x: marginLeft, y: top }}>{matrixMemo}</SvgG>

      {/* grid */}

      <SvgG pos={{ x: marginLeft, y: top }}>{gridMemo}</SvgG>

      {/* row labels */}

      <SvgG pos={{ x: marginLeft - displayProps.axisOffset, y: top }}>
        {rowLabelsMemo}
      </SvgG>

      {/* legend */}

      {legendMemo}
    </SvgZoomCanvas>
  )

  return svgElem
}

export function OncoplotSvg() {
  return (
    <CrosshairProvider>
      <OncoplotSvgContent />
    </CrosshairProvider>
  )
}
