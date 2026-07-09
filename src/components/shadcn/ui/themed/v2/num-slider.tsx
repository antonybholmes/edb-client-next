import { VCenterRow } from '@/components/layout/v-center-row'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { formatNumber } from '@/lib/text/text'
import { type ComponentProps } from 'react'
import { Slider } from './slider'

export function Num({ v, dp = 0 }: { v: number; dp?: number }) {
  return <span className="text-alt-foreground">{formatNumber(v, { dp })}</span>
}

export function NumSlider({
  value,
  dp = 0,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & { dp?: number }) {
  const v = Array.isArray(value) ? value[0] : value

  return (
    <VCenterRow className="gap-x-2">
      <Num v={v} dp={dp} />
      <Slider value={value} {...props} />
    </VCenterRow>
  )
}
