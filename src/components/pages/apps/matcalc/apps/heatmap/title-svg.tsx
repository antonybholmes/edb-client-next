import { type IPos } from '@/interfaces/pos'

import type { IFontProps } from '@/components/plot/svg-props'
import { SvgText, type ISvgTextProps } from '@/components/plot/svg-text'

export interface IProps {
  title: string
  font: IFontProps
  pos?: IPos
}

/**
 * Standard title for the heatmap
 *
 * @param param0
 * @returns
 */
export function SvgTitle({ children, ...props }: ISvgTextProps) {
  return (
    <SvgText {...props} dominantBaseline="hanging">
      {children}
    </SvgText>
  )
}
