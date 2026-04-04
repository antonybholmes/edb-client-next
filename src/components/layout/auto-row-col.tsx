import { useRef, type RefObject } from 'react'

import { useDebouncedComponentSize } from '@/hooks/component-size'
import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

interface IProps extends IDivProps {
  breakpoint?: number
}

/**
 * Responsive row/column layout that switches between row and column
 * based on the width of the component and the given breakpoint.
 *
 * @param param0
 * @returns
 */
export function AutoRowCol({
  breakpoint = 100,
  className,
  children,
  ...props
}: IProps) {
  const ref: RefObject<HTMLDivElement | null> = useRef(null)

  const size = useDebouncedComponentSize(ref)

  return (
    <div
      className={cn(
        'gap-x-2 gap-y-1 flex',
        { 'flex-col items-start': size.w < breakpoint },
        { 'flex-row items-center': size.w >= breakpoint },
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
}
