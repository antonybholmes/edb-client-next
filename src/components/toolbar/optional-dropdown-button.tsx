import { useRef, useState, type ReactNode } from 'react'

import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'

import { DropdownMenu, DropdownMenuContent } from '@themed/dropdown-menu'

import { TRANS_COLOR_CLS } from '@/theme'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button, type IButtonProps } from '@themed/button'
import { BaseCol } from '../layout/base-col'
import { DropDownButton } from '../shadcn/ui/themed/dropdown-button'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  //BUTTON_MD_H_CLS,
  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

interface IProps extends IButtonProps {
  icon: ReactNode
  align?: 'start' | 'center' | 'end'
  onMainClick: () => void
  menuClassName?: string
}

export function OptionalDropdownButton({
  icon,
  onMainClick,
  size = 'icon',
  align = 'start',
  rounded = 'theme',
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
              variant="muted"
              // ripple={false}
              onClick={() => onMainClick()}
              size={size}
              checked={open}
              rounded={rounded}
              title={props['title'] ?? ''}
              aria-label={props['aria-label']}
              className="rounded-r-none"
            >
              {icon}
            </Button>

            <DropDownButton
              checked={open}
              // ripple={false}
              rounded={rounded}
              className="rounded-l-none"
              aria-label="Show dropdown menu"
              onClick={() => setOpen(true)}
            >
              <ChevronRightIcon
                className="rotate-90 stroke-foreground"
                w="w-3.5"
              />
            </DropDownButton>
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
