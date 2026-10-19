import { ICON_CLS } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { CenterRow } from '../layout/center-row'

export function TransposeIcon({ size = 16 }: { size?: number }) {
  return (
    <CenterRow
      className={cn(ICON_CLS, 'text-base italic')}
      style={{ fontFamily: 'serif', fontSize: size }}
    >
      <span className="font-bold">A</span>
      <sup style={{ fontSize: size * 0.75 }}>T</sup>
    </CenterRow>
  )
}
