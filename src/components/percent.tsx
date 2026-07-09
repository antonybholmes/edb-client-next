import { cn } from '@/lib/shadcn-utils'
import { formatAsPercent } from '@/lib/text/format-string'
import { H2_CLS } from '@/theme'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

/**
 * Renders a percentage value with optional digit formatting.
 *
 * @param v - The numeric value to be formatted as a percentage.
 * @param digits - Optional number of decimal places to include in the formatted percentage. Defaults to 0.
 * @returns A JSX element containing the formatted percentage string.
 */
export function Percent({ v, digits = 0 }: { v: number; digits?: number }) {
  return (
    <span className="text-alt-foreground">{formatAsPercent(v, digits)}</span>
  )
}
