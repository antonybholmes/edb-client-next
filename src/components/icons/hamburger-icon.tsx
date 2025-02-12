import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { motion } from 'motion/react'

//const LINE_CLS = 'w-full h-[2px] bg-foreground/75'

export function HamburgerIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
  hover,
}: IIconProps) {
  const y1 = hover ? 4 : 6
  const y2 = hover ? 20 : 18
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(stroke, w, className)}
      strokeWidth={strokeWidth}
      //animate={{ scaleX:  1, scaleY: hover ? 0.7 : 1 }}
      // transition={{ ease: 'easeInOut' }}
    >
      <motion.line
        x1="2"
        x2="22"
        animate={{ y1: y1, y2: y1 }}
        //strokeLinecap="round"
        //strokeLinejoin="round"
      />

      <motion.line
        x1="2"
        x2="22"
        y1="12"
        y2="12"
        animate={{ opacity: hover ? 1 : 0 }}
        //strokeLinecap="round"
        //strokeLinejoin="round"
      />

      <motion.line
        x1="2"
        x2="22"
        y1="12"
        animate={{ y1: y2, y2: y2 }}
        //strokeLinecap="round"
        //strokeLinejoin="round"
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
