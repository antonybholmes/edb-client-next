import { useMouseMoveListener } from '@/hooks/mousemove-listener'
import { useMouseUpListener } from '@/hooks/mouseup-listener'
import { TRANS_COLOR_CLS } from '@/theme'
import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import {
  Children,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { BaseCol } from '../layout/base-col'
import { STICKY_SENSITIVITY } from './h-split-pane'

interface IProps extends IDivProps {
  //panels: ReactElement[]
  p?: number
  limits?: [number, number]
  hideTriggers?: [number, number]
  hideLimits?: [number, number]
  keyInc?: number
  sticky?: number[]
}

export function VSplitPane({
  p = 0.8,
  limits = [0.1, 0.9],
  hideTriggers = [0.05, 0.95],
  hideLimits = [0, 1],
  keyInc = 0.05,
  sticky = [0.2, 0.8],
  className,
  children,
}: IProps) {
  const dragging = useRef<{ y: number; h: number; p: number } | null>(null)
  const [isDrag, setIsDrag] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const refC1 = useRef<HTMLDivElement>(null)
  const refC2 = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState(false)
  const id = useId()

  const panels = Children.toArray(children)

  useEffect(() => {
    moveByFraction(p)
  }, [p])

  function move(y: number) {
    if (!dragging.current || !ref.current) {
      return
    }

    const rect = ref.current.getBoundingClientRect()

    let cp = y / rect.height
    //const ydiff = y - dragging.current.y
    //const ydiffp = ydiff / rect.height
    //const p = dragging.current.p + ydiffp

    //console.log(y, cp, dragging.current.p, rect.height)

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
      move(e.pageY - ref.current.getBoundingClientRect().top)
    }

    e.preventDefault()
    //e.stopPropagation()
  }

  function onMouseDown(e: { pageY: number; preventDefault: () => void }) {
    if (refC1.current && ref.current) {
      //previousClientX.current = e.clientX
      dragging.current = {
        y: e.pageY - ref.current.getBoundingClientRect().top,
        h: refC1.current.clientHeight,
        p: parseFloat(refC1.current.style.flexGrow) / 100,
      }

      setIsDrag(true)
    }

    e.preventDefault()
  }

  function onMouseUp() {
    dragging.current = null
    setIsDrag(false)
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

  if (panels.length < 2) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden grow',
        [isDrag, 'cursor-ns-resize'],
        className
      )}
    >
      <div
        ref={refC1}
        id="top-pane"
        className="flex min-h-0 shrink basis-0 flex-col overflow-hidden"
        //style={{ flexGrow: p }}
      >
        {panels[0]}
      </div>
      <BaseCol
        id={`hitbox-v-${id}`}
        className={cn(
          TRANS_COLOR_CLS,
          'group m-1  shrink-0 grow-0 cursor-ns-resize justify-center p-1 outline-hidden'
        )}
        onMouseDown={onMouseDown}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(true)}
        onKeyDown={onKeyDown}
        data-is-drag={isDrag}
        tabIndex={0}
      >
        <div
          id="divider"
          className="pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring data-[is-drag=true]:bg-ring h-[2px] trans-color grow"
          data-is-drag={isDrag}
        />
      </BaseCol>
      <div
        id="bottom-pane"
        ref={refC2}
        className="flex min-h-0 shrink basis-0 flex-col overflow-hidden"
        //style={{ flexGrow: 100 - p }}
      >
        {panels[1]}
      </div>
    </div>
  )
}
