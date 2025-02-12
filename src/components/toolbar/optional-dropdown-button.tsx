import { useRef, useState, type ReactNode } from 'react'

import { VCenterRow } from '@/components/layout/v-center-row'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import {
  DropdownMenu,
  DropdownMenuContent,
} from '@components/shadcn/ui/themed/dropdown-menu'

import { ROUNDED_CLS, TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@components/shadcn/ui/themed/button'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { BaseCol } from '../layout/base-col'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  ROUNDED_CLS,
  //BUTTON_H_CLS,
  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

interface IProps extends IElementProps {
  icon: ReactNode
  align: 'start' | 'center' | 'end'
  onMainClick: () => void
  menuClassName?: string
}

export function OptionalDropdownButton({
  icon,
  onMainClick,

  align = 'start',
  menuClassName,
  children,
  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  const anchorRef = useRef(null)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <VCenterRow className={CONTAINER_CLS} ref={anchorRef}>
        <BaseCol>
          <VCenterRow>
            <Button
              variant="accent"
              onClick={() => onMainClick()}
              pad="xs"
              selected={open}
              title={props['title'] ?? ''}
              aria-label={props['aria-label']}
              className="rounded-r-none"
            >
              {icon}
            </Button>

            <Button
              multiProps="dropdown"
              selected={open}
              ripple={false}
              className="rounded-l-none"
              aria-label="Show dropdown menu"
              onClick={() => setOpen(true)}
            >
              <ChevronRightIcon
                className="rotate-90 stroke-foreground"
                w="w-3.5"
              />
            </Button>
          </VCenterRow>
          <DropdownMenuTrigger className="invisible w-full h-0" />
        </BaseCol>
      </VCenterRow>

      <DropdownMenuContent
        onInteractOutside={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
        align={align}
        //sideOffset={0}
        className={menuClassName}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
