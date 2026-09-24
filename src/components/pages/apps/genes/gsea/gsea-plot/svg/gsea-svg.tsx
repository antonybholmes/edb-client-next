import { memo, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'

import { useEdbSettings } from '@/components/edb/edb-settings'
import {
  IRankedGene,
  sortRankedGenes,
} from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { range } from '@/lib/math/range'
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
  pos,
  innerPlotSize,
}: {
  pathway: IGseaTableResult
  index: number
  // row: number
  // col: number
  // plotSize: IDim
  pos: IPos
  innerPlotSize: IDim
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { phenotypes, scores, result } = useGseaData(pathway.name)

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

  const maxRank = scores.length - 1

  // let subSampledEs = useMemo(() => {
  //   const genes = subsampleRankedGenes(es, 1000) //settings.es.step)

  //   return settings.phenotypes.invert
  //     ? genes
  //         .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
  //         .sort((a, b) => a.rank - b.rank)
  //     : genes
  // }, [es, settings.es.step, settings.phenotypes.invert])

  const sortedScores: IRankedGene[] = useMemo(
    () =>
      sortRankedGenes(scores, maxRank, {
        reverse: settings.phenotypes.mode !== 'normal',
      }),
    [scores, maxRank, settings.phenotypes.mode]
  )

  const hits = useMemo(() => {
    return sortRankedGenes(result.hits, maxRank, {
      reverse: settings.phenotypes.mode !== 'normal',
    })
  }, [result, maxRank, settings.phenotypes.mode])

  let plotY = 0

  const esSvg = useMemo(() => {
    if (!settings.es.show) {
      return null
    }

    return (
      <EsSvg
        pathway={pathway}
        hits={hits}
        numGenes={scores.length}
        xax={xax}
        yax={yax}
        phenotypes={phenotypes}
      />
    )
  }, [settings.es.show, pathway, hits, scores.length, xax, yax, phenotypes])

  if (settings.es.show) {
    plotY += settings.es.axes.y.length + 1.5 * settings.plot.gap.y
  }

  const crossing = crossingIndex(sortedScores, xaf)

  const genesSvg = useMemo(() => {
    if (!settings.genes.show) {
      return null
    }

    return (
      <SvgG pos={{ x: 0, y: plotY }}>
        <GenesSvg
          pathway={pathway}
          xax={xax}
          yaf={yaf}
          //points={points}
          scores={sortedScores}
          hits={hits}
          crossing={crossing}
          pos={{ x: pos.x, y: pos.y + plotY }}

          innerPlotSize={innerPlotSize}
        />
      </SvgG>
    )
  }, [
    settings.genes.show,
    pathway,
    xax,
    yax,
    sortedScores,
    hits,
    crossing,
    pos,
    innerPlotSize,
  ])

  if (settings.genes.show) {
    plotY += settings.genes.height + settings.plot.gap.y
  }

  const rankingSvg = useMemo(() => {
    if (!settings.ranking.show) {
      return null
    }

    return (
      <SvgG pos={{ x: 0, y: plotY }}>
        <RankingSvg
          plotId={pathway.id}
          xaf={xaf}
          es={sortedScores}
          crossing={crossing}
        />
      </SvgG>
    )
  }, [settings.ranking.show, plotY, pathway.id, xaf, sortedScores, crossing])

  const titleX = settings.plot.margin.left + settings.es.axes.x.length / 2

  return (
    <>
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
    </>
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
      w: settings.es.axes.x.length,
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
      settings.es.axes.x.length,
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

  const svgPlots = useMemo(
    () =>
      pathways.map((pathway, index) => {
        const row = Math.floor(index / settings.page.columns)
        const col = index % settings.page.columns

        const pos = { x: col * plotSize.w, y: row * plotSize.h }

        return (
          <SvgG pos={pos} key={`plot-${index + 1}`}>
            <GseaPlot
              key={pathway.id}
              pathway={pathway}
              index={index}
              pos={pos}
              innerPlotSize={innerPlotSize}
            />
          </SvgG>
        )
      }),
    [pathways, settings.page.columns, plotSize, innerPlotSize]
  )

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

export function subsampleRankedGenes(
  rankedGenes: IRankedGene[],
  step: number
): IRankedGene[] {
  const ix = range(0, rankedGenes.length, step)

  let subSampledRankedGenes = ix.map((i) => rankedGenes[i]!)

  if (subSampledRankedGenes[0].rank !== 0) {
    subSampledRankedGenes = [
      { rank: 0, name: '', score: 0 },
      ...subSampledRankedGenes,
    ]
  }

  if (
    subSampledRankedGenes[subSampledRankedGenes.length - 1].rank !==
    rankedGenes[rankedGenes.length - 1]!.rank
  ) {
    subSampledRankedGenes = [
      ...subSampledRankedGenes,
      { rank: rankedGenes[rankedGenes.length - 1]!.rank, name: '', score: 0 },
    ]
  }

  return subSampledRankedGenes
}
