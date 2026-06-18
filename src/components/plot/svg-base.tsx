import type { ISVGProps } from '@/interfaces/svg-props'

export const ARIAL_FONT_FAMILY = 'Arial, Helvetica, sans-serif'

/**
 * A list of common font families to choose from, with their corresponding CSS font-family strings.
 * The label is used for display in the UI, and the value is the actual CSS font-family string that
 * will be applied to the SVG text elements. If a font family is not recognized, it will be returned
 * as-is by the getFontFamilies function. This is a list of fonts that should be commonly available
 * across platforms, but the actual availability may vary depending on the user's system.
 */
export const FONTS = [
  { label: 'Arial', value: ARIAL_FONT_FAMILY },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]

const FONT_MAP = Object.fromEntries(FONTS.map(f => [f.label, f.value]))

/**
 * Maps a font family name to a CSS font-family string. If the name is not recognized, it is returned as-is.
 *
 * @param fontFamily
 * @returns
 */
export function getFontFamilies(fontFamily: string) {
  return FONT_MAP[fontFamily] ?? fontFamily
}

/**
 * Svg component with useful defaults set and a view box to match the width and height
 * @param param0
 * @returns
 */
export function SvgBase({
  width = 100,
  height = 100,
  scale = 1,
  style,
  ...props
}: Omit<ISVGProps, 'width' | 'height'> & {
  width?: number
  height?: number
  scale?: number
}) {
  console.log(
    'rendering svg with width',
    width,
    'height',
    height,
    'scale',
    scale,
    width * scale,
    height * scale
  )
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      width={typeof width === 'number' ? width * scale : width}
      height={typeof height === 'number' ? height * scale : height}
      style={{ ...style, fontFamily: ARIAL_FONT_FAMILY }}
      fontFamily={ARIAL_FONT_FAMILY}
      {...props}
    />
  )
}
