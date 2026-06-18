import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

//const LINE_CLS = 'w-full h-px absolute bg-foreground origin-center'

export function HamburgerIcon({
  size = 'w-4 h-4',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
  hover,
}: IIconProps) {
  const line1Ref = useRef<SVGLineElement>(null)
  const line2Ref = useRef<SVGLineElement>(null)
  const line3Ref = useRef<SVGLineElement>(null)
  const tlRef = useRef<gsap.core.Timeline>(null)

  useEffect(() => {
    if (!line1Ref.current || !line2Ref.current || !line3Ref.current) return

    tlRef.current = gsap
      .timeline()
      .to(
        line1Ref.current,
        {
          transform: 'translateY(-2px)',
          duration: 0.2,
          ease: 'power.out',
        },
        0
      )
      .to(
        line2Ref.current,
        {
          opacity: 1,
          scaleX: 1,
          transformOrigin: '50% 50%',
          //attr: { y1: 12, y2: 12 },
          duration: 0.2,
          ease: 'power.out',
        },
        0
      )
      .to(
        line3Ref.current,
        {
          transform: 'translateY(2px)',
          duration: 0.2,
          ease: 'power.out',
        },
        0
      )
      .pause()
  }, [])

  useEffect(() => {
    if (hover) {
      tlRef.current?.play()
    } else {
      tlRef.current?.reverse()
    }
  }, [hover])

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, stroke, size, className)}
      strokeWidth={strokeWidth}
      //animate={{ scaleX:  1, scaleY: hover ? 0.7 : 1 }}
      // transition={{ ease: 'easeInOut' }}
    >
      <line
        x1="2"
        x2="22"
        y1="7"
        y2="7"
        ref={line1Ref}
        //initial={false}
        //animate={{ y1: y1, y2: y1 }}
        //shapeRendering="crispEdges"
      />

      <line
        ref={line2Ref}
        x1="2"
        x2="22"
        y1="12"
        y2="12"
        className="opacity-0 left-1/2 -translate-x-1/2"
        //shapeRendering="crispEdges"
      />

      <line
        ref={line3Ref}
        x1="2"
        x2="22"
        y1="17"
        y2="17"
        //shapeRendering="crispEdges"
        //initial={false}
        //animate={{ y1: y2, y2: y2 }}
      />
    </svg>

    // <VCenterCol
    //   className={cn(ICON_CLS, size, className)}
    //   //style={style}
    // >
    //   <span
    //     ref={line1Ref}
    //     className={cn(LINE_CLS, 'left-0 top-1/4')}
    //     //animate={{ scaleX: hover ? 1.25 : 1 }}
    //   />
    //   <span
    //     ref={line2Ref}
    //     className={cn(LINE_CLS, 'left-0 opacity-0 scale-x-50 origin-center')}
    //     //animate={{ scaleX: hover ? 1.25 : 1 }}
    //   />
    //   <span
    //     ref={line3Ref}
    //     className={cn(LINE_CLS, 'left-0 top-3/4')}
    //     //animate={{ scaleX: hover ? 1.25 : 1 }}
    //   />
    // </VCenterCol>
  )
}
