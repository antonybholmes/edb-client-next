import type { IPaintProps, IStrokeProps } from '@/components/plot/svg-props'
import { IDim } from '@/interfaces/dim'
import type { ComponentProps, SVGProps } from 'react'

interface IProps extends SVGProps<SVGRectElement> {
  size?: IDim
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
export function SvgRect({
  size,
  width,
  height,
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
  width = size?.w ?? width
  height = size?.h ?? height
  return (
    <rect
      width={width}
      height={height}
      stroke={stroke ?? (sp?.show && sp?.value ? sp.value : 'none')}
      strokeWidth={strokeWidth ?? sp?.width}
      strokeOpacity={strokeOpacity ?? sp?.opacity}
      strokeDasharray={strokeDasharray ?? sp?.dasharray}
      fill={fill ?? fp?.value ?? 'none'}
      fillOpacity={fillOpacity ?? fp?.opacity}
      {...props}
    />
  )
}

/**
 * Svg rect for capturing mouse interactions. It is marked for interaction only so
 * it be removed when svg is saved or finalized.
 *
 * @param param0 Props to be passed to the SvgRect component.
 * @returns
 */
export function SvgMouseRect({ ...props }: ComponentProps<typeof SvgRect>) {
  return (
    <SvgRect
      id="mouse-rect"
      data-interaction-only="true"
      fill="transparent"
      pointerEvents="all"
      {...props}
    />
  )
}
