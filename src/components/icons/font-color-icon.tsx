import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { CenterCol } from '../layout/center-col'

export function FontColorIcon({
  size = 'w-5 h-5',
  color = 'stroke-current',
}: IIconProps) {
  return (
    <CenterCol className={cn(ICON_CLS, size)}>
      <span className="font-bold">A</span>
      <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
    </CenterCol>
  )
}
