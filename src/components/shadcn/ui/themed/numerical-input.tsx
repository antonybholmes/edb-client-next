import { BaseCol } from '@layout/base-col'

import { clamp } from '@/lib/math/clamp'
import { TriangleRightIcon } from '@icons/triangle-right-icon'
import { useEffect, useRef, useState } from 'react'
import { Input, type IInputProps } from './input'

const BUTTON_CLS = `w-4 shrink-0 h-4 flex flex-row justify-center items-center 
  data-[enabled=true]:stroke-foreground data-[enabled=false]:stroke-foreground/50 
  data-[enabled=true]:fill-foreground data-[enabled=false]:fill-foreground/50 
  data-[enabled=true]:hover:fill-theme data-[enabled=true]:focus:fill-theme 
  data-[enabled=true]:hover:stroke-theme data-[enabled=true]:focus:stroke-theme
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
  className,
}: INumericalInputProps) {
  //const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // the internal value is unbounded so that user can type
  // without it auto clamping. Once use performs action that
  // propogates the value, e.g. press enter, then it will
  // be clamped
  const [_value, setValue] = useState<number>(Number(value) || 0)

  function _getValue(v: number): number {
    if (limit?.length === 2) {
      v = clamp(v, limit[0], limit[1])
    }

    return v
  }

  function _onNumChange(v: number): number {
    setValue(v)

    // also call more realtime update, just in case
    onNumChange?.(_getValue(v))

    return v
  }

  function _onNumChanged(v: number): number {
    v = _getValue(v)

    setValue(v)
    // update but ensure data is clamped
    onNumChange?.(v)
    onNumChanged?.(v)

    return v
  }

  useEffect(() => {
    // if you set a value, it supersedes the internal value
    const v = Number(value)

    if (!Number.isNaN(v)) {
      setValue(_getValue(v))
    }
  }, [value])

  function updateValue(delta: number) {
    setValue(prev => {
      let newVal = prev + delta

      if (limit?.length === 2) {
        newVal = Math.min(limit[1], Math.max(limit[0], newVal))
      }

      return newVal
    })
  }

  function startUpdating(delta: number) {
    setValue(_value + delta)
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
    _onNumChanged(_value)
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
      value={_value.toFixed(dp)}
      type="number"
      min={limit?.length === 2 ? limit[0] : undefined}
      max={limit?.length === 2 ? limit[1] : undefined}
      disabled={disabled}
      w={w}
      className={className}
      inputCls="text-right"
      onKeyDown={e => {
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
                _onNumChanged(_value + step)
                break
              case 'ArrowDown':
              case 'ArrowLeft':
                _onNumChanged(_value - step)
                break
              default:
                break
            }
          }
        }
      }}
      onChange={e => {
        const v = Number(e.target.value)

        // default to min if garbage input
        if (!Number.isNaN(v)) {
          _onNumChange(v)
        }
      }}
      placeholder={placeholder}
      rightChildren={
        <BaseCol className="shrink-0 -mr-1.5">
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
            onKeyDown={e => handleKeyDown(e, step)}
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
            onKeyDown={e => handleKeyDown(e, -step)}
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
        </BaseCol>
      }
    />
  )
}
