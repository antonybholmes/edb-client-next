import type { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { type ITabIndicatorPos } from './tab-indicator-provider'
import { useTabIndicators } from './tab-indicator-store'

const ROUNDED_FIRST = {
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
}

const ROUNDED_LAST = {
  borderTopRightRadius: '0.5rem',
  borderBottomRightRadius: '0.5rem',
}

const ROUNDED_NONE = {
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
}

function getRoundedStyle(rounded: boolean, first: boolean, last: boolean) {
  const style = {}

  if (rounded) {
    Object.assign(style, ROUNDED_NONE)

    if (first) {
      Object.assign(style, ROUNDED_FIRST)
    }

    if (last) {
      Object.assign(style, ROUNDED_LAST)
    }
  }

  return style
}

interface IProps extends IClassProps {
  groupId: string
  color?: string

  rounded?: boolean
}

export function TabIndicatorSelectedBlock({
  groupId,
  color = 'bg-muted/60',

  rounded = true,
  className,
}: IProps) {
  const { selectedPosition: position } = useTabIndicators(groupId)
  const previousPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const blockRef = useRef<HTMLSpanElement>(null)

  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!blockRef.current) {
      return
    }

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    if (position) {
      const first = position.index === 0
      const last = position.index === position.tabs - 1

      const roundedStyle = getRoundedStyle(rounded, first, last)

      if (previousPos.current && (position.animate ?? true)) {
        timelineRef.current = gsap.timeline().to(blockRef.current, {
          x: position.x,
          width: position.w,
          height: position.h,
          ...roundedStyle,
          duration: 0.5,
          ease: 'power3.out',
        })
      } else {
        timelineRef.current = gsap
          .timeline()
          .set(blockRef.current, {
            x: position.x,
            width: position.w,
            height: position.h,
            //opacity: 0,
            ...roundedStyle,
          })
          .to(blockRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
          })
      }
    } else {
      timelineRef.current = gsap.timeline().to(blockRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
    }

    previousPos.current = position
  }, [position?.x, position?.h, position?.y, position?.w])

  return (
    <span
      ref={blockRef}
      className={cn(`absolute left-0 z-0 opacity-0`, color, className)}
      //style={{ height: position?.h || 0 }}
      // animate={{
      //   y: `${tabIndicatorPos.x}rem`,
      //   height: `${(tabIndicatorPos.size as number) - 0.15}rem`,
      // }}

      //initial={false}
      //transition={{ ease: 'easeOut', duration: 0.25 }}
    />
  )
}
