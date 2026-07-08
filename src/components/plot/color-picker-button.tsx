import { cn } from '@/lib/shadcn-utils'
import { gsap } from 'gsap'
import tinycolor from 'tinycolor2'

import { ComponentProps, useEffect, useMemo, useRef } from 'react'

export const COLOR_THRESHOLD = 700

export function ColorButton({
  size = 'w-5',
  presetColor,
  ...props
}: ComponentProps<'button'> & {
  presetColor: string
  size?: string
}) {
  const ref = useRef(null)

  const tl = useRef<gsap.core.Timeline>(null)

  useEffect(() => {
    tl.current = gsap.timeline({ paused: true }).to(ref.current, {
      duration: 0.3,
      scale: 1.2,
      ease: 'power3.out',
    })
  }, [])

  return (
    <button
      onMouseEnter={() => tl.current?.play()}
      onMouseLeave={() => tl.current?.reverse()}
      onFocus={() => tl.current?.play()}
      onBlur={() => tl.current?.reverse()}

      {...props}
    >
      <ColorIcon ref={ref} presetColor={presetColor} size={size} />
    </button>
  )
}

export function ColorIcon({
  ref,
  size = 'w-5',
  presetColor,
}: ComponentProps<'span'> & {
  presetColor: string
  size?: string
}) {
  const isLight = useMemo(() => tinycolor(presetColor).isLight(), [presetColor])

  return (
    <span
      ref={ref}

      className={cn(
        'block rounded-full aspect-square border shrink-0 pointer-events-none',
        size,
        isLight ? 'border-border' : 'border-transparent'
      )}
      style={{ background: presetColor }}
    />
  )
}
