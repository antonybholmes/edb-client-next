import type { IPaintProps, IStrokeProps } from '@/components/plot/svg-props'
import type { SVGProps } from 'react'

interface IProps extends SVGProps<SVGPathElement> {
  sp?: IStrokeProps | undefined
  fp?: IPaintProps | undefined
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
  sp,
  fp,
  ...props
}: IProps) {
  return (
    <path
      id={id}
      stroke={stroke ?? sp?.value ?? 'none'}
      strokeWidth={strokeWidth ?? sp?.width}
      strokeOpacity={opacity ?? sp?.opacity}
      strokeDasharray={strokeDasharray ?? sp?.dasharray}
      fill={props.fill ?? fp?.value ?? 'none'}
      fillOpacity={props.fillOpacity ?? fp?.opacity}
      {...props}
    />
  )
}
