import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

interface ILoadingSpinnerProps extends IIconProps {
  gradient?: string
}

export function LoadingSpinner({
  size = 'w-6',
  gradient = 'from-background from-25% to-theme dark:to-foreground to-90%',
  className,
}: ILoadingSpinnerProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(boxRef.current, {
        rotation: 360,
        duration: 1.5,
        repeat: -1, // infinite
        ease: 'linear', // linear motion
        transformOrigin: '50% 50%', // optional: set rotation center
      })
    }, boxRef)

    return () => ctx.revert()
  }, [])

  return (
    <span
      ref={boxRef}
      className={cn(
        ICON_CLS,
        size,
        'flex flex-row items-center justify-center rounded-full border-2 border-transparent border-t-foreground/50 relative p-1',
        gradient,

        className
      )}
    ></span>
  )
}
