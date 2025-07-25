import { type INumMap } from '@interfaces/num-map'

import { useContext, useMemo, type ComponentProps } from 'react'

import { argsort } from '@lib/math/argsort'
import { range } from '@lib/math/range'
import { sum } from '@lib/math/sum'

import { BaseSvg } from '@/components/base-svg'
import { Axis, YAxis } from '@/components/plot/axis'
import { SVG_CRISP_EDGES } from '@/consts'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { MotifsContext } from './motifs-provider'
import { LW, useMotifSettings } from './motifs-settings'

const H = 100
const IC_TOTAL = 2
const FONT_SIZE = 70
const MIN_ADJ = 0.000001

export const BASE_IDS: string[] = ['A', 'C', 'G', 'T']

const Y_SCALE_FACTORS: INumMap = { A: 1.0, C: 1, G: 1, T: 1.0 }

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
  const { state } = useContext(MotifsContext)!

  // if (state.motifs.size === 0) {
  //   return null
  // }

  const { settings } = useMotifSettings()

  const maxN = Math.max(
    ...state.order
      .map(id => state.motifs.get(id)!)
      .map(motif => motif.weights.length)
  )

  const innerWidth = settings.letterWidth * maxN
  const innerHeight = state.motifs.size * (settings.plotHeight + settings.gap)

  const width = innerWidth + settings.margin.left + settings.margin.right
  const height = innerHeight + settings.margin.top + settings.margin.bottom

  const svg = useMemo(() => {
    if (state.motifs.size === 0) {
      return null
    }

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
        .setTicks([0, 1])
        .setTitle('Prob')
    }

    //console.log("motifs", state)

    return (
      <BaseSvg
        ref={ref}
        scale={settings.zoom}
        width={width}
        height={height}
        shapeRendering={SVG_CRISP_EDGES}
      >
        {state.order.map((id, index) => {
          const motif = state.motifs.get(id)!

          // dataframes are n x 4 representations of motifs

          //const shape = df.shape
          const n = motif.weights.length
          const w = settings.letterWidth * n //shape[1]
          const xax = new Axis()
            .setDomain([0, motif.weights.length])
            .setLength(w)
            .setTicks(
              range(1, n + 1).map(x => ({
                v: x - 0.5,
                label: x.toLocaleString(),
              }))
            )
          //.setTickLabels(range(1, n + 1))

          // if (_displayProps.revComp) {
          //   df = new DataFrame({
          //     data: [
          //       (df.row(3)!.values ?? []).toReversed(),
          //       (df.row(2)!.values ?? []).toReversed(),
          //       (df.row(1)!.values ?? []).toReversed(),
          //       (df.row(0)!.values ?? []).toReversed(),
          //     ],
          //     index: ["T", "G", "C", "A"],
          //   })
          // }

          // let dft = df.t
          // dft = rowDiv(dft, rowSums(dft)) //.t

          // normalize

          const nweights = motif.weights.map(pw => {
            const pw2 = pw.map(w => w + MIN_ADJ)
            const s = sum(pw2)
            return pw2.map(w => w / s)
          })

          return (
            <g
              transform={`translate(${settings.margin.left}, ${
                settings.margin.top +
                index * (settings.plotHeight + settings.gap)
              })`}
              key={index}
            >
              {range(n).map(r => {
                const npw = nweights[r]!
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
                      const color = settings.baseColors[base.toLowerCase()]!
                      const p: number = npw[c]! //dft.get(r, c) as number
                      const y_scale =
                        p *
                        2 *
                        ic_frac *
                        y_scale_factor *
                        Y_SCALE_FACTORS[base]!
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
                {`${motif.motifName} ${motif.motifId ? ` (${motif.motifId}) ` : ' '}- ${motif.dataset}`}
              </text>
              <AxisLeftSvg ax={yax} />
              <AxisBottomSvg ax={xax} pos={{ x: 0, y: settings.plotHeight }} />
            </g>
          )
        })}
      </BaseSvg>
    )
  }, [state, settings])

  return <div className={className}>{svg}</div>
}
