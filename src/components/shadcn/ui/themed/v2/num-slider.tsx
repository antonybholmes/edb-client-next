import { VCenterRow } from '@/components/layout/v-center-row'

import { useDebounceCallback, useNumDebounce } from '@/hooks/debounce'
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
import { Input } from './input'
import { Slider } from './slider'

type INumParser = (v: string) => number

function parseNumber(v: string): number {
  v = v.trim().replaceAll(',', '')

  const num = parseFloat(v)

  return num
}

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
  min,
  max,
  dp = 0,
  labelCls,
  delayMs = 300,
  parser = parseNumber,
  onNumChange,
  onNumChanged,
  format,
  ...props
}: ComponentProps<typeof Slider> & {
  labelCls?: string
  dp?: number
  parser?: INumParser
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

  const { debounced: debouncedValueChange } = useDebounceCallback(
    (value: number) => {
      _onValueChange(value)
    },
    { delayMs: 500 }
  )

  const f = useCallback(format ?? ((v: number) => formatNumber(v, { dp })), [
    format,
    formatNumber,
    dp,
  ])

  return (
    <VCenterRow>
      <Input
        value={f(_v)}
        onTextChange={(t) => {
          const v = parser(t)

          if (!isNaN(v)) {
            debouncedValueChange(v)
          }
        }}
        inputCls={cn('text-right', labelCls)}
        w="xs"
        h="sm"
        variant="flat"
      />
      <Slider
        value={_v}
        onValueChange={_onValueChange}
        min={min}
        max={max}
        {...props}
      />
    </VCenterRow>
  )
}
