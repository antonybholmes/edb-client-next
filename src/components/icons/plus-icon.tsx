import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { Plus, PlusCircle } from 'lucide-react'

export function PlusIcon({
  w = 'w-5 h-5',
  fill,
  stroke = 'stroke-foreground',
  withCircle = true,
  className,
  strokeWidth = 1.5,
}: IIconProps & {
  withCircle?: boolean
}) {
  // const lineCls = cn(
  //   "rounded-full absolute left-0.25 right-0.25 top-1/2 -translate-y-1/2",
  //   fill,
  // )

  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   viewBox="0 0 24 24"
  //   className={cn(ICON_CLS, stroke, fill, w, className)}
  //   style={{
  //     strokeLinecap: 'round',
  //     strokeLinejoin: 'round',
  //     ...style,
  //   }}
  //   {...props}
  // >
  //   <path d="M6 12H18M12 6V18" />
  // </svg>

  if (withCircle) {
    return (
      <PlusCircle
        className={cn(ICON_CLS, fill, stroke, w, className)}
        strokeWidth={strokeWidth}
        stroke=""
      />
    )
  } else {
    return (
      <Plus
        className={cn(ICON_CLS, fill, stroke, w, className)}
        strokeWidth={strokeWidth}
        stroke=""
      />
    )
  }
}
