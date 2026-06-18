import type { IStrokeProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface ISvgPolyLineProps extends SVGProps<SVGPolylineElement> {
  s?: IStrokeProps | undefined
}

/**
 * SVG <polyline> element that accepts stroke props as a single object and applies them to the polyline element.
 *
 * If a specific stroke prop is provided, it will override the corresponding value in the stroke object.
 * @param param0
 * @returns
 */
export function SvgPolyLine({
  stroke,
  strokeWidth,
  strokeDasharray,
  opacity,
  fill = 'none',
  s,
  ...props
}: ISvgPolyLineProps) {
  return (
    <polyline
      stroke={stroke ?? s?.value}
      strokeWidth={strokeWidth ?? s?.width}
      strokeOpacity={opacity ?? s?.opacity}
      strokeDasharray={strokeDasharray ?? s?.dasharray}
      fill={fill}
      {...props}
    />
  )
}
