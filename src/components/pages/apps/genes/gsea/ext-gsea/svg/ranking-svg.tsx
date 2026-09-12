import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { AxisLeftSvg } from '@/components/plot/axes/svg-axis'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { SvgText } from '@/components/plot/svg-text'
import { end } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'

export function ExtGseaRankingSvg({ result }: { result: IExtGseaPlotResult }) {
  const { plot } = useExtGseaContext()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const { axis: yax } = useAxis({
    plotId: result.id,
    groupId: 'snr',
    axisId: 'y',
  })

  const displayProps = plot.props

  const rankedGenes = result.rankedGenes

  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yax)
  let displayPoints = rankedGenes.map((e, ei) => [xaf(ei), yaf(e.score)])

  displayPoints = [[xaf(0), yaf(0)], ...displayPoints]
  displayPoints = [...displayPoints, [xaf(rankedGenes.length - 1), yaf(0)]]

  const crossIndex = end(where(rankedGenes, (gene) => gene.score > 0)) + 1
  const crossingX = xaf(crossIndex)

  return (
    <>
      <SvgPolygon
        points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
        stroke="none"
        fp={displayProps.ranking.fill}
      />
      {displayProps.ranking.zeroCross.show && (
        <SvgG pos={{ x: crossingX, y: 0 }}>
          <SvgLine
            y2={displayProps.ranking.axes.y.length}
            s={displayProps.ranking.zeroCross}
          />
          <SvgG
            pos={{
              x: 0,
              y: displayProps.ranking.axes.y.length + displayProps.plot.gap.y,
            }}
          >
            <SvgText font={displayProps.axes.x.font} textAnchor="middle">
              Zero cross at {crossIndex.toLocaleString()}
            </SvgText>
          </SvgG>
        </SvgG>
      )}
      <AxisLeftSvg ax={yax} />
    </>
  )
}
