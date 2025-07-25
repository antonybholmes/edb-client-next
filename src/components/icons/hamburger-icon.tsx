import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

//const LINE_CLS = 'w-full h-[2px] bg-foreground/75'

export function HamburgerIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
  hover,
}: IIconProps) {
  const y1 = hover ? 9 : 7
  const y2 = hover ? 15 : 17

  const line1Ref = useRef<SVGLineElement>(null)
  const line2Ref = useRef<SVGLineElement>(null)

  useEffect(() => {
    gsap
      .timeline()
      .to(
        line1Ref.current,
        {
          attr: { y1: y1, y2: y1 },
          duration: 0.3,
          //ease: 'power1.inOut',
        },
        0
      )
      .to(
        line2Ref.current,
        {
          attr: { y1: y2, y2: y2 },
          duration: 0.3,
          //ease: 'power1.inOut',
        },
        0
      )
  }, [hover])

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, stroke, w, className)}
      strokeWidth={strokeWidth}
      //animate={{ scaleX:  1, scaleY: hover ? 0.7 : 1 }}
      // transition={{ ease: 'easeInOut' }}
    >
      <line
        x1="2"
        x2="22"
        ref={line1Ref}
        //initial={false}
        //animate={{ y1: y1, y2: y1 }}
      />

      <line
        ref={line2Ref}
        x1="2"
        x2="22"
        //initial={false}
        //animate={{ y1: y2, y2: y2 }}
      />
    </svg>

    // <VCenterCol
    //   className={cn(ICON_CLS, w, 'gap-y-1.5', className)}
    //   style={style}
    // >
    //   <motion.span
    //     className={LINE_CLS}
    //     animate={{ scaleX: hover ? 1.25 : 1 }}
    //   />
    //   <motion.span
    //     className={LINE_CLS}
    //     animate={{ scaleX: hover ? 1.25 : 1 }}
    //   />
    // </VCenterCol>
  )
}
