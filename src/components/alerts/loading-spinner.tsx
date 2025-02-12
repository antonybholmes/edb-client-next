import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { motion } from 'motion/react'

interface ILoadingSpinnerProps extends IIconProps {
  gradient?: string
}

export default function LoadingSpinner({
  w = 'w-6',
  gradient = 'from-input/25 to-theme',
  className,
}: ILoadingSpinnerProps) {
  return (
    <motion.div
      className={cn(
        ICON_CLS,
        'flex flex-row items-center justify-center rounded-full bg-[conic-gradient(var(--tw-gradient-stops))]',
        gradient,
        w,
        className
      )}
      // Animate the rotation property
      animate={{ rotate: 360 }}
      // Transition to define the looping behavior
      transition={{
        repeat: Infinity, // Loop the animation infinitely
        repeatType: 'loop', // Continuous looping
        duration: 1.25, // Duration of one spin (1 second)
        ease: 'linear', // Linear easing for a smooth rotation
      }}
      // Styling the spinner
      style={{
        padding: 4,
        //background: "conic-gradient(from 0deg, blue, lightblue, white)",
      }}

      //     width: "50px", // Set the width of the spinner
      //     height: "50px", // Set the height of the spinner
      //     borderRadius: "50%", // Make the element circular
      //     border: "5px solid lightgray", // Light gray border
      //     borderTop: "5px solid blue", // Blue color on top to create a spinning effect
      //     display: "inline-block",
      //   }}
    >
      <span className="bg-white rounded-full w-full h-full" />
    </motion.div>
  )
}
