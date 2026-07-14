import { formatAsPercent } from '@/lib/text/format-string'
import { useCallback, type ComponentProps } from 'react'
import { NumSlider } from './num-slider'

export function PercentSlider({
  value,
  dp = 0,
  ...props
}: ComponentProps<typeof NumSlider>) {
  const f = useCallback((v: number) => formatAsPercent(v, dp), [dp])

  return <NumSlider value={value} format={f} {...props} />
}
