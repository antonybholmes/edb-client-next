import { BaseSvg } from '@/components/base-svg'
import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axis-svg'
import type { ISVGProps } from '@/interfaces/svg-props'
import { useDNAQuery } from '@/lib/genomic/dna'
import { locStr } from '@/lib/genomic/genomic'
import { numSort } from '@/lib/math/math'
import { range } from '@/lib/math/range'
import { useMemo } from 'react'
import { BASE_W, DNASvg } from './dna-svg'
import { useMAFs } from './maf-store'
import { MotifsSvg } from './motifs-svg'
import { useVariantSettings } from './variant-settings-store'

const MARGIN = { top: 100.5, right: 100.5, bottom: 300.5, left: 100.5 }

export function MAFPlotSVG({ ref }: ISVGProps) {
  const { settings } = useVariantSettings()
  const { mafs: results } = useMAFs()

  const { data: dna } = useDNAQuery(settings.location, {
    format: 'upper',
    assembly: 'hg19',
  })

  // need to split multiple snps and format insertions deletions

  const maxCount = Math.max(...(results?.mafs.map(m => m.count) ?? [0]))

  const maxY = maxCount / (results?.alleles ?? 1)

  //console.log(maxHeightMap)

  const innerWidth = ((dna?.seq.length ?? 0) - 1) * BASE_W
  const plotHeight = settings.mafs.plot.height

  const width = innerWidth + MARGIN.left + MARGIN.right
  const height = plotHeight + MARGIN.top + MARGIN.bottom

  // whether to show things like AID motifs or not

  let xax = new Axis()
    .setDomain([settings.location.start, settings.location.end])
    //.setTicks([settings.location.start, settings.location.end])
    //.setDomain([0, plot.dna.seq.length])
    .setLength(innerWidth)

  let yax = new YAxis()
    .autoDomain([0, maxY])
    .setLength(plotHeight)
    .setTitle('MAF')

  const y0 = yax.domainToRange(0)

  const points = useMemo(() => {
    const yMap = new Map<number, number>()

    for (const m of results?.mafs ?? []) {
      const x = xax.domainToRange(m.start)
      const y = yax.domainToRange(m.count / (results?.alleles ?? 1))

      if (!yMap.has(x)) {
        yMap.set(x, 0)
      }

      yMap.set(x, Math.max(yMap.get(x)!, y))
    }

    // get unique x positions
    const xs = numSort([
      ...new Set(
        range(settings.location.start, settings.location.end + 1).map(pos =>
          xax.domainToRange(pos)
        )
      ),
    ])

    const points = xs.map(x => {
      if (yMap.has(x)) {
        return [x, yMap.get(x)!]
      } else {
        return [x, y0]
      }
    })

    return points
  }, [results?.mafs, results?.alleles, xax])

  let fillPathD = ''

  if (settings.mafs.plot.fill.show) {
    const fillPoints = [...points]
    // add zero points at start and end so that the area is filled correctly
    if (points.length > 0 && fillPoints[0]![1] !== y0) {
      // add point at start
      fillPoints.unshift([fillPoints[0]![0]!, y0])
    }

    if (points.length > 0 && fillPoints[fillPoints.length - 1]![1] !== y0) {
      // add point at end
      fillPoints.push([fillPoints[fillPoints.length - 1]![0]!, y0])
    }

    fillPathD =
      fillPoints
        .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
        .join(' ') + ' Z'
  }

  const pathD = points
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(' ')

  //console.log('points', points)

  if (!results || results.mafs.length === 0 || !dna) {
    return null
  }

  return (
    <BaseSvg
      ref={ref}
      width={width} //* settings.scale}
      height={height} //* settings.scale}
      scale={settings.scale}
      //shapeRendering={SVG_CRISP_EDGES}
      //className="absolute z-20"
    >
      <g
        transform={`translate(${MARGIN.left + innerWidth * 0.5}, ${MARGIN.top * 0.5})`}
      >
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="small"
          fontWeight="bold"
        >
          {locStr(settings.location)} (
          {(results?.alleles ?? 0).toLocaleString()} alleles)
        </text>
      </g>

      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {settings.mafs.plot.fill.show && fillPathD && (
          <path
            d={fillPathD}
            fill={settings.mafs.plot.fill.color}
            fillOpacity={settings.mafs.plot.fill.opacity}
            stroke="none"
          />
        )}
        {settings.mafs.plot.line.show && pathD && (
          <path
            d={pathD}
            stroke={settings.mafs.plot.line.color}
            strokeOpacity={settings.mafs.plot.line.opacity}
            strokeWidth={settings.mafs.plot.line.width}
            fill="none"
          />
        )}
      </g>

      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        <AxisLeftSvg
          ax={yax}
          //showTicks={settings.es.axes.x.showTicks}
        />
      </g>

      <g transform={`translate(${MARGIN.left}, ${MARGIN.top + plotHeight})`}>
        <AxisBottomSvg
          ax={xax}
          //showTicks={settings.es.axes.x.showTicks}
        />
      </g>

      <DNASvg pos={{ x: MARGIN.left, y: MARGIN.top + plotHeight + 80 }} />

      <MotifsSvg
        xax={xax}
        pos={{
          x: MARGIN.left,
          y: MARGIN.top + plotHeight + (settings.dna.show ? 120 : 50),
        }}
      />
    </BaseSvg>
  )
}
