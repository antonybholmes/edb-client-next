import { cellStr } from '@/lib/dataframe/cell'

import { type ICell } from '@/interfaces/cell'
import { ZERO_POS, type IPos } from '@/interfaces/pos'

import { type IClusterFrame } from '@/lib/math/hcluster'

import { HColorBarSvg, VColorBarSvg } from '@/components/plot/color-bar-svg'
import { CellsSvg, DotsSvg, GridSvg } from '@/components/plot/heatmap/cell-svg'
import {
  ColGroupsSvg,
  ColLabelsSvg,
  ColTreeTopSvg,
} from '@/components/plot/heatmap/col-svg'
import {
  LEGEND_BLOCK_SIZE,
  MIN_INNER_HEIGHT,
} from '@/components/plot/heatmap/heatmap-svg-props'

import { RowLabelsSvg, RowTreeSvg } from '@/components/plot/heatmap/row-svg'
import type { ISVGProps } from '@/interfaces/svg-props'
import { getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import { range } from '@/lib/math/range'
import { useCallback, useMemo, useRef, useState } from 'react'

import { SvgBase } from '@/components/plot/svg-base'
import type { IMarginProps } from '@/components/plot/svg-props'
import { SvgTitle } from '@/components/plot/svg-title-svg'
import { useMergeRefs } from '@/hooks/merge-refs'
import { COLOR_MAPS } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { createPortal } from 'react-dom'
import { ActionListSvg } from './action-list-svg'
import { useHeatmapContext } from './heatmap-provider'
import { DotLegend, LegendBottomSvg, LegendRightSvg } from './legend-svg'
 

export interface ITooltip {
  pos: IPos
  cell: ICell
}

interface IProps extends ISVGProps {
  //cf: IClusterFrame
  maxRows?: number
  maxCols?: number
  //plotAddr: IHistItemAddr
}

export function SankeySvg({ ref }: IProps) {
  const { plot } = useHeatmapContext()

  const cf = plot.dataframes['main'] as IClusterFrame

  const groups = plot.groups || []

  //const groups = groups.filter(g => g.show|| settings.groups.filter.mode === 'keep')

  const displayOptions = plot.props

  const blockSize = displayOptions.blockSize

  const scaledBlockSize = {
    w: blockSize.w * displayOptions.zoom,
    h: blockSize.h * displayOptions.zoom,
  }

  const innerRef = useRef<SVGSVGElement>(null)
  const setRefs = useMergeRefs(innerRef, ref)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const tooltipRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const legendBlockSize = LEGEND_BLOCK_SIZE.h //Math.min(displayOptions.blockSize.w,displayOptions.blockSize.h)

  const dfMain = cf.df

  const rowLabelsMetaW =
    displayOptions.rowLabels.width *
    (displayOptions.rowLabels.showMetadata ? dfMain.rowObs.shape[1] : 1)

  const margin: IMarginProps = useMemo(() => {
    const left =
      displayOptions.padding +
      (cf.rowTree &&
      displayOptions.rowTree.show &&
      displayOptions.rowTree.position === 'left'
        ? displayOptions.rowTree.width + displayOptions.padding
        : 0) +
      (displayOptions.rowLabels.show &&
      displayOptions.rowLabels.position === 'left'
        ? rowLabelsMetaW + displayOptions.padding
        : 0)

    const right =
      (displayOptions.rowLabels.show &&
      displayOptions.rowLabels.position === 'right'
        ? rowLabelsMetaW + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position.includes('right')
        ? displayOptions.colorbar.width + displayOptions.padding
        : 0) +
      (cf.rowTree &&
      displayOptions.rowTree.show &&
      displayOptions.rowTree.position === 'right'
        ? displayOptions.rowTree.width + displayOptions.padding
        : 0) +
      ((displayOptions.legend.show || displayOptions.dot.legend.show) &&
      displayOptions.legend.position.includes('right')
        ? displayOptions.legend.width + displayOptions.padding
        : 0)

    const top =
      displayOptions.padding +
      (cf.colTree &&
      displayOptions.colTree.show &&
      displayOptions.colTree.position === 'top'
        ? displayOptions.colTree.width + displayOptions.padding
        : 0) +
      (displayOptions.colLabels.show &&
      displayOptions.colLabels.position === 'top'
        ? displayOptions.colLabels.width + displayOptions.padding
        : 0) +
      (displayOptions.groups.show && groups.length > 0
        ? displayOptions.groups.height + displayOptions.padding
        : 0)

    const bottom =
      displayOptions.padding +
      displayOptions.colLabels.width +
      (displayOptions.legend.show && displayOptions.legend.position === 'bottom'
        ? 2 * legendBlockSize + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position === 'bottom'
        ? displayOptions.colorbar.width + displayOptions.padding
        : 0)

    return { top, left, bottom, right }
  }, [displayOptions])

  const handleVariantEnter = useCallback(
    (pos: IPos, cell: ICell) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (!innerRef.current) {
        return
      }

      const screen = svgPointToScreen(innerRef.current, pos.x, pos.y)

      if (!screen) {
        return
      }

      setToolTipInfo({ pos: screen, cell })
    },
    [margin.left, margin.top, blockSize, displayOptions.zoom]
  )

  const handleVariantLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => setToolTipInfo(null), 300)
  }, [])

  const { svg, width, height } = useMemo(() => {
    if (!cf) {
      return {
        svg: null,
        width: 0,
        height: 0,
      }
    }

    const dfSize = plot?.dataframes['size'] as BaseDataFrame
    const dfRaw = plot?.dataframes['raw'] as BaseDataFrame

    // const colorMap = d3
    //   .scaleLinear()
    //   .domain([displayOptions.range[0], 0, displayOptions.range[1]])
    //
    //   .range(["blue", "white", "red"])

    const s = dfMain.shape

    const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(s[0])
    let colLeaves: number[] = []

    if (cf.colTree) {
      colLeaves = cf.colTree.leaves
    } else if (groups.length > 0) {
      // if we are not clustering columns, but have groups,
      // order by groups

      colLeaves = groups
        .map((group) => getColIdxFromGroup(dfMain, group))
        .flat()

      const used = new Set<number>(colLeaves)

      // add unused indices in the order encountered at the end of the list
      // so we don't lose any data but move the unclassified to the end
      if (displayOptions.groups.keepUnused) {
        colLeaves = [...colLeaves, ...range(s[1]).filter((i) => !used.has(i))]
      }
    } else {
      // no clustering or groups, just show in original order

      colLeaves = range(s[1])
    }

    const colColorMap = new Map<number, string>(
      groups
        .map((group) =>
          getColIdxFromGroup(dfMain, group).map(
            (c) => [c, group.color] as [number, string]
          )
        )
        .flat()
    )

    const innerWidth = colLeaves.length * blockSize.w
    const innerHeight = dfMain.shape[0] * blockSize.h
    const width = innerWidth + margin.left + margin.right
    const height =
      Math.max(MIN_INNER_HEIGHT, innerHeight) + margin.top + margin.bottom

    const legendTop = displayOptions.legend.position.includes('upper')
      ? 30
      : margin.top

    let legendPos: IPos = { ...ZERO_POS }

    if (displayOptions.legend.position.includes('right')) {
      legendPos = {
        x:
          margin.left +
          innerWidth +
          displayOptions.padding +
          (displayOptions.rowLabels.show &&
          displayOptions.rowLabels.position === 'right'
            ? rowLabelsMetaW
            : 0) +
          (cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'right'
            ? displayOptions.rowTree.width + displayOptions.padding
            : 0) +
          (displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('right')
            ? displayOptions.colorbar.width
            : 0),
        y: legendTop,
      }
    }

    let dotLegendPos: IPos = { ...ZERO_POS }
    if (displayOptions.legend.position.includes('right')) {
      dotLegendPos = {
        x: legendPos.x!,
        y:
          legendTop +
          (displayOptions.legend.show && displayOptions.groups.show
            ? (legendBlockSize + displayOptions.padding) * (groups.length + 1)
            : 0),
      }
    }

    const svg = (
      <>
        {displayOptions.title.show && displayOptions.title.text && (
          <SvgTitle
            font={displayOptions.title}
            x={margin.left + innerWidth / 2}
            y={displayOptions.title.offset}
          >
            {displayOptions.title.text}
          </SvgTitle>
        )}

        {cf.colTree &&
          displayOptions.colTree.show &&
          displayOptions.colTree.position === 'top' && (
            <ColTreeTopSvg
              tree={cf.colTree}
              width={innerWidth}
              height={displayOptions.colTree.width}
              props={displayOptions}
              pos={{ x: margin.left, y: displayOptions.padding }}
            />
          )}

        {displayOptions.groups.show && groups.length > 0 && (
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

        {displayOptions.colLabels.show && (
          <ColLabelsSvg
            df={dfMain}
            leaves={colLeaves}
            props={displayOptions}
            colorMap={colColorMap}
            pos={{
              x: margin.left,
              y:
                displayOptions.colLabels.position === 'top'
                  ? margin.top -
                    displayOptions.padding -
                    (displayOptions.groups.show && groups.length > 0
                      ? displayOptions.groups.height + displayOptions.padding
                      : 0)
                  : margin.top + innerHeight + displayOptions.padding,
            }}
          />
        )}

        {/* Show tree on left of heat map */}
        {cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'left' && (
            <RowTreeSvg
              tree={cf.rowTree}
              width={innerHeight}
              height={displayOptions.rowTree.width}
              mode="left"
              props={displayOptions}
              pos={{ x: displayOptions.padding, y: margin.top }}
            />
          )}

        {cf.rowTree &&
          displayOptions.rowTree.show &&
          displayOptions.rowTree.position === 'right' && (
            <RowTreeSvg
              tree={cf.rowTree}
              width={innerHeight}
              height={displayOptions.rowTree.width}
              mode="right"
              props={displayOptions}
              pos={{
                x:
                  margin.left +
                  innerWidth +
                  displayOptions.padding +
                  (displayOptions.rowLabels.show &&
                  displayOptions.rowLabels.position === 'right'
                    ? rowLabelsMetaW + displayOptions.padding
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
                displayOptions.rowLabels.position === 'left'
                  ? margin.left - displayOptions.padding
                  : margin.left + innerWidth + displayOptions.padding,
              y: margin.top,
            }}
          />
        )}

        {displayOptions.mode === 'dot' ? (
          <>
            <GridSvg
              width={innerWidth}
              height={innerHeight}
              props={displayOptions}
              pos={{ x: margin.left, y: margin.top }}
            />
            {/* Draw cells after grid so the are not obscured */}
            <DotsSvg
              df={dfMain}
              dfRaw={dfRaw}
              dfSize={dfSize}
              rowLeaves={rowLeaves}
              colLeaves={colLeaves}
              handleVariantEnter={handleVariantEnter}
              handleVariantLeave={handleVariantLeave}
              props={displayOptions}
              pos={{ x: margin.left, y: margin.top }}
            />
          </>
        ) : (
          <>
            <CellsSvg
              df={dfMain}
              rowLeaves={rowLeaves}
              colLeaves={colLeaves}
              props={displayOptions}
              pos={{ x: margin.left, y: margin.top }}
              handleVariantEnter={handleVariantEnter}
              handleVariantLeave={handleVariantLeave}
            />
            <GridSvg
              width={innerWidth}
              height={innerHeight}
              props={displayOptions}
              pos={{ x: margin.left, y: margin.top }}
            />
          </>
        )}

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('right') && (
            <VColorBarSvg
              domain={displayOptions.range}
              cmap={COLOR_MAPS[displayOptions.cmap]!}
              size={displayOptions.colorbar.size}
              stroke={displayOptions.colorbar.stroke}
              font={displayOptions.legend}
              pos={{
                x:
                  margin.left +
                  innerWidth +
                  displayOptions.padding +
                  (displayOptions.rowLabels.show &&
                  displayOptions.rowLabels.position === 'right'
                    ? rowLabelsMetaW
                    : 0) +
                  (cf.rowTree &&
                  displayOptions.rowTree.show &&
                  displayOptions.rowTree.position === 'right'
                    ? displayOptions.rowTree.width + displayOptions.padding
                    : 0),
                y: legendTop,
              }}
            />
          )}

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position === 'bottom' && (
            <HColorBarSvg
              domain={displayOptions.range}
              cmap={COLOR_MAPS[displayOptions.cmap]!}
              size={displayOptions.colorbar.size}
              stroke={displayOptions.colorbar.stroke}
              font={displayOptions.legend}
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  displayOptions.padding +
                  (displayOptions.colLabels.show &&
                  displayOptions.colLabels.position === 'bottom'
                    ? displayOptions.colLabels.width + displayOptions.padding
                    : 0) +
                  (displayOptions.legend.show &&
                  displayOptions.legend.position === 'bottom'
                    ? 2 * legendBlockSize + displayOptions.padding
                    : 0),
              }}
            />
          )}

        {/* Plot the legend */}

        {displayOptions.groups.show &&
          groups.length > 0 &&
          displayOptions.legend.show &&
          displayOptions.legend.position.includes('right') && (
            <LegendRightSvg pos={legendPos} groups={groups} />
          )}

        {/* Legend on bottom */}

        {displayOptions.groups.show &&
          groups.length > 0 &&
          displayOptions.legend.show &&
          displayOptions.legend.position === 'bottom' && (
            <LegendBottomSvg
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  displayOptions.padding +
                  (displayOptions.colLabels.show &&
                  displayOptions.colLabels.position === 'bottom'
                    ? displayOptions.colLabels.width + displayOptions.padding
                    : 0),
              }}
              groups={groups}
            />
          )}

        {/* Plot the dot legend */}

        {displayOptions.mode === 'dot' &&
          displayOptions.legend.position.includes('right') &&
          displayOptions.dot.legend.show && (
            <DotLegend pos={dotLegendPos} groups={groups} />
          )}

        {/* Show a list of transforms to create heatmap */}
        {displayOptions.actions.show &&
          plot.actions &&
          plot.actions.length > 0 && (
            <ActionListSvg
              actions={plot.actions}
              props={displayOptions}
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  3 * displayOptions.padding +
                  (displayOptions.colLabels.show &&
                  displayOptions.colLabels.position === 'bottom'
                    ? displayOptions.colLabels.width + displayOptions.padding
                    : 0) +
                  (displayOptions.legend.show &&
                  displayOptions.legend.position === 'bottom'
                    ? 2 * legendBlockSize + displayOptions.padding
                    : 0) +
                  (displayOptions.colorbar.show &&
                  displayOptions.colorbar.position === 'bottom'
                    ? 2 * legendBlockSize + displayOptions.padding
                    : 0),
              }}
            />
          )}
      </>
    )

    return { svg, width, height }
  }, [cf, displayOptions, groups])

  // function onMouseMove(e: { pageX: number; pageY: number }) {
  //   if (!innerRef.current) {
  //     return
  //   }

  //   const rect = innerRef.current.getBoundingClientRect()

  //   let c = Math.floor(
  //     (e.pageX -
  //       margin.left * displayOptions.zoom -
  //       rect.left -
  //       window.scrollX) /
  //       scaledBlockSize.w
  //   )

  //   if (c < 0 || c > dfMain.shape[1] - 1) {
  //     c = -1
  //   }

  //   let r = Math.floor(
  //     (e.pageY - margin.top * displayOptions.zoom - rect.top - window.scrollY) /
  //       scaledBlockSize.h
  //   )

  //   if (r < 0 || r > dfMain.shape[0] - 1) {
  //     r = -1
  //   }

  //   if (r === -1 || c === -1) {
  //     setToolTipInfo(null)
  //   } else {
  //     setToolTipInfo({
  //       ...toolTipInfo,
  //       pos: {
  //         x: (margin.left + c * blockSize.w) * displayOptions.zoom - 1,
  //         y: (margin.top + r * blockSize.h) * displayOptions.zoom - 1,
  //       },
  //       cell: { row: r, col: c },
  //     })
  //   }
  // }

  //const inBlock = highlightCol[0] > -1 && highlightCol[1] > -1

  return (
    <>
      <SvgBase
        ref={setRefs}
        scale={displayOptions.zoom}
        width={width}
        height={height}
        //shapeRendering={SVG_CRISP_EDGES}
        //onMouseMove={onMouseMove}
        //className="absolute"
      >
        {svg}
      </SvgBase>

      {displayOptions.tooltip.show && toolTipInfo && (
        <>
          {createPortal(
            <>
              <div
                ref={tooltipRef}
                className="fixed z-50 rounded-lg bg-black/50 px-5 py-4 text-xs text-white"
                style={{
                  left: toolTipInfo.pos.x + scaledBlockSize.w + 2,
                  top: toolTipInfo.pos.y + scaledBlockSize.h + 2,
                }}
              >
                <p className="font-semibold">{`${dfMain.colName(
                  toolTipInfo.cell.col
                )} (${toolTipInfo.cell.row + 1}, ${toolTipInfo.cell.col + 1})`}</p>
                <p>
                  {cellStr(
                    dfMain.get(toolTipInfo.cell.row, toolTipInfo.cell.col)
                  )}
                </p>
              </div>
              <span
                ref={highlightRef}
                className="fixed z-40 border border-black pointer-events-none"
                style={{
                  top: toolTipInfo.pos.y - 1,
                  left: toolTipInfo.pos.x - 1,
                  width: scaledBlockSize.w + 1,
                  height: scaledBlockSize.h + 1,
                }}
              />
            </>,
            document.body
          )}
        </>
      )}
    </>
  )
}
