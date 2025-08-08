import { clamp } from '../math/clamp'
import { lerp } from '../math/lerp'
import { hexToRgba, rgba2hex, type IRGBA } from './color'
import { BRIGHT_20_PALETTE, TAB10_PALETTE, TABLEAU_20_PALETTE } from './palette'

// based on https://github.com/bpostlethwaite/colormap/

// type ICMAPSpec = { index: number; rgba: IRGBA }[]

// export const COLORMAPS_SPECS: { [key: string]: ICMAPSpec } = {
//   viridis: [
//     { index: 0, rgba: [68, 1, 84, 1] },
//     { index: 0.13, rgba: [71, 44, 122, 1] },
//     { index: 0.25, rgba: [59, 81, 139, 1] },
//     { index: 0.38, rgba: [44, 113, 142, 1] },
//     { index: 0.5, rgba: [33, 144, 141, 1] },
//     { index: 0.63, rgba: [39, 173, 129, 1] },
//     { index: 0.75, rgba: [92, 200, 99, 1] },
//     { index: 0.88, rgba: [170, 220, 50, 1] },
//     { index: 1, rgba: [253, 231, 37, 1] },
//   ],
//   bwr: [
//     { index: 0, rgba: [0, 0, 255, 1] },
//     { index: 0.5, rgba: [255, 255, 255, 1] },
//     { index: 1, rgba: [255, 0, 0, 1] },
//   ],
//   hsv: [
//     { index: 0, rgba: [255, 0, 0, 1] },
//     { index: 0.169, rgba: [253, 255, 2, 1] },
//     { index: 0.173, rgba: [247, 255, 2, 1] },
//     { index: 0.337, rgba: [0, 252, 4, 1] },
//     { index: 0.341, rgba: [0, 252, 10, 1] },
//     { index: 0.506, rgba: [1, 249, 255, 1] },
//     { index: 0.671, rgba: [2, 0, 253, 1] },
//     { index: 0.675, rgba: [8, 0, 253, 1] },
//     { index: 0.839, rgba: [255, 0, 251, 1] },
//     { index: 0.843, rgba: [255, 0, 245, 1] },
//     { index: 1, rgba: [255, 0, 6, 1] },
//   ],
//   jet: [
//     { index: 0, rgba: [0, 0, 131, 1] },
//     { index: 0.125, rgba: [0, 60, 170, 1] },
//     { index: 0.375, rgba: [5, 255, 255, 1] },
//     { index: 0.625, rgba: [255, 255, 0, 1] },
//     { index: 0.875, rgba: [250, 0, 0, 1] },
//     { index: 1, rgba: [128, 0, 0, 1] },
//   ],
// }

export class ColorMap {
  private _cmap: IRGBA[]
  private _maxIndex: number
  private _name: string

  constructor(name: string, cmap: (string | IRGBA)[]) {
    this._name = name
    this._cmap = cmap.map((c) => {
      if (typeof c === 'string') {
        return hexToRgba(c)
      } else {
        return c
      }
    })

    this._maxIndex = this._cmap.length - 1
  }

  get name(): string {
    return this._name
  }

  get colors(): number {
    return this._cmap.length
  }

  private _interpolateColor(c1: IRGBA, c2: IRGBA, t: number): IRGBA {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t)),
      clamp(lerp(c1[3], c2[3], t), 0, 1),
    ]
  }

  getRGBAColor(v: number): IRGBA {
    //const p = Math.max(0, Math.min(1, v))
    //console.log(p, Math.floor(p * this._n), this._n)
    //return this._cmap[p * this._n]!

    const t = Math.max(0, Math.min(1, v))

    const idx = t * this._maxIndex
    const lower = Math.floor(idx)
    const upper = Math.ceil(idx)

    const color = this._interpolateColor(
      this._cmap[lower]!,
      this._cmap[upper]!,
      idx - lower
    )

    return color
    //return `rgba(${color.join(',')})`;
  }

  getHexColor(v: number, keepAlpha: boolean = true): string {
    let ret = rgba2hex(this.getRGBAColor(v))

    if (!keepAlpha) {
      // strip the alpha channel if it exists
      ret = ret.slice(0, 7)
    }

    return ret
  }

  /**
   * Returns the color stripped of the alpha channel.
   *
   * @param v
   * @returns
   */
  // getColorWithoutAlpha(v: number): string {
  //   // clip offunknown alpha component
  //   return this.getHexColor(v).slice(0, 7)
  // }
}

// interface IProps {
//   cmap?: ICMAPSpec
//   nshades?: number
// }

// export function createColorMap(name: string, props: IProps = {}): ColorMap {
//   /*
//    * Default Options
//    */

//   const { cmap, nshades } = {
//     cmap: COLORMAPS_SPECS['viridis']!,
//     nshades: 255,
//     ...props,
//   }

//   if (cmap.length > nshades + 1) {
//     throw new Error('cmap requires nshades to be at least size ' + cmap.length)
//   }

//   // map index points from 0..1 to 0..n-1
//   const indicies = cmap.map(function (c: { index: number }) {
//     return Math.round(c.index * nshades)
//   })

//   const steps = cmap.map(function (c) {
//     return c.rgba
//   })

//   /*
//    * map increasing linear values between indicies to
//    * linear steps in colorvalues
//    */
//   const colors: IRGBA[] = []

//   //range(indicies.length - 1).map(i => {

//   for (let i = 0; i < indicies.length - 1; i++) {
//     const nsteps = indicies[i + 1]! - indicies[i]!
//     const startColor = steps[i]!
//     const endColor = steps[i + 1]!

//     for (let j = 0; j < nsteps; j++) {
//       const interpolationFactor = j / nsteps
//       colors.push([
//         Math.round(lerp(startColor[0]!, endColor[0]!, interpolationFactor)),
//         Math.round(lerp(startColor[1]!, endColor[1]!, interpolationFactor)),
//         Math.round(lerp(startColor[2]!, endColor[2]!, interpolationFactor)),
//         clamp(lerp(startColor[3]!, endColor[3]!, interpolationFactor), 0, 1),
//       ])
//     }
//   }

//   //add 1 step as last value
//   colors.push(cmap[cmap.length - 1]!.rgba)

//   return new ColorMap(
//     name,
//     colors.map(c => rgba2hex(c))
//   ) //.map(rgb2float))
// }

//export const BWR_CMAP = createColorMap({ cmap: COLORMAPS['bwr']! })

export const BWR_CMAP: ColorMap = new ColorMap('BWR', [
  '#0000ff',
  '#1111ff',
  '#2222ff',
  '#3333ff',
  '#4444ff',
  '#5555ff',
  '#6666ff',
  '#7777ff',
  '#8888ff',
  '#9999ff',
  '#aaaaff',
  '#bbbbff',
  '#ccccff',
  '#ddddff',
  '#eeeeff',
  '#ffffff',
  '#ffeeee',
  '#ffdddd',
  '#ffcccc',
  '#ffbbbb',
  '#ffaaaa',
  '#ff9999',
  '#ff8888',
  '#ff7777',
  '#ff6666',
  '#ff5555',
  '#ff4444',
  '#ff3333',
  '#ff2222',
  '#ff1111',
  '#ff0000',
])

export const BWR_CMAP_V2: ColorMap = new ColorMap('BWR v2', [
  '#2d68c4',
  '#3b72c8',
  '#497ccc',
  '#5786d0',
  '#6590d4',
  '#739ad8',
  '#81a4dc',
  '#8faee0',
  '#9db9e3',
  '#abc3e7',
  '#b9cdeb',
  '#c7d7ef',
  '#d5e1f3',
  '#e3ebf7',
  '#f1f5fb',
  '#ffffff',
  '#fdeeee',
  '#fcdddd',
  '#facccc',
  '#f9bbbb',
  '#f7aaaa',
  '#f69999',
  '#f48888',
  '#f37777',
  '#f16666',
  '#f05555',
  '#ee4444',
  '#ed3333',
  '#eb2222',
  '#ea1111',
  '#e80000',
])

export const JET_CMAP: ColorMap = new ColorMap('Jet', [
  '#00007f',
  '#0000a1',
  '#0000c3',
  '#0000e5',
  '#0008ff',
  '#002aff',
  '#004cff',
  '#006eff',
  '#0090ff',
  '#00b2ff',
  '#00d4ff',
  '#00f6ff',
  '#19ffe5',
  '#3bffc3',
  '#5dffa1',
  '#7fff7f',
  '#a1ff5d',
  '#c3ff3b',
  '#e5ff19',
  '#fff600',
  '#ffd400',
  '#ffb200',
  '#ff9000',
  '#ff6e00',
  '#ff4c00',
  '#ff2a00',
  '#ff0800',
  '#e50000',
  '#c30000',
  '#a10000',
  '#7f0000',
])

//createColorMap({
//  cmap: COLORMAPS_SPECS['jet']!,
//})

//https://hauselin.github.io/colorpalettejs/
export const VIRIDIS_CMAP: ColorMap = new ColorMap('Viridis', [
  '#440154',
  '#470d60',
  '#481a6c',
  '#482475',
  '#472f7d',
  '#443983',
  '#414487',
  '#3d4d8a',
  '#39568c',
  '#355f8d',
  '#31688e',
  '#2d708e',
  '#2a788e',
  '#27808e',
  '#23888e',
  '#21918c',
  '#1f988b',
  '#1fa188',
  '#22a884',
  '#2ab07f',
  '#35b779',
  '#44bf70',
  '#54c568',
  '#67cc5c',
  '#7ad151',
  '#90d743',
  '#a5db36',
  '#bddf26',
  '#d2e21b',
  '#eae51a',
  '#fde725',
])

export const INFERNO_CMAP: ColorMap = new ColorMap('Inferno', [
  '#000004',
  '#040312',
  '#0c0826',
  '#160b39',
  '#240c4f',
  '#320a5e',
  '#420a68',
  '#4f0d6c',
  '#5d126e',
  '#6a176e',
  '#781c6d',
  '#85216b',
  '#932667',
  '#a02a63',
  '#ae305c',
  '#bc3754',
  '#c73e4c',
  '#d34743',
  '#dd513a',
  '#e65d2f',
  '#ed6925',
  '#f37819',
  '#f8850f',
  '#fb9606',
  '#fca50a',
  '#fbb61a',
  '#fac62d',
  '#f6d746',
  '#f2e661',
  '#f3f586',
  '#fcffa4',
])

export const PLASMA_CMAP: ColorMap = new ColorMap('Plasma', [
  '#0d0887',
  '#220690',
  '#330597',
  '#41049d',
  '#5002a2',
  '#5c01a6',
  '#6a00a8',
  '#7701a8',
  '#8405a7',
  '#8f0da4',
  '#9c179e',
  '#a62098',
  '#b12a90',
  '#ba3388',
  '#c33d80',
  '#cc4778',
  '#d35171',
  '#da5b69',
  '#e16462',
  '#e76f5a',
  '#ed7953',
  '#f2844b',
  '#f68f44',
  '#fa9b3d',
  '#fca636',
  '#fdb42f',
  '#fec029',
  '#fcce25',
  '#f9dc24',
  '#f5eb27',
  '#f0f921',
])

export const MAGMA_CMAP: ColorMap = new ColorMap('Magma', [
  '#000004',
  '#030312',
  '#0b0924',
  '#140e36',
  '#20114b',
  '#2c115f',
  '#3b0f70',
  '#491078',
  '#57157e',
  '#641a80',
  '#721f81',
  '#7e2482',
  '#8c2981',
  '#992d80',
  '#a8327d',
  '#b73779',
  '#c43c75',
  '#d2426f',
  '#de4968',
  '#e95462',
  '#f1605d',
  '#f7705c',
  '#fa7f5e',
  '#fc9065',
  '#fe9f6d',
  '#feb078',
  '#febf84',
  '#fecf92',
  '#fddea0',
  '#fceeb0',
  '#fcfdbf',
])
//createColorMap({
//  cmap: COLORMAPS_SPECS['viridis']!,
//})

export const BLUES_CMAP: ColorMap = new ColorMap('Blues', [
  '#deebf7',
  '#d4e4f3',
  '#cadcef',
  '#c0d5eb',
  '#b6cee8',
  '#abc7e4',
  '#a1bfe0',
  '#96b8dc',
  '#8cb1d8',
  '#81aad4',
  '#76a4d0',
  '#6a9dcd',
  '#5e96c9',
  '#518fc5',
  '#4289c1',
  '#3182bd',
  '#2f7cb7',
  '#2c76b2',
  '#2a71ac',
  '#286ba6',
  '#2565a1',
  '#23609b',
  '#205a96',
  '#1e5590',
  '#1b4f8b',
  '#184a85',
  '#164580',
  '#133f7b',
  '#0f3a75',
  '#0c3570',
  '#08306b',
])

export const REDS_CMAP: ColorMap = new ColorMap('Reds', [
  '#ffe5e5',
  '#ffdfdd',
  '#ffd9d5',
  '#ffd2cd',
  '#ffccc5',
  '#fec6bd',
  '#fdc0b5',
  '#fdbaad',
  '#fcb4a6',
  '#fbad9e',
  '#faa796',
  '#f8a18f',
  '#f79b87',
  '#f59480',
  '#f48e78',
  '#f28871',
  '#f0816a',
  '#ee7b63',
  '#ec755b',
  '#ea6e54',
  '#e8674d',
  '#e56046',
  '#e3593f',
  '#e05238',
  '#de4b31',
  '#db432a',
  '#d83a22',
  '#d5311b',
  '#d22613',
  '#cf1809',
  '#cc0000',
])

//createColorMap({
//  cmap: [
//    { index: 0, rgba: [255, 255, 255, 1] },
//    { index: 1, rgba: [0, 0, 139, 1] },
//  ],
//})

export const TAB10_CMAP: ColorMap = new ColorMap('Tab10', TAB10_PALETTE)
export const TABLEAU_20_CMAP: ColorMap = new ColorMap(
  'Tableu20',
  TABLEAU_20_PALETTE
)
export const BRIGHT_20_CMAP: ColorMap = new ColorMap(
  'Bright20',
  BRIGHT_20_PALETTE
)

export const GRAY_RED_CMAP = new ColorMap('Gray Red', [
  '#f0f0f0',
  '#f2dedc',
  '#f3ccc7',
  '#f5bab3',
  '#f6a89f',
  '#f8968a',
  '#fa8476',
  '#f87a6d',
  '#f67467',
  '#f36d61',
  '#f1665b',
  '#ee5f55',
  '#ec584e',
  '#e95148',
  '#e74a42',
  '#e4433c',
  '#e23d36',
  '#df3630',
  '#dd2f2a',
  '#da2824',
  '#d8211d',
  '#d51a17',
  '#d31311',
  '#d00c0b',
  '#ce0605',
  '#ca0000',
  '#bf0000',
  '#b50000',
  '#aa0000',
  '#a00000',
  '#950000',
  '#8b0000',
])

export const COLOR_MAPS: Record<string, ColorMap> = {
  BWR: BWR_CMAP,
  'BWR v2': BWR_CMAP_V2,
  Viridis: VIRIDIS_CMAP,
  Jet: JET_CMAP,
  Blues: BLUES_CMAP,
  Reds: REDS_CMAP,
  //Tab10: TAB10_CMAP,
  //Tableu20: TABLEAU_20_CMAP,
  //Bright20: BRIGHT_20_CMAP,
  'Gray Red': GRAY_RED_CMAP,
  Inferno: INFERNO_CMAP,
  Plasma: PLASMA_CMAP,
  Magma: MAGMA_CMAP,
}

export function getColorMap(name: string): ColorMap {
  return name in COLOR_MAPS ? COLOR_MAPS[name]! : BWR_CMAP_V2
}
