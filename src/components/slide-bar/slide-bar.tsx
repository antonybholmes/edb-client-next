import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react'

import { H2_CLS } from '@/theme'
import { cn } from '@lib/class-names'

import { BaseCol } from '@/components/layout/base-col'

import { type IButtonProps } from '@components/shadcn/ui/themed/button'

import { ANIMATION_DURATION_S } from '@/consts'
import type { IChildrenProps } from '@interfaces/children-props'
import type { IElementProps } from '@interfaces/element-props'
import type { IPos } from '@interfaces/pos'
import { motion } from 'motion/react'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { HCenterRow } from '../layout/h-center-row'
import { VCenterRow } from '../layout/v-center-row'
import { Button } from '../shadcn/ui/themed/button'
import {
  SlidebarContext,
  SlidebarProvider,
  type ISlidebarContext,
} from './slide-bar-provider'

const KEY_STEP = 5

const H_DIV_BOX_CLS =
  'group hidden sm:flex shrink-0 grow-0 cursor-ew-resize flex-row items-center justify-center rounded-full px-2 outline-none overflow-hidden'

const H_LINE_CLS =
  'pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring h-full rounded-full trans-color w-[2px] shrink-0'

const V_DIV_BOX_CLS =
  'group flex flex-col sm:hidden shrink-0 grow-0 cursor-ns-resize items-center justify-center rounded-full py-2 outline-none'

const V_LINE_CLS =
  'pointer-events-none group-hover:bg-ring group-focus-visible:bg-ring w-full rounded-full trans-color h-[2px] shrink-0'

type DragDirType = 'h' | 'v' | ''

export function CloseButton({ className, ...props }: IButtonProps) {
  return (
    <Button
      variant="muted"
      multiProps="icon-sm"
      rounded="theme"
      className={cn('shrink-0', className)}
      ripple={false}
      title="Hide sidebar"
      {...props}
    >
      <ChevronRightIcon />
    </Button>
  )
}

export function SlideBarMain(props: IChildrenProps) {
  return <>{props.children}</>
}

export function SlideBarSide(props: IChildrenProps) {
  return <>{props.children}</>
}

interface ISlideBarProps extends ISlidebarContext, IElementProps {
  title?: string
  side?: 'Left' | 'Right'
  position: number
  limits: [number, number]
}

export const SlideBar = forwardRef(function SlideBar(
  {
    title = '',
    side = 'Left',
    open = true,
    onOpenChange = () => {},
    position = 80,
    limits = [5, 85],
    mainContent,
    sideContent,
    children,
  }: ISlideBarProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  //const c = Children.toArray(children)

  //let mainContent:ReactNode
  //let sideContent:ReactNode
  //let content:ReactNode[] = [];

  // Children.forEach(children,  (child:ReactNode)=> {
  //   console.log(child?.type)
  //   if (!isValidElement(child)) return;
  //   if (child.type === SlideBarMain) {
  //     mainContent = child;
  //   } else if (child.type === SlideBarSide) {
  //     sideContent = child;
  //   } else {
  //     content.push(child);
  //   }
  // })

  return (
    <SlidebarProvider
      title={title}
      side={side}
      open={open}
      position={position}
      limits={limits}
      onOpenChange={onOpenChange}
      mainContent={mainContent}
      sideContent={sideContent}
    >
      {children}
    </SlidebarProvider>
  )
})

interface ISlideBarContentProps extends IElementProps {
  lineClassName?: string
}

interface IDrag {
  pos: IPos
  divPos: IPos
  dir: DragDirType
}
const NO_DRAG: IDrag = {
  pos: { x: -1, y: -1 },
  divPos: { x: -1, y: -1 },
  dir: '',
}

export const SlideBarContent = forwardRef(function SlideBarContent(
  { lineClassName, className, ...props }: ISlideBarContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  //const firstUpdate = useRef(true)
  //const _value = value ?? tabs[0].name // getTabValue(value, tabs)

  const innerRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => innerRef.current!, [])

  const contentRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const hHitBoxRef = useRef<HTMLDivElement>(null)
  const vHitBoxRef = useRef<HTMLDivElement>(null)
  const sidebarContentRef = useRef<HTMLDivElement>(null)

  const {
    title,
    side,
    open,
    onOpenChange,
    position,
    limits,
    mainContent,
    sideContent,
  } = useContext(SlidebarContext)

  //const [focus, setFocus] = useState(false)
  const [dragState, setDragState] = useState<IDrag>({ ...NO_DRAG })
  const [showAnimation, setShowAnimation] = useState(true)
  const [divPos, setDivPos] = useState(position)
  const [flexPos, setFlexPos] = useState(
    open ? position : side === 'Right' ? 100 : 0
  )

  function onMouseDown(e: MouseEvent | React.MouseEvent, dir: DragDirType) {
    e.preventDefault()
    e.stopPropagation()

    const divRect =
      dir === 'v'
        ? vHitBoxRef.current!.getBoundingClientRect()
        : hHitBoxRef.current!.getBoundingClientRect()

    setDragState({
      pos: { x: e.pageX, y: e.pageY },
      divPos: {
        x: divRect.left + (side === 'Left' ? divRect.width : 0),
        y: divRect.top + (side === 'Left' ? divRect.height : 0),
      },
      dir,
    })

    setShowAnimation(false)
  }

  function _onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!focus) {
      return
    }

    setShowAnimation(false)

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        setDivPos(Math.max(limits[0], divPos - KEY_STEP))
        break
      case 'ArrowRight':
      case 'ArrowDown':
        setDivPos(Math.min(limits[1], divPos + KEY_STEP))
        break
    }
  }

  function _onkeyUp() {
    setShowAnimation(true)
  }

  function setNormDivPos(p: number) {
    p = Math.max(limits[0], Math.min(limits[1], p))
    setDivPos(p)
  }

  // set initial position on render
  useEffect(() => {
    setNormDivPos(position)
  }, [position])

  useEffect(() => {
    setFlexPos(open ? divPos : side === 'Right' ? 100 : 0)
  }, [divPos, open])

  useEffect(() => {
    function onMouseUp() {
      setDragState({ ...NO_DRAG })
      setShowAnimation(true)
    }

    function onMouseMove(e: MouseEvent) {
      if (!innerRef.current || !hHitBoxRef.current || dragState.dir === '') {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      const clientRect = innerRef.current.getBoundingClientRect()

      if (dragState.dir === 'v') {
        //const bw = side == 'Right' ? divRect.height : -divRect.height
        const dy = e.pageY - dragState.pos.y

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((dragState.divPos.y + dy - clientRect.top) / clientRect.height) *
              100
          )
        )

        setNormDivPos(p)
      } else {
        // h
        const dx = e.pageX - dragState.pos.x

        //const bw = side == 'Right' ? -divRect.width * 0.5 : divRect.width * 0.5

        const p = Math.max(
          limits[0],
          Math.min(
            limits[1],
            ((dragState.divPos.x + dx - clientRect.left) / clientRect.width) *
              100
          )
        )

        setNormDivPos(p)
      }
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [dragState])

  const duration = showAnimation ? ANIMATION_DURATION_S : 0

  return (
    <div
      ref={innerRef}
      className={cn(
        'flex flex-col sm:flex-row grow min-h-0 h-full overflow-hidden data-drag-[dir=h]:cursor-ew-resize data-drag-[dir=v]:cursor-ns-resize',
        className
      )}
      data-drag-dir={dragState.dir}
      {...props}
    >
      {side === 'Right' && (
        <motion.div
          initial={false}
          layout
          transition={{ type: 'easeInOut', duration }}
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden flex flex-col"
          animate={{ flexGrow: flexPos }}
        >
          {mainContent && mainContent}
        </motion.div>
      )}

      <motion.div
        initial={false}
        layout
        transition={{ type: 'easeInOut', duration }}
        id="side-pane"
        ref={sidebarRef}
        className="flex flex-col sm:flex-row min-h-0 min-w-0 basis-0 overflow-hidden"
        animate={{
          flexGrow: side === 'Right' ? 100 - flexPos : flexPos,
          opacity: open ? 1 : 0,
        }}
      >
        <div
          ref={sidebarContentRef}
          className="flex flex-col sm:flex-row grow min-h-0 overflow-hidden"
        >
          {side === 'Right' && (
            <>
              <div
                id="divider-hitbox"
                ref={hHitBoxRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseDown(e, 'h')}
                onClick={() => {
                  hHitBoxRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={_onKeyDown}
                onKeyUp={_onkeyUp}
                tabIndex={0}
              >
                <div
                  className={cn(
                    H_LINE_CLS,
                    [dragState.dir !== '', 'bg-ring'],
                    lineClassName
                  )}
                />
              </div>

              <div
                id="divider-hitbox"
                ref={vHitBoxRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseDown(e, 'v')}
                onClick={() => {
                  vHitBoxRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={_onKeyDown}
                onKeyUp={_onkeyUp}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [dragState.dir !== '', 'bg-ring'])}
                />
              </div>
            </>
          )}

          <BaseCol
            className="gap-y-1 grow overflow-hidden data-[drag=true]:pointer-events-none"
            data-drag={dragState.dir !== ''}
          >
            {title && (
              <VCenterRow className="justify-between pr-1">
                <h2 className={H2_CLS}>{title}</h2>
                <CloseButton onClick={() => onOpenChange?.(false)} />
              </VCenterRow>
            )}

            {sideContent && sideContent}
          </BaseCol>

          {side === 'Left' && (
            <>
              <HCenterRow
                id="divider-hitbox"
                ref={hHitBoxRef}
                className={H_DIV_BOX_CLS}
                onMouseDown={e => onMouseDown(e, 'h')}
                onClick={() => {
                  hHitBoxRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={_onKeyDown}
                onKeyUp={_onkeyUp}
                tabIndex={0}
              >
                <div
                  className={cn(
                    H_LINE_CLS,
                    [dragState.dir !== '', 'bg-ring'],
                    lineClassName
                  )}
                />
              </HCenterRow>

              <div
                id="divider-hitbox"
                ref={vHitBoxRef}
                className={V_DIV_BOX_CLS}
                onMouseDown={e => onMouseDown(e, 'v')}
                onClick={() => {
                  vHitBoxRef.current!.focus()
                }}
                //onFocus={() => setFocus(true)}
                //onBlur={() => setFocus(false)}
                onKeyDown={_onKeyDown}
                onKeyUp={_onkeyUp}
                tabIndex={0}
              >
                <div
                  className={cn(V_LINE_CLS, [dragState.dir !== '', 'bg-ring'])}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {side === 'Left' && (
        <motion.div
          initial={false}
          layout
          ref={contentRef}
          id="center-pane"
          className="min-w-0 basis-0 overflow-hidden"
          animate={{ flexGrow: 100 - flexPos }}
          transition={{ type: 'easeInOut', duration }}
        >
          {mainContent && mainContent}
        </motion.div>
      )}
    </div>
  )
})
