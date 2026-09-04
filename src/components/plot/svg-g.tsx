import { type IPos } from '@/interfaces/pos'

import { SVGProps } from 'react'

export interface IProps extends SVGProps<SVGGElement> {
  pos?: IPos
}

/**
 * Standard title for the heatmap
 *
 * @param param0
 * @returns
 */
export function SvgG({ pos, children, ...props }: IProps) {
  return (
    <g transform={`translate(${pos?.x ?? 0}, ${pos?.y ?? 0})`} {...props}>
      {children}
    </g>
  )
}
