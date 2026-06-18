import {
  ICON_CLS,
  VECTOR_ICON_CLS,
  type IIconProps,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Play } from 'lucide-react'

export const variants = cva(VECTOR_ICON_CLS, {
  variants: {
    variant: {
      none: '',
      default: 'stroke-foreground',
      colorful: 'fill-emerald-500',
      'app-theme': 'fill-app-theme/50 stroke-app-theme/90',
    },
  },
  defaultVariants: {
    variant: 'app-theme',
  },
})

export function PlayIcon({
  size = 20,
  stroke,
  fill,
  className,
  strokeWidth = 1,
  variant,
}: IIconProps & VariantProps<typeof variants>) {
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
      className={variants({
        variant,
        className: cn(ICON_CLS, stroke, fill, className),
      })}
      size={size}
      strokeWidth={strokeWidth}
    />
  )
}
