import { TRANS_COLOR_CLS } from '@/theme'
import { useMouseMoveListener } from '@hooks/use-mousemove-listener'
import { useMouseUpListener } from '@hooks/use-mouseup-listener'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

interface IProps extends IElementProps {
  panels: ReactElement[]
  p?: number
  limits?: [number, number]
  hideTriggers?: [number, number]
  hideLimits?: [number, number]
  keyInc?: number
  sticky?: number[]
}

export const ROW_CLS = 'flex flex-row min-w-0'
export const STICKY_SENSITIVITY = 0.02

export function HSplitPane({
  panels,
  p = 0.8,
  limits = [0.1, 0.85],
  hideTriggers = [0.05, 0.9],
  hideLimits = [0, 1],
  keyInc = 0.05,
  sticky = [0.2, 0.8],
  className,
}: IProps) {
  const dragging = useRef<{ x: number; w: number; p: number } | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const refC1 = useRef<HTMLDivElement>(null)
  const refC2 = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState(false)
  const id = useId()

  useEffect(() => {
    moveByFraction(p)
  }, [p])

  function move(x: number) {
    if (!dragging.current || !ref.current) {
      return
    }

    const rect = ref.current.getBoundingClientRect()

    let cp = x / rect.width
    //const xdiff = x - dragging.current.x
    //const xdiffp = xdiff / rect.width
    //const p = dragging.current.p + xdiffp

    //console.log(x, p, cp, dragging.current.p)

    const rcp = sticky.filter((x) => Math.abs(cp - x) < STICKY_SENSITIVITY)

    if (rcp.length > 0) {
      cp = rcp[0]!
    }

    cp =
      hideTriggers[0] !== -1 && cp < hideTriggers[0]
        ? hideLimits[0]
        : Math.max(cp, limits[0])

    cp =
      hideTriggers[1] !== -1 && cp > hideTriggers[1]
        ? hideLimits[1]
        : Math.min(cp, limits[1])

    moveByFraction(cp)
  }

  function moveByFractionWithinLimits(p: number) {
    moveByFraction(Math.max(limits[0], Math.min(limits[1], p)))
  }

  function moveByFraction(p: number) {
    p = Math.max(0, Math.min(1, p))

    const flex = p * 100

    if (refC1.current) {
      refC1.current.style.flexGrow = flex.toString() //`${change * 100}%`
    }

    if (refC2.current) {
      refC2.current.style.flexGrow = (100 - flex).toString() //`${change * 100}%`
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (ref.current) {
      move(e.pageX - ref.current.getBoundingClientRect().left)
    }

    e.preventDefault()
    //e.stopPropagation()
  }

  function onMouseDown(e: { pageX: number; preventDefault: () => void }) {
    if (refC1.current && ref.current) {
      //previousClientX.current = e.clientX
      dragging.current = {
        x: e.pageX - ref.current.getBoundingClientRect().left,
        w: refC1.current.clientWidth,
        p: parseFloat(refC1.current.style.flexGrow) / 100,
      }

      setIsDragging(true)
    }

    e.preventDefault()
  }

  function onMouseUp() {
    dragging.current = null
    setIsDragging(false)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    //console.log(e.code)

    if (!focus) {
      return
    }

    const p = parseInt(refC1.current?.style.flexGrow ?? '0') / 100

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        moveByFractionWithinLimits(p - keyInc)
        break
      case 'ArrowRight':
      case 'ArrowDown':
        moveByFractionWithinLimits(p + keyInc)
        break
    }
  }

  useMouseMoveListener((e) => onMouseMove(e as MouseEvent))
  useMouseUpListener(onMouseUp)

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-row overflow-hidden',
        [isDragging, 'cursor-ew-resize'],
        className
      )}
    >
      <div
        ref={refC1}
        id="left-pane"
        className="flex min-w-0 shrink basis-0 flex-col overflow-hidden"
        //style={{ flexGrow: initSplit }}
      >
        {panels[0]}
      </div>
      <div
        id={`hitbox-h-${id}`}
        className={cn(
          TRANS_COLOR_CLS,
          'group m-1 flex shrink-0 grow-0 cursor-ew-resize flex-row items-center justify-center rounded-full p-1 outline-none hover:bg-ring/20 focus-visible:bg-ring/20',
          [isDragging, 'bg-ring/20']
        )}
        onMouseDown={onMouseDown}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(true)}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div
          id="divider"
          className={cn(
            TRANS_COLOR_CLS,
            'pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring',
            [isDragging, 'bg-ring']
          )}
          style={{ width: 1 }}
        />
      </div>
      <div
        id="right-pane"
        ref={refC2}
        className="flex min-w-0 shrink basis-0 flex-col overflow-hidden"
        //style={{ flexGrow: 100 - initSplit }}
      >
        {panels[1]}
      </div>
    </div>
  )
}
