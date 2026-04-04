import { VECTOR_ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { FolderOpen } from 'lucide-react'

export const variants = cva(VECTOR_ICON_CLS, {
  variants: {
    variant: {
      default: '',
      colorful: ' stroke-1 stroke-red-400 fill-yellow-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function OpenIcon({
  w = 'h-5 w-5',
  variant,
  className,
}: IIconProps & VariantProps<typeof variants>) {
  return (
    <FolderOpen
      className={variants({ variant, className: cn(w, className) })}
    />
  )
}
