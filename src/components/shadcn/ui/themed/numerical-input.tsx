import { VCenterCol } from '@/components/layout/v-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgPath } from '@/components/plot/svg-path'
import { useDebounce } from '@/hooks/debounce'
import { useUpdateEffect } from '@/hooks/update-effect'
import { clamp } from '@/lib/math/clamp'
import { cn } from '@/lib/shadcn-utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Input, type IInputProps } from './v2/input'

const BUTTON_CLS = `w-4.5 flex h-2.5 min-h-0 overflow-hidden shrink-0 
  flex-row justify-center items-center
  disabled:text-foreground/50
  enabled:focus-visible:text-app-theme
  bg-muted/60 enabled:hover:bg-muted/90
  outline-none trans-color`

const UP_BUTTON_CLS = cn(BUTTON_CLS, 'rounded-t-sm')
const DOWN_BUTTON_CLS = cn(BUTTON_CLS, 'rounded-b-sm')

const UPDATE_INTERVAL_MS = 150

const REMOVE_TRAILING_ZEROS_REGEX = /\.?0+$/

export function SmallChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <SvgBase size={{ w: 24, h: 24 }}>
      <SvgPath
        d={
          direction === 'up' ? 'M8 14, L12 10, L16 14' : 'M8 10, L12 14, L16 10'
        }
        strokeWidth={2}
        className="stroke-foreground"
      />
    </SvgBase>
  )
}

export interface INumericalInputProps extends Omit<IInputProps, 'value'> {
  value: number
  limit?: [number, number]
  step?: number
  dp?: number
  removeTrailingZeros?: boolean
  /**
   * Callback that is run as you type. The returned number is
   * the valid number you typed. If what you type is translates
   * to NaN, this is not called.
   * @param v
   * @returns
   */
  onNumChange?: (v: number) => void
  onNumChanged?: (v: number) => void
  suffix?: string
  delay?: number
}

export function NumericalInput({
  id,
  name,
  value = 0,
  limit = [0, 100],
  step = 1,
  dp = 0,
  removeTrailingZeros = true,
  placeholder,
  onNumChange,
  onNumChanged,
  disabled,
  h,
  w = 'xxs',
  variant = 'default',
  delay = UPDATE_INTERVAL_MS,
  suffix = '',
  className = '',
  title,
  ...props
}: INumericalInputProps) {
  //const _id = id ?? useStableId('numerical-input')

  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // To allow ui to respond to spinner buttons without waiting for debounce,
  // we keep an internal value that updates immediately as user types or clicks
  // spinner, and then debounce the updates to the outside
  const numValue = useRef<number>(value)

  const [textValue, setTextValue] = useState<string>('')

  const suffixRegex = useMemo(() => new RegExp(`${suffix}$`), [suffix])

  // debounce the text value, so we don't call onNumChange too frequently as user types
  const debouncedTextValue = useDebounce(textValue, {
    delayMs: 1000,
  })

  function _clampValue(v: number): number {
    if (limit?.length === 2) {
      v = clamp(v, { min: limit[0], max: limit[1] })
    }

    return v
  }

  /**
   * Formats the number to the correct number of decimal places and removes trailing zeros if requested.
   * @param v
   */
  function _setShowValue(v: number) {
    let formattedValue = dp > -1 ? v.toFixed(dp) : v.toString()

    if (removeTrailingZeros && dp > 0) {
      formattedValue = formattedValue.replace(REMOVE_TRAILING_ZEROS_REGEX, '')
    }

    setTextValue(formattedValue + suffix)
  }

  // const debouncedNumValue = useDebounce(numValue, {
  //   delayMs: 500,
  //   fn: v => _clampValue(v),
  // })

  // user provides a new value, we update the internal value immediately
  useEffect(() => {
    const v = _clampValue(value)

    _setShowValue(v)
    numValue.current = v
  }, [value])

  // the internal number value is clamped to the limit
  //const _n = useRef(Number(value) || limit?.[0] || 0)

  useUpdateEffect(() => {
    if (debouncedTextValue === '') {
      return
    }
    _onChange(debouncedTextValue)
  }, [debouncedTextValue])

  // useEffect(() => {
  //   onNumChange?.(debouncedNumValue)
  //   onNumChanged?.(debouncedNumValue)
  // }, [debouncedNumValue])

  const ariaLabel = props['aria-label'] ?? title ?? 'Numerical input'

  function _onChange(text: string, triggerChanged: boolean = false) {
    // remove commas for thousands separators, since they interfere with parsing
    let v = Number(text.replaceAll(',', ''))

    if (suffix) {
      text = text.replace(suffixRegex, '')
    }

    if (Number.isNaN(v)) {
      return
    }

    v = _clampValue(v)

    _setShowValue(v) // ensure value is formatted correctly as user types

    if (v !== value) {
      // only trigger updates if the value is different from the last value we sent to the parent
      numValue.current = v

      onNumChange?.(v)

      if (triggerChanged) {
        onNumChanged?.(v)
      }
    }
  }

  // function _onNumChanged(v: number): number {
  //   v = _clampValue(v)

  //   setValue(v.toFixed(dp)) // update the internal value and format it
  //   _n.current = v // update the internal value without formatting
  //   // update but ensure data is clamped
  //   onNumChange?.(v)
  //   onNumChanged?.(v)

  //   return v
  // }

  // useEffect(() => {
  //   // if you set a value, it supersedes the internal value
  //   let v = Number(value)

  //   if (!Number.isNaN(v)) {
  //     v = _clampValue(v)
  //     setValue(v.toFixed(dp))
  //     _n.current = v
  //   }
  // }, [value])

  function updateValue(delta: number) {
    numValue.current = _clampValue(numValue.current + delta)

    // force ui to update immediately so user can see the change as they hold down the button
    // but since this value is debounced, the onNumChange/onNumChanged callbacks won't be called until
    // user releases the button or stops typing for a moment.
    _setShowValue(numValue.current)
  }

  function startUpdating(delta: number) {
    updateValue(delta)

    timeoutRef.current = setInterval(() => {
      updateValue(delta)
    }, delay)
  }

  function stopUpdating() {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current)
    }

    timeoutRef.current = null

    // Once we finish updating the internal state, push it
    // so the rest of the ui can respond
    //_onNumChanged(numValue.current)

    const v = numValue.current
    _setShowValue(v) // ensure value is formatted correctly after user finishes changing
    onNumChanged?.(v)
  }

  const handleKeyDown = (event: React.KeyboardEvent, delta: number) => {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      updateValue(delta)
    }
  }

  const handleKeyUp = () => {
    stopUpdating()
  }

  return (
    <VCenterRow className="gap-x-1" data-disabled={disabled}>
      <Input
        id={id}
        name={name}
        value={textValue}
        type="number"
        h={h}
        step={step}
        min={limit?.length === 2 ? limit[0] : undefined}
        max={limit?.length === 2 ? limit[1] : undefined}
        disabled={disabled}
        w={w}
        className={className}
        variant={variant}
        inputCls="text-right"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            _onChange(e.currentTarget.value, true) //onNumChanged?.(Math.min(limit[1], Math.max(limit[0], v)))
          }
        }}

        onTextChange={setTextValue}
        placeholder={placeholder}

        aria-label={ariaLabel}
        title={title}
      />
      <VCenterCol>
        <button
          disabled={disabled}

          className={UP_BUTTON_CLS}

          onMouseDown={() => startUpdating(step)}
          onMouseUp={stopUpdating}
          onMouseLeave={stopUpdating}
          onKeyDown={(e) => handleKeyDown(e, step)}
          onKeyUp={handleKeyUp}
          aria-label="Increase value"
        >
          <SmallChevronIcon direction="up" />
        </button>
        <button
          disabled={disabled}

          className={DOWN_BUTTON_CLS}

          onMouseDown={() => startUpdating(-step)}
          onMouseUp={stopUpdating}
          onMouseLeave={stopUpdating}
          onKeyDown={(e) => handleKeyDown(e, -step)}
          onKeyUp={handleKeyUp}
          aria-label="Decrease value"
        >
          <SmallChevronIcon direction="down" />
        </button>
      </VCenterCol>
    </VCenterRow>
  )
}
