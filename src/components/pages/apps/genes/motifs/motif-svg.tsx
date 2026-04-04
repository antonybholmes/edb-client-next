import { type INumMap } from '@/interfaces/num-map'

import { memo, useMemo, type ComponentProps } from 'react'

import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'

import { BaseSvg } from '@/components/base-svg'
import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axis-svg'
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

export function MotifSvg({ ref, className }: ComponentProps<'svg'>) {
  const { searchResult, motifsInUse } = useMotifs()

  // if (state.motifs.size === 0) {
  //   return null
  // }

  const { settings } = useMotifSettings()

  const motifsToPlot = searchResult.motifs.filter(
    motif => motifsInUse[motif.id] ?? true
  )

  if (motifsToPlot.length === 0) {
    return null
  }

  const rows = Math.ceil(motifsToPlot.length / settings.cols)

  // standardize width of every plot to the largest motif in
  // the list
  const maxN = Math.max(...motifsToPlot.map(motif => motif.weights.length))

  // A plots dimensions include the gap to the right and bottom,
  // but the plot is rendered at (0,0) within its plot area
  const plotWidth = settings.letterWidth * maxN + settings.gap
  const plotHeight = settings.plotHeight + settings.gap

  // the dimensions of all the plots without margins
  const innerWidth = plotWidth * settings.cols
  const innerHeight = plotHeight * rows

  // The full SVG dimensions
  const width = innerWidth + settings.margin.left + settings.margin.right
  const height = innerHeight + settings.margin.top + settings.margin.bottom

  const x_scale_factor = settings.letterWidth / LW
  const y_scale_factor = settings.plotHeight / H

  let yax: YAxis

  if (settings.mode === 'bits') {
    yax = new YAxis()
      .setDomain([0, 2])
      .setLength(settings.plotHeight)
      .setTicks([0, 1, 2])
      .setTitle('Bits')
  } else {
    yax = new YAxis()
      .setDomain([0, 1])
      .setLength(settings.plotHeight)
      .setTicks([0, 0.5, 1])
      .setTitle('Prob')
  }

  const MotifPlot = memo(function MotifPlot({
    index,
    motif,
  }: {
    index: number
    motif: IMotif
  }) {
    const row = Math.floor(index / settings.cols)
    const col = index % settings.cols

    const plotX = col * plotWidth
    const plotY = row * plotHeight

    //const motif = state.motifs.get(id)!

    // dataframes are n x 4 representations of motifs

    //const shape = df.shape
    const n = motif.weights.length
    const w = settings.letterWidth * n //shape[1]

    const xax = useMemo(
      () =>
        new Axis()
          .setDomain([0, motif.weights.length])
          .setLength(w)
          .setTicks(
            range(1, n + 1).map(x => ({
              v: x - 0.5,
              label: x.toLocaleString(),
            }))
          ),
      [w, motif.weights.length, n]
    )

    // normalize

    const normalizedWeights: number[][] = useMemo(() => {
      const weights = motif.weights.map(pw => {
        const pw2 = pw.map(w => w + MIN_ADJ)
        const s = sum(pw2)
        return pw2.map(w => w / s)
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
      <g
        transform={`translate(${plotX}, ${plotY})`}
        key={index}
        id={motif.id}
        motif-id={motif.motifId}
      >
        {range(n).map(r => {
          const npw = normalizedWeights[r]!
          // we want largest probs on top
          const idx = argsort(npw) //dft.row(r)!.values)

          let ic_final = 0

          if (settings.mode === 'bits') {
            // sum of p * log2(p)
            const U = -idx
              .map(c => npw[c]!)
              .filter(p => p > 0)
              .map(p => p * Math.log2(p))
              .reduce((a, b) => a + b)

            ic_final = IC_TOTAL - U
          } else {
            ic_final = IC_TOTAL
          }

          const ic_frac = ic_final / IC_TOTAL

          let y2 = settings.plotHeight

          return (
            <g
              transform={`translate(${
                settings.letterWidth * r + 0.5 * settings.letterWidth
              }, 0)`}
              key={r}
            >
              {idx.map(c => {
                const base: string = BASE_IDS[c]!
                const color = settings.baseColors[base.toLowerCase()]!.color!
                const p: number = npw[c]! //dft.get(r, c) as number
                const y_scale =
                  p * 2 * ic_frac * y_scale_factor * Y_SCALE_FACTORS[base]!
                const h = p * ic_frac * settings.plotHeight
                const y3 = y2
                y2 -= h
                return (
                  <g transform={`translate(0, ${y3})`} key={c}>
                    <g transform={`scale(${x_scale_factor}, ${y_scale})`}>
                      <text
                        fontWeight="bold"
                        fontSize={FONT_SIZE}
                        fill={color}
                        textAnchor="middle"
                      >
                        {base}
                      </text>
                    </g>
                  </g>
                )
              })}
            </g>
          )
        })}

        <text x={0.5 * w} y={-settings.titleOffset} textAnchor="middle">
          {title}
        </text>
        <AxisLeftSvg ax={yax} />
        <AxisBottomSvg ax={xax} pos={{ x: 0, y: settings.plotHeight }} />
      </g>
    )
  })

  const svg = (
    <BaseSvg
      ref={ref}
      scale={settings.zoom}
      width={width}
      height={height}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <g
        transform={`translate(${settings.margin.left}, ${settings.margin.top})`}
        id="inner-plot"
      >
        {motifsToPlot.map((motif, index) => {
          return <MotifPlot key={motif.id} index={index} motif={motif} />
        })}
      </g>
    </BaseSvg>
  )

  return <div className={className}>{svg}</div>
}
