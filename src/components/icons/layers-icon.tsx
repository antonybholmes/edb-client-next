import { ICON_CLS } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import type { IChartIconProps } from './chart-icon'

const PATH = 'M 1,6 L 12,0 L 23,6 L 12,12 Z'

export function LayersIcon({
  w = 'w-5',
  className,
  className3 = 'fill-foreground/50',
  className2 = 'fill-foreground/75',
  className1 = 'fill-foreground',
  stroke = 'stroke-2',
}: IChartIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, stroke, className)}
      viewBox="0 0 24 24"
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <path d={PATH} transform="translate(0,11)" className={className3} />

      <path d={PATH} transform="translate(0,6)" className={className2} />

      <path d={PATH} className={className1} transform="translate(0,1)" />
    </svg>
  )
}
