import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { motion } from 'motion/react'

interface ILoadingSpinnerProps extends IIconProps {
  secondaryStroke?: string
}

// based on https://glennmccomb.com/articles/building-a-pure-css-animated-svg-spinner/
export function LoadingSpinner2({
  w = 'w-6',
  stroke = 'stroke-theme',
  strokeWidth = 6,
  className,
}: ILoadingSpinnerProps) {
  const radius = 24
  const circumference = 2 * Math.PI * 24
  const arcLength = circumference * 0.95
  const arcLength2 = circumference * 0.25

  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={cn(ICON_CLS, w, className)}
      animate={{
        rotate: 360,
      }}
      // Transition to define the looping behavior
      transition={{
        repeat: Infinity, // Loop the animation infinitely
        //repeatType: 'loop', // Continuous looping
        duration: 2, // Duration of one spin (1 second)
        ease: 'linear', // Linear easing for a smooth rotation
      }}
    >
      {/* <circle
        cx="32"
        cy="32"
        fill="none"
        r={radius}
        strokeWidth={strokeWidth}
        className={cn(secondaryStroke)}
      /> */}

      <motion.circle
        cx="32"
        cy="32"
        fill="none"
        r={radius}
        strokeDasharray={circumference} // Length of the circle’s circumference
        strokeDashoffset={arcLength}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        className={stroke}
        transform="rotate(-90 32 32)" // Rotate to start at the top (12 o'clock)
        animate={{
          strokeDashoffset: [arcLength, arcLength, arcLength2, arcLength],
          rotate: [0, 45, 45, 360],
        }}
        // Transition to define the looping behavior
        transition={{
          repeat: Infinity, // Loop the animation infinitely
          //repeatType: 'loop', // Continuous looping
          duration: 1.4, // Duration of one spin (1 second)
          ease: 'easeInOut', // Linear easing for a smooth rotation
        }}
      />
    </motion.svg>
  )
}
