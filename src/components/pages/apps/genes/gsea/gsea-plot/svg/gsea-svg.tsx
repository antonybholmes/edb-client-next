import { memo, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'
import { IPos } from '@/interfaces/pos'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import { IRankedGene } from '@/lib/gsea/geneset'
import { CrosshairProvider } from '@/providers/crosshair-provider'
import { useZoom } from '@/providers/zoom-provider'
import { useGseaPlot } from '../gsea-plot-provider'
import { useGseaSettings } from '../gsea-settings-store'
import { IGseaTableResult, useGseaData } from '../gsea-store'
import { EsSvg } from './es-svg'
import { GenesSvg } from './hits-svg'
import { crossingIndex, RankingSvg } from './ranking-svg'

const GseaPlot = memo(function GseaPlot({
  pathway,
  index,
  row,
  col,
  plotSize,
  innerPlotSize,
}: {
  pathway: IGseaTableResult
  index: number
  row: number
  col: number
  plotSize: IDim
  innerPlotSize: IDim
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { phenotypes, rankedGenes, result } = useGseaData(pathway.name)

  const pos = useMemo(
    () => ({ x: col * plotSize.w, y: row * plotSize.h }),
    [row, col, plotSize]
  )

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

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])
  const yaf = useMemo(() => axisDomainToRangeFunc(yax), [yax])

  const maxRank = rankedGenes.length - 1

  const sortedRankedGenes: IRankedGene[] = useMemo(
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

    return es.map((e) => ({ x: xaf(e.rank), y: yaf(e.score) }))
  }, [es, xax, yax])

  if (!xax || !yax || !result) {
    return null
  }

  let plotY = 0

  const esSvg = settings.es.show ? (
    <EsSvg
      pathway={pathway}
      rankedGenes={rankedGenes}
      es={es}
      points={points}
      xax={xax}
      yax={yax}
      phenotypes={phenotypes}
    />
  ) : null

  if (settings.es.show) {
    plotY += settings.es.axes.y.length + 1.5 * settings.plot.gap.y
  }

  const crossing = crossingIndex(sortedRankedGenes, xaf)

  const genesSvg = settings.genes.show ? (
    <GenesSvg
      pathway={pathway}
      xax={xax}
      points={points}
      es={es}
      sortedRankedGenes={sortedRankedGenes}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
      innerPlotSize={innerPlotSize}
    />
  ) : null

  if (settings.genes.show) {
    plotY += settings.genes.height + settings.plot.gap.y
  }

  const rankingSvg = settings.ranking.show ? (
    <RankingSvg
      plotId={pathway.id}
      xaf={xaf}
      rankedGenes={sortedRankedGenes}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
    />
  ) : null

  const titleX = settings.plot.margin.left + settings.axes.x.length / 2

  return (
    <SvgG pos={pos} id={`plot-${index + 1}`}>
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
  const { zoom } = useZoom()
  const { pathways } = useGseaPlot()

  // stable across renders so GseaPlot's memo() isn't defeated by
  // fresh object literals on every GseaSvgContent render
  const innerPlotSize = useMemo(
    () => ({
      w: settings.axes.x.length,
      h:
        settings.es.axes.y.length +
        (settings.genes.show
          ? settings.plot.gap.y + settings.genes.height
          : 0) +
        (settings.ranking.show
          ? settings.plot.gap.y + settings.ranking.axes.y.length
          : 0),
    }),
    [
      settings.axes.x.length,
      settings.es.axes.y.length,
      settings.genes.show,
      settings.genes.height,
      settings.ranking.show,
      settings.ranking.axes.y.length,
      settings.plot.gap.y,
    ]
  )

  const plotSize = useMemo(
    () => ({
      w:
        innerPlotSize.w +
        settings.plot.margin.left +
        settings.plot.margin.right,
      h:
        innerPlotSize.h +
        settings.plot.margin.top +
        settings.plot.margin.bottom,
    }),
    [
      innerPlotSize,
      settings.plot.margin.left,
      settings.plot.margin.right,
      settings.plot.margin.top,
      settings.plot.margin.bottom,
    ]
  )

  if (pathways.length === 0) {
    return null
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
      />
    )
  })

  return (
    <SvgBase
      scale={zoom}
      width={pageSize[0]!}
      height={pageSize[1]!}
      //shapeRendering={SVG_CRISP_EDGES}
      //className="absolute"
    >
      {svgPlots}
    </SvgBase>
  )
}

export function GseaSvg() {
  return (
    <CrosshairProvider>
      <GseaSvgContent />
    </CrosshairProvider>
  )
}
