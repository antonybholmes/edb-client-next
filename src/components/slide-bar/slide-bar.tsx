import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { H2_CLS } from '@/theme'

import { BaseCol } from '@layout/base-col'

import { type IButtonProps } from '@themed/button'

import { ANIMATION_DURATION_S } from '@/consts'
import type { IDivProps } from '@interfaces/div-props'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { VCenterRow } from '../layout/v-center-row'

import { useResizeObserver } from '@/hooks/resize-observer'
import { TAILWIND_MEDIA_SM, useWindowSize } from '@/hooks/window-size'
import { cn } from '@lib/shadcn-utils'
import gsap from 'gsap'

import type { ILim } from '@/lib/math/math'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import { HANDLE_CLS, InnerHandle } from '../shadcn/ui/themed/resizable'
import type { LeftRightPos } from '../side'

export const KEY_STEP = 5

// The smallest size in px that the sidebar can be
// resized to by the user
const MIN_SIZE_PX = 16

const CONTAINER_CLS = `flex data-[drag-dir=horizontal]:flex-row data-[drag-dir=vertical]:flex-col grow overflow-hidden
  data-[drag=horizontal]:cursor-ew-resize data-[drag=vertical]:cursor-ns-resize`

export function CloseButton({ className, ...props }: IButtonProps) {
  return (
    <IconButton
      className={cn('shrink-0', className)}
      size="icon-xs"
      //rounded="full"
      title="Hide Pane"
      {...props}
    >
      <ChevronRightIcon />
    </IconButton>
  )
}

interface ISlideBarStore {
  p: number
  //flexBasis: number
  mode: 'auto' | 'fixed'
}

export interface ISlideBarProps extends IDivProps {
  title?: string
  side?: LeftRightPos
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialPosition?: number
  cachePosition?: boolean
  limits?: ILim
  hideLimit?: number
  mainContent?: ReactNode
  sideContent?: ReactNode
}

export function SlideBar({
  title = '',
  side = 'left',
  open = true,
  onOpenChange = () => {},
  initialPosition = 80,
  limits = [5, 85],
  hideLimit = 2,
  className,
  children,
  ...props
}: ISlideBarProps) {
  // const [divOffset, setDivOffsetFromEdge] = cachePosition
  //   ? useSessionAtom<ISlideBarStore>(`slidebar:${id}`, {
  //       p: -1,
  //       mode: 'auto',
  //     })
  //   : useState<ISlideBarStore>({ p: -1, mode: 'auto' })

  const [divOffset, setDivOffsetFromEdge] = useState<ISlideBarStore>({
    p: -1,
    mode: 'auto',
  })

  //console.log('id', id, divOffset)

  //const isFixed = useRef(false) // false = percent mode

  // we need to track when use starts messing around with ui
  const initialOpen = useRef(open)

  // remains true until we detect user doing something
  const isInitial = useRef(true)

  // the position of the div in the ui considering if the side is open or closed.
  const [flexBasis, setFlexBasis] = useState(0)

  const c = Children.toArray(children)

  const mainContent = c[0]
  const sideContent = c[1]

  const containerRef = useRef<HTMLDivElement>(null)

  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const hHitBoxRef = useRef<HTMLDivElement>(null)
  //const vHitBoxRef = useRef<HTMLDivElement>(null)
  const sidebarContentRef = useRef<HTMLDivElement>(null)

  //const initial = useRef(true)

  const [dragDir, setDragDir] = useState<'horizontal' | 'vertical' | ''>('')
  // const {
  //   title,
  //   side,
  //   open,
  //   onOpenChange,
  //   position,
  //   limits,
  //   hideLimit,
  //   mainContent,
  //   sideContent,
  // } = useContext(SlidebarContext)

  //const [dragState, setDragState] = useState<IDrag>({ ...NO_DRAG })
  //const [showAnimation, setShowAnimation] = useState(true)
  const showAnimation = useRef(0)

  const wSize = useWindowSize()

  //const [cachedOffset, setCachedOffset] = useStorageAtom(`slidebar:${id}`, -1)

  const mode = useMemo(() => {
    if (wSize.w < TAILWIND_MEDIA_SM) {
      return 'vertical'
    } else {
      return 'horizontal'
    }
  }, [wSize])

  function onMouseDown(e: MouseEvent | React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    isInitial.current = false

    if (!containerRef.current) {
      return
    }

    //const divRect = vHitBoxRef.current!.getBoundingClientRect()

    //const clientRect = containerRef.current.getBoundingClientRect()

    const dragState = {
      pos: { x: e.pageX, y: e.pageY },
      flexBasis,
    }

    //setShowAnimation(false)
    showAnimation.current = 0

    function onMouseUp() {
      e.preventDefault()
      e.stopPropagation()

      //setShowAnimation(true)
      //showAnimation.current = ANIMATION_DURATION_S

      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)

      setDragDir('')
    }

    function onMouseMove(e: MouseEvent) {
      e.preventDefault()
      e.stopPropagation()

      if (!containerRef.current) {
        return
      }

      //const clientRect = containerRef.current.getBoundingClientRect()

      //const bw = side == 'right' ? divRect.width : -divRect.width
      const dx =
        mode === 'horizontal'
          ? e.pageX - dragState.pos.x
          : e.pageY - dragState.pos.y

      //console.log('dragging h', dx)

      //const p =
      //  ((dragState.divPos.y + dy - clientRect.top) / clientRect.width) * 100

      const p =
        side === 'left' ? dragState.flexBasis + dx : dragState.flexBasis - dx

      // once user starts dragging, we want to
      // set the position to be fixed, so that
      // it does not jump around when the window resizes
      //isFixed.current = true
      setDragDir(mode)
      _setDivOffsetFromEdge(divOffset, p, 'fixed')
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function _onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()

    isInitial.current = false

    if (!focus || !containerRef.current) {
      return
    }

    const clientRect = containerRef.current.getBoundingClientRect()

    const step =
      ((mode === 'horizontal' ? clientRect.width : clientRect.height) *
        KEY_STEP) /
      100

    //setShowAnimation(false)
    showAnimation.current = 0

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        _setDivOffsetFromEdge(
          divOffset,
          divOffset.p - (side === 'left' ? step : -step),
          'fixed',
          false
        )
        break
      case 'ArrowRight':
      case 'ArrowDown':
        _setDivOffsetFromEdge(
          divOffset,
          divOffset.p + (side === 'left' ? step : -step),
          'fixed',
          false
        )
        break
    }

    // once user starts dragging, we want to
    // set the position to be fixed, so that
    // it does not jump around when the window resizes
    //isFixed.current = true
  }

  function _onkeyUp(e: KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()

    //setShowAnimation(true)
    //showAnimation.current = ANIMATION_DURATION_S
  }

  /**
   * Set where the divider is positioned in the container
   * This sets the divider position and caches the position
   * so that if the sidebar is closed and opened again, the
   * original position is restored.
   *
   * @param offset             position in the container as pixels
   * @param allowHiding   whether to allow hiding the sidebar
   *                      when dragging to edges of screen
   * @returns
   */
  function _setDivOffsetFromEdge(
    divOffset: ISlideBarStore,
    offset: number,
    resizeMode: 'auto' | 'fixed',
    allowHiding = true
  ) {
    if (!containerRef.current) {
      return
    }

    const clientRect = containerRef.current.getBoundingClientRect()

    const w = mode === 'horizontal' ? clientRect.width : clientRect.height

    // since we specify position as the offset from the left or right edge,
    // we need to convert it to the offset from the left edge
    // depending on the side
    let p = offset //side === 'left' ? offset : w - offset

    const x1 = w * (limits![0] / 100)
    const x2 = w * (limits![1] / 100)

    // If user drags to the edge of the screen, we want to
    // hide the sidebar. This is useful for small screens
    // where the sidebar is not needed. This is only done
    // when the sidebar is not fixed, i.e. when the user
    // is dragging the sidebar to resize it.
    // This is done by checking if the position is less than
    // the hide limit. If it is, we set the position to the
    // hide limit. This is done to prevent the sidebar from
    // jumping around when the user is dragging it

    //console.log('hiding', p, x1, w - x2, side === 'left' ? x1 : w - x2)

    if (allowHiding && p <= (side === 'left' ? x1 : w - x2) / 2) {
      p = MIN_SIZE_PX //(w * (100 - hideLimit!)) / 100
    } else {
      if (side === 'left') {
        p = Math.max(x1, Math.min(x2, p))
      } else {
        p = Math.max(w - x2, Math.min(w - x1, p))
      }
    }

    //Cache the position so that when the sidebar is closed
    //it can be opened at the same position
    // if (isFixed.current && cachePosition) {
    //   setCachedOffset(p)
    // }

    // need to be careful when updating atom that we only
    // do so when a primitive value changes, otherwise
    // it can trigger too many renders dues to reacts poor
    // handling of object equality
    if (p !== divOffset.p || resizeMode !== divOffset.mode) {
      setDivOffsetFromEdge({ p, mode: resizeMode })
    }
  }

  function _setFlexPos(p: number) {
    if (!containerRef.current || p === flexBasis) {
      return
    }

    const clientRect = containerRef.current.getBoundingClientRect()

    const w = mode === 'horizontal' ? clientRect.width : clientRect.height

    p = Math.max(0, Math.min(w, p))

    setFlexBasis(p)
  }

  // set initial position on render
  // useEffect(() => {
  //   if (cachedOffset !== -1) {
  //     _setDivOffsetFromEdge(cachedOffset)
  //   }
  // }, [cachedOffset])

  // must only change when open changes
  useEffect(() => {
    if (open !== initialOpen.current) {
      isInitial.current = false
    }

    if (!isInitial.current) {
      showAnimation.current = ANIMATION_DURATION_S
    }
  }, [open])

  // can change when either open or divOffset.p changes
  useEffect(() => {
    // We always show in the closed position.
    // For open, we only do so once the ui is
    // in user mode, otherwise we defer to other
    // UI pieces to determine how to to display
    // the flex pos. This is so this effect does
    // not intefer with the resize observer.

    const p = open ? divOffset.p : 0

    _setFlexPos(p)
  }, [open, divOffset.p])

  useEffect(() => {
    if (showAnimation.current > 0) {
      gsap.to(sidebarRef.current, {
        flexBasis: flexBasis,
        duration: showAnimation.current,
        //ease: 'power1.inOut',
      })
    } else {
      gsap.set(sidebarRef.current, {
        flexBasis: flexBasis,
      })
    }
  }, [flexBasis])

  useEffect(() => {
    if (!containerRef || !containerRef.current || divOffset.mode === 'fixed') {
      return
    }

    const observer = new ResizeObserver(() => {
      // in auto mode, resize side bars based on percentage of component width/height
      if (!containerRef.current) {
        return
      }

      const clientRect = containerRef.current.getBoundingClientRect()

      //console.log('resize', isFixed.current, cachedOffset)

      const w = mode === 'horizontal' ? clientRect.width : clientRect.height
      let newPx = (w * initialPosition) / 100

      if (side === 'right') {
        newPx = w - newPx
      }

      _setDivOffsetFromEdge(divOffset, newPx, 'auto')
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [divOffset.mode])

  useResizeObserver<HTMLDivElement>(containerRef, (target) => {
    if (divOffset.mode === 'fixed') {
      return
    }

    const clientRect = target.getBoundingClientRect()

    //console.log('resize', isFixed.current, cachedOffset)

    const w = mode === 'horizontal' ? clientRect.width : clientRect.height
    let newPx = (w * initialPosition) / 100

    if (side === 'right') {
      newPx = w - newPx
    }

    _setDivOffsetFromEdge(divOffset, newPx, 'auto')
  })

  function mainPanel() {
    return (
      <div
        ref={contentRef}
        id="center-pane"
        className="overflow-hidden flex flex-col grow"
        //animate={{ height: flexPos.p }}
      >
        {mainContent && mainContent}
      </div>
    )
  }

  function hitbox() {
    return (
      <div
        id="divider-hitbox"
        ref={hHitBoxRef}
        className={HANDLE_CLS}
        onMouseDown={(e) => onMouseDown(e)}
        onClick={() => {
          hHitBoxRef.current!.focus()
        }}
        onKeyDown={_onKeyDown}
        onKeyUp={_onkeyUp}
        tabIndex={0}
        data-drag-dir={mode}
        data-resize-handle-state={dragDir !== '' ? 'drag' : ''}
      >
        <InnerHandle />
      </div>
    )
  }

  function sideContentPanel() {
    return (
      <BaseCol
        ref={sidebarContentRef}
        className="gap-x-1 overflow-hidden data-[drag=true]:pointer-events-none grow"
        data-drag={dragDir !== ''}
      >
        {title && (
          <VCenterRow className="justify-between pr-1">
            <h2 className={H2_CLS}>{title}</h2>
            <CloseButton onClick={() => onOpenChange?.(false)} />
          </VCenterRow>
        )}

        {sideContent && sideContent}
      </BaseCol>
    )
  }

  function leftView() {
    return (
      <>
        <div
          id="side-pane"
          ref={sidebarRef}
          className="flex data-[drag-dir=horizontal]:flex-row data-[drag-dir=vertical]:flex-col overflow-hidden"
          data-drag-dir={mode}
        >
          {sideContentPanel()}

          {hitbox()}
        </div>

        {mainPanel()}
      </>
    )
  }

  function rightView() {
    return (
      <>
        {mainPanel()}

        <div
          id="side-pane"
          ref={sidebarRef}
          className="flex data-[drag-dir=horizontal]:flex-row data-[drag-dir=vertical]:flex-col overflow-hidden"
          //style={{ flexBasis: `${flexBasis}px` }}
          data-drag-dir={mode}
        >
          {hitbox()}

          {sideContentPanel()}
        </div>
      </>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(CONTAINER_CLS, className)}
      data-drag-dir={mode}
      data-drag={dragDir}
      {...props}
    >
      {side === 'left' ? leftView() : rightView()}
    </div>
  )
}
