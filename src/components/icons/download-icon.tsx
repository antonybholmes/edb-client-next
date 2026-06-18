import {
  ICON_CLS,
  VECTOR_ICON_CLS,
  type IIconProps,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowDownToLine } from 'lucide-react'

export const variants = cva(VECTOR_ICON_CLS, {
  variants: {
    variant: {
      none: '',
      default: 'stroke-foreground',
      app: 'stroke-app-theme',
    },
  },
  defaultVariants: {
    variant: 'app',
  },
})

export function DownloadIcon({
  size = 20,
  className,
  variant,
  strokeWidth = 1.5,
}: IIconProps & VariantProps<typeof variants>) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(ICON_CLS, stroke, fill, size, className)}
    //   style={{
    //     strokeLinecap: 'round',
    //     strokeLinejoin: 'round',
    //     fill: 'none',
    //     ...style,
    //   }}
    //   {...props}
    // >
    //   <path d="M 12 2 L 12 14" />
    //   <path d="M 6 10 L 12 16 L 18 10" />
    //   <path d="M 2 20 L 22 20" />
    // </svg>

    <ArrowDownToLine
      className={variants({
        variant,
        className: cn(ICON_CLS, className),
      })}
      strokeWidth={strokeWidth}
      size={size}
      stroke=""
    />
  )
}
