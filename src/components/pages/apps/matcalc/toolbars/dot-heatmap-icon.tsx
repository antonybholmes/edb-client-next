import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

const R = '5'

export function DotHeatMapIcon({
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
        cx="5"
        cy="5"
        r={R}

        stroke="none"
        className="fill-app-theme/90"
      />

      <circle
        cx="16"
        cy="5"
        r={R}
        stroke="none"
        className="fill-app-theme/30"
      />

      <circle
        cx="27"
        cy="5"
        r={R}
        stroke="none"
        className="fill-app-theme/50"
      />

      <circle
        cx="5"
        cy="16"
        r={R}
        stroke="none"
        className="fill-app-theme/30"
      />

      <circle
        cx="16"
        cy="16"
        r={R}
        stroke="none"
        className="fill-app-theme/60"
      />

      <circle
        cx="27"
        cy="16"
        r={R}
        stroke="none"
        className="fill-app-theme/40"
      />

      <circle
        cx="5"
        cy="27"
        r={R}
        stroke="none"
        className="fill-app-theme/70"
      />

      <circle
        cx="16"
        cy="27"
        r={R}

        stroke="none"
        className="fill-app-theme/30"
      />

      <circle
        cx="27"
        cy="27"
        r={R}
        stroke="none"
        className="fill-app-theme/60"
      />
    </svg>
  )
}
