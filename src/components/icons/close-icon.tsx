import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { X } from 'lucide-react'

export function CloseIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
}: IIconProps) {
  //const lineCls = cn("rounded-full absolute left-0.25 right-0.25 top-1/2 -translate-y-1/2", fill)
  return (
    // <svg
    //   viewBox="0 0 16 16"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={cn(ICON_CLS, w, stroke, fill, className)}
    //   style={{ ...style, strokeLinecap: 'round', strokeLinejoin: 'round' }}
    //   data-checked={selected}
    // >
    //   <path d="M 1,1 L 15,15 M 15,1 L 1,15" />
    // </svg>

    <X
      className={cn(ICON_CLS, stroke, w, className)}
      strokeWidth={strokeWidth}
    />
  )
}
