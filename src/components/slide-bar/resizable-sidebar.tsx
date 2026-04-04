import { Children, useEffect, useMemo, useRef } from 'react'

import type { IDivProps } from '@/interfaces/div-props'

import { TAILWIND_MEDIA_SM, useWindowSize } from '@/hooks/window-size'

import { useStableId } from '@/hooks/stable-id'
import { usePanelRef } from 'react-resizable-panels'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinHResizeHandle,
  ThinVResizeHandle,
} from '../shadcn/ui/themed/resizable'
import type { LeftRightPos } from '../side'
import { useSlideBar, useSlideBarStore } from './slide-bar-store'

export interface ISlideBarProps extends IDivProps {
  side?: LeftRightPos
}

export function ResizableSidebar({
  id,
  side = 'left',
  children,
}: ISlideBarProps) {
  // need to wait for hydration to get the correct initial
  // size from the store, otherwise it will always start at 50%

  const hydrated = useSlideBarStore((state) => state._hasHydrated)

  const _id = id ?? useStableId('resizable-sidebar')

  //const mainPanelId = useStableId('slide-bar-main-panel')
  //const sidePanelId = useStableId('slide-bar-side-panel')

  const isUserDragging = useRef(false)
  const { barProps, setSize } = useSlideBar(_id)

  const sidePanelRef = usePanelRef()

  const c = Children.toArray(children)

  const wSize = useWindowSize()

  const initialSize = useRef(barProps.size)

  useEffect(() => {
    if (sidePanelRef.current) {
      if (barProps.open) {
        const size = Math.max(barProps.sideLimits[0], 100 - barProps.size)
        sidePanelRef.current.resize(`${size}%`)
      } else {
        sidePanelRef.current.collapse()
      }
    }
  }, [barProps.open])

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

  const mainPanel = (
    <ResizablePanel
      //id={mainPanelId}
      defaultSize={`${initialSize.current}%`}
      minSize={`${barProps.sideLimits[0]}%`}
      //maxSize="100%"
      //collapsible={true}
      //collapsedSize={`${barProps.minSize}%`}
      className="flex flex-col"
      onResize={(resize) => {
        if (!isUserDragging.current) {
          return
        }

        setSize(resize.asPercentage)
      }}
    >
      {c[0]}
    </ResizablePanel>
  )

  const sidePanel = (
    <ResizablePanel
      panelRef={sidePanelRef}
      //id={sidePanelId}
      defaultSize={`${100 - initialSize.current}%`}
      minSize={`${barProps.sideLimits[0]}%`}
      maxSize={`${barProps.sideLimits[1]}%`}
      collapsible={true}
      className="flex flex-col"
    >
      {c[1]}
    </ResizablePanel>
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
