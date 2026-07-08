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
export const COLOR_ORANGE = '#FFA500'

const MAX_COLORS_8BIT = 16777215

export const COLOR_REGEX = /^([a-zA-Z]+|#([0-9a-fA-F]{6}$|[0-9a-fA-F]{8}))$/i

export function randomHslColor(): string {
  return 'hsla(' + Math.random() * 360 + ', 100%, 50%, 1)'
}

/**
 * Generate a random hex color string in the format #rrggbb. The alpha channel is not included.
 *
 * @returns
 */
export function randomHexColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * MAX_COLORS_8BIT)
      .toString(16)
      .padStart(6, '0')
  )
}

/**
 * Generate a random RGBA color as an array [r, g, b, a], where r, g, b are integers in the range [0, 255]
 * and a is a float in the range [0, 1].
 * @returns
 */
export function randomRGBAColor(): IRGBA {
  return [...range(3).map(() => Math.floor(Math.random() * 256)), 1] as IRGBA
}

export type IRGB = [number, number, number]

export type IRGBA = [number, number, number, number]

export const BASE_RGBA: IRGBA = [0, 0, 0, 1]

export function rgb2float(rgba: IRGBA): IRGBA {
  return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]]
}

/**
 * Convert an RGBA array to a hex color string.
 * The alpha channel is included as the last two digits in the hex string,
 * e.g. [255, 0, 0, 0.5] -> #ff000080. Supports both RGB and RGBA input,
 * with alpha defaulting to 1 if not provided.
 *
 * @param rgba
 * @returns
 */
export function rgba2hex(rgba: IRGBA): string {
  let dig: string
  let hex = '#'

  for (let i = 0; i < 3; ++i) {
    dig = rgba[i]!.toString(16)
    hex += ('00' + dig).substring(dig.length)
  }

  const alphaHex = Math.round(255 * rgba[3])
    .toString(16)
    .padStart(2, '0')

  // alpha
  hex += alphaHex

  return hex
}

/**
 * Convert a hex color string to an RGBA array.
 * Supports both 6-digit (#rrggbb) and 8-digit (#rrggbbaa) hex formats.
 *
 * @param hex
 * @returns
 */
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

/**
 * Add an alpha channel to a hex color, e.g. #ff0000 -> #ff000080 for 50% opacity.
 *
 * @param hex
 * @param alpha
 * @returns
 */
export function addAlphaToHex(hex: string, alpha: number = 1): string {
  const a = Math.round(255 * Math.max(0, Math.min(1, alpha)))
    .toString(16)
    .padStart(2, '0')

  return removeAlphaFromHex(hex) + a
}

/**
 * Adds an alpha channel to a hex color if not already present.
 * If the hex color already has an alpha channel, it is returned unchanged.
 *
 * @param hex
 * @param alpha
 * @returns
 */
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
export function removeAlphaFromHex(hex: string): string {
  return hex.slice(0, 7)
}

export function rgbaStr(rgba: IRGBA): string {
  return 'rgba(' + rgba.join(',') + ')'
}

/**
 * Empirical function to determine if a color is light or dark.
 * Used to determine if text should be black or white on top of a background color.
 *
 * @param color string hex color or rgb/rgba array
 * @returns true if light color, false if dark color
 */
export function isLightColor(color: string | IRGB | IRGBA): boolean {
  if (typeof color === 'string') {
    color = hexToRgba(color)
  }

  const s = color[0] + color[1] + color[2]

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

  return yiq >= threshold
}

export function getTextColorForBackground(
  color: string,
  threshold: number = 150
) {
  return textColorShouldBeDark(color, threshold) ? COLOR_BLACK : COLOR_WHITE
}
