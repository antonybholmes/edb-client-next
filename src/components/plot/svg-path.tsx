import type { IStrokeProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface IProps extends SVGProps<SVGPathElement> {
  s?: IStrokeProps | undefined
}

/**
 * SVG <path> element that accepts stroke props as a single object and applies them to the path element.
 * If a specific stroke prop is provided, it will override the corresponding value in the stroke object.
 * @param param0
 * @returns
 */
export function SvgPath({
  id,
  stroke,
  strokeWidth,
  strokeDasharray,
  opacity,
  s,
  ...props
}: IProps) {
  return (
    <path
      id={id}
      stroke={stroke ?? s?.value}
      strokeWidth={strokeWidth ?? s?.width}
      strokeOpacity={opacity ?? s?.opacity}
      strokeDasharray={strokeDasharray ?? s?.dasharray}
      {...props}
    />
  )
}
