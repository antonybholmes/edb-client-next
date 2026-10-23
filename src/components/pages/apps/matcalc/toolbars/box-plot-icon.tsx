import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function BoxPlotIcon({
  size = 'w-4',

  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(ICON_CLS, size, className)}
      //shapeRendering={SVG_CRISP_EDGES}
    >
      <path
        className="fill-app-theme/20 stroke-app-theme"
        d="M8 30, L24 30, L16 30, L16 20, L24 20, L24 10, L16 10, L16 2, L24 2, L8 2, L16 2, L16 10, L8 10, L8 20, L16 20, L16 30 Z"
      />
    </svg>
  )
}
