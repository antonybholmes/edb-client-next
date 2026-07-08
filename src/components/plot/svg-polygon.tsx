import type { IPaintProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface IProps extends SVGProps<SVGPolygonElement> {
  s?: IPaintProps | undefined
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
  stroke = 'none',
  s,
  ...props
}: IProps) {
  return (
    <polygon
      stroke={stroke}

      fill={fill ?? s?.value}
      fillOpacity={fillOpacity ?? s?.opacity}
      {...props}
    />
  )
}
