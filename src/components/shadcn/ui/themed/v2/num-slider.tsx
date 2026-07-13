import { VCenterRow } from '@/components/layout/v-center-row'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { formatNumber } from '@/lib/text/text'
import { type ComponentProps } from 'react'
import { Slider } from './slider'

export function Num({
  v,
  dp = 0,
  className,
}: IClassProps & { v: number; dp?: number }) {
  return (
    <span className={cn('text-alt-foreground text-right', className)}>
      {formatNumber(v, { dp })}
    </span>
  )
}

export function NumSlider({
  value,
  dp = 0,
  labelCls,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  labelCls?: string
  dp?: number
}) {
  const v = Array.isArray(value) ? value[0] : value

  return (
    <VCenterRow className="gap-x-2">
      <Num v={v} dp={dp} className={labelCls} />
      <Slider value={value} {...props} />
    </VCenterRow>
  )
}
