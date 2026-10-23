import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function VolcanoIcon({
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
        cx="16"
        cy="27"
        r="4"
        className="fill-app-theme/30"
        stroke="none"
      />

      <circle
        cx="18"
        cy="20"
        r="4"
        className="fill-app-theme/50"
        stroke="none"
      />

      <circle
        cx="22"
        cy="12"
        r="4"
        className="fill-app-theme/70"
        stroke="none"
      />

      <circle cx="28" cy="5" r="4" className="fill-app-theme" stroke="none" />

      <circle
        cx="14"
        cy="20"
        r="4"
        className="fill-app-theme/50"
        stroke="none"
      />

      <circle
        cx="10"
        cy="12"
        r="4"
        className="fill-app-theme/70"
        stroke="none"
      />

      <circle cx="4" cy="5" r="4" className="fill-app-theme" stroke="none" />
    </svg>
  )
}
