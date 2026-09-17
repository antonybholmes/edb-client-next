import { AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { IPos } from '@/interfaces/pos'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { IRankedGene } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc, axisLength } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { useGseaSettings } from '../gsea-settings-store'

export function RankingSvg({
  plotId,
  xaf,
  es,
  crossing,
  pos,
}: {
  plotId: string
  xaf: (domainValue: number) => number
  es: IRankedGene[]
  crossing: { index: number; x: number }
  pos?: IPos
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: yax } = useAxis({
    plotId: plotId,
    groupId: 'snr',
    axisId: 'y',
  })

  const yaf = axisDomainToRangeFunc(yax)

  const y0 = yaf(0)

  const ylen = axisLength(yax)

  const points = es.map((e) => ({
    x: xaf(e.rank),
    y: yaf(e.score),
  }))

  // fix starts and end
  const displayPoints = [
    { x: xaf(0), y: y0 },
    ...points,
    {
      x: xaf(es.length - 1),
      y: y0,
    },
  ]

  return (
    <SvgG pos={pos}>
      {settings.ranking.fill.show && (
        <SvgPolygon
          points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fp={settings.ranking.fill}
        />
      )}

      {settings.ranking.zeroCross.line.show && (
        <SvgG pos={{ x: crossing.x, y: 0 }}>
          <SvgLine
            y2={settings.ranking.axes.y.length}
            s={settings.ranking.zeroCross.line}
          />
          <SvgG
            pos={{
              x: 0,
              y: settings.ranking.axes.y.length + settings.plot.gap.y,
            }}
          >
            <SvgText
              textAnchor="middle"
              font={edbSettings.plots.axes.x.ticks.major.style.labels}
            >
              Zero cross at {crossing.index.toLocaleString()}
            </SvgText>
          </SvgG>
        </SvgG>
      )}
      <AxisLeftSvg ax={yax} />
    </SvgG>
  )
}

export function crossingIndex(
  scores: IRankedGene[],
  xaf: (domainValue: number) => number
): { index: number; x: number } {
  const crossIndex = scores.findLastIndex((gene) => gene.score > 0) + 1

  const crossing = {
    index: crossIndex,
    x: xaf(crossIndex),
  }
  return crossing
}
