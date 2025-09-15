import { FOCUS_INSET_RING_CLS } from '@/theme'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/shadcn-utils'
import { useState } from 'react'
import { BaseLink } from './base-link'

import type { IPos } from '@interfaces/pos'
import { buttonVariants } from '@themed/button'
import type { VariantProps } from 'class-variance-authority'

export interface IButtonLinkProps
  extends ILinkProps,
    VariantProps<typeof buttonVariants> {}

export function ButtonLink({
  ref,
  variant,
  size,
  rounded,
  ring,
  justify,
  items,
  flow,
  className,
  onMouseUp,
  onMouseDown,
  onMouseLeave,
  children,
  ...props
}: IButtonLinkProps) {
  //const rippleRef = useRef<HTMLSpanElement>(null)
  const [clickProps, setClickProps] = useState<IPos>({ x: -1, y: -1 })

  // useEffect(() => {
  //   if (clickProps.x !== -1) {
  //     gsap.fromTo(
  //       rippleRef.current,
  //       {
  //         left: clickProps.x,
  //         top: clickProps.y,
  //         transform: 'scale(1)',
  //         height: '1rem',
  //         width: '1rem',
  //         opacity: 0.9,
  //       },
  //       {
  //         transform: 'scale(12)',
  //         opacity: 0.2,
  //         duration: 2,
  //         ease: 'power3.out',
  //       }
  //     )
  //   } else {
  //     gsap.to(rippleRef.current, {
  //       opacity: 0,
  //       duration: 1,
  //       ease: 'power3.out',
  //     })
  //   }
  // }, [clickProps])

  function _onMouseUp(e: React.MouseEvent<HTMLAnchorElement>) {
    setClickProps({ x: -1, y: -1 })
    onMouseUp?.(e)
  }

  function _onMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
    setClickProps({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
    onMouseDown?.(e)
  }

  function _onMouseLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    setClickProps({ x: -1, y: -1 })
    onMouseLeave?.(e)
  }

  return (
    <BaseLink
      ref={ref}
      className={buttonVariants({
        variant,
        justify,
        items,
        size,
        rounded,
        ring,
        flow,
        className: cn(
          FOCUS_INSET_RING_CLS,
          'relative overflow-hidden',
          className
        ),
      })}
      onMouseDown={_onMouseDown}
      onMouseUp={_onMouseUp}
      onMouseLeave={_onMouseLeave}
      {...props}
    >
      {children}
      {/* <span ref={rippleRef} className={RIPPLE_CLS} /> */}
    </BaseLink>
  )
}
