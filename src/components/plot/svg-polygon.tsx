import type { IPaintProps, IStrokeProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface IProps extends SVGProps<SVGPolygonElement> {
  sp?: IStrokeProps | undefined
  fp?: IPaintProps | undefined
}

/**
 * SVG <polyline> element that accepts stroke props as a single object and applies them to the polyline element.
 *
 * If a specific stroke prop is provided, it will override the corresponding value in the stroke object.
 * @param param0
 * @returns
 */
export function SvgPolygon({
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeDasharray,
  sp,
  fp,
  ...props
}: IProps) {
  return (
    <polygon
      stroke={stroke ?? sp?.value ?? 'none'}
      strokeWidth={strokeWidth ?? sp?.width}
      strokeOpacity={strokeOpacity ?? sp?.opacity}
      strokeDasharray={strokeDasharray ?? sp?.dasharray}
      fill={fill ?? fp?.value ?? 'none'}
      fillOpacity={fillOpacity ?? fp?.opacity}
      {...props}
    />
  )
}
