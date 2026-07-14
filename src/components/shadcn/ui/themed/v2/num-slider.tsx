import { VCenterRow } from '@/components/layout/v-center-row'

import { useNumDebounce } from '@/hooks/debounce'
import { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { formatNumber } from '@/lib/text/text'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from 'react'
import { Slider } from './slider'

export function Num({
  v,
  format = (v: number) => formatNumber(v),
  className,
}: IClassProps & { v: number; format?: (v: number) => string }) {
  return (
    <span className={cn('text-alt-foreground text-right', className)}>
      {format(v)}
    </span>
  )
}

export function NumSlider({
  value,
  dp = 0,
  labelCls,
  delayMs = 300,
  onNumChange,
  onNumChanged,
  format,
  ...props
}: ComponentProps<typeof Slider> & {
  labelCls?: string
  dp?: number
  format?: (v: number) => string
}) {
  const [_v, setV] = useState<number>(
    Array.isArray(value) ? value[0] : value || 0
  )

  const prevValueRef = useRef<number>(_v)
  const debouncedV = useNumDebounce(_v, { delayMs })

  useEffect(() => {
    const v = Array.isArray(value) ? value[0] : value || 0
    setV(v)
  }, [value])

  useEffect(() => {
    if (prevValueRef.current !== debouncedV) {
      prevValueRef.current = debouncedV
      onNumChanged?.(debouncedV)
    }
  }, [debouncedV, onNumChanged])

  function _onValueChange(value: number | readonly number[]) {
    const v = Array.isArray(value) ? value[0] : value

    setV(v)
    onNumChange?.(v)
  }

  const f = useCallback(format ?? ((v: number) => formatNumber(v, { dp })), [
    format,
    formatNumber,
    dp,
  ])

  return (
    <VCenterRow className="gap-x-2">
      <Num v={_v} className={labelCls} format={f} />
      <Slider value={_v} onValueChange={_onValueChange} {...props} />
    </VCenterRow>
  )
}
