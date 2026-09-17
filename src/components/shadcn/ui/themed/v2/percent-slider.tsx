import { formatAsPercent } from '@/lib/text/format-string'
import { useCallback, type ComponentProps } from 'react'
import { NumSlider } from './num-slider'

function parsePercent(v: string): number {
  v = v.trim().replaceAll(',', '').replaceAll('%', '')

  const num = parseFloat(v)

  if (isNaN(num)) {
    return NaN
  }

  console.log('aha', num)

  return num / 100
}

export function PercentSlider({
  value,
  dp = 0,
  ...props
}: ComponentProps<typeof NumSlider>) {
  const f = useCallback((v: number) => formatAsPercent(v, dp), [dp])

  return <NumSlider value={value} format={f} parser={parsePercent} {...props} />
}
