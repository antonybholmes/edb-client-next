import { cellStr } from '@lib/dataframe/cell'

import { type ICell } from '@interfaces/cell'
import { type IElementProps } from '@interfaces/element-props'
import { ZERO_POS, type IPos } from '@interfaces/pos'

import { type IClusterFrame } from '@lib/math/hcluster'

import { GroupsContext } from '@/components/pages/modules/matcalc/groups-provider'
import { getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import { range } from '@lib/math/range'
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { HColorBarSvg, VColorBarSvg } from '../color-bar-svg'
import { CellsSvg, DotsSvg, GridSvg } from './cell-svg'
import { ColGroupsSvg, ColLabelsSvg, ColTreeTopSvg } from './col-svg'
import {
  DEFAULT_HEATMAP_PROPS,
  LEGEND_BLOCK_SIZE,
  MIN_INNER_HEIGHT,
  type IHeatMapDisplayOptions,
} from './heatmap-svg-props'
import { DotLegend, LegendBottomSvg, LegendRightSvg } from './legend-svg'
import { RowLabelsSvg, RowTreeSvg } from './row-svg'

export interface ITooltip {
  pos: IPos
  cell: ICell
}

interface IProps extends IElementProps {
  cf: IClusterFrame
  maxRows?: number
  maxCols?: number
  displayOptions?: IHeatMapDisplayOptions
}

export const HeatMapSvg = forwardRef<SVGElement, IProps>(function HeatMapSvg(
  { cf, displayOptions = { ...DEFAULT_HEATMAP_PROPS } }: IProps,
  ref
) {
  const blockSize = displayOptions.blockSize

  const scaledBlockSize = {
    w: blockSize.w * displayOptions.scale,
    h: blockSize.h * displayOptions.scale,
  }

  const { groupState } = useContext(GroupsContext)

  const innerRef = useRef<SVGElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const tooltipRef = useRef<HTMLDivElement>(null)
  //const canvasRef = useRef(null)
  //const downloadRef = useRef<HTMLAnchorElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const legendBlockSize = LEGEND_BLOCK_SIZE.h //Math.min(displayOptions.blockSize.w,displayOptions.blockSize.h)

  const margin = useMemo(() => {
    const left =
      displayOptions.padding +
      (cf.rowTree &&
      displayOptions.rowTree.show &&
      displayOptions.rowTree.position === 'Left'
        ? displayOptions.rowTree.width + displayOptions.padding
        : 0) +
      (displayOptions.rowLabels.show &&
      displayOptions.rowLabels.position === 'Left'
        ? displayOptions.rowLabels.width + displayOptions.padding
        : 0)

    const right =
      (displayOptions.rowLabels.show &&
      displayOptions.rowLabels.position === 'Right'
        ? displayOptions.rowLabels.width + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position.includes('Right')
        ? displayOptions.colorbar.width + displayOptions.padding
        : 0) +
      (cf.rowTree &&
      displayOptions.rowTree.show &&
      displayOptions.rowTree.position === 'Right'
        ? displayOptions.rowTree.width + displayOptions.padding
        : 0) +
      (displayOptions.legend.show &&
      displayOptions.legend.position.includes('Right')
        ? displayOptions.legend.width + displayOptions.padding
        : 0)

    const top =
      displayOptions.padding +
      (cf.colTree &&
      displayOptions.colTree.show &&
      displayOptions.colTree.position === 'Top'
        ? displayOptions.colTree.width + displayOptions.padding
        : 0) +
      (displayOptions.colLabels.show &&
      displayOptions.colLabels.position === 'Top'
        ? displayOptions.colLabels.width + displayOptions.padding
        : 0) +
      (displayOptions.groups.show && groupState.groups.size > 0
        ? displayOptions.groups.height + displayOptions.padding
        : 0)

    const bottom =
      displayOptions.padding +
      (displayOptions.colLabels.show &&
      displayOptions.colLabels.position === 'Bottom'
        ? displayOptions.colLabels.width + displayOptions.padding
        : 0) +
      (displayOptions.legend.show && displayOptions.legend.position === 'Bottom'
        ? 2 * legendBlockSize + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position === 'Bottom'
        ? displayOptions.colorbar.width + displayOptions.padding
        : 0)

    return { top, left, bottom, right }
  }, [displayOptions])

  const dfMain = cf.df

  const dfPercent = cf.secondaryTables
    ? cf.secondaryTables['percent']
    : undefined

  const svg = useMemo(() => {
    if (!cf) {
      return null
    }

    // const colorMap = d3
    //   .scaleLinear()
    //   .domain([displayOptions.range[0], 0, displayOptions.range[1]])
    //   // @ts-ignore
    //   .range(["blue", "white", "red"])

    const s = dfMain.shape

    const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(s[0])
    let colLeaves: number[] = []

    if (cf.colTree) {
      colLeaves = cf.colTree.leaves
    } else if (groupState.order.length > 0) {
      // order according to group order

      colLeaves = groupState.order
        .map(i => groupState.groups.get(i)!)
        .map(group => getColIdxFromGroup(dfMain, group))
        .flat()

      const used = new Set<number>(colLeaves)

      // add unused indices in order at end
      if (displayOptions.groups.keepUnused) {
        colLeaves = [...colLeaves, ...range(s[1]).filter(i => !used.has(i))]
      }
    } else {
      // keep current order
      colLeaves = range(s[1])
    }

    const colColorMap = new Map<number, string>(
      groupState.order
        .map(i => groupState.groups.get(i)!)
        .map(group =>
          getColIdxFromGroup(dfMain, group).map(
            c => [c, group.color] as [number, string]
          )
        )
        .flat()
    )

    const innerWidth = colLeaves.length * blockSize.w
    const innerHeight = dfMain.shape[0] * blockSize.h
    const width = innerWidth + margin.left + margin.right
    const height =
      Math.max(MIN_INNER_HEIGHT, innerHeight) + margin.top + margin.bottom

    const legendTop =
      displayOptions.legend.show &&
      displayOptions.legend.position.includes('Upper')
        ? 20
        : margin.top

    let legendPos: IPos = { ...ZERO_POS }

    if (
      displayOptions.legend.show &&
      displayOptions.legend.position.includes('Right')
    ) {
      legendPos = {
        x:
          margin.left +
          innerWidth +
          displayOptions.padding +
          (displayOptions.rowLabels.show &&
          displayOptions.rowLabels.position === 'Right'
            ? displayOptions.rowLabels.width
            : 0) +
          (cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'Right'
            ? displayOptions.rowTree.width + displayOptions.padding
            : 0) +
          (displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('Right')
            ? displayOptions.colorbar.width
            : 0),
        y: legendTop,
      }
    }

    let dotLegendPos: IPos = { ...ZERO_POS }
    if (
      displayOptions.legend.show &&
      displayOptions.legend.position.includes('Right')
    ) {
      dotLegendPos = {
        x: legendPos.x!,
        y:
          legendTop +
          (displayOptions.groups.show
            ? (legendBlockSize + displayOptions.padding) *
              (groupState.groups.size + 1)
            : 0),
      }
    }

    return (
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={innerRef}
        width={width * displayOptions.scale}
        height={height * displayOptions.scale}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering={SVG_CRISP_EDGES}
        onMouseMove={onMouseMove}
        className="absolute"
      >
        {cf.colTree &&
          displayOptions.colTree.show &&
          displayOptions.colTree.position === 'Top' && (
            <ColTreeTopSvg
              tree={cf.colTree}
              width={innerWidth}
              height={displayOptions.colTree.width}
              props={displayOptions}
              pos={{ x: margin.left, y: displayOptions.padding }}
            />
          )}

        {displayOptions.groups.show && groupState.groups.size > 0 && (
          <ColGroupsSvg
            df={dfMain}
            colorMap={colColorMap}
            pos={{
              x: margin.left,
              y:
                margin.top -
                displayOptions.padding -
                displayOptions.groups.height,
            }}
            leaves={colLeaves}
            props={displayOptions}
          />
        )}

        {/* Show tree on left of heat map */}
        {cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'Left' && (
            <RowTreeSvg
              tree={cf.rowTree}
              width={innerHeight}
              height={displayOptions.rowTree.width}
              mode="Left"
              props={displayOptions}
              pos={{ x: displayOptions.padding, y: margin.top }}
            />
          )}

        {cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'Right' && (
            <RowTreeSvg
              tree={cf.rowTree}
              width={innerHeight}
              height={displayOptions.rowTree.width}
              mode="Right"
              props={displayOptions}
              pos={{
                x:
                  margin.left +
                  innerWidth +
                  displayOptions.padding +
                  (displayOptions.rowLabels.show &&
                  displayOptions.rowLabels.position === 'Right'
                    ? displayOptions.rowLabels.width + displayOptions.padding
                    : 0),
                y: margin.top,
              }}
            />
          )}

        {displayOptions.rowLabels.show && (
          <RowLabelsSvg
            df={dfMain}
            leaves={rowLeaves}
            props={displayOptions}
            pos={{
              x:
                displayOptions.rowLabels.position === 'Left'
                  ? margin.left - displayOptions.padding
                  : margin.left + innerWidth + displayOptions.padding,
              y: margin.top,
            }}
          />
        )}

        {displayOptions.style === 'Dot' ? (
          <DotsSvg
            df={dfMain}
            dfPercent={dfPercent}
            rowLeaves={rowLeaves}
            colLeaves={colLeaves}
            props={displayOptions}
            pos={{ x: margin.left, y: margin.top }}
          />
        ) : (
          <CellsSvg
            df={dfMain}
            rowLeaves={rowLeaves}
            colLeaves={colLeaves}
            props={displayOptions}
            pos={{ x: margin.left, y: margin.top }}
          />
        )}

        <GridSvg
          width={innerWidth}
          height={innerHeight}
          props={displayOptions}
          pos={{ x: margin.left, y: margin.top }}
        />

        {displayOptions.colLabels.show && (
          <ColLabelsSvg
            df={dfMain}
            leaves={colLeaves}
            props={displayOptions}
            colorMap={colColorMap}
            pos={{
              x: margin.left,
              y:
                displayOptions.colLabels.position === 'Top'
                  ? margin.top -
                    displayOptions.padding -
                    (displayOptions.groups.show && groupState.groups.size > 0
                      ? displayOptions.groups.height + displayOptions.padding
                      : 0)
                  : margin.top + innerHeight + displayOptions.padding,
            }}
          />
        )}

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('Right') && (
            <VColorBarSvg
              domain={displayOptions.range}
              cmap={displayOptions.cmap}
              size={displayOptions.colorbar.size}
              stroke={displayOptions.colorbar.stroke}
              pos={{
                x:
                  margin.left +
                  innerWidth +
                  displayOptions.padding +
                  (displayOptions.rowLabels.show &&
                  displayOptions.rowLabels.position === 'Right'
                    ? displayOptions.rowLabels.width
                    : 0) +
                  (cf.rowTree &&
                  displayOptions.rowTree.show &&
                  displayOptions.rowTree.position === 'Right'
                    ? displayOptions.rowTree.width + displayOptions.padding
                    : 0),
                y: legendTop,
              }}
            />
          )}

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position === 'Bottom' && (
            <HColorBarSvg
              domain={displayOptions.range}
              cmap={displayOptions.cmap}
              size={displayOptions.colorbar.size}
              stroke={displayOptions.colorbar.stroke}
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  displayOptions.padding +
                  (displayOptions.colLabels.show &&
                  displayOptions.colLabels.position === 'Bottom'
                    ? displayOptions.colLabels.width + displayOptions.padding
                    : 0) +
                  (displayOptions.legend.show &&
                  displayOptions.legend.position === 'Bottom'
                    ? 2 * legendBlockSize + displayOptions.padding
                    : 0),
              }}
            />
          )}

        {/* Plot the legend */}

        {displayOptions.groups.show &&
          groupState.groups.size > 0 &&
          displayOptions.legend.show &&
          displayOptions.legend.position.includes('Right') && (
            <LegendRightSvg pos={legendPos} props={displayOptions} />
          )}

        {/* Legend on bottom */}

        {displayOptions.groups.show &&
          groupState.groups.size > 0 &&
          displayOptions.legend.show &&
          displayOptions.legend.position.includes('Bottom') && (
            <LegendBottomSvg
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  displayOptions.padding +
                  (displayOptions.colLabels.show &&
                  displayOptions.colLabels.position === 'Bottom'
                    ? displayOptions.colLabels.width + displayOptions.padding
                    : 0),
              }}
              props={displayOptions}
            />
          )}

        {/* Plot the dot legend */}

        {dfPercent &&
          displayOptions.legend.show &&
          displayOptions.legend.position.includes('Right') && (
            <DotLegend props={displayOptions} pos={dotLegendPos} />
          )}
      </svg>
    )
  }, [cf, displayOptions])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!innerRef.current) {
      return
    }

    const rect = innerRef.current.getBoundingClientRect()

    let c = Math.floor(
      (e.pageX -
        margin.left * displayOptions.scale -
        rect.left -
        window.scrollX) /
        scaledBlockSize.w
    )

    if (c < 0 || c > dfMain.shape[1] - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY -
        margin.top * displayOptions.scale -
        rect.top -
        window.scrollY) /
        scaledBlockSize.h
    )

    if (r < 0 || r > dfMain.shape[0] - 1) {
      r = -1
    }

    if (r === -1 || c === -1) {
      setToolTipInfo(null)
    } else {
      setToolTipInfo({
        ...toolTipInfo,
        pos: {
          x: (margin.left + c * blockSize.w) * displayOptions.scale - 1,
          y: (margin.top + r * blockSize.h) * displayOptions.scale - 1,
        },
        cell: { row: r, col: c },
      })
    }
  }

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  return (
    <>
      {svg}

      {toolTipInfo && (
        <>
          <div
            ref={tooltipRef}
            className="absolute z-50 rounded-lg bg-black/50 px-5 py-4 text-xs text-white"
            style={{
              left: toolTipInfo.pos.x + scaledBlockSize.w + 2,
              top: toolTipInfo.pos.y + scaledBlockSize.h + 2,
            }}
          >
            <p className="font-semibold">{`${dfMain.colName(
              toolTipInfo.cell.col
            )} (${toolTipInfo.cell.row + 1}, ${toolTipInfo.cell.col + 1})`}</p>
            <p>
              {cellStr(dfMain.get(toolTipInfo.cell.row, toolTipInfo.cell.col))}
            </p>
            {/* <p>
          row: {toolTipInfo.cell.r + 1}, col: {toolTipInfo.cell.c + 1}
        </p> */}
          </div>

          <span
            ref={highlightRef}
            className="absolute z-40 border-black"
            style={{
              top: `${toolTipInfo.pos.y}px`,
              left: `${toolTipInfo.pos.x}px`,
              width: `${scaledBlockSize.w + 1}px`,
              height: `${scaledBlockSize.h + 1}px`,
              borderWidth: `${Math.max(1, displayOptions.scale)}px`,
            }}
          />
        </>
      )}
    </>
  )
})
