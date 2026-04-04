import { useRef, useState, type ReactNode } from 'react'

import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import { TRANS_COLOR_CLS } from '@/theme'
import { Button, type IButtonProps } from '@/themed/v2/button'

import { BaseCol } from '../layout/base-col'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  //BUTTON_MD_H_CLS,
  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

type IProps = IButtonProps & {
  icon: ReactNode
  align?: 'start' | 'center' | 'end'
  onMainClick: () => void
  menuClassName?: string
}

export function DropdownButton({
  icon,

  size = 'dropdown',
  align = 'start',
  rounded = 'theme',
  menuClassName = '',
  children,
}: IProps) {
  const [open, setOpen] = useState(false)

  const anchorRef = useRef(null)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <VCenterRow className={CONTAINER_CLS} ref={anchorRef}>
        <BaseCol>
          <Button
            size={size}
            checked={open}
            // ripple={false}
            rounded={rounded}
            aria-label="Show dropdown menu"
            onClick={() => setOpen(true)}
          >
            {icon}
            <ChevronRightIcon
              className="rotate-90 stroke-foreground"
              w="w-3.5"
            />
          </Button>

          <DropdownMenuTrigger className="invisible w-full h-0" />
        </BaseCol>
      </VCenterRow>

      <DropdownMenuContent
        //onInteractOutside={() => setOpen(false)}
        //onEscapeKeyDown={() => setOpen(false)}
        align={align}
        //sideOffset={0}
        className={menuClassName}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
