import { type IPos } from '@/interfaces/pos'

import {
  LEGEND_BLOCK_SIZE,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'

export interface IProps {
  actions: string[]
  props: IHeatMapDisplayOptions
  pos: IPos
}

/**
 * List of actions performed on the heatmap, e.g. clustering
 * so that user has a record of what was done (can always crop it out later)
 *
 * @param param0
 * @returns
 */
export function ActionListSvg({
  actions,
 
  pos,
}: IProps) {
  const legendBlockSize = LEGEND_BLOCK_SIZE.h * 0.75

  return (
    <g
      transform={`translate(${pos?.x}, ${pos.y})`}
    >
      <text fontSize="small" fontWeight="bold" y={0}>
        Actions
      </text>
      {actions.map((action, ai) => {
        // looks more visually appealing when gap is smaller
        const y = legendBlockSize * (ai + 1)

        return (
          <text fontSize="small" y={y} key={ai}>
            {action}
          </text>
        )
      })}
    </g>
  )
}
