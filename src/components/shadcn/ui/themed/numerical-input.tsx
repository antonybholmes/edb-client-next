import { TriangleRightIcon } from '@/components/icons/triangle-right-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { useDebounce } from '@/hooks/debounce'
import { clamp } from '@/lib/math/clamp'
import { useEffect, useRef, useState } from 'react'
import { Input, type IInputProps } from './v2/input'

const BUTTON_CLS = `w-4 flex h-4 flex-row justify-center items-center
  data-[enabled=true]:stroke-foreground data-[enabled=false]:stroke-foreground/50 
  data-[enabled=true]:fill-foreground data-[enabled=false]:fill-foreground/50 
  data-[enabled=true]:hover:fill-theme data-[enabled=true]:focus-visible:fill-theme 
  data-[enabled=true]:hover:stroke-theme data-[enabled=true]:focus-visible:stroke-theme
  outline-hidden trans-color`

const UPDATE_INTERVAL_MS = 150

export interface INumericalInputProps extends Omit<IInputProps, 'value'> {
  value: number
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

  delay?: number
}

export function NumericalInput({
  id,
  name,
  value = 0,
  limit,
  step = 1,
  dp = 0,
  placeholder,
  onNumChange,
  onNumChanged,
  disabled,
  w = 'xxs',
  variant = 'default',
  delay = UPDATE_INTERVAL_MS,
  className = '',
}: INumericalInputProps) {
  //const _id = id ?? useStableId('numerical-input')

  //const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // To allow ui to respond to spinner buttons without waiting for debounce,
  // we keep an internal value that updates immediately as user types or clicks
  // spinner, and then debounce the updates to the outside
  const numValue = useRef<number>(value)

  const [textValue, setTextValue] = useState<string>(value.toFixed(dp))

  //const [numValue, setNumValue] = useState<number>(value)

  // debounce the text value, so we don't call onNumChange too frequently as user types
  const debouncedTextValue = useDebounce(textValue, {
    delayMs: 500,
  })

  // const debouncedNumValue = useDebounce(numValue, {
  //   delayMs: 500,
  //   fn: v => _clampValue(v),
  // })

  // user provides a new value, we update the internal value immediately
  useEffect(() => {
    const v = _clampValue(value)
    setTextValue(v.toFixed(dp))
    numValue.current = v
  }, [value])

  // the internal number value is clamped to the limit
  //const _n = useRef(Number(value) || limit?.[0] || 0)

  useEffect(() => {
    _onChange(debouncedTextValue, 'change')
  }, [debouncedTextValue])

  // useEffect(() => {
  //   onNumChange?.(debouncedNumValue)
  //   onNumChanged?.(debouncedNumValue)
  // }, [debouncedNumValue])

  function _clampValue(v: number): number {
    if (limit?.length === 2) {
      v = clamp(v, limit[0], limit[1])
    }

    return v
  }

  function _onChange(text: string, mode: 'change' | 'changed') {
    // remove commas for thousands separators, since they interfere with parsing
    let v = Number(text.replaceAll(',', ''))

    if (Number.isNaN(v)) {
      return
    }

    v = _clampValue(v)

    if (v === value) {
      // if value hasn't changed, do nothing
      return
    }

    numValue.current = v

    setTextValue(v.toFixed(dp))

    onNumChange?.(v)

    if (mode === 'changed') {
      onNumChanged?.(v)
    }

    // setValue(text)

    // // Clear the previous timeout
    // if (timeoutRef.current) {
    //   clearTimeout(timeoutRef.current)
    // }

    // // Set a new timeout to format after delay
    // timeoutRef.current = setTimeout(() => {
    //   let v = Number(text)

    //   if (!Number.isNaN(v)) {
    //     v = _clampValue(v)
    //     _n.current = v

    //     onNumChange?.(v)
    //   }
    // }, delay)

    // also call more realtime update, just in case
    //onNumChange?.(_getValue(v))
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
    setTextValue(numValue.current.toFixed(dp))
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

  //console.log('_value', _value)

  return (
    <Input
      id={id}
      name={name}
      value={textValue}
      type="number"
      step={step}
      min={limit?.length === 2 ? limit[0] : undefined}
      max={limit?.length === 2 ? limit[1] : undefined}
      disabled={disabled}
      w={w}
      className={className}
      variant={variant}
      inputCls="text-right"
      onKeyDown={e => {
        //console.log(e)
        if (e.key === 'Enter') {
          //const v = Number(e.currentTarget.value)

          // only called when user presses enter,
          // this is for when you don't want to respond
          // on every change, (e.g. it taxes the ui to keep
          // redrawing quickly, so only respond once user
          // has made a final choice
          //if (!Number.isNaN(v)) {
          _onChange(e.currentTarget.value, 'changed') //onNumChanged?.(Math.min(limit[1], Math.max(limit[0], v)))
          //}
        }

        // else {
        //   // respond to arrow keys when ctrl pressed
        //   if (e.ctrlKey) {
        //     switch (e.key) {
        //       case 'ArrowUp':
        //       case 'ArrowRight':
        //         console.log('up')
        //         _onNumChanged(_n.current + step)
        //         break
        //       case 'ArrowDown':
        //       case 'ArrowLeft':
        //         _onNumChanged(_n.current - step)
        //         break
        //       default:
        //         break
        //     }
        //   }
        // }
      }}
      // onKeyUp={e => {
      //   switch (e.key) {
      //     case 'ArrowUp':
      //     case 'ArrowRight':
      //     case 'ArrowDown':
      //     case 'ArrowLeft':
      //       // trigger event when arrow key is released
      //       // the numerical input triggers updates automatically
      //       // but we want to notify that the user has finished changing
      //       // since some components do not listen for every change
      //       // and instead are designed to respond once user has finished
      //       _onNumChanged(_n.current)
      //       break
      //     default:
      //       break
      //   }
      // }}
      onTextChange={setTextValue}
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
            onKeyDown={e => handleKeyDown(e, step)}
            onKeyUp={handleKeyUp}
            aria-label="Increase value"
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
            aria-label="Decrease value"
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
