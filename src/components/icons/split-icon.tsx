import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export interface IChartIconProps extends IIconProps {
  className1?: string
  className2?: string
  className3?: string
}

export function SplitIcon({
  w = 'w-4',
  fill = 'stroke-foreground fill-none',
  stroke = 'stroke-2',
  className,
}: IChartIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, fill, stroke, w, className)}
      viewBox="0 0 24 24"
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <rect x="2" y="1" width="20" height="22" className="fill-none" />
      <line x1="14" x2="14" y1="2" y2="22" />
    </svg>
  )
}
