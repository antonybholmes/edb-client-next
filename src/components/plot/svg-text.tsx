import {
  DEFAULT_TEXT_PROPS,
  type ITextProps,
} from '@/components/plot/svg-props'
import type { SVGProps } from 'react'
import { getFontFamilies } from './svg-base'

export interface ISvgTextProps extends SVGProps<SVGTextElement> {
  font?: ITextProps | undefined
}

/**
 * SVG <text> element that accepts font props as a single object and applies them to the text element.
 * If a specific font prop is provided, it will override the corresponding value in the font object.
 * @param param0
 * @returns
 */
export function SvgText({
  x,
  y,
  fill,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  textAnchor,
  opacity,
  dominantBaseline = 'middle',
  font = { ...DEFAULT_TEXT_PROPS },
  ...props
}: ISvgTextProps) {
  if (!font?.show) {
    return null
  }

  return (
    <text
      x={x}
      y={y}
      fill={fill ?? font?.font.fill.value}
      fontFamily={getFontFamilies(fontFamily ?? font?.font.fontFamily)}
      fontSize={fontSize ?? font?.font.fontSize}
      fontWeight={fontWeight ?? font?.font.fontWeight}
      fontStyle={fontStyle ?? font?.font.fontStyle}
      textDecoration={textDecoration ?? font?.font.decoration}
      textAnchor={textAnchor ?? font?.font.textAnchor}
      opacity={opacity ?? font?.font.fill.opacity}
      dominantBaseline={dominantBaseline}
      transform={`rotate(${font?.rotation ?? 0}, ${x}, ${y})`}
      {...props}
    />
  )
}
