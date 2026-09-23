import { formatAsPercent } from '@/lib/text/format-string'
import { useCallback, type ComponentProps } from 'react'
import { NumSlider } from './num-slider'

/**
 * Parses a string representation of a percentage into a numeric value. This function removes
 * any commas and percentage signs from the input string, converts it to a float, and then
 * divides by 100 to get the numeric value.
 *
 * @param v The string representation of a percentage (e.g., "50%").
 * @returns The numeric value of the percentage (e.g., 0.5).
 */
function parsePercent(v: string): number {
  v = v.trim().replaceAll(',', '').replaceAll('%', '')

  const num = parseFloat(v)

  if (isNaN(num)) {
    return NaN
  }

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
