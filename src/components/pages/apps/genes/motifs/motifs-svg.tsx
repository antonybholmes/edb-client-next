import { memo, useMemo } from 'react'

import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc, type IAxis } from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import { LW, useMotifSettings, type IMotifSettings } from './motifs-settings'
import { useMotifs, type IMotif } from './motifs-store'

const H = 100

const FONT_SIZE = 70
const MIN_ADJ = 0.000001

export const BASE_IDS = Object.freeze(['A', 'C', 'G', 'T'])

interface IMotifPlotProps {
  index: number
  motif: IMotif

  yax: IAxis | undefined
  settings: IMotifSettings
  plotWidth: number
  plotHeight: number
  xScaleFactor: number
  yScaleFactor: number
}

const MotifPlot = memo(function MotifPlot({
  index,
  motif,
  yax,
  settings,
  plotWidth,
  plotHeight,
  xScaleFactor,
  yScaleFactor,
}: IMotifPlotProps) {
  const { axis: xax } = useAxis({
    plotId: motif.id,
    groupId: 'motif',
    axisId: 'x',
  })

  const af = axisDomainToRangeFunc(xax)

  const row = Math.floor(index / settings.page.cols)
  const col = index % settings.page.cols
  const plotX = col * plotWidth
  const plotY = row * plotHeight
  const motifLength = motif.weights.length
  const width = settings.plot.bases.width * motifLength

  const normalizedWeights: number[][] = useMemo(() => {
    const weights = motif.weights.map((pw) => {
      const pw2 = pw.map((w) => w + MIN_ADJ)
      const s = sum(pw2)
      return pw2.map((w) => w / s)
    })

    if (settings.revComp) {
      weights.reverse()
      for (const pw of weights) {
        pw.reverse()
      }
    }

    return weights
  }, [motif.weights, settings.revComp])

  const title = `${motif.name} ${motif.motifId ? ` (${motif.motifId}) ` : ' '}- ${motif.dataset.name}`

  // ideally 2 for bits, 1 for prob
  const yMax = yax.domain[1]

  return (
    <SvgG pos={{ x: plotX, y: plotY }} id={motif.id} motif-id={motif.motifId}>
      {range(motifLength).map((positioni) => {
        const npw = normalizedWeights[positioni]!
        const idx = argsort(npw)
        // max probability is 1
        let ic_final = 1

        if (settings.mode === 'bits') {
          const u = -idx
            .map((basei) => npw[basei]!)
            .filter((p) => p > 0)
            .map((p) => p * Math.log2(p))
            .reduce((a, b) => a + b)

          ic_final = yMax - u
        }

        // when using bits height is proportional to information content
        const ic_frac = ic_final / yMax
        let y2 = settings.plot.height

        const x = af(positioni + 1)

        // settings.plot.bases.width * positioni +
        //        0.5 * settings.plot.bases.width,

        return (
          <SvgG
            pos={{
              x,
              y: 0,
            }}
            key={positioni}
          >
            {idx.map((basei) => {
              const base: string = BASE_IDS[basei]!
              const font = settings.bases[base.toLowerCase()]!
              const weight: number = npw[basei]!
              const yScale = weight * 2 * ic_frac * yScaleFactor
              const h = weight * ic_frac * settings.plot.height
              const y3 = y2
              y2 -= h

              return (
                <g transform={`translate(0, ${y3})`} key={basei}>
                  <g transform={`scale(${xScaleFactor}, ${yScale})`}>
                    <SvgText
                      textAnchor="middle"
                      dominantBaseline="auto"
                      fontSize={FONT_SIZE}
                      font={font}
                    >
                      {base}
                    </SvgText>
                  </g>
                </g>
              )
            })}
          </SvgG>
        )
      })}

      <SvgText
        x={0.5 * width}
        y={-settings.title.offset}
        textAnchor="middle"
        font={settings.title.text}
      >
        {title}
      </SvgText>

      {settings.axes.show && (
        <>
          <AxisLeftSvg ax={yax} />
          <AxisBottomSvg ax={xax} pos={{ x: 0, y: settings.plot.height }} />
        </>
      )}
    </SvgG>
  )
})

// export interface IDisplayProps {
//   plotHeight: number
//   letterWidth: number
//   mode: Mode
//   zoom: number
//   margin: IMarginProps
//   baseColors: { [K in DNABase]: string }
//   titleOffset: number
//   gap: number
//   revComp: boolean
// }

// export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
//   plotHeight: 100,
//   letterWidth: LW,
//   zoom: 1,
//   mode: 'Bits',
//   gap: 80,
//   margin: { top: 100, right: 100, bottom: 100, left: 100 },
//   baseColors: {
//     a: '#3cb371',
//     c: '#FFA500',
//     g: '#4169e1',
//     t: '#ff0000',
//   },
//   titleOffset: 10,
//   revComp: false,
// }

// interface IProps extends IDivProps {
//   displayProps?: IDisplayProps
// }

export function MotifsSvg() {
  const { motifsToPlot } = useMotifs()

  const { settings } = useMotifSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: yax } = useAxis({ plotId: 'y', groupId: 'y', axisId: 'y' })

  if (motifsToPlot.length === 0) {
    return null
  }

  const rows = Math.ceil(motifsToPlot.length / settings.page.cols)

  // standardize width of every plot to the largest motif in
  // the list
  const maxN = Math.max(...motifsToPlot.map((motif) => motif.weights.length))

  // A plots dimensions include the gap to the right and bottom,
  // but the plot is rendered at (0,0) within its plot area
  const plotWidth = settings.plot.bases.width * maxN + settings.gap
  const plotHeight = settings.plot.height + settings.gap

  // the dimensions of all the plots without margins
  const innerWidth = plotWidth * settings.page.cols
  const innerHeight = plotHeight * rows

  // The full SVG dimensions
  const width =
    innerWidth + settings.page.margin.left + settings.page.margin.right
  const height =
    innerHeight + settings.page.margin.top + settings.page.margin.bottom

  const xScaleFactor = settings.plot.bases.width / LW
  const yScaleFactor = settings.plot.height / H

  const svg = (
    <SvgBase
      scale={edbSettings.plots.scale}
      width={width}
      height={height}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <SvgMargin
        margin={settings.page.margin}

        id="inner-plot"
      >
        {motifsToPlot.map((motif, index) => {
          return (
            <MotifPlot
              key={motif.id}
              index={index}
              motif={motif}
              yax={yax}
              settings={settings}
              plotWidth={plotWidth}
              plotHeight={plotHeight}
              xScaleFactor={xScaleFactor}
              yScaleFactor={yScaleFactor}
            />
          )
        })}
      </SvgMargin>
    </SvgBase>
  )

  return svg
}
