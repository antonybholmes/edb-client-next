import { range } from '../math/range'

export const COLOR_WHITE = '#ffffff'
export const COLOR_BLACK = '#000000'
export const COLOR_RED = '#ff0000'
export const COLOR_GREEN = '#00ff00'
export const COLOR_BLUE = '#0000ff'
export const COLOR_MEDIUM_SEA_GREEN = '#3cb371'
export const COLOR_GRAY = '#808080'
export const COLOR_LIGHTGRAY = '#C0C0C0'
export const COLOR_TRANSPARENT = '#00000000'
export const COLOR_CORNFLOWER_BLUE = '#6495ED'
export const COLOR_NAVY_BLUE = '#000080'

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

export const BASE_RGBA: IRGBA = [0, 0, 0, 1]

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

export function hexToRgba(hex: string): IRGBA {
  const ret: IRGBA = [...BASE_RGBA]

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex
  )

  if (result) {
    ret[0] = Math.max(0, Math.min(255, parseInt(result[1]!, 16)))
    ret[1] = Math.max(0, Math.min(255, parseInt(result[2]!, 16)))
    ret[2] = Math.max(0, Math.min(255, parseInt(result[3]!, 16)))

    if (result[4]) {
      ret[3] = Math.max(0, Math.min(1, parseInt(result[4]!, 16) / 255))
    }
  }

  return ret
}

export function addAlphaToHex(hex: string, alpha: number = 1): string {
  const a = Math.round(255 * Math.max(0, Math.min(1, alpha)))
    .toString(16)
    .padStart(2, '0')

  //console.log(hex.slice(0, 7), alpha, a)

  return hexColorWithoutAlpha(hex) + a
}

export function addAlphaToHexIfNotPresent(
  hex: string,
  alpha: number = 1
): string {
  if (hex.length > 7) {
    return hex
  }

  return addAlphaToHex(hex, alpha)
}

/**
 * Remove the alpha channel from a hex color if present, e.g. #ff0000ff -> #ff0000
 *
 * @param hex
 * @returns
 */
export function hexColorWithoutAlpha(hex: string): string {
  return hex.slice(0, 7)
}

export function rgbaStr(rgba: IRGBA): string {
  return 'rgba(' + rgba.join(',') + ')'
}

export function isLightColor(color: string): boolean {
  const rgb = hexToRgba(color)
  const s = rgb[0] + rgb[1] + rgb[2]

  return s > 700
}

export function isDarkColor(color: string): boolean {
  return !isLightColor(color)

  // const rgb = hexToRgb(color)
  // const s = rgb.r + rgb.g + rgb.b

  // return s < 600
}

export function textColorShouldBeDark(
  color: string,
  threshold: number = 150
): boolean {
  const rgb = hexToRgba(color)

  // Calculate the YIQ (luminance)
  const yiq = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114

  //console.log(color, rgb, yiq, threshold)

  return yiq >= threshold
}

export function getTextColorForBackground(
  color: string,
  threshold: number = 150
) {
  return textColorShouldBeDark(color, threshold) ? COLOR_BLACK : COLOR_WHITE
}
