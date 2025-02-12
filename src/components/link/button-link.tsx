import { FOCUS_INSET_RING_CLS } from '@/theme'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from 'react'
import { BaseLink } from './base-link'

import {
  buttonVariants2,
  RIPPLE_CLS,
  type IButtonVariantProps,
} from '@components/shadcn/ui/themed/button'
import type { IPos } from '@interfaces/pos'
import gsap from 'gsap'

export interface IButtonLinkProps extends ILinkProps, IButtonVariantProps {}

export const ButtonLink = forwardRef(function ButtonLink(
  {
    variant = 'default',
    size = 'default',
    rounded = 'default',
    ring = 'default',
    justify = 'default',
    items = 'default',
    pad = 'default',
    className,
    onMouseUp,
    onMouseDown,
    onMouseLeave,
    children,
    ...props
  }: IButtonLinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const rippleRef = useRef<HTMLSpanElement>(null)
  const [clickProps, setClickProps] = useState<IPos>({ x: -1, y: -1 })

  useEffect(() => {
    if (clickProps.x !== -1) {
      gsap.fromTo(
        rippleRef.current,
        {
          left: clickProps.x,
          top: clickProps.y,
          transform: 'scale(1)',
          height: '1rem',
          width: '1rem',
          opacity: 0.9,
        },
        {
          transform: 'scale(12)',
          opacity: 0.2,
          duration: 2,
          ease: 'power3.out',
        }
      )
    } else {
      gsap.to(rippleRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
    }
  }, [clickProps])

  function _onMouseUp(e: React.MouseEvent<HTMLAnchorElement>) {
    setClickProps({ x: -1, y: -1 })
    onMouseUp?.(e)
  }

  function _onMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
    console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
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
      className={buttonVariants2({
        variant,
        justify,
        items,
        size,
        rounded,
        ring,
        pad,
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
      <span ref={rippleRef} className={RIPPLE_CLS} />
    </BaseLink>
  )
})
