import { type INumMap } from '@/interfaces/num-map'

import { memo, useMemo } from 'react'

import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxes, useAxis } from '@/components/plot/axes/axes-store'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import { LW, useMotifSettings } from './motifs-settings'
import { useMotifs, type IMotif } from './motifs-store'

const H = 100
const IC_TOTAL = 2
const FONT_SIZE = 70
const MIN_ADJ = 0.000001

export const BASE_IDS = Object.freeze(['A', 'C', 'G', 'T'])

const Y_SCALE_FACTORS: INumMap = Object.freeze({ A: 1.0, C: 1, G: 1, T: 1.0 })

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

  const { plots } = useAxes()

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

  const x_scale_factor = settings.plot.bases.width / LW
  const y_scale_factor = settings.plot.height / H

  const MotifPlot = memo(function MotifPlot({
    index,
    motif,
  }: {
    index: number
    motif: IMotif
  }) {
    const row = Math.floor(index / settings.page.cols)
    const col = index % settings.page.cols

    const plotX = col * plotWidth
    const plotY = row * plotHeight

    //const motif = state.motifs.get(id)!

    // dataframes are n x 4 representations of motifs

    //const shape = df.shape
    const n = motif.weights.length
    const w = settings.plot.bases.width * n //shape[1]

    const xax = plots[motif.id].groups['motif'].axes['x']

    // normalize

    const normalizedWeights: number[][] = useMemo(() => {
      const weights = motif.weights.map((pw) => {
        const pw2 = pw.map((w) => w + MIN_ADJ)
        const s = sum(pw2)
        return pw2.map((w) => w / s)
      })

      if (settings.revComp) {
        weights.reverse()

        // complement
        for (const pw of weights) {
          pw.reverse()
        }
      }

      return weights
    }, [motif.weights, settings.revComp])

    const title = `${motif.name} ${motif.motifId ? ` (${motif.motifId}) ` : ' '}- ${motif.dataset.name}`

    return (
      <SvgG
        pos={{ x: plotX, y: plotY }}

        key={index}
        id={motif.id}
        motif-id={motif.motifId}
      >
        {range(n).map((r) => {
          const npw = normalizedWeights[r]!
          // we want largest probs on top
          const idx = argsort(npw) //dft.row(r)!.values)

          let ic_final = 0

          if (settings.mode === 'bits') {
            // sum of p * log2(p)
            const U = -idx
              .map((c) => npw[c]!)
              .filter((p) => p > 0)
              .map((p) => p * Math.log2(p))
              .reduce((a, b) => a + b)

            ic_final = IC_TOTAL - U
          } else {
            ic_final = IC_TOTAL
          }

          const ic_frac = ic_final / IC_TOTAL

          let y2 = settings.plot.height

          return (
            <SvgG
              pos={{
                x:
                  settings.plot.bases.width * r +
                  0.5 * settings.plot.bases.width,
                y: 0,
              }}

              key={r}
            >
              {idx.map((c) => {
                const base: string = BASE_IDS[c]!
                const font = settings.bases[base.toLowerCase()]!
                const p: number = npw[c]! //dft.get(r, c) as number
                const y_scale =
                  p * 2 * ic_frac * y_scale_factor * Y_SCALE_FACTORS[base]!
                const h = p * ic_frac * settings.plot.height
                const y3 = y2
                y2 -= h
                return (
                  <g transform={`translate(0, ${y3})`} key={c}>
                    <g transform={`scale(${x_scale_factor}, ${y_scale})`}>
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
          x={0.5 * w}
          y={-settings.title.offset}
          textAnchor="middle"
          font={settings.title.text}
        >
          {title}
        </SvgText>

        {settings.axes.show && (
          <>
            <AxisLeftSvg
              ax={yax}
              //font={settings.axes.labels}
              //labelFont={settings.axes.title}
              //showTicks={settings.axes.ticks.show}
            />
            <AxisBottomSvg
              ax={xax}
              pos={{ x: 0, y: settings.plot.height }}
              //font={settings.axes.labels}
              //labelFont={settings.axes.title}
              //showTicks={settings.axes.ticks.show}
            />
          </>
        )}
      </SvgG>
    )
  })

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
          return <MotifPlot key={motif.id} index={index} motif={motif} />
        })}
      </SvgMargin>
    </SvgBase>
  )

  return svg
}
