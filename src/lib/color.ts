import { range } from './math/range'

const MAX_COLORS_8BIT = 16777215

export const COLOR_REGEX = /^([a-zA-Z]+|#([0-9a-fA-F]{6}$|[0-9a-fA-F]{8}))$/i

export function randomHslColor(): string {
  return 'hsla(' + Math.random() * 360 + ', 100%, 50%, 1)'
}

export function randomHexColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * MAX_COLORS_8BIT)
      .toString(16)
      .padStart(6, '0')
  )
}

export function randomRGBAColor(): IRGBA {
  return [...range(3).map(() => Math.floor(Math.random() * 256)), 1] as IRGBA
}

export type IRGBA = [number, number, number, number]

export function rgb2float(rgba: IRGBA): IRGBA {
  return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]]
}

export function rgba2hex(rgba: IRGBA): string {
  let dig: string
  let hex = '#'

  for (let i = 0; i < 3; ++i) {
    dig = rgba[i]!.toString(16)
    hex += ('00' + dig).substring(dig.length)
  }

  // alpha
  hex += (255 * rgba[3]).toString(16)

  return hex
}

export function hexToRgb(hex: string): {
  r: number
  g: number
  b: number
  a: number
} {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex
  )

  const ret = { r: 0, g: 0, b: 0, a: 1 }

  if (result) {
    ret.r = Math.max(0, Math.min(255, parseInt(result[1]!, 16)))
    ret.g = Math.max(0, Math.min(255, parseInt(result[2]!, 16)))
    ret.b = Math.max(0, Math.min(255, parseInt(result[3]!, 16)))

    if (result[4]) {
      ret.a = Math.max(0, Math.min(1, parseInt(result[4]!, 16) / 255))
    }
  }

  return ret
}

export function addAlphaToHex(hex: string, alpha: number): string {
  const a = Math.round(255 * Math.max(0, Math.min(1, alpha)))
    .toString(16)
    .padStart(2, '0')

  //console.log(hex.slice(0, 7), alpha, a)

  return removeHexAlpha(hex) + a
}

/**
 * Remove the alpha channel from a hex color if present, e.g. #ff0000ff -> #ff0000
 *
 * @param hex
 * @returns
 */
export function removeHexAlpha(hex: string): string {
  return hex.slice(0, 7)
}

export function rgbaStr(rgba: IRGBA): string {
  return 'rgba(' + rgba.join(',') + ')'
}
