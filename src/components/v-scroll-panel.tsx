import { type ReactNode } from 'react'

import type { IDivProps } from '@/interfaces/div-props'
import { BaseCol } from '@/layout/base-col'
import { cn } from '@/lib/shadcn-utils'

export const V_SCROLL_CHILD_CLS = 'absolute w-full'

export function VScrollPanel({
  ref,
  asChild = false,
  innerCls,
  className,
  children,
  ...props
}: IDivProps & {
  // vscrollpane relies on the component being absolute
  // so asChild is for components that are already absolute
  // and don't require a parent wrapper to provide this.
  asChild?: boolean
  innerCls?: string
}) {
  let content: ReactNode = children

  if (!asChild) {
    content = (
      <BaseCol className={cn(V_SCROLL_CHILD_CLS, innerCls)}>{content}</BaseCol>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0 min-h-0 grow',
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}
