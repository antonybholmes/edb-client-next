import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { cn } from '@lib/shadcn-utils'
import { useState, type ComponentProps, type ReactNode } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './shadcn/ui/themed/collapsible'

import { BaseCol } from '@layout/base-col'
import { VCenterRow } from './layout/v-center-row'
import type { LeftRightPos } from './side'

interface IProps extends ComponentProps<'button'> {
  name: string
  isOpen?: boolean
  headerClassName?: string
  headerChildren?: ReactNode
  headerChildrenSide?: LeftRightPos
  gap?: string
}

export function CollapseBlock({
  name,
  isOpen = true,
  headerClassName,
  headerChildren,
  headerChildrenSide = 'left',
  gap = 'gap-y-1',
  className,
  children,
  ...props
}: IProps) {
  const [_isOpen, setIsOpen] = useState(isOpen)

  return (
    <Collapsible
      className="flex flex-col text-xs gap-y-1 mb-1"
      open={_isOpen}
      onOpenChange={setIsOpen}
    >
      <VCenterRow
        className={cn(
          'relative flex shrink-0 flex-row items-center gap-x-2 outline-hidden',
          headerClassName
        )}
        tabIndex={0}
      >
        {headerChildrenSide === 'left' && headerChildren && headerChildren}

        <CollapsibleTrigger
          data-open={_isOpen}
          className="group flex grow flex-row items-center justify-between"
          {...props}
        >
          <h3 className="font-semibold">{name}</h3>

          <VCenterRow
            data-open={_isOpen}
            className="aspect-square rounded-full overflow-hidden w-6 shrink-0 justify-center group-hover:bg-muted"
          >
            <ChevronRightIcon
              className={cn('trans-300 transition-transform', {
                '-rotate-90': _isOpen,
              })}
            />
          </VCenterRow>
        </CollapsibleTrigger>

        {headerChildrenSide === 'right' && headerChildren && headerChildren}
      </VCenterRow>
      <CollapsibleContent className="collapsible-content p-1">
        {/* We must use an inner div here because otherwise the animation is messed up if the children
       are direct descendants of the content div */}
        <BaseCol className={cn(className, gap)}>{children}</BaseCol>
      </CollapsibleContent>
    </Collapsible>
  )
}
