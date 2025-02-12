import type { IInputProps } from '@interfaces/input-props'

import { BaseCol } from '@/components/layout/base-col'
import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { useEffect, useState } from 'react'

import { cn } from '@lib/class-names'
import { Input } from './input'

const BUTTON_CLS =
  'w-5 shrink-0 h-4 flex flex-row justify-center items-center data-[enabled=true]:stroke-foreground data-[enabled=false]:stroke-foreground/50 data-[enabled=true]:hover:stroke-theme data-[enabled=true]:focus:stroke-theme outline-none trans-color'

interface IProps extends IInputProps {
  limit?: [number, number]
  inc?: number
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
  limit = [1, 100],
  inc = 1,
  dp = 0,
  placeholder,
  type,
  onNumChange,
  onNumChanged,
  disabled,
  w = 'w-16',
  className,
}: IProps) {
  const [_value, setValue] = useState<string | number | undefined>('')
  const [_numValue, setNumValue] = useState<number>(0)

  if (dp === undefined) {
    dp = 0
  }

  useEffect(() => {
    if (typeof value !== 'number') {
      value = limit[0]
    }

    setNumValue(Math.min(limit[1], Math.max(limit[0], value)))
  }, [value])

  useEffect(() => {
    setValue(_numValue.toFixed(dp))
  }, [_numValue])

  function _onNumChanged(v: number) {
    v = Math.min(limit[1], Math.max(limit[0], v))
    // update
    onNumChanged?.(v)

    // also call more realtime update, just in case
    onNumChange?.(v)
  }

  return (
    <Input
      value={_value}
      type={type}
      disabled={disabled}
      className={cn(w, className)}
      inputCls="text-right"
      onKeyDown={(e) => {
        //console.log(e)
        if (e.key === 'Enter') {
          const v = Number(e.currentTarget.value)

          // default to min if garbage input
          if (!Number.isNaN(v)) {
            _onNumChanged(v)
          }
        } else {
          // respond to arrow keys when ctrl pressed
          if (e.ctrlKey) {
            switch (e.key) {
              case 'ArrowUp':
              case 'ArrowRight':
                _onNumChanged(_numValue + inc)
                break
              case 'ArrowDown':
              case 'ArrowLeft':
                _onNumChanged(_numValue - inc)
                break
              default:
                break
            }
          }
        }
      }}
      onChange={(e) => {
        const v = Number(e.currentTarget.value)

        // default to min if garbage input
        if (!Number.isNaN(v)) {
          onNumChange?.(Math.min(limit[1], Math.max(limit[0], v)))
        }

        setValue(e.currentTarget.value)
      }}
      placeholder={placeholder}
      rightChildren={
        <BaseCol className="shrink-0 -mr-2">
          <button
            disabled={disabled}
            data-enabled={!disabled}
            className={BUTTON_CLS}
            onClick={() => {
              _onNumChanged(_numValue + inc)
            }}
          >
            <ChevronRightIcon
              className="-rotate-90 -mb-1"
              w="w-3"
              stroke=""
              fill=""
              strokeWidth={3}
            />
          </button>
          <button
            disabled={disabled}
            data-enabled={!disabled}
            className={BUTTON_CLS}
            onClick={() => {
              _onNumChanged(_numValue - inc)
            }}
          >
            <ChevronRightIcon
              className="rotate-90 mb-1"
              w="w-3"
              stroke=""
              strokeWidth={3}
              fill=""
            />
          </button>
        </BaseCol>
      }
    />
  )
}
