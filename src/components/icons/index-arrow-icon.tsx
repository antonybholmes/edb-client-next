import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

const Y2 = 12
const Y1 = Y2 - 6
const Y3 = Y2 + 6
const DURATION = 0.3

export function IndexArrowIcon({
  size = 'w-4 h-4',
  stroke = 'stroke-white',
  strokeWidth = 2,
  hover = false,
  className,
}: IIconProps) {
  const lineRef = useRef(null)
  const arrowRef = useRef(null)

  useEffect(() => {
    gsap
      .timeline()
      .to(
        arrowRef.current,
        {
          x: hover ? 3 : 0,
          duration: DURATION,
          ease: 'power3.out',
        },
        0
      )
      .to(
        lineRef.current,
        {
          scaleX: hover ? 1 : 0,
          transformOrigin: 'center center',
          opacity: hover ? 1 : 0,
          duration: DURATION,
          ease: 'power3.out',
        },
        0
      )
  }, [hover])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 24 24`}
      className={cn(ICON_CLS, size, stroke, className)}
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }}
      strokeWidth={strokeWidth}
    >
      <line
        ref={lineRef}
        x1={7}
        y1={Y2}
        x2={18.5}
        y2={Y2}
        className="opacity-0"
      />
      <path
        ref={arrowRef}
        d={`M 12,${Y1} L 18,${Y2} L 12,${Y3}`}
        //className="trans-transform group-hover:translate-x-[3px]"
      />
    </svg>
  )
}
