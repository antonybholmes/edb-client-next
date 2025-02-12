import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export const R = 5
export const X1 = 6
export const X2 = 18
//export const X3 = 14

export function MenuButtonIcon({
  w = 'w-5',

  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, w, className)}
    >
      <circle cx={X1} cy={X1} r={R} className="fill-white" />
      <circle cx={X2} cy={X1} r={R} className="fill-white/60" />
      {/* <circle cx={X3} cy={X1} r={R} /> */}

      <circle cx={X1} cy={X2} r={R} className="fill-white/70" />
      <circle cx={X2} cy={X2} r={R} className="fill-white/90" />
      {/* <circle cx={X3} cy={X2} r={R} /> */}

      {/* <circle cx={X1} cy={X3} r={R} /> */}
      {/* <circle cx={X2} cy={X3} r={R} /> */}
      {/* <circle cx={X3} cy={X3} r={R} /> */}
    </svg>
  )
}
