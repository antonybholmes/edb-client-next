import { VCenterCol } from '@/components/layout/v-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

interface IPileupSkeletonProps extends IDivProps {
  orientation?: 'horizontal' | 'vertical'
}

export function SkeletonCard({
  className,
  orientation = 'horizontal',
  ...props
}: IPileupSkeletonProps) {
  const durationRef = useRef(2 + Math.random() * 3)
  const delayRef = useRef(Math.random())
  const shimmerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const el = shimmerRef.current

    if (!el) {
      return
    }

    const isHorizontal = orientation === 'horizontal'

    const tween = gsap.fromTo(
      el,
      {
        xPercent: isHorizontal ? -200 : 0,
        yPercent: !isHorizontal ? -200 : 0,
      },
      {
        xPercent: isHorizontal ? 200 : 0,
        yPercent: !isHorizontal ? 200 : 0,
        duration: durationRef.current, // random duration to prevent multiple skeletons from animating in sync
        ease: 'none',
        repeat: -1,
        delay: delayRef.current, // random delay to prevent multiple skeletons from animating in sync
      }
    )

    return () => {
      tween.kill()
    }
  }, [orientation])

  return (
    <div
      className={cn('bg-muted/80 overflow-hidden relative', className)}
      {...props}
    >
      {/* shimmer overlay */}
      <span
        aria-hidden="true"
        ref={shimmerRef}
        className={cn(
          'absolute from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none will-change-transform top-0 left-0',
          orientation === 'horizontal'
            ? 'bg-linear-to-r h-full w-full min-w-button-md'
            : 'bg-linear-to-b w-full h-full min-h-button-md'
        )}
      />
      {/* <span
        ref={shimmerRef}
        className={cn(
          'absolute from-transparent to-white/50 rounded-sm h-full w-full pointer-events-none will-change-transform inset-0',
          orientation === 'horizontal' ? 'bg-linear-to-r' : 'bg-linear-to-b'
        )}
      /> */}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <VCenterRow className="gap-x-3 w-full">
      <SkeletonCard className="w-2 h-2 aspect-square rounded-full shrink-0" />
      <SkeletonCard
        className="h-2 rounded-full"
        style={{ width: `${Math.random() * 60 + 40}%` }}
      />
    </VCenterRow>
  )
}

export function SkeletonRows({
  count = 6,
  className,
}: IDivProps & { count?: number }) {
  return (
    <VCenterCol className={cn('gap-y-6 h-1/2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </VCenterCol>
  )
}
