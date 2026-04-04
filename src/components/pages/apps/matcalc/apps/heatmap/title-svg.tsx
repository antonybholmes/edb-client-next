import { type IPos } from '@/interfaces/pos'

import type { IFontProps } from '@/components/plot/svg-props'

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
export function TitleSvg({ title, font, pos }: IProps) {
  return (
    <text
      x={pos?.x ?? 0}
      y={pos?.y ?? 0}
      textAnchor="middle"
      dominantBaseline="hanging"
      style={{
        fontSize: font.size,
        fontWeight: 'bold',
        fill: font.color,
        opacity: font.opacity,
      }}
    >
      {title}
    </text>
  )
}
