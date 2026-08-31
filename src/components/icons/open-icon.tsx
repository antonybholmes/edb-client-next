import { VECTOR_ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cva, type VariantProps } from 'class-variance-authority'
import { FolderOpen } from 'lucide-react'

export const variants = cva(VECTOR_ICON_CLS, {
  variants: {
    variant: {
      default: '',
      colorful: 'stroke-red-400/70 fill-yellow-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function OpenIcon({
  size = 20,
  variant,
  className,
}: IIconProps & VariantProps<typeof variants>) {
  return (
    <FolderOpen
      className={variants({ variant, className })}
      size={size}
      strokeWidth={1}
    />
  )
}
