import { VCenterRow } from '@/components/layout/v-center-row'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { type ComponentProps } from 'react'
import { MaterialSlider } from './material-slider'
import { DEFAULT_SLIDER_TICKS, ISliderProps, RoundSlider } from './round-slider'

export function Slider({
  variant = 'material',
  ticks = DEFAULT_SLIDER_TICKS,
  ...props
}: ISliderProps & { variant?: 'round' | 'material' }) {
  switch (variant) {
    case 'material':
      return <MaterialSlider ticks={ticks} {...props} />
    default:
      return <RoundSlider ticks={ticks} {...props} />
  }
}

export function SliderWithValue({
  value,
  className = '',
  side = 'left',
  dp = 0,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  side?: 'left' | 'right'
  dp?: number
}) {
  const v = Array.isArray(value) ? value[0] : value || 0

  return (
    <VCenterRow className="gap-x-2">
      {side === 'left' && (
        <span className="bg-muted/50 py-1 rounded-sm text-center min-w-10">
          {v.toFixed(dp)}
        </span>
      )}
      <Slider {...props} value={value} className={className} />
      {side === 'right' && (
        <span className="ml-2 min-w-8">{v.toFixed(dp)}</span>
      )}
    </VCenterRow>
  )
}
