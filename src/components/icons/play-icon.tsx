import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { Play } from 'lucide-react'

export function PlayIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 454 542"
    //   className={cn(w, stroke, fill, className)}
    // >
    //   <g transform="translate(30 20)">
    //     <path
    //       d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
    //       strokeWidth={40}
    //     />
    //   </g>
    // </svg>

    <Play
      className={cn(ICON_CLS, stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
