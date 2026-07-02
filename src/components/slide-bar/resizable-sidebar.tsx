import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { TAILWIND_MEDIA_SM, useWindowSize } from '@/hooks/window-size'

import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { useHydration } from '@/stores/hydration'
import { createPortal } from 'react-dom'
import { usePanelRef } from 'react-resizable-panels'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { PropsPanel } from '../props-panel'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinHResizeHandle,
  ThinVResizeHandle,
} from '../shadcn/ui/themed/resizable'
import type { IButtonProps } from '../shadcn/ui/themed/v2/button'
import type { LeftRightPos } from '../side'

import { OPTS_SIDEBAR_ID } from '../tabs/tab-provider'
import { useSlideBar, useSlideBarStore } from './slide-bar-store'

export function CloseButton({ className, ...props }: IButtonProps) {
  return (
    <IconButton
      className={cn('shrink-0', className)}
      size="icon-sm"
      //rounded="full"
      title="Hide Pane"
      {...props}
    >
      <ChevronRightIcon />
    </IconButton>
  )
}

interface IResizableSidebarContext {
  id: string
  //left: ITab | undefined
  //center: ITab | undefined
  //right: ITab | undefined
  //set: (slot: Slot, entry: ITab) => void
}
type Slot = 'left' | 'right' | 'center'

const ResizableSidebarContext = createContext<IResizableSidebarContext>({
  id: '',
  //left: undefined,
  //center: undefined,
  //right: undefined,
  //set: () => {},
})

export function useResizableSidebarContext() {
  const ctx = useContext(ResizableSidebarContext)
  if (!ctx) {
    throw new Error(
      'useResizableSidebarContext must be used within a ResizableSidebarProvider'
    )
  }
  return ctx
}

function ResizableSidebarProvider({
  id = 'resizable-sidebar',
  children,
}: IChildrenProps & { id: string }) {
  //id = useStableId(id)

  // const [left, setLeft] = useState<ITab | undefined>(undefined)
  // const [center, setCenter] = useState<ITab | undefined>(undefined)
  // const [right, setRight] = useState<ITab | undefined>(undefined)

  // const set = useCallback(
  //   (slot: Slot, entry: ITab) => {
  //     if (slot === 'left') {
  //       setLeft(entry)
  //     } else if (slot === 'center') {
  //       setCenter(entry)
  //     } else if (slot === 'right') {
  //       setRight(entry)
  //     }
  //   },
  //   [setLeft, setCenter, setRight]
  // )

  return (
    <ResizableSidebarContext.Provider
      value={{
        id,
        //left,
        //center,
        ///right,
        //set,
      }}
    >
      {children}
    </ResizableSidebarContext.Provider>
  )
}

export function SidePanel({
  showCloseButton = true,
  children,
}: IChildrenProps & { showCloseButton?: boolean }) {
  // need to wait for hydration to get the correct initial
  // size from the store, otherwise it will always start at 50%

  const { id, left, right } = useResizableSidebarContext()

  const hydrated = useHydration(useSlideBarStore)

  const { open, size, sideLimits, setOpen } = useSlideBar(id)

  const sidePanelRef = usePanelRef()

  const initialSize = useRef(size)

  useEffect(() => {
    if (sidePanelRef.current) {
      if (open) {
        const s = Math.max(sideLimits[0], 100 - size)
        sidePanelRef.current.resize(`${s}%`)
      } else {
        sidePanelRef.current.collapse()
      }
    }
  }, [open, size, sideLimits[0], sidePanelRef])

  if (!hydrated) {
    return null
  }

  return (
    <ResizablePanel
      panelRef={sidePanelRef}
      //id={sidePanelId}
      defaultSize={`${100 - initialSize.current}%`}
      minSize={`${sideLimits[0]}%`}
      maxSize={`${sideLimits[1]}%`}
      collapsible={true}
      //className="flex flex-col relative gap-y-2"
    >
      {/* Seems to need inner div to make overflow work properly, otherwise scrollbars appear */}
      <PropsPanel className="flex flex-col gap-y-2 relative h-full">
        {/* <VCenterRow className="gap-x-1 min-h-8 absolute w-full z-50">
          <VCenterRow className="grow min-h-8">
            <VCenterRow
              id={`resizable-sidebar-header-left-${id}`}
              className="gap-x-2 grow"
            >
              {left && left.render && left.render}
            </VCenterRow>

            <VCenterRow
              id={`resizable-sidebar-header-right-${id}`}
              className="gap-x-2 grow justify-end"
            >
              {right && right.render && right.render}
            </VCenterRow>
          </VCenterRow> */}
        {showCloseButton && (
          <CloseButton
            onClick={() => setOpen(false)}
            className="absolute right-0 top-0.5"
          />
        )}
        {/* </VCenterRow> */}

        {children}
      </PropsPanel>
    </ResizablePanel>
  )
}

export interface ISlideBarProps extends IChildrenProps {
  side?: LeftRightPos
  showCloseButton?: boolean
}

function _ResizableSidebar({
  side = 'left',
  showCloseButton = true,
  children,
}: ISlideBarProps) {
  // need to wait for hydration to get the correct initial
  // size from the store, otherwise it will always start at 50%

  const { id } = useResizableSidebarContext()

  // we show bar once the store has hydrated, to ensure we get the correct initial size
  const hydrated = useHydration(useSlideBarStore)

  const isUserDragging = useRef(false)
  const { size, sideLimits, setSize } = useSlideBar(id)

  const c = Children.toArray(children)

  const wSize = useWindowSize()

  const initialSize = useRef(size)

  const orientation = useMemo(() => {
    if (wSize.w < TAILWIND_MEDIA_SM) {
      return 'vertical'
    } else {
      return 'horizontal'
    }
  }, [wSize])

  function handlePointerDown() {
    isUserDragging.current = true

    const stopDragging = () => {
      isUserDragging.current = false
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }

    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
  }

  if (!hydrated) {
    return null
  }

  if (c.length < 2) {
    console.warn(
      'ResizableSidebar requires exactly 2 children, but received ' + c.length
    )
    return null
  }

  const mainPanel = (
    <ResizablePanel
      defaultSize={`${initialSize.current}%`}
      minSize={`${sideLimits[0]}%`}
      //className="flex flex-col"
      onResize={(resize) => {
        if (!isUserDragging.current) {
          return
        }

        // we update the store size when user is actively dragging the resize handle
        // and not when the size is being programmatically updated (e.g., when the sidebar is opened or closed)
        setSize(resize.asPercentage)
      }}
    >
      {c[0]}
    </ResizablePanel>
  )

  const sidePanel = (
    <SidePanel showCloseButton={showCloseButton}>{c[1]}</SidePanel>
  )

  return (
    <ResizablePanelGroup orientation={orientation} className="grow h-full">
      {side === 'left' ? sidePanel : mainPanel}

      {orientation === 'horizontal' ? (
        <ThinHResizeHandle onPointerDown={handlePointerDown} />
      ) : (
        <ThinVResizeHandle onPointerDown={handlePointerDown} />
      )}

      {side === 'left' ? mainPanel : sidePanel}
    </ResizablePanelGroup>
  )
}

/**
 * Creates a resizable sidebar component with an optional close button and configurable side (left or right).
 * Note that if you have multiple sidebars in the same ui, you must set different a unique `id` for each sidebar
 * to avoid conflicts.
 * @param param0
 * @returns
 */
export function ResizableSidebar({
  id = OPTS_SIDEBAR_ID,
  side = 'left',
  showCloseButton = true,
  children,
}: ISlideBarProps & { id?: string }) {
  return (
    <ResizableSidebarProvider id={id}>
      <_ResizableSidebar side={side} showCloseButton={showCloseButton}>
        {children}
      </_ResizableSidebar>
    </ResizableSidebarProvider>
  )
}

export function ResizableSidebarHeaderPortal({
  children,
  side = 'left',
}: IChildrenProps & { side?: LeftRightPos }) {
  const { id } = useResizableSidebarContext()

  const [target, setTarget] = useState<HTMLElement | null>(null)

  const slot = `resizable-sidebar-header-${side}-${id}`

  useEffect(() => {
    setTarget(document.getElementById(slot))
  }, [slot])

  if (!target) {
    return null
  }

  return createPortal(children, target)
}
