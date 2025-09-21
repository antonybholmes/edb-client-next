import { TriangleRightIcon } from '@/components/icons/triangle-right-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { clamp } from '@/lib/math/clamp'
import { useEffect, useRef, useState } from 'react'
import { Input, type IInputProps } from './input'

const BUTTON_CLS = `w-4 flex h-4 flex-row justify-center items-center
  data-[enabled=true]:stroke-foreground data-[enabled=false]:stroke-foreground/50 
  data-[enabled=true]:fill-foreground data-[enabled=false]:fill-foreground/50 
  data-[enabled=true]:hover:fill-theme data-[enabled=true]:focus-visible:fill-theme 
  data-[enabled=true]:hover:stroke-theme data-[enabled=true]:focus-visible:stroke-theme
  outline-hidden trans-color`

const UPDATE_INTERVAL_MS = 100

export interface INumericalInputProps extends IInputProps {
  limit?: [number, number]
  step?: number
  dp?: number
  /**
   * Callback that is run as you type. The returned number is
   * the valid number you typed. If what you type is translates
   * to NaN, this is not called.
   * @param v
   * @returns
   */
  onNumChange?: (v: number) => void
  onNumChanged?: (v: number) => void
  w?: string
}

export function NumericalInput({
  value = 0,
  limit,
  step = 1,
  dp = 0,
  placeholder,
  onNumChange,
  onNumChanged,
  disabled,
  w = 'w-20',
  variant = 'default',
  className,
}: INumericalInputProps) {
  //const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // The internal value is unbounded so that user can type
  // normally without constant auto formatting which is annoying.
  // Once the user presses enter or stops updating via the arrow keys,
  // we will format the value to the dp and clamp it to the limit.
  const [_value, setValue] = useState(value)

  // the internal number value is clamped to the limit
  const [_n, setN] = useState(Number(value) || limit?.[0] || 0)

  function _getValue(v: number): number {
    if (limit?.length === 2) {
      v = clamp(v, limit[0], limit[1])
    }

    return v
  }

  function _onNumChange(text: string): number {
    setValue(text)

    let v = Number(text)

    if (!Number.isNaN(v)) {
      v = _getValue(v)
      setN(v)
      onNumChange?.(v)
    }

    // also call more realtime update, just in case
    //onNumChange?.(_getValue(v))

    return v
  }

  function _onNumChanged(v: number): number {
    v = _getValue(v)

    setValue(v.toFixed(dp)) // update the internal value and format it
    setN(v) // update the internal value without formatting
    // update but ensure data is clamped
    onNumChange?.(v)
    onNumChanged?.(v)

    return v
  }

  useEffect(() => {
    // if you set a value, it supersedes the internal value
    let v = Number(value)

    if (!Number.isNaN(v)) {
      v = _getValue(v)
      setValue(v.toFixed(dp))
      setN(v)
    }
  }, [value])

  function updateValue(delta: number) {
    setN((prev) => _getValue(prev + delta))
  }

  function startUpdating(delta: number) {
    setN((prev) => _getValue(prev + delta))
    intervalRef.current = setInterval(
      () => updateValue(delta),
      UPDATE_INTERVAL_MS
    )
  }

  function stopUpdating() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = null

    // Once we finish updating the internal state, push it
    // so the rest of the ui can respond
    _onNumChanged(_n)
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

  //const v = value || _value ||

  return (
    <Input
      value={_value}
      type="number"
      min={limit?.length === 2 ? limit[0] : undefined}
      max={limit?.length === 2 ? limit[1] : undefined}
      disabled={disabled}
      w={w}
      className={className}
      variant={variant}
      inputCls="text-right"
      onKeyDown={(e) => {
        //console.log(e)
        if (e.key === 'Enter') {
          const v = Number(e.currentTarget.value)

          // only called when user presses enter,
          // this is for when you don't want to respond
          // on every change, (e.g. it taxes the ui to keep
          // redrawing quickly, so only respond once user
          // has made a final choice
          if (!Number.isNaN(v)) {
            _onNumChanged(v) //onNumChanged?.(Math.min(limit[1], Math.max(limit[0], v)))
          }
        } else {
          // respond to arrow keys when ctrl pressed
          if (e.ctrlKey) {
            switch (e.key) {
              case 'ArrowUp':
              case 'ArrowRight':
                _onNumChanged(_n + step)
                break
              case 'ArrowDown':
              case 'ArrowLeft':
                _onNumChanged(_n - step)
                break
              default:
                break
            }
          }
        }
      }}
      onChange={(e) => {
        //const v = Number(e.target.value)

        // default to min if garbage input
        //if (!Number.isNaN(v)) {
        _onNumChange(e.target.value)
        //}
      }}
      placeholder={placeholder}
      rightChildren={
        <VCenterCol className="shrink-0 -mr-1.5">
          <button
            disabled={disabled}
            data-enabled={!disabled}
            className={BUTTON_CLS}
            // onClick={() => {
            //   _onNumChanged(_value.current + inc)
            // }}
            onMouseDown={() => startUpdating(step)}
            onMouseUp={stopUpdating}
            onMouseLeave={stopUpdating}
            onKeyDown={(e) => handleKeyDown(e, step)}
            onKeyUp={handleKeyUp}
          >
            <TriangleRightIcon
              className="-rotate-90 -mb-0.5"
              w="w-3"
              stroke=""
              fill=""
              //strokeWidth={3}
            />
          </button>
          <button
            disabled={disabled}
            data-enabled={!disabled}
            className={BUTTON_CLS}
            // onClick={() => {
            //   _onNumChanged(_numValue - inc)
            // }}

            // onClick={() => {
            //   _onNumChanged(_value.current - inc)
            // }}
            onMouseDown={() => startUpdating(-step)}
            onMouseUp={stopUpdating}
            onMouseLeave={stopUpdating}
            onKeyDown={(e) => handleKeyDown(e, -step)}
            onKeyUp={handleKeyUp}
          >
            <TriangleRightIcon
              className="rotate-90 mb-0.5"
              w="w-3"
              stroke=""
              strokeWidth={0}
              fill=""
            />
          </button>
        </VCenterCol>
      }
    />
  )
}
