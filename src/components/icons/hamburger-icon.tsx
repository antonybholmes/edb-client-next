import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { motion } from 'motion/react'

//const LINE_CLS = 'w-full h-[2px] bg-foreground/75'

export function HamburgerIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
  hover,
}: IIconProps) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(stroke, w, className)}
      strokeWidth={strokeWidth}
      animate={{ scaleX: hover ? 1.2 : 1, scaleY: 1 }}
      transition={{ ease: 'easeInOut' }}
    >
      <line
        x1="2"
        x2="22"
        y1="7"
        y2="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line
        x1="2"
        x2="22"
        y1="17"
        y2="17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>

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
