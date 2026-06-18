'use client'

import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { Card } from '@/components/shadcn/ui/themed/card'
import { useSizeObserver } from '@/hooks/resize-observer'
import type { IDim } from '@/interfaces/dim'
import { cn } from '@/lib/shadcn-utils'
import { useRef, useState, type ComponentProps } from 'react'
import { ExtScrollProvider, useExtScrollContext } from './ext-scroll-provider'
import { ExtHScroll, ExtVScroll } from './ext-scrollbars'

interface ExtScrollCardProps extends ComponentProps<typeof Card> {
  cardCls?: string | undefined
  shiftToScroll?: boolean
}

function _ExtScrollCard({
  shiftToScroll = false,
  cardCls,
  variant = 'content',
  children,
  className,
}: ExtScrollCardProps) {
  const { scrollLeft, scrollTop, vScrollRef, setSize } = useExtScrollContext()

  const [maxScroll, setMaxScroll] = useState<IDim>({ w: 0, h: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function _setSize(size: IDim) {
    console.log('setting size ext', size)
    setSize(size)
  }

  function _setContainerSize(size: IDim) {
    if (containerRef.current) {
      const { scrollWidth, scrollHeight } = containerRef.current
      setMaxScroll({
        w: scrollWidth - size.w,
        h: scrollHeight - size.h,
      })
    }
  }

  useSizeObserver(containerRef, _setContainerSize)
  useSizeObserver(ref, _setSize)

  return (
    <BaseRow className={cn('grow', className)}>
      <BaseCol className="grow">
        <Card
          className={cn('grow', cardCls)}
          variant={variant}
          onWheel={(e) => {
            if (vScrollRef.current && (!shiftToScroll || e.shiftKey)) {
              vScrollRef.current.scrollTop += e.deltaY
            }
          }}
        >
          <div className="relative overflow-hidden grow" ref={containerRef}>
            <div
              ref={ref}
              className="absolute left-0 top-0"
              style={{
                transform: `translate3d(${-scrollLeft.normalized * maxScroll.w}px, ${-scrollTop.normalized * maxScroll.h}px, 0)`,
              }}
            >
              {children}
            </div>
          </div>
        </Card>

        <ExtHScroll className="mx-2" />
      </BaseCol>
      <ExtVScroll className="mt-2 mb-6" />
    </BaseRow>
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
