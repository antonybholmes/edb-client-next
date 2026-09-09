import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { IPos } from '@/interfaces/pos'
import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { ColorMap } from '@/lib/color/colormap'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  IAxis,
} from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { useSVG } from '@/providers/svg-provider'
import { TOOLTIP_CLEAR_MS } from '@/providers/tooltip-provider'
import { useGseaPlot } from './gsea-plot-provider'
import { useGseaSettings } from './gsea-settings-store'
import { IGseaGeneRankScore, IGseaGeneSet, useGseaData } from './gsea-store'

function EsSvg({
  pathway,
  es,
  sortedRankedGenes,
  maxRank,
  points,
  x0,
  x1,
  xax,
  yax,
  phenotypes,
}: {
  pathway: IGseaGeneSet
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]
  maxRank: number
  points: IPos[]
  x0: number
  x1: number
  xax: IAxis
  yax: IAxis
  phenotypes: string[]
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const nes = settings.phenotypes.invert ? -pathway.nes : pathway.nes

  const sortedPhenotypes = settings.phenotypes.invert
    ? phenotypes.slice().reverse()
    : phenotypes

  const phenIndexMap = new Map<string, number>(
    sortedPhenotypes.map((phen, i) => [phen, i])
  )

  const phenotypei = phenIndexMap.get(pathway.phen)!
  const rankMid = maxRank / 2

  const y0 = axisDomainToRange(yax, [0])[0]

  //
  // Fix starts and end of ES curve. GSEA does not necessarily
  // start at 0 or end at 0 because it only changes when it encounters a gene in the pathway.
  // So if the first gene in the ranked list is in the pathway, it will start with a
  // jump and never actually be at 0. Same for the end. We add points at the start and end to
  // ensure the curve starts and ends at 0.
  //
  let displayPoints = points

  // If the first point is not at (x0, y0), add a point at the start
  if (displayPoints[0]!.x !== x0 || displayPoints[0]!.y !== y0) {
    displayPoints = [{ x: x0, y: y0 }, ...displayPoints]
  }

  // If the last point is not at (x1, y0), add a point at the end
  if (
    displayPoints[displayPoints.length - 1]!.x !== x1 ||
    displayPoints[displayPoints.length - 1]!.y !== y0
  ) {
    displayPoints = [
      ...displayPoints,
      {
        x: x1,
        y: y0,
      },
    ]
  }

  return (
    <g>
      <EsLeadingEdgeSvg
        es={es}
        rankMid={rankMid}
        x0={x0}
        x1={x1}
        y0={y0}
        xax={xax}
        yax={yax}
      />

      <SvgPolyLine
        points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        s={settings.es.line}
      />

      {edbSettings.plots.axes.y.style.show && <AxisLeftSvg ax={yax} />}

      {edbSettings.plots.axes.x.style.show && (
        <g transform={`translate(0, ${y0})`}>
          <AxisBottomSvg ax={xax} showTicks={settings.es.axes.x.showTicks} />
        </g>
      )}

      <g
        transform={`translate(${settings.axes.x.length + settings.plot.gap.x / 4}, ${y0})`}
      >
        <SvgText
          dominantBaseline="central"
          font={edbSettings.plots.axes.x.ticks.major.style.labels}
        >
          {sortedRankedGenes.length.toLocaleString()}
        </SvgText>
      </g>

      {settings.es.labels.show && (
        <g
          transform={`translate(${phenotypei === 0 ? settings.axes.x.length - 70 : 10}, ${phenotypei === 0 ? 10 : settings.es.axes.y.length - 20})`}
          fontSize="small"
        >
          <SvgText font={settings.es.labels}>NES: {nes.toFixed(2)}</SvgText>

          <g transform={`translate(0, 15)`}>
            <SvgText font={settings.es.labels}>
              FDR: {pathway.q.toFixed(3)}
            </SvgText>
          </g>
        </g>
      )}

      {settings.es.phenotypes.show && (
        <g
          transform={`translate(0, ${settings.es.axes.y.length + settings.plot.gap.y / 2})`}
        >
          <g>
            <SvgText
              fill={
                settings.genes.color.on
                  ? settings.genes.pos.value
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
            >
              {sortedPhenotypes[0]!}
            </SvgText>
          </g>

          <g transform={`translate(${settings.axes.x.length}, 0)`}>
            <SvgText
              fill={
                settings.genes.color.on
                  ? settings.genes.neg.value
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
              textAnchor="end"
            >
              {sortedPhenotypes[1]!}
            </SvgText>
          </g>
        </g>
      )}
    </g>
  )
}

function EsLeadingEdgeSvg({
  es,
  rankMid,
  x0,
  x1,
  y0,
  xax,
  yax,
}: {
  es: IGseaGeneRankScore[]
  rankMid: number
  x0: number
  x1: number
  y0: number
  xax: IAxis
  yax: IAxis
}) {
  const { settings } = useGseaSettings()

  const leadingEdge = es.filter((e) => e.leading)

  const isLeft = leadingEdge[leadingEdge.length - 1]!.rank < rankMid

  let leadingPoints = leadingEdge.map((e) => ({
    x: axisDomainToRange(xax, [e.rank])[0],
    y: axisDomainToRange(yax, [e.score])[0],
  }))

  // To make the filled area under the leading edge curve,
  // we need to add points at the start and end of the leading edge curve to ensure it is closed.
  // We check if the leading edge is on the left or right half of the plot to determine
  // where to add the points.

  let linePos: IPos = isLeft
    ? leadingPoints[leadingPoints.length - 1]!
    : leadingPoints[0]!

  // check if leading edge is on left or right half to decide how to fix start and end
  if (isLeft) {
    // left
    leadingPoints = [
      { x: x0, y: y0 },
      ...leadingPoints,
      {
        x: linePos!.x,
        y: y0,
      },
    ]
  } else {
    leadingPoints = [
      { x: leadingPoints[0]!.x, y: y0 },
      ...leadingPoints,
      {
        x: x1,
        y: y0,
      },
    ]
  }

  return (
    <g id="leading-edge">
      {settings.es.leadingEdge.fill.show && (
        <polygon
          id="leading-edge-area"
          points={leadingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={settings.es.leadingEdge.fill.value}
          stroke="none"
          fillOpacity={settings.es.leadingEdge.fill.opacity}
        />
      )}

      {settings.es.leadingEdge.line.show && (
        <SvgLine
          id="leading-edge-line"
          x1={linePos.x}
          y1={linePos.y}
          x2={linePos.x}
          y2={y0}
          s={settings.es.leadingEdge.line}
        />
      )}
    </g>
  )
}

function GenesSvg({
  xax,
  points,
  es,
  sortedRankedGenes,
  crossing,
  pos,
}: {
  xax: IAxis
  points: { x: number; y: number }[]
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]
  crossing: { index: number; x: number }
  pos: IPos
}) {
  const { settings } = useGseaSettings()

  const c1 = settings.genes.pos.value
  const c2 = addAlphaToHex(
    settings.genes.pos.value,
    settings.genes.gradient.opacity
  )
  const c3 = addAlphaToHex(
    settings.genes.neg.value,
    settings.genes.gradient.opacity
  )
  const c4 = settings.genes.neg.value
  const cmap1 = new ColorMap('pos', 'pos', [c1, c2])
  const cmap2 = new ColorMap('neg', 'neg', [c3, c4])

  //console.log(sortedRankedGenes)

  // for a given point, use its rank to find the corresponding gene in sortedRankedGenes,
  // then use its score to determine the color of the point. This is because we base
  // color on the ranking of all genes in the exp matrix so we are essentially using
  // the signal to noise ratio to color the points from red (positive) to blue (negative)
  const posPoints = points.filter((_, pi) => {
    return sortedRankedGenes[es[pi]!.rank]!.score >= 0
  })
  const negPoints = points.filter(
    (_, pi) => sortedRankedGenes[es[pi]!.rank]!.score < 0
  )

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {posPoints.map((p, pi) => {
        const pc = p.x / crossing.x

        const color = settings.genes.color.on
          ? cmap1.getHexColor(pc)
          : COLOR_BLACK
        return (
          <line
            key={pi}
            x1={p.x}
            x2={p.x}
            y1={0}
            y2={settings.genes.height}
            strokeWidth={settings.genes.pos.width}
            stroke={color}
          />
        )
      })}

      {negPoints.map((p, pi) => {
        const pc = (p.x - crossing.x) / (xax.range[1] - crossing.x)

        const color = settings.genes.color.on
          ? cmap2.getHexColor(pc)
          : COLOR_BLACK
        return (
          <line
            key={posPoints.length + pi}
            x1={p.x}
            x2={p.x}
            y1={0}
            y2={settings.genes.height}
            strokeWidth={settings.genes.neg.width}
            stroke={color}
          />
        )
      })}
    </g>
  )
}

function RankingSvg({
  pathway,
  xax,
  sortedRankedGenes,
  crossing,
  x0,
  x1,
  pos,
}: {
  pathway: IGseaGeneSet
  xax: IAxis
  sortedRankedGenes: IGseaGeneRankScore[]

  crossing: { index: number; x: number }

  x0: number
  x1: number
  pos: IPos
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: yax } = useAxis({
    plotId: pathway.id,
    groupId: 'snr',
    axisId: 'y',
  })

  const y0 = axisDomainToRange(yax, [0])[0]
  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yax)
  const points = sortedRankedGenes.map((e) => ({
    x: xaf(e.rank),
    y: yaf(e.score),
  }))

  // fix starts and end
  let displayPoints = points

  displayPoints = [{ x: x0, y: y0 }, ...displayPoints]

  displayPoints = [
    ...displayPoints,
    {
      x: x1,
      y: y0,
    },
  ]

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {settings.ranking.fill.show && (
        <SvgPolygon
          points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fp={settings.ranking.fill}
        />
      )}

      {settings.ranking.zeroCross.line.show && (
        <g transform={`translate(${crossing.x}, 0)`}>
          <SvgLine
            y2={settings.ranking.axes.y.length}
            s={settings.ranking.zeroCross.line}
          />
          <g
            transform={`translate(0, ${settings.ranking.axes.y.length + settings.plot.gap.y})`}
          >
            <SvgText
              textAnchor="middle"
              font={edbSettings.plots.axes.x.ticks.major.style.labels}
            >
              Zero cross at {crossing.index.toLocaleString()}
            </SvgText>
          </g>
        </g>
      )}
      <AxisLeftSvg ax={yax} />
    </g>
  )
}

const GseaPlot = memo(function GseaPlot({
  pathway,
  index,
  row,
  col,
  plotSize,
  innerPlotSize,
  pos,
}: {
  pathway: IGseaGeneSet
  index: number
  row: number
  col: number
  plotSize: IDim
  innerPlotSize: IDim
  pos: IPos
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { phenotypes, rankedGenes, result } = useGseaData(pathway.name)
  const { ref } = useSVG()
  const { setBarPos } = useBarContext()

  const { axis: xax } = useAxis({
    plotId: pathway.id,
    groupId: 'es',
    axisId: 'x',
  })
  const { axis: yax } = useAxis({
    plotId: pathway.id,
    groupId: 'es',
    axisId: 'y',
  })

  const maxRank = rankedGenes.length - 1

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // avoid re-rendering the whole svg tree when the hovered cell hasn't changed
  const lastCellRef = useRef<{ r: number; c: number } | null>(null)

  const sortedRankedGenes: IGseaGeneRankScore[] = useMemo(
    () =>
      settings.phenotypes.invert
        ? rankedGenes
            .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
            .sort((a, b) => a.rank - b.rank)
        : rankedGenes,
    [rankedGenes, maxRank, settings.phenotypes.invert]
  )

  const es = useMemo(() => {
    if (!result) {
      return []
    }

    return settings.phenotypes.invert
      ? result.es
          .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
          .sort((a, b) => a.rank - b.rank)
      : result.es
  }, [result, maxRank, settings.phenotypes.invert])

  const points: IPos[] = useMemo(() => {
    if (!xax || !yax) {
      return []
    }

    const xaf = axisDomainToRangeFunc(xax)
    const yaf = axisDomainToRangeFunc(yax)

    return es.map((e) => ({ x: xaf(e.rank), y: yaf(e.score) }))
  }, [es, xax, yax])

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

      const svgP = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      const plotP = {
        x: svgP.x - pos.x - settings.plot.margin.left,
        y: svgP.y - pos.y - settings.plot.margin.top,
      }

      if (
        plotP.x < 0 ||
        plotP.x > plotSize.w ||
        plotP.y < 0 ||
        plotP.y > plotSize.h
      ) {
        return
      }

      // find nearest es point using binary search
      let nearestEsPoint = points[0]
      let left = 0
      let right = points.length - 1
      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        if (points[mid].x < plotP.x) {
          left = mid + 1
        } else {
          right = mid - 1
        }
      }
      if (left < points.length) {
        nearestEsPoint = points[left]
      }

      const barP = {
        x: nearestEsPoint.x + settings.plot.margin.left,
        y: plotP.y + settings.plot.margin.top,
      }

      const { relativeP: barScreenP } = svgPointToScreen(ref.current, barP)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setBarPos(barScreenP)

      // const stats = mf?.data(row, col)

      // showTooltip({
      //   pos: { x: absoluteBlockScreenXY.x + 5, y: absoluteBlockScreenXY.y + 5 },
      //   content: (
      //     <>
      //       <p className="font-semibold">{stats!.sample}</p>
      //       <p>{stats!.feature}</p>
      //       <p className="truncate">
      //         {getEventLabel(stats!, mutationsInUse, 'single')}
      //       </p>
      //       <p>{`row: ${row + 1}, col: ${col + 1}`}</p>
      //     </>
      //   ),
      // })
    },
    [top, hideTooltip, settings.plot.margin, points]
  )

  if (!xax || !yax || !result) {
    return null
  }

  const [x0, x1] = axisDomainToRange(xax, [0, maxRank])
  let plotY = 0

  const esSvg = settings.es.show ? (
    <EsSvg
      pathway={pathway}
      sortedRankedGenes={sortedRankedGenes}
      es={es}
      maxRank={maxRank}
      x0={x0}
      x1={x1}
      points={points}
      xax={xax}
      yax={yax}
      phenotypes={phenotypes}
    />
  ) : null

  if (settings.es.show) {
    plotY += settings.es.axes.y.length + 1.5 * settings.plot.gap.y
  }

  const crossIndex =
    sortedRankedGenes.findLastIndex((gene) => gene.score > 0) + 1

  const crossing = {
    index: crossIndex,
    x: axisDomainToRange(xax, [crossIndex])[0],
  }

  const genesSvg = settings.genes.show ? (
    <GenesSvg
      xax={xax}
      points={points}
      es={es}
      sortedRankedGenes={sortedRankedGenes}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
    />
  ) : null

  if (settings.genes.show) {
    plotY += settings.genes.height + settings.plot.gap.y
  }

  const rankingSvg = settings.ranking.show ? (
    <RankingSvg
      xax={xax}
      pathway={pathway}
      sortedRankedGenes={sortedRankedGenes}
      x0={x0}
      x1={x1}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
    />
  ) : null

  const titleX = settings.plot.margin.left + settings.axes.x.length / 2

  return (
    <SvgG pos={pos} id={`plot-${index + 1}`} onMouseMove={onMouseMove}>
      <rect
        width={plotSize.w}
        height={plotSize.h}
        fill="transparent"
        stroke="blue"
      />

      {edbSettings.plots.axes.x.style.title.show && (
        <SvgText
          id={`title-${index + 1}`}
          font={edbSettings.plots.axes.x.style.title}
          textAnchor="middle"
          x={titleX}
          y={
            settings.plot.margin.top -
            edbSettings.plots.axes.x.style.title.offset * 0.5
          }
        >
          {pathway.name}
        </SvgText>
      )}
      <SvgMargin margin={settings.plot.margin}>
        {esSvg}
        {genesSvg}
        {rankingSvg}
      </SvgMargin>
    </SvgG>
  )
})

interface IBarContext {
  barPos: IPos | null
  setBarPos: (pos: IPos | null) => void
}

const BarContext = createContext<IBarContext>({
  barPos: null,
  setBarPos: () => {},
})

function useBarContext() {
  const ctx = useContext(BarContext)
  if (!ctx) {
    throw new Error('useBarContext must be used within a BarContext.Provider')
  }
  return ctx
}

function BarContextProvider({ children }: { children: ReactNode }) {
  const [barPos, setBarPos] = useState<IPos | null>(null)
  return (
    <BarContext.Provider value={{ barPos, setBarPos }}>
      {children}
    </BarContext.Provider>
  )
}

/**
 * Create SVG for GSEA plot. We create separate SVG for each plot and then combine them in the main SVG.
 * This allows us to have different y axes for ES and ranked genes, and to have different settings for each plot.
 *
 * Notes: Rank is 0-based in the results files.
 * @param param0
 * @returns
 */
function GseaSvgContent() {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { barPos } = useBarContext()

  const { pathways } = useGseaPlot()

  if (pathways.length === 0) {
    return null
  }

  // size of plot with padding
  const innerPlotSize = {
    w: settings.axes.x.length,
    h:
      settings.es.axes.y.length +
      (settings.genes.show ? settings.plot.gap.y + settings.genes.height : 0) +
      (settings.ranking.show
        ? settings.plot.gap.y + settings.ranking.axes.y.length
        : 0),
  }

  const plotSize = {
    w: innerPlotSize.w + settings.plot.margin.left + settings.plot.margin.right,
    h: innerPlotSize.h + settings.plot.margin.top + settings.plot.margin.bottom,
  }

  const rows = Math.ceil(pathways.length / settings.page.columns)
  const pageSize = [plotSize.w * settings.page.columns, plotSize.h * rows]

  const svgPlots = pathways.map((pathway, index) => {
    const row = Math.floor(index / settings.page.columns)
    const col = index % settings.page.columns
    return (
      <GseaPlot
        key={pathway.id}
        pathway={pathway}
        index={index}
        row={row}
        col={col}
        plotSize={plotSize}
        innerPlotSize={innerPlotSize}
        pos={{ x: col * plotSize.w, y: row * plotSize.h }}
      />
    )
  })

  return (
    <>
      <SvgBase
        scale={edbSettings.plots.scale}
        width={pageSize[0]!}
        height={pageSize[1]!}
        //shapeRendering={SVG_CRISP_EDGES}
        //className="absolute"
      >
        {svgPlots}
      </SvgBase>
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

export function GseaSvg() {
  return (
    <BarContextProvider>
      <GseaSvgContent />
    </BarContextProvider>
  )
}
