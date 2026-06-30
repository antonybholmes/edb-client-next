import type { IMarginProps } from '@/components/plot/svg-props'
import { SVGProps } from 'react'

export interface ISvgGroupProps extends SVGProps<SVGGElement> {}

export interface IProps extends ISvgGroupProps {
  margin: IMarginProps
}

/**
 * Margin group for svg plots. Translates the group by the margin specified and renders children inside it. This is useful for rendering axes and legends outside the main plot area without having to worry about the margin.
 *
 * @param param0
 * @returns
 */
export function SvgMargin({ margin, children, ...props }: IProps) {
  return (
    <g transform={`translate(${margin.left}, ${margin.top})`} {...props}>
      {children}
    </g>
  )
}
