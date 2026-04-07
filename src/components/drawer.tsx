import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { gsap } from 'gsap'
import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactElement,
} from 'react'
import { BaseCol } from './layout/base-col'

interface IDrawerProps extends IChildrenProps {
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>
}

export function Drawer({ trigger, className, children }: IDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      gsap.to(backdropRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.3,
        onStart: () => {
          if (backdropRef?.current) {
            backdropRef.current.style.pointerEvents = 'auto'
          }
        },
      })

      gsap.to(drawerRef.current, {
        x: '0%',
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        onStart: () => {
          if (drawerRef?.current) {
            drawerRef.current.style.pointerEvents = 'auto'
          }
        },
      })
    } else {
      gsap.to(backdropRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.3,
        onComplete: () => {
          if (backdropRef?.current) {
            backdropRef.current.style.pointerEvents = 'none'
          }
        },
      })

      gsap.to(drawerRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          if (drawerRef?.current) {
            drawerRef.current.style.pointerEvents = 'none'
          }
        },
      })
    }
  }, [isOpen])

  const triggerWithProps = cloneElement(trigger, {
    onClick: e => {
      trigger.props.onClick?.(e) // preserve original onClick
      setIsOpen(true)
    },
  })

  return (
    <>
      {/* Trigger */}
      {triggerWithProps}

      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-foreground/20 z-40"
      />

      {/* Drawer */}
      <BaseCol
        ref={drawerRef}
        className={cn(
          `fixed top-0 right-0 h-full bg-background shadow-xl z-50 opacity-0 pointer-events-none`,
          className
        )}
      >
        {children}
      </BaseCol>
    </>
  )
}
