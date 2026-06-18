import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cva, type VariantProps } from 'class-variance-authority'
import { MonitorUp } from 'lucide-react'

export const variants = cva(ICON_CLS, {
  variants: {
    variant: {
      default: '',
      colorful: 'stroke-orange-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function UploadIcon({
  size = 20,
  variant,
  className,
  strokeWidth = 1.5,
  ...props
}: IIconProps & VariantProps<typeof variants>) {
  return (
    <MonitorUp
      className={variants({ variant, className })}
      size={size}
      strokeWidth={strokeWidth}
    />
  )
}
