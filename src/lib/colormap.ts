import { rgba2hex, type IRGBA } from './color'
import { lerp } from './math/lerp'
import { range } from './math/range'

// based on https://github.com/bpostlethwaite/colormap/

type ICMAPSpec = { index: number; rgba: IRGBA }[]

export const COLORMAPS: { [key: string]: ICMAPSpec } = {
  viridis: [
    { index: 0, rgba: [68, 1, 84, 1] },
    { index: 0.13, rgba: [71, 44, 122, 1] },
    { index: 0.25, rgba: [59, 81, 139, 1] },
    { index: 0.38, rgba: [44, 113, 142, 1] },
    { index: 0.5, rgba: [33, 144, 141, 1] },
    { index: 0.63, rgba: [39, 173, 129, 1] },
    { index: 0.75, rgba: [92, 200, 99, 1] },
    { index: 0.88, rgba: [170, 220, 50, 1] },
    { index: 1, rgba: [253, 231, 37, 1] },
  ],
  bwr: [
    { index: 0, rgba: [0, 0, 255, 1] },
    { index: 0.5, rgba: [255, 255, 255, 1] },
    { index: 1, rgba: [255, 0, 0, 1] },
  ],
  hsv: [
    { index: 0, rgba: [255, 0, 0, 1] },
    { index: 0.169, rgba: [253, 255, 2, 1] },
    { index: 0.173, rgba: [247, 255, 2, 1] },
    { index: 0.337, rgba: [0, 252, 4, 1] },
    { index: 0.341, rgba: [0, 252, 10, 1] },
    { index: 0.506, rgba: [1, 249, 255, 1] },
    { index: 0.671, rgba: [2, 0, 253, 1] },
    { index: 0.675, rgba: [8, 0, 253, 1] },
    { index: 0.839, rgba: [255, 0, 251, 1] },
    { index: 0.843, rgba: [255, 0, 245, 1] },
    { index: 1, rgba: [255, 0, 6, 1] },
  ],
  jet: [
    { index: 0, rgba: [0, 0, 131, 1] },
    { index: 0.125, rgba: [0, 60, 170, 1] },
    { index: 0.375, rgba: [5, 255, 255, 1] },
    { index: 0.625, rgba: [255, 255, 0, 1] },
    { index: 0.875, rgba: [250, 0, 0, 1] },
    { index: 1, rgba: [128, 0, 0, 1] },
  ],
}

export class ColorMap {
  private _cmap: string[]
  private _n: number

  constructor(cmap: string[]) {
    this._cmap = cmap
    this._n = this._cmap.length - 1
  }

  getColor(v: number): string {
    const p = Math.max(0, Math.min(1, v))
    //console.log(p, Math.floor(p * this._n), this._n)
    return this._cmap[Math.floor(p * this._n)]!
  }

  /**
   * Returns the color stripped of the alpha channel.
   *
   * @param v
   * @returns
   */
  getColorWithoutAlpha(v: number): string {
    // clip offunknown alpha component
    return this.getColor(v).slice(0, 7)
  }
}

interface IProps {
  cmap?: ICMAPSpec
  nshades?: number
}

export function createColorMap(props: IProps = {}): ColorMap {
  /*
   * Default Options
   */

  const { cmap, nshades } = {
    cmap: COLORMAPS['viridis']!,
    nshades: 255,
    ...props,
  }

  if (cmap.length > nshades + 1) {
    throw new Error('cmap requires nshades to be at least size ' + cmap.length)
  }

  // map index points from 0..1 to 0..n-1
  const indicies = cmap.map(function (c: { index: number }) {
    return Math.round(c.index * nshades)
  })

  const steps = cmap.map(function (c) {
    return c.rgba
  })

  /*
   * map increasing linear values between indicies to
   * linear steps in colorvalues
   */
  const colors: IRGBA[] = []

  range(indicies.length - 1).map((i) => {
    const nsteps = indicies[i + 1]! - indicies[i]!
    const fromrgba = steps[i]!
    const torgba = steps[i + 1]!

    for (let j = 0; j < nsteps; j++) {
      const amt = j / nsteps
      colors.push([
        Math.round(lerp(fromrgba[0]!, torgba[0]!, amt)),
        Math.round(lerp(fromrgba[1]!, torgba[1]!, amt)),
        Math.round(lerp(fromrgba[2]!, torgba[2]!, amt)),
        lerp(fromrgba[3]!, torgba[3]!, amt),
      ])
    }
  })

  //add 1 step as last value
  colors.push(cmap[cmap.length - 1]!.rgba)

  return new ColorMap(colors.map((c) => rgba2hex(c))) //.map(rgb2float))
}

export const BWR_CMAP = createColorMap({ cmap: COLORMAPS['bwr']! })
export const JET_CMAP = createColorMap({ cmap: COLORMAPS['jet']! })
export const VIRIDIS_CMAP = createColorMap({ cmap: COLORMAPS['viridis']! })
export const BLUES_CMAP = createColorMap({
  cmap: [
    { index: 0, rgba: [255, 255, 255, 1] },
    { index: 1, rgba: [0, 0, 139, 1] },
  ],
})
