import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { IPos } from '@/interfaces/pos'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { IRankedGene } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { axisDomainToRangeFunc, IAxis } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { SvgText } from '@/components/plot/svg-text'
import { argmax } from '@/lib/math/math'
import { memo, useMemo } from 'react'
import { useGseaSettings } from '../gsea-settings-store'
import { IGseaTableResult } from '../gsea-store'
import { getColorMapFromSettings } from './hits-svg'

export const EsLeadingEdgeSvg = memo(function EsLeadingEdgeSvg({
  leadingEdge,
  xax,
  yaf,
  fill,
  fillOpacity,
}: {
  leadingEdge: IRankedGene[]
  xax: IAxis
  yaf: (domain: number) => number
  fill?: string
  fillOpacity?: number
}) {
  const { settings } = useGseaSettings()

  // hooks must run unconditionally, so the empty/undefined checks happen inside the memo below
  const { leadingPoints, linePos } = useMemo(() => {
    if (!xax || leadingEdge.length === 0) {
      return { leadingPoints: [] as IPos[], linePos: undefined }
    }

    const xaf = axisDomainToRangeFunc(xax)

    const x0 = xax.range[0]
    const x1 = xax.range[1]
    const y0 = yaf(0)

    const points = leadingEdge.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.esScore),
    }))

    const { value: maxEsScore } = argmax(
      leadingEdge.map((e) => e.esScore),
      { abs: true }
    )

    const isLeft = maxEsScore >= 0

    // To make the filled area under the leading edge curve,
    // we need to add points at the start and end of the leading edge curve to ensure it is closed.
    // We check if the leading edge is on the left or right half of the plot to determine
    // where to add the points.

    const linePos: IPos = isLeft ? points[points.length - 1]! : points[0]!

    // check if leading edge is on left or right half to decide how to fix start and end
    const leadingPoints = isLeft
      ? [{ x: x0, y: y0 }, ...points, { x: linePos.x, y: y0 }]
      : [{ x: linePos.x, y: y0 }, ...points, { x: x1, y: y0 }]

    return { leadingPoints, linePos }
  }, [leadingEdge, xax, yaf])

  if (!xax || leadingEdge.length === 0) {
    return null
  }

  return (
    <g id="leading-edge">
      {settings.es.leadingEdge.fill.show && (
        <SvgPolygon
          id="leading-edge-area"
          points={leadingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={fill ?? settings.es.leadingEdge.fill.value}
          stroke="none"
          fillOpacity={fillOpacity ?? settings.es.leadingEdge.fill.opacity}
        />
      )}

      {settings.es.leadingEdge.line.show && (
        <SvgLine
          id="leading-edge-line"
          x1={linePos!.x}
          y1={linePos!.y}
          x2={linePos!.x}
          y2={yaf(0)}
          s={settings.es.leadingEdge.line}
        />
      )}
    </g>
  )
})

export const EsCurveSvg = memo(function EsCurveSvg({
  hits,
  xax,
  yax,
  stroke,
}: {
  hits: IRankedGene[]
  xax: IAxis
  yax: IAxis
  stroke?: string
}) {
  const { settings } = useGseaSettings()

  const yaf = useMemo(() => axisDomainToRangeFunc(yax), [yax])
  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])

  const x0 = xaf(0)
  const x1 = xax.range[1]
  const y0 = yaf(0)

  const { leadingEdge } = useMemo(() => {
    const leadingEdge = hits.filter((e) => e.leading)

    const { value: maxEsScore, index: maxEsScoreIndex } = argmax(
      leadingEdge.map((e) => e.esScore),
      { abs: true }
    )

    const isLeft = maxEsScore >= 0

    return { leadingEdge, isLeft, maxEsScore, maxEsScoreIndex }
  }, [hits])

  const points = useMemo(() => {
    if (!xax || !yax) {
      return []
    }

    let points = hits.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.esScore),
    }))

    // fix starts and ends

    if (points[0].x !== x0 || points[0].y !== y0) {
      points = [{ x: x0, y: y0 }, ...points]
    }

    if (
      points[points.length - 1]!.x !== x1 ||
      points[points.length - 1]!.y !== y0
    ) {
      points = [
        ...points,
        {
          x: x1,
          y: y0,
        },
      ]
    }

    return points
  }, [hits, xax, yax])

  return (
    <>
      <EsLeadingEdgeSvg leadingEdge={leadingEdge} xax={xax} yaf={yaf} />

      <SvgPolyLine
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        s={settings.es.line}
        stroke={stroke}
      />
    </>
  )
})

export const EsSvg = memo(function EsSvg({
  pathway,
  numGenes,
  hits,
  xax,
  yax,
  phenotypes,
}: {
  pathway: IGseaTableResult
  numGenes: number
  hits: IRankedGene[]
  xax: IAxis
  yax: IAxis
  phenotypes: string[]
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const nes = settings.phenotypes.mode !== 'normal' ? -pathway.nes : pathway.nes

  const sortedPhenotypes =
    settings.phenotypes.mode !== 'normal'
      ? phenotypes.slice().reverse()
      : phenotypes

  const phenIndexMap = useMemo(
    () => new Map<string, number>(sortedPhenotypes.map((phen, i) => [phen, i])),
    [sortedPhenotypes]
  )

  const phenotypei = phenIndexMap.get(pathway.phen)!

  const yaf = useMemo(() => axisDomainToRangeFunc(yax), [yax])

  const y0 = yaf(0)

  const cmap = useMemo(
    () => getColorMapFromSettings(settings, edbSettings),
    [settings, edbSettings]
  )

  return (
    <>
      <EsCurveSvg hits={hits} xax={xax} yax={yax} />

      {yax.style.show && <AxisLeftSvg ax={yax} />}

      {xax.style.show && (
        <SvgG pos={{ x: 0, y: y0 }}>
          <AxisBottomSvg ax={xax} showTicks={settings.es.axes.x.showTicks} />
        </SvgG>
      )}

      <SvgG
        pos={{ x: settings.es.axes.x.length + settings.plot.gap.x / 4, y: y0 }}
      >
        <SvgText
          dominantBaseline="central"
          font={edbSettings.plots.axes.x.ticks.major.style.labels}
        >
          {numGenes.toLocaleString()}
        </SvgText>
      </SvgG>

      {settings.es.labels.show && (
        <SvgG
          pos={{
            x: phenotypei === 0 ? settings.es.axes.x.length - 70 : 10,
            y: phenotypei === 0 ? 10 : settings.es.axes.y.length - 20,
          }}
          fontSize="small"
        >
          <SvgText font={settings.es.labels}>NES: {nes.toFixed(2)}</SvgText>

          <SvgG pos={{ x: 0, y: 15 }}>
            <SvgText font={settings.es.labels}>
              FDR: {pathway.q.toFixed(3)}
            </SvgText>
          </SvgG>
        </SvgG>
      )}

      {settings.es.phenotypes.show && (
        <SvgG
          pos={{ x: 0, y: settings.es.axes.y.length + settings.plot.gap.y / 2 }}
        >
          <SvgG>
            <SvgText
              fill={
                settings.genes.color.on && settings.genes.labels.color.on
                  ? cmap.getHexColor(0)
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
            >
              {sortedPhenotypes[0]!}
            </SvgText>
          </SvgG>

          <SvgG pos={{ x: settings.es.axes.x.length, y: 0 }}>
            <SvgText
              fill={
                settings.genes.color.on && settings.genes.labels.color.on
                  ? cmap.getHexColor(1)
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
              textAnchor="end"
            >
              {sortedPhenotypes[1]!}
            </SvgText>
          </SvgG>
        </SvgG>
      )}
    </>
  )
})
