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
import { argmaxAbs } from '@/lib/math/math'
import { useMemo } from 'react'
import { useGseaSettings } from '../gsea-settings-store'
import { IGseaTableResult } from '../gsea-store'

export function EsLeadingEdgeSvg({
  leadingEdge,
  xaf,
  yaf,
  fill,
  fillOpacity,
}: {
  leadingEdge: IRankedGene[]

  xaf: (domain: number) => number
  yaf: (domain: number) => number
  fill?: string
  fillOpacity?: number
}) {
  const { settings } = useGseaSettings()

  if (leadingEdge.length === 0) {
    return null
  }

  const x0 = xaf(0)
  const x1 = xaf(leadingEdge[leadingEdge.length - 1]!.rank)
  const y0 = yaf(0)

  let leadingPoints = leadingEdge.map((e) => ({
    x: xaf(e.rank),
    y: yaf(e.score),
  }))

  const { value } = argmaxAbs(leadingEdge.map((e) => e.score))

  const isLeft = value >= 0

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

export function EsCurveSvg({
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

  const yaf = axisDomainToRangeFunc(yax)
  const xaf = axisDomainToRangeFunc(xax)

  const points: IPos[] = useMemo(() => {
    if (!xax || !yax) {
      return []
    }

    return hits.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.score),
    }))
  }, [hits, xax, yax])

  const leadingEdge = useMemo(() => hits.filter((e) => e.leading), [hits])

  return (
    <>
      <EsLeadingEdgeSvg leadingEdge={leadingEdge} xaf={xaf} yaf={yaf} />

      <SvgPolyLine
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        s={settings.es.line}
        stroke={stroke}
      />
    </>
  )
}

export function EsSvg({
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
  const nes = settings.phenotypes.invert ? -pathway.nes : pathway.nes

  const sortedPhenotypes = settings.phenotypes.invert
    ? phenotypes.slice().reverse()
    : phenotypes

  const phenIndexMap = new Map<string, number>(
    sortedPhenotypes.map((phen, i) => [phen, i])
  )

  const phenotypei = phenIndexMap.get(pathway.phen)!
  //const rankMid = maxRank / 2

  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yax)

  const y0 = yaf(0)

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
        pos={{ x: settings.axes.x.length + settings.plot.gap.x / 4, y: y0 }}
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
            x: phenotypei === 0 ? settings.axes.x.length - 70 : 10,
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
                settings.genes.color.on
                  ? settings.genes.pos.value
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
            >
              {sortedPhenotypes[0]!}
            </SvgText>
          </SvgG>

          <SvgG pos={{ x: settings.axes.x.length, y: 0 }}>
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
          </SvgG>
        </SvgG>
      )}
    </>
  )
}
