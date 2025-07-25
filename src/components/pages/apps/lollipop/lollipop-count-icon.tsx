import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function LollipopCountIcon({
  w = 'w-5',
  fill = 'fill-background',
  stroke = 'stroke-foreground',
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, w, className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        //className={cn('text-xs', stroke)}
        fill="currentColor"
        fontSize={16}
      >
        1
      </text>
    </svg>
  )
}
