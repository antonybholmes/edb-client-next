import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function HeatMapIcon({
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
      <rect
        x="2"
        y="2"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/90"
      />

      <rect
        x="13"
        y="2"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/30"
      />

      <rect
        x="24"
        y="2"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/50"
      />

      <rect
        x="2"
        y="13"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/30"
      />

      <rect
        x="13"
        y="13"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/60"
      />

      <rect
        x="24"
        y="13"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/40"
      />

      <rect
        x="2"
        y="24"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/70"
      />

      <rect
        x="13"
        y="24"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/30"
      />

      <rect
        x="24"
        y="24"
        width="9"
        height="9"
        stroke="none"
        className="fill-app-theme/60"
      />

      {/* <rect
        x="2"
        y="2"
        width="28"
        height="28"
        fill="none"
        className="stroke-app-theme"
      /> */}
    </svg>
  )
}
