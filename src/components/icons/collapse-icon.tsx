import { type IIconProps } from '@/interfaces/icon-props'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'

export function CollapseIcon({
  size = 14,
  collapsed = false,
}: IIconProps & { collapsed: boolean }) {
  return collapsed ? (
    <ChevronsUpDown size={size} />
  ) : (
    <ChevronsDownUp size={size} />
  )
}
