import { isLightColor } from '@lib/color/color'
import { cn } from '@lib/shadcn-utils'
import type { ComponentProps } from 'react'

export function ColorDot({
  color,
  autoBorder = true,
  style,
  ...props
}: ComponentProps<'span'> & { autoBorder?: boolean; color: string }) {
  const lightMode = isLightColor(color)

  const border =
    autoBorder && lightMode ? 'border-border/50' : 'border-transparent'

  return (
    <span
      className={cn('rounded-full w-3.5 h-3.5 shrink-0 aspect-square', border)}
      style={{ ...style, backgroundColor: color }}
      {...props}
    />
  )
}
