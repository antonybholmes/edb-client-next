'use client'

import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { Card } from '@/components/shadcn/ui/themed/card'
import { useSizeObserver } from '@/hooks/resize-observer'
import type { IDim } from '@/interfaces/dim'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode, useRef, useState, type ComponentProps } from 'react'
import {
  ExtScrollProvider,
  useExtScrollRefsContext,
  useExtScrollStateContext,
} from './ext-scroll-provider'
import { ExtHScroll, ExtVScroll } from './ext-scrollbars'

interface ExtScrollCardProps extends ComponentProps<typeof Card> {
  cardCls?: string | undefined
  shiftToScroll?: boolean
  header?: ReactNode | undefined
  padding?: string | undefined
}

function _ExtScrollCard({
  shiftToScroll = false,
  header,
  children,
  className,
  padding = '0.5rem',
  cardCls,
  ...props
}: ExtScrollCardProps) {
  const { vScrollRef } = useExtScrollRefsContext()
  const { size, scrollLeft, scrollTop, setSize } = useExtScrollStateContext()

  const [scrollableArea, setScrollableArea] = useState<IDim>({ w: 0, h: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function _setSize(size: IDim) {
    setSize(size)

    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current
      _setScrollableArea({ w: clientWidth, h: clientHeight }, size)
    }
  }

  function _setContainerSize(containerSize: IDim) {
    _setScrollableArea(containerSize, size)
  }

  function _setScrollableArea(clientSize: IDim, contentSize: IDim) {
    setScrollableArea({
      w: Math.max(contentSize.w - clientSize.w, 0),
      h: Math.max(contentSize.h - clientSize.h, 0),
    })
  }

  useSizeObserver(containerRef, _setContainerSize)
  useSizeObserver(ref, _setSize)

  return (
    <BaseCol className={cn('grow h-full', className)}>
      <div
        className="bg-background rounded-t-xl border-t border-l border-r border-border/50 mr-4"
        style={{
          paddingTop: padding,
          paddingLeft: padding,
          paddingRight: padding,
          paddingBottom: header ? padding : undefined,
        }}
      >
        {header && header}
      </div>
      <BaseRow className="grow">
        <BaseCol className="grow">
          <BaseCol
            className="grow bg-background border-l border-r border-b border-border/50 rounded-b-xl"
            style={{
              paddingLeft: padding,
              paddingRight: padding,
              paddingBottom: padding,
            }}
            onWheel={(e) => {
              if (vScrollRef.current && (!shiftToScroll || e.shiftKey)) {
                vScrollRef.current.scrollTop += e.deltaY
              }
            }}
            {...props}
          >
            <div className="relative overflow-hidden grow" ref={containerRef}>
              <div
                ref={ref}
                className="absolute left-0 top-0"
                style={{
                  transform: `translate3d(${-scrollLeft.normalized * scrollableArea.w}px, ${-scrollTop.normalized * scrollableArea.h}px, 0)`,
                }}
              >
                {children}
              </div>
            </div>
          </BaseCol>

          <ExtHScroll className="mx-2" />
        </BaseCol>
        <ExtVScroll className="mb-6" />
      </BaseRow>
    </BaseCol>
  )
}

/**
 * Displays content in a card with separate scrollbars,
 * that are outside the content to make UI cleaner. Prevents
 * scrollbars from overlapping content and allows for better control of scroll behavior.
 * @param param0
 * @returns
 */
export function ExtScrollCard({
  children,
  cardCls,
  ...props
}: ExtScrollCardProps) {
  return (
    <ExtScrollProvider>
      <_ExtScrollCard cardCls={cardCls} {...props}>
        {children}
      </_ExtScrollCard>
    </ExtScrollProvider>
  )
}
