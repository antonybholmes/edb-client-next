import { cn } from '@lib/class-names'

import { type IFieldMap } from '@interfaces/field-map'
import { cellStr } from '@lib/dataframe/cell'

import type { LeftRightPos } from '@/components/side'
import { COLOR_BLACK, COLOR_WHITE } from '@/consts'
import { getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import type { IDim } from '@interfaces/dim'
import { type IElementProps } from '@interfaces/element-props'
import { type IClusterGroup } from '@lib/cluster-group'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import type { IClusterFrame } from '@lib/math/hcluster'
import { range } from '@lib/math/range'
import { forwardRef, useMemo, useRef, useState } from 'react'
import { HColorBarSvg, VColorBarSvg } from '../color-bar-svg'
import {
  DEFAULT_LABEL_PROPS,
  DEFAULT_STROKE_PROPS,
  type ILabelProps,
  type LegendPos,
  type TopBottomPos,
} from '../svg-props'
import type { ITreeProps } from './heatmap-svg-props'

interface IBlock {
  w: number
  h: number
}

const BLOCK_SIZE: IBlock = { w: 30, h: 30 }
const NO_SELECTION = [-1, -1]

const margin = { top: 10, right: 10, bottom: 10, left: 10 }

export interface IDotPlotProps {
  blockSize: IBlock
  grid: {
    show: boolean
    color: string
  }
  border: {
    show: boolean
    color: string
  }
  range: [number, number]
  rowLabels: ILabelProps & { position: LeftRightPos }
  colLabels: ILabelProps & { position: TopBottomPos }
  colorbar: {
    barSize: IDim
    width: number
    position: 'Bottom' | 'Right' | null
  }
  rowTree: ITreeProps & {
    position: LeftRightPos
  }
  colTree: ITreeProps & {
    position: TopBottomPos
  }
  legend: { position: LegendPos | null; width: number }
  groups: {
    show: boolean
    height: number
  }
  padding: number
  scale: number
  cmap: ColorMap
}

export const DEFAULT_DISPLAY_PROPS: IDotPlotProps = {
  blockSize: BLOCK_SIZE,
  grid: { show: true, color: '#eeeeee' },
  border: { show: true, color: COLOR_BLACK },
  range: [-3, 3],
  rowLabels: { ...DEFAULT_LABEL_PROPS, position: 'Right' },
  colLabels: { ...DEFAULT_LABEL_PROPS, position: 'Top' },
  colorbar: {
    position: 'Right',
    barSize: { width: 160, height: 16 },
    width: 100,
  },
  groups: { show: true, height: 0.5 * BLOCK_SIZE.h },
  legend: { position: 'Upper Right', width: 200 },
  rowTree: {
    show: true,
    width: 100,
    position: 'Left',
    stroke: { ...DEFAULT_STROKE_PROPS },
  },
  colTree: {
    show: true,
    width: 100,
    position: 'Top',
    stroke: { ...DEFAULT_STROKE_PROPS },
  },
  padding: 10,
  scale: 1,
  cmap: BWR_CMAP,
}

interface IProps extends IElementProps {
  cf: IClusterFrame
  groups?: IClusterGroup[]
  maxRows?: number
  maxCols?: number
  search?: string[]
  displayProps?: IFieldMap
}

export const DotPlotSvg = forwardRef<SVGElement, IProps>(function DotPlotSvg(
  { cf, groups = [], displayProps = {} }: IProps,
  svgRef
) {
  const _displayProps: IDotPlotProps = {
    ...DEFAULT_DISPLAY_PROPS,
    ...displayProps,
  }

  const blockSize = _displayProps.blockSize
  const blockSize2: IBlock = { w: 0.5 * blockSize.w, h: 0.5 * blockSize.h }

  //const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  //const canvasRef = useRef(null)
  //const downloadRef = useRef<HTMLAnchorElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)

  const [highlightCol, setHighlightCol] = useState(NO_SELECTION)
  //const [highlightRow, setHighlightRow] = useState(-1)

  const marginLeft =
    margin.left +
    (cf.rowTree && _displayProps.rowTree.position === 'Left'
      ? _displayProps.rowTree.width + _displayProps.padding
      : 0) +
    (_displayProps.rowLabels.position === 'Left'
      ? _displayProps.rowLabels.width + _displayProps.padding
      : 0)

  const marginRight =
    (_displayProps.rowLabels.position === 'Right'
      ? _displayProps.rowLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.colorbar.position === 'Right'
      ? _displayProps.colorbar.width + _displayProps.padding
      : 0) +
    (cf.rowTree && _displayProps.rowTree.position === 'Right'
      ? _displayProps.rowTree.width + _displayProps.padding
      : 0) +
    (_displayProps.legend.position?.includes('Right')
      ? _displayProps.legend.width + _displayProps.padding
      : 0)

  const marginTop =
    margin.top +
    (cf.colTree && _displayProps.colTree.position === 'Top'
      ? _displayProps.colTree.width + _displayProps.padding
      : 0) +
    (_displayProps.colLabels.position === 'Top'
      ? _displayProps.colLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.groups.show && groups.length > 0
      ? _displayProps.groups.height + _displayProps.padding
      : 0)

  const marginBottom =
    _displayProps.padding +
    (_displayProps.colLabels.position === 'Bottom'
      ? _displayProps.colLabels.width + _displayProps.padding
      : 0) +
    (_displayProps.colorbar.position === 'Bottom'
      ? _displayProps.colorbar.width + _displayProps.padding
      : 0)

  const dfMain = cf.df
  const innerWidth = dfMain.shape[1] * blockSize.w
  const innerHeight = dfMain.shape[0] * blockSize.h
  const width = innerWidth + marginLeft + marginRight
  const height = innerHeight + marginTop + marginBottom

  const [toolTipInfo, setToolTipInfo] = useState({
    left: -1,
    top: -1,
    visible: false,
    seqIndex: 0,
    pos: -1,
  })

  function bound(x: number) {
    const r = _displayProps.range[1] - _displayProps.range[0]

    return (
      (Math.max(_displayProps.range[0], Math.min(_displayProps.range[1], x)) -
        _displayProps.range[0]) /
      r
    )
  }

  const svg = useMemo(() => {
    if (!cf) {
      return null
    }

    // const colorMap = d3
    //   .scaleLinear()
    //   .domain([_displayProps.range[0], 0, _displayProps.range[1]])
    //
    //   .range(["blue", "white", "red"])

    const dfPercent = cf.secondaryTables!['percent']!

    const s = dfMain.shape

    const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(s[0])
    const colLeaves = cf.colTree ? cf.colTree.leaves : range(s[1])

    const colColorMap = Object.fromEntries(
      groups
        .map((group) =>
          getColIdxFromGroup(dfMain, group).map((c) => [c, group.color])
        )
        .flat()
    )

    const legendBlockSize = Math.min(
      _displayProps.blockSize.w,
      _displayProps.blockSize.h
    )

    return (
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={svgRef}
        width={width * _displayProps.scale}
        height={height * _displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering={SVG_CRISP_EDGES}
        onMouseMove={onMouseMove}
        className="absolute"
      >
        {cf.colTree && _displayProps.colTree.position === 'Top' && (
          <g transform={`translate(${marginLeft}, ${_displayProps.padding})`}>
            {cf.colTree.coords.map((coords, ri) =>
              range(3).map((i) => {
                return (
                  <line
                    key={ri * 3 + i}
                    x1={coords[i]!.x * innerWidth}
                    y1={
                      _displayProps.colTree.width -
                      coords[i]!.y * _displayProps.colTree.width
                    }
                    x2={coords[i + 1]!.x * innerWidth}
                    y2={
                      _displayProps.colTree.width -
                      coords[i + 1]!.y * _displayProps.colTree.width
                    }
                    stroke={COLOR_BLACK}
                  />
                )
              })
            )}
          </g>
        )}

        {_displayProps.groups.show && groups.length > 0 && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop - _displayProps.padding - _displayProps.groups.height
            })`}
          >
            {colLeaves.map((ci) => {
              const fill: string = colColorMap[ci]

              return (
                <rect
                  id={`color:${ci}`}
                  key={`color:${ci}`}
                  x={ci * blockSize.w}
                  y={0}
                  width={blockSize.w}
                  height={_displayProps.groups.height}
                  fill={fill}
                />
              )
            })}
          </g>
        )}

        {cf.rowTree && _displayProps.rowTree.position === 'Left' && (
          <g transform={`translate(${_displayProps.padding}, ${marginTop})`}>
            {cf.rowTree.coords.map((coords, ri) =>
              range(3).map((i) => {
                return (
                  <line
                    key={ri * 3 + i}
                    y1={coords[i]!.x * innerHeight}
                    x1={
                      _displayProps.rowTree.width -
                      coords[i]!.y * _displayProps.rowTree.width
                    }
                    y2={coords[i + 1]!.x * innerHeight}
                    x2={
                      _displayProps.rowTree.width -
                      coords[i + 1]!.y * _displayProps.rowTree.width
                    }
                    stroke={COLOR_BLACK}
                  />
                )
              })
            )}
          </g>
        )}

        {cf.rowTree && _displayProps.rowTree.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft +
              innerWidth +
              _displayProps.padding +
              (_displayProps.rowLabels.position === 'Right'
                ? _displayProps.rowLabels.width + _displayProps.padding
                : 0)
            }, ${marginTop})`}
          >
            {cf.rowTree.coords.map((coords, ri) =>
              range(3).map((i) => {
                return (
                  <line
                    key={ri * 3 + i}
                    y1={coords[i]!.x * innerHeight}
                    x1={coords[i]!.y * _displayProps.rowTree.width}
                    y2={coords[i + 1]!.x * innerHeight}
                    x2={coords[i + 1]!.y * _displayProps.rowTree.width}
                    stroke={COLOR_BLACK}
                  />
                )
              })
            )}
          </g>
        )}

        {_displayProps.rowLabels.position === 'Left' && (
          <g
            transform={`translate(${
              cf.rowTree && _displayProps.rowTree.position === 'Left'
                ? _displayProps.rowTree.width +
                  _displayProps.padding +
                  margin.left
                : margin.left
            }, ${marginTop})`}
          >
            {dfMain.rowNames.map((index, ri) => {
              return (
                <text
                  key={ri}
                  x={0}
                  y={ri * blockSize.h + blockSize2.h}
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {index}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.rowLabels.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft + innerWidth + _displayProps.padding
            }, ${marginTop})`}
          >
            {rowLeaves.map((ri) => {
              return (
                <text
                  key={ri}
                  x={0}
                  y={ri * blockSize.h + blockSize2.h}
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {dfMain.rowNames[ri]}
                </text>
              )
            })}
          </g>
        )}

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {rowLeaves.map((ri) => {
            return colLeaves.map((ci) => {
              const v = dfMain.get(ri, ci) as number
              const p = dfPercent.get(ri, ci) as number

              const fill: string = !isNaN(v)
                ? _displayProps.cmap.getColor(bound(v))
                : COLOR_WHITE

              return (
                <circle
                  id={`${ri}:${ci}`}
                  key={`${ri}:${ci}`}
                  cx={ci * blockSize.w + 0.5 * blockSize.w}
                  cy={ri * blockSize.h + 0.5 * blockSize.h}
                  r={0.5 * blockSize.w * p}
                  fill={fill}
                />
              )
            })
          })}
        </g>

        {/* grid */}

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {_displayProps.grid.show && (
            <>
              {range(blockSize.h, innerHeight, blockSize.h).map((y) => (
                <line
                  key={y}
                  x1={0}
                  y1={y}
                  x2={innerWidth}
                  y2={y}
                  stroke={_displayProps.grid.color}
                />
              ))}
              {range(blockSize.w, innerWidth, blockSize.w).map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={innerHeight}
                  stroke={_displayProps.grid.color}
                />
              ))}
            </>
          )}

          {_displayProps.border.show && (
            <rect
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              stroke={_displayProps.border.color}
              fill="none"
            />
          )}
        </g>

        {_displayProps.colLabels.position === 'Top' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop -
              _displayProps.padding -
              (_displayProps.groups.show && groups.length > 0
                ? _displayProps.groups.height + _displayProps.padding
                : 0)
            })`}
          >
            {dfMain.colNames.map((index, ri) => {
              return (
                <text
                  key={ri}
                  transform={`translate(${
                    ri * blockSize.w + blockSize2.w
                  }, 0) rotate(270)`}
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {index}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.colLabels.position === 'Bottom' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop + innerHeight + _displayProps.padding
            })`}
          >
            {colLeaves.map((ci) => {
              return (
                <text
                  key={ci}
                  transform={`translate(${
                    ci * blockSize.w + blockSize2.w
                  }, 0) rotate(270)`}
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  textAnchor="end"
                  fontSize="smaller"
                >
                  {dfMain.colName(ci)}
                </text>
              )
            })}
          </g>
        )}

        {_displayProps.colorbar.position === 'Right' && (
          <g
            transform={`translate(${
              marginLeft +
              innerWidth +
              _displayProps.padding +
              (_displayProps.rowLabels.position === 'Right'
                ? _displayProps.rowLabels.width
                : 0) +
              (cf.rowTree && _displayProps.rowTree.position === 'Right'
                ? _displayProps.rowTree.width + _displayProps.padding
                : 0)
            }, ${marginTop})`}
          >
            {VColorBarSvg({
              domain: _displayProps.range,
              cmap: _displayProps.cmap,
              size: _displayProps.colorbar.barSize,
            })}
          </g>
        )}

        {_displayProps.colorbar.position === 'Bottom' && (
          <g
            transform={`translate(${marginLeft}, ${
              marginTop +
              innerHeight +
              _displayProps.padding +
              (_displayProps.colLabels.position === 'Bottom'
                ? _displayProps.colLabels.width
                : 0)
            })`}
          >
            {HColorBarSvg({
              domain: _displayProps.range,
              cmap: _displayProps.cmap,
              size: _displayProps.colorbar.barSize,
            })}
          </g>
        )}

        {/* Plot the legend */}

        {_displayProps.groups.show &&
          groups.length > 0 &&
          _displayProps.legend.position === 'Upper Right' && (
            <g
              transform={`translate(${
                marginLeft +
                innerWidth +
                _displayProps.padding +
                (_displayProps.rowLabels.position === 'Right'
                  ? _displayProps.rowLabels.width
                  : 0) +
                (cf.rowTree && _displayProps.rowTree.position === 'Right'
                  ? _displayProps.rowTree.width + _displayProps.padding
                  : 0) +
                (_displayProps.colorbar.position === 'Right'
                  ? _displayProps.colorbar.width
                  : 0)
              }, ${marginTop})`}
            >
              {groups.map((g, gi) => {
                return (
                  <g
                    key={`group:${gi}`}
                    transform={`translate(0, ${
                      gi > 0 ? _displayProps.padding * gi : 0
                    })`}
                  >
                    <rect
                      x={0}
                      y={gi * legendBlockSize}
                      width={legendBlockSize}
                      height={legendBlockSize}
                      fill={g.color}
                      stroke={COLOR_BLACK}
                    />

                    <text
                      x={legendBlockSize + _displayProps.padding}
                      y={gi * legendBlockSize + 0.5 * legendBlockSize}
                      fill={COLOR_BLACK}
                      dominantBaseline="central"
                      fontSize="smaller"
                    >
                      {g.name}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
      </svg>
    )
  }, [cf, displayProps])

  function onMouseMove(e: { pageX: number; pageY: number }) {
    if (!svgRef) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!svgRef.current) {
      return
    }

    let c = Math.floor(
      (e.pageX -
        marginLeft * _displayProps.scale -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgRef.current.getBoundingClientRect().left -
        window.scrollX) /
        (blockSize.w * _displayProps.scale)
    )

    if (c < 0 || c > dfMain.shape[1]! - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY -
        marginTop * _displayProps.scale -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        svgRef.current.getBoundingClientRect().top -
        window.scrollY) /
        (blockSize.h * _displayProps.scale)
    )

    if (r < 0 || r > dfMain.shape[0] - 1) {
      r = -1
    }

    setHighlightCol([r, c])

    if (r > -1 && c > -1) {
      setToolTipInfo({
        ...toolTipInfo,
        seqIndex: r,
        pos: c,
        left: (marginLeft + (c + 1) * blockSize.w) * _displayProps.scale,
        top: (marginTop + (r + 1) * blockSize.h) * _displayProps.scale,
        visible: true,
      })
    }
  }

  const inBlock = highlightCol[0]! > -1 && highlightCol[1]! > -1

  return (
    <>
      {svg}

      <div
        ref={tooltipRef}
        className={cn(
          'absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white',
          [inBlock && toolTipInfo.visible, 'opacity-100', 'opacity-0']
        )}
        style={{ left: toolTipInfo.left, top: toolTipInfo.top }}
      >
        {inBlock && (
          <>
            <p className="font-semibold">{dfMain.colName(toolTipInfo.pos)}</p>
            <p>{cellStr(dfMain.get(toolTipInfo.seqIndex, toolTipInfo.pos))}</p>
            <p>
              x: {toolTipInfo.pos + 1}, y: {toolTipInfo.seqIndex + 1}
            </p>
          </>
        )}
      </div>

      <span
        ref={highlightRef}
        className={cn('absolute z-40 border-black', [
          inBlock,
          'opacity-100',
          'opacity-0',
        ])}
        style={{
          top: `${
            (marginTop + highlightCol[0]! * blockSize.h) * _displayProps.scale -
            1
          }px`,
          left: `${
            (marginLeft + highlightCol[1]! * blockSize.w) *
              _displayProps.scale -
            1
          }px`,
          width: `${blockSize.w * _displayProps.scale + 1}px`,
          height: `${blockSize.h * _displayProps.scale + 1}px`,
          borderWidth: `${Math.max(1, _displayProps.scale)}px`,
        }}
      />
    </>
  )
})
