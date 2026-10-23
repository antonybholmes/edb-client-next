import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function BubbleIcon({
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
      <circle
        cx="12"
        cy="27"
        r="4"
        className="fill-app-theme/30"
        stroke="none"
      />

      <circle
        cx="16"
        cy="18"
        r="5"
        className="fill-app-theme/50"
        stroke="none"
      />

      <circle cx="25" cy="7" r="6" className="fill-app-theme" stroke="none" />
    </svg>
  )
}
