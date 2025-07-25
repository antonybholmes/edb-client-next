import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

interface ILoadingSpinnerProps extends IIconProps {
  gradient?: string
}

export function LoadingSpinner({
  w = 'w-6',
  gradient = 'from-background from-25% to-theme dark:to-foreground to-90%',
  className,
}: ILoadingSpinnerProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.to(boxRef.current, {
      rotation: 360,
      duration: 1.5,
      repeat: -1, // infinite
      ease: 'none', // linear motion
      transformOrigin: '50% 50%', // optional: set rotation center
    })
  }, [])

  return (
    <span
      ref={boxRef}
      className={cn(
        ICON_CLS,
        'flex flex-row items-center justify-center rounded-full bg-conic relative p-[4px]',
        gradient,
        w,
        className
      )}
    >
      <span className="bg-background   rounded-full w-full h-full z-10 relative" />
      <span className="absolute rounded-full w-[4px] h-[4px] aspect-square top-0 left-1/2 -translate-x-1/2 z-0 bg-linear-to-r bg-theme dark:bg-foreground" />
    </span>
  )
}
