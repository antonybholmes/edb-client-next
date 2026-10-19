import { ICON_CLS } from '@/interfaces/icon-props'
import { CenterRow } from '../layout/center-row'

export function TransposeIcon({ size = 16 }: { size?: number }) {
  return (
    <CenterRow
      className={ICON_CLS}
      style={{ fontFamily: 'serif', fontSize: size }}
    >
      <i className="font-bold">A</i>
      <sup style={{ fontSize: size * 0.7 }}>T</sup>
    </CenterRow>
  )
}
