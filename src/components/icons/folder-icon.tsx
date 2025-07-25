import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { Folder } from 'lucide-react'

export function FolderIcon({
  w = 'h-4 w-4',
  stroke = 'stroke-foreground',
  fill = '',
  className,
}: IIconProps) {
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

    <Folder className={cn(ICON_CLS, stroke, fill, w, className)} />
  )
}
