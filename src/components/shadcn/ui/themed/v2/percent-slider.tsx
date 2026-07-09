import { VCenterRow } from '@/components/layout/v-center-row'
import { Percent } from '@/components/percent'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { type ComponentProps } from 'react'
import { Slider } from './slider'

export function PercentSlider({
  value,

  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const v = Array.isArray(value) ? value[0] : value

  return (
    <VCenterRow className="gap-x-2">
      <Percent v={v} />
      <Slider value={value} {...props} />
    </VCenterRow>
  )
}
