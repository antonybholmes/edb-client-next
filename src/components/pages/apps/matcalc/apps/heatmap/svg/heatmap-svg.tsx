import { type ICell } from '@/interfaces/cell'
import { type IPos } from '@/interfaces/pos'

import { type IClusterFrame } from '@/lib/math/hcluster'

import {
  LEGEND_BLOCK_SIZE,
  MIN_INNER_HEIGHT,
} from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgHColorBar, SvgVColorBar } from '@/components/plot/svg-color-bar'
import { CellsSvg, DotsSvg, GridSvg } from './cell-svg'
import { ColGroupsSvg, ColLabelsSvg, ColTreeTopSvg } from './col-svg'

import type { ISVGProps } from '@/interfaces/svg-props'
import { getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import { CrosshairProvider } from '@/providers/crosshair-provider'
import { useMemo } from 'react'
import { RowLabelsSvg, RowTreeSvg } from './row-svg'

import { useAxis } from '@/components/plot/axes/axes-store'
import { axisLength } from '@/components/plot/axes/axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import type { IMarginProps } from '@/components/plot/svg-props'
import { getColorMapFromCmap } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { sum } from '@/lib/math/sum'
import { SvgTitle } from '../../../../../../plot/svg-title'
import { ActionListSvg } from '../action-list-svg'
import { useHeatmapContext } from '../heatmap-provider'
import { DotLegend, LegendBottomSvg, LegendRightSvg } from '../legend-svg'
import { CellGaps } from './cell-gaps'

export const TOOLTIP_CLEAR_MS = 300

export interface ITooltip {
  pos: IPos
  cell: ICell
}

interface IProps extends ISVGProps {
  scale?: number
}

export function HeatMapSvg({ scale = 1 }: IProps) {
  const { plot } = useHeatmapContext()

  if (!plot) {
    return null
  }

  return (
    <CrosshairProvider>
      <HeatMapSvgContent scale={scale} />
    </CrosshairProvider>
  )
}

function HeatMapSvgContent({ scale = 1 }: IProps) {
  const { plot, rowLeaves, colLeaves } = useHeatmapContext()

  const cf = plot.dataframes['main'] as IClusterFrame

  const groupRows = plot.groupRows || []
  const groups0 = groupRows[0]?.groups || []
  //const groups = plot.groupRows[0].groups || []

  //const groups = groups.filter(g => g.show|| settings.groups.filter.mode === 'keep')

  const displayOptions = plot.props

  const blockSize = displayOptions.blockSize

  const legendBlockSize = LEGEND_BLOCK_SIZE.h

  const dfMain = cf.df

  const rowLabelsMetaW =
    displayOptions.labels.row.width *
    (displayOptions.labels.row.showMetadata ? dfMain.rowObs.shape[1] : 1)

  const margin: IMarginProps = useMemo(() => {
    const left =
      displayOptions.padding +
      (cf.rowTree &&
      displayOptions.tree.row.show &&
      displayOptions.tree.row.position === 'left'
        ? displayOptions.tree.row.width + displayOptions.padding
        : 0) +
      (displayOptions.labels.row.show &&
      displayOptions.labels.row.position === 'left'
        ? rowLabelsMetaW + displayOptions.padding
        : 0)

    const right =
      (displayOptions.labels.row.show &&
      displayOptions.labels.row.position === 'right'
        ? rowLabelsMetaW + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position.includes('right')
        ? displayOptions.colorbar.size.w + displayOptions.padding
        : 0) +
      (cf.rowTree &&
      displayOptions.tree.row.show &&
      displayOptions.tree.row.position === 'right'
        ? displayOptions.tree.row.width + displayOptions.padding
        : 0) +
      ((displayOptions.legend.show || displayOptions.dot.legend.show) &&
      displayOptions.legend.position.includes('right')
        ? displayOptions.legend.width + displayOptions.padding
        : 0)

    const top =
      displayOptions.padding +
      (cf.colTree &&
      displayOptions.tree.col.show &&
      displayOptions.tree.col.position === 'top'
        ? displayOptions.tree.col.width + displayOptions.padding
        : 0) +
      (displayOptions.labels.col.show &&
      displayOptions.labels.col.position === 'top'
        ? displayOptions.labels.col.width + displayOptions.padding
        : 0) +
      (displayOptions.groups.show && groupRows.length > 0
        ? groupRows.length *
          (displayOptions.groups.height + displayOptions.padding)
        : 0)

    const bottom =
      displayOptions.padding +
      displayOptions.labels.col.width +
      (displayOptions.legend.show && displayOptions.legend.position === 'bottom'
        ? 2 * legendBlockSize + displayOptions.padding
        : 0) +
      (displayOptions.colorbar.show &&
      displayOptions.colorbar.position === 'bottom'
        ? displayOptions.colorbar.size.w + displayOptions.padding
        : 0)

    return { top, left, bottom, right }
  }, [displayOptions])

  const xgaps = useMemo(
    () => new CellGaps(displayOptions.gaps.cols, blockSize.w, dfMain.shape[1]),
    [displayOptions.gaps.cols, blockSize.w, dfMain.shape[1]]
  )

  const ygaps = useMemo(
    () => new CellGaps(displayOptions.gaps.rows, blockSize.h, dfMain.shape[0]),
    [displayOptions.gaps.rows, blockSize.h, dfMain.shape[0]]
  )

  const { axis: cax } = useAxis({
    plotId: plot.id,
    groupId: 'cbar',
    axisId: 'cbar',
  })

  //console.log('cax', plot.id, cax)

  const { svg, width, height } = useMemo(() => {
    if (!cf) {
      return {
        svg: null,
        width: 0,
        height: 0,
      }
    }

    const dfSize = plot?.dataframes['size'] as BaseDataFrame

    //unadjusted values which can be used to set the cell value
    // for display rather than the transformed data. useful if
    // you want to display non-logged values in a logged matrix
    // where the logged data is used to control heatmap colors etc
    // but user wants to see the original values
    const dfRaw = plot?.dataframes['raw'] as BaseDataFrame

    // const colorMap = d3
    //   .scaleLinear()
    //   .domain([displayOptions.range[0], 0, displayOptions.range[1]])
    //
    //   .range(["blue", "white", "red"])

    const colColorMap = new Map<string, Map<number, string>>(
      groupRows.map((gr) => [
        gr.id,
        new Map<number, string>(
          gr.groups
            .map((group) =>
              getColIdxFromGroup(dfMain, group).map(
                (c) => [c, group.color] as [number, string]
              )
            )
            .flat()
        ),
      ])
    )

    const ungappedInnerWidth = colLeaves.length * blockSize.w

    const innerWidth =
      ungappedInnerWidth +
      displayOptions.gaps.cols.size * displayOptions.gaps.cols.indexes.length

    const ungappedInnerHeight = rowLeaves.length * blockSize.h

    const innerHeight =
      ungappedInnerHeight +
      displayOptions.gaps.rows.size * displayOptions.gaps.rows.indexes.length

    const width = innerWidth + margin.left + margin.right
    const height =
      Math.max(MIN_INNER_HEIGHT, innerHeight) + margin.top + margin.bottom

    const legendTop = displayOptions.legend.position.includes('upper')
      ? 30
      : margin.top

    const legendPos = {
      x:
        margin.left +
        innerWidth +
        displayOptions.padding +
        (displayOptions.labels.row.show &&
        displayOptions.labels.row.position === 'right'
          ? rowLabelsMetaW
          : 0) +
        (cf.rowTree &&
        displayOptions.tree.row.show &&
        displayOptions.tree.row.position === 'right'
          ? displayOptions.tree.row.width + displayOptions.padding
          : 0),
      y: legendTop,
    }

    const showLegendGroupRight =
      displayOptions.groups.show &&
      groupRows.length > 0 &&
      displayOptions.legend.show &&
      displayOptions.legend.position.includes('right')

    const legendRightY = showLegendGroupRight
      ? (displayOptions.legend.icon.size + displayOptions.padding) *
        sum(groupRows.map((gr) => gr.groups.length))
      : 0

    const dotRightY =
      4 * displayOptions.padding +
      (showLegendGroupRight ? legendRightY : 0) +
      +(cax.style.show ? axisLength(cax) : 0)

    const cmap = getColorMapFromCmap(displayOptions.cmap)

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
          displayOptions.tree.col.show &&
          displayOptions.tree.col.position === 'top' && (
            <ColTreeTopSvg
              df={cf.df}
              tree={cf.colTree}
              width={ungappedInnerWidth}
              gaps={xgaps}
              height={displayOptions.tree.col.width}
              props={displayOptions}
              pos={{ x: margin.left, y: displayOptions.padding }}
            />
          )}

        {displayOptions.groups.show && groupRows.length > 0 && (
          <ColGroupsSvg
            gaps={xgaps}
            colorMap={colColorMap}
            pos={{
              x: margin.left,
              y:
                margin.top -
                groupRows.length *
                  (displayOptions.groups.height + displayOptions.padding),
            }}
            leaves={colLeaves}
          />
        )}

        {displayOptions.labels.col.show && (
          <ColLabelsSvg
            gaps={xgaps}
            leaves={colLeaves}

            colorMap={colColorMap}
            pos={{
              x: margin.left,
              y:
                displayOptions.labels.col.position === 'top'
                  ? margin.top -
                    displayOptions.padding -
                    (displayOptions.groups.show && groupRows.length > 0
                      ? groupRows.length *
                        (displayOptions.groups.height + displayOptions.padding)
                      : 0)
                  : margin.top + innerHeight + displayOptions.padding,
            }}
          />
        )}

        {/* Show tree on left of heat map */}
        {cf.rowTree &&
          displayOptions.tree.row.show &&
          displayOptions.tree.row.position === 'left' && (
            <RowTreeSvg
              df={cf.df}
              tree={cf.rowTree}
              gaps={ygaps}
              width={ungappedInnerHeight}
              height={displayOptions.tree.row.width}
              mode="left"
              props={displayOptions}
              pos={{ x: displayOptions.padding, y: margin.top }}
            />
          )}

        {cf.rowTree &&
          displayOptions.tree.row.show &&
          displayOptions.tree.row.position === 'right' && (
            <RowTreeSvg
              df={cf.df}
              tree={cf.rowTree}
              gaps={ygaps}
              width={ungappedInnerHeight}
              height={displayOptions.tree.row.width}
              mode="right"
              props={displayOptions}
              pos={{
                x:
                  margin.left +
                  innerWidth +
                  displayOptions.padding +
                  (displayOptions.labels.row.show &&
                  displayOptions.labels.row.position === 'right'
                    ? rowLabelsMetaW + displayOptions.padding
                    : 0),
                y: margin.top,
              }}
            />
          )}

        {displayOptions.labels.row.show && (
          <RowLabelsSvg
            leaves={rowLeaves}
            gaps={ygaps}
            pos={{
              x:
                displayOptions.labels.row.position === 'left'
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
              xgaps={xgaps}
              ygaps={ygaps}
              pos={{ x: margin.left, y: margin.top }}
            />
            {/* Draw cells after grid so the are not obscured */}
            <DotsSvg
              df={dfMain}
              dfRaw={dfRaw}
              dfSize={dfSize}
              plotSize={{ w: innerWidth, h: innerHeight }}
              margin={margin}
              xgaps={xgaps}
              ygaps={ygaps}
              rowLeaves={rowLeaves}
              colLeaves={colLeaves}
              // handleVariantEnter={handleVariantEnter}
              // handleVariantLeave={hideTooltip}
              props={displayOptions}
              pos={{ x: margin.left, y: margin.top }}
            />
          </>
        ) : (
          <>
            <CellsSvg
              df={dfMain}
              margin={margin}
              plotSize={{ w: innerWidth, h: innerHeight }}
              rowLeaves={rowLeaves}
              colLeaves={colLeaves}
              props={displayOptions}
              xgaps={xgaps}
              ygaps={ygaps}
              pos={{ x: margin.left, y: margin.top }}
            />
            <GridSvg
              width={innerWidth}
              height={innerHeight}
              props={displayOptions}
              xgaps={xgaps}
              ygaps={ygaps}
              pos={{ x: margin.left, y: margin.top }}
            />
          </>
        )}

        {/* Plot the legend */}

        {cax.style.show && displayOptions.colorbar.position === 'bottom' && (
          <SvgHColorBar
            ax={cax}
            cmap={cmap}

            pos={{
              x: margin.left,
              y:
                margin.top +
                innerHeight +
                displayOptions.padding +
                (displayOptions.labels.col.show &&
                displayOptions.labels.col.position === 'bottom'
                  ? displayOptions.labels.col.width + displayOptions.padding
                  : 0) +
                (displayOptions.legend.show &&
                displayOptions.legend.position === 'bottom'
                  ? 2 * legendBlockSize + displayOptions.padding
                  : 0),
            }}
          />
        )}

        {displayOptions.groups.show &&
          groupRows.length > 0 &&
          displayOptions.legend.show &&
          displayOptions.legend.position === 'bottom' && (
            <LegendBottomSvg
              pos={{
                x: margin.left,
                y:
                  margin.top +
                  innerHeight +
                  displayOptions.padding +
                  (displayOptions.labels.col.show &&
                  displayOptions.labels.col.position === 'bottom'
                    ? displayOptions.labels.col.width + displayOptions.padding
                    : 0),
              }}
              groupRows={groupRows}
            />
          )}

        <SvgG id="legend-right" pos={legendPos}>
          {showLegendGroupRight && <LegendRightSvg groupRows={groupRows} />}

          {cax.style.show &&
            displayOptions.colorbar.position.includes('right') && (
              <SvgG pos={{ x: 0, y: legendRightY }}>
                <SvgVColorBar ax={cax} cmap={cmap} />
              </SvgG>
            )}

          {/* Plot the dot legend */}

          {displayOptions.mode === 'dot' &&
            displayOptions.legend.position.includes('right') &&
            displayOptions.dot.legend.show && (
              <SvgG pos={{ x: 0, y: dotRightY }}>
                <DotLegend groupRows={groupRows} />
              </SvgG>
            )}
        </SvgG>

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
                  (displayOptions.labels.col.show &&
                  displayOptions.labels.col.position === 'bottom'
                    ? displayOptions.labels.col.width + displayOptions.padding
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
  }, [cf, displayOptions, groupRows, cax])

  return (
    <SvgBase scale={scale} width={width} height={height}>
      {svg}
    </SvgBase>
  )
}
