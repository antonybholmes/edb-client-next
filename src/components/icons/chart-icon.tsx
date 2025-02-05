import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export interface IChartIconProps extends IIconProps {
  className1?: string
  className2?: string
  className3?: string
}

export function ChartIcon({
  w = 'w-4',
  fill = 'fill-foreground',
  className,
  className1,
  className2,
  className3,
  style,
}: IChartIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, fill, w, className)}
      viewBox="0 0 24 24"
      style={{ stroke: 'none', ...style }}
    >
      <rect x="1" y="12" width="5.5" height="11" className={className1} />
      <rect x="8" y="1" width="5.5" height="22" className={className2} />
      <rect x="15" y="6" width="5.5" height="17" className={className3} />
    </svg>
  )
}
