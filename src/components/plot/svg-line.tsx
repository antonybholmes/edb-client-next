import type { IStrokeProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface ISvgLineProps extends SVGProps<SVGLineElement> {
  s?: IStrokeProps | undefined
}

/**
 * SVG <text> element that accepts font props as a single object and applies them to the text element.
 * If a specific font prop is provided, it will override the corresponding value in the font object.
 * @param param0
 * @returns
 */
export function SvgLine({
  id,
  stroke,
  strokeWidth,
  strokeDasharray,
  opacity,
  s,
  ...props
}: ISvgLineProps) {
  return (
    <line
      id={id}
      stroke={stroke ?? s?.value}
      strokeWidth={strokeWidth ?? s?.width}
      strokeOpacity={opacity ?? s?.opacity}
      strokeDasharray={strokeDasharray ?? s?.dasharray}
      {...props}
    />
  )
}
