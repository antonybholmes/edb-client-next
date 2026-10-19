import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { VariantProps } from 'class-variance-authority'
import { ImageDown } from 'lucide-react'
import { variants } from './download-icon'

export function DownloadImageIcon({
  size = 20,
  variant,
  className,
  strokeWidth = 1.5,
}: IIconProps & VariantProps<typeof variants>) {
  return (
    <ImageDown
      className={variants({
        variant,
        className: cn(ICON_CLS, className),
      })}
      strokeWidth={strokeWidth}
      size={size}
    />
  )
}
