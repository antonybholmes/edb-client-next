import { useRef, useState, type ReactNode } from 'react'

import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'

import { DropdownMenu, DropdownMenuContent } from '@themed/dropdown-menu'

import { ROUNDED_CLS, TRANS_COLOR_CLS } from '@/theme'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { BaseCol } from '../layout/base-col'
import type { IButtonProps } from '../shadcn/ui/themed/button'
import { DropDownButton } from '../shadcn/ui/themed/dropdown-button'
import { ToolbarButton } from './toolbar-button'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  ROUNDED_CLS,
  //BUTTON_MD_H_CLS,
  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

interface IProps extends IButtonProps {
  icon: ReactNode
  onMainClick: () => void
  menuClassName?: string
}

export function ToolbarOptionalDropdownButton({
  size = 'toolbar',
  icon,
  onMainClick,

  menuClassName,
  children,

  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  const anchorRef = useRef(null)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <BaseCol className={CONTAINER_CLS} ref={anchorRef}>
        <VCenterRow>
          <ToolbarButton
            size={size}
            onClick={() => onMainClick()}
            //rounded="none"
            //checked={open}
            open={open}
            className="rounded-r-none"
            {...props}
          >
            {icon}
          </ToolbarButton>

          <DropDownButton
            variant="flat"
            size="toolbar-dropdown"
            open={open}
            // ripple={false}
            className="rounded-l-none"
            aria-label="Show dropdown menu"
            onClick={() => setOpen(true)}
          >
            <ChevronRightIcon className="rotate-90" w="w-4" />
          </DropDownButton>
        </VCenterRow>
        <DropdownMenuTrigger className="invisible w-full h-0" />
      </BaseCol>

      <DropdownMenuContent
        onInteractOutside={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
        align="start"
        //sideOffset={20}
        className={menuClassName}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
