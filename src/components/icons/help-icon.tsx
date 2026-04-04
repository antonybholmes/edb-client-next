import { VECTOR_ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { CircleHelp } from 'lucide-react'

export const variants = cva(VECTOR_ICON_CLS, {
  variants: {
    variant: {
      default: '',
      colorful: 'stroke-theme/75 fill-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function HelpIcon({
  w = 'h-5 w-5',
  variant = 'colorful',
  className,
}: IIconProps & VariantProps<typeof variants>) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 20 20"
    //   className={cn(ICON_CLS, w, fill, className)}
    // >
    //   <text
    //     textAnchor="middle"
    //     dominantBaseline="central"
    //     x="10"
    //     y="10"
    //     fontSize="small"
    //     className="font-medium stroke-none"
    //   >
    //     ?
    //   </text>
    //   <circle cx="10" cy="10" r="9" className="stroke-2 fill-none" />
    // </svg>

    <CircleHelp
      className={variants({ variant, className: cn(w, className) })}
    />
  )
}
