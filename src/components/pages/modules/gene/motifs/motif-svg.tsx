import { type INumMap } from '@interfaces/num-map'

import { type IElementProps } from '@interfaces/element-props'

import { forwardRef, useContext, useMemo } from 'react'

import { argsort } from '@lib/math/argsort'
import { range } from '@lib/math/range'
import { sum } from '@lib/math/sum'

import type { IMarginProps } from '@/components/plot/svg-props'
import { SVG_CRISP_EDGES } from '@/consts'
import { Axis, YAxis } from '@components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { MotifsContext } from './motifs-provider'

export type Mode = 'Prob' | 'Bits'

const LW = 45
const H = 100
const IC_TOTAL = 2
const FONT_SIZE = 70
const MIN_ADJ = 0.000001

export type DNABase = 'a' | 'c' | 'g' | 't'

export const BASE_IDS: string[] = ['A', 'C', 'G', 'T']

const Y_SCALE_FACTORS: INumMap = { A: 1.0, C: 1, G: 1, T: 1.0 }

export interface IDisplayProps {
  plotHeight: number
  letterWidth: number
  mode: Mode
  scale: number
  margin: IMarginProps
  baseColors: { [K in DNABase]: string }
  titleOffset: number
  gap: number
  revComp: boolean
}

export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
  plotHeight: 100,
  letterWidth: LW,
  scale: 1,
  mode: 'Bits',
  gap: 80,
  margin: { top: 100, right: 100, bottom: 100, left: 100 },
  baseColors: {
    a: '#3cb371',
    c: '#FFA500',
    g: '#4169e1',
    t: '#ff0000',
  },
  titleOffset: 10,
  revComp: false,
}

interface IProps extends IElementProps {
  displayProps?: IDisplayProps
}

export const MotifSvg = forwardRef<SVGElement, IProps>(function MotifSvg(
  { displayProps, className }: IProps,
  svgRef
) {
  const { state } = useContext(MotifsContext)!

  // if (state.motifs.size === 0) {
  //   return null
  // }

  const _displayProps: IDisplayProps = {
    ...DEFAULT_DISPLAY_PROPS,
    ...displayProps,
  }

  const maxN = Math.max(
    ...state.order
      .map((id) => state.motifs.get(id)!)
      .map((motif) => motif.weights.length)
  )

  const innerWidth = _displayProps.letterWidth * maxN
  const innerHeight =
    state.motifs.size * (_displayProps.plotHeight + _displayProps.gap)

  const width =
    innerWidth + _displayProps.margin.left + _displayProps.margin.right
  const height =
    innerHeight + _displayProps.margin.top + _displayProps.margin.bottom

  const svg = useMemo(() => {
    if (state.motifs.size === 0) {
      return null
    }

    const x_scale_factor = _displayProps.letterWidth / LW
    const y_scale_factor = _displayProps.plotHeight / H

    let yax: YAxis

    if (_displayProps.mode === 'Bits') {
      yax = new YAxis()
        .setDomain([0, 2])
        .setLength(_displayProps.plotHeight)
        .setTicks([0, 1, 2])
        .setTitle('Bits')
    } else {
      yax = new YAxis()
        .setDomain([0, 1])
        .setLength(_displayProps.plotHeight)
        .setTicks([0, 1])
        .setTitle('Prob')
    }

    //console.log("motifs", state)

    return (
      <svg
        fontFamily="Arial, Helvetica, sans-serif"
        // @ts-expect-error svg ref not checked properly
        ref={svgRef}
        width={width * _displayProps.scale}
        height={height * _displayProps.scale}
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering={SVG_CRISP_EDGES}
      >
        {state.order.map((id, index) => {
          const motif = state.motifs.get(id)!

          // dataframes are n x 4 representations of motifs

          //const shape = df.shape
          const n = motif.weights.length
          const w = _displayProps.letterWidth * n //shape[1]
          const xax = new Axis()
            .setDomain([0, motif.weights.length])
            .setLength(w)
            .setTicks(range(1, n + 1).map((x) => x - 0.5))
            .setTickLabels(range(1, n + 1))

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

          // let dft = df.t()
          // dft = rowDiv(dft, rowSums(dft)) //.t()

          // normalize

          const nweights = motif.weights.map((pw) => {
            const pw2 = pw.map((w) => w + MIN_ADJ)
            const s = sum(pw2)
            return pw2.map((w) => w / s)
          })

          return (
            <g
              transform={`translate(${_displayProps.margin.left}, ${
                _displayProps.margin.top +
                index * (_displayProps.plotHeight + _displayProps.gap)
              })`}
              key={index}
            >
              {range(n).map((r) => {
                const npw = nweights[r]!
                const idx = argsort(npw) //dft.row(r)!.values)

                let ic_final = 0

                if (_displayProps.mode == 'Bits') {
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

                let y2 = _displayProps.plotHeight

                return (
                  <g
                    transform={`translate(${
                      _displayProps.letterWidth * r +
                      0.5 * _displayProps.letterWidth
                    }, 0)`}
                    key={r}
                  >
                    {idx.map((c) => {
                      const base: string = BASE_IDS[c]!
                      const color =
                        _displayProps.baseColors[base.toLowerCase() as DNABase]
                      const p: number = npw[c]! //dft.get(r, c) as number
                      const y_scale =
                        p *
                        2 *
                        ic_frac *
                        y_scale_factor *
                        Y_SCALE_FACTORS[base]!
                      const h = p * ic_frac * _displayProps.plotHeight
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

              <text
                x={0.5 * w}
                y={-_displayProps.titleOffset}
                textAnchor="middle"
              >
                {motif.motifName} - {motif.dataset}
              </text>
              <AxisLeftSvg ax={yax} />
              <AxisBottomSvg
                ax={xax}
                pos={{ x: 0, y: _displayProps.plotHeight }}
              />
            </g>
          )
        })}
      </svg>
    )
  }, [state, _displayProps])

  return <div className={className}>{svg}</div>
})
