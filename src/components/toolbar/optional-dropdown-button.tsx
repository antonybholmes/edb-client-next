import { useRef, useState, type ReactNode } from 'react'

import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import { TRANS_COLOR_CLS } from '@/theme'
import { type IButtonProps } from '@/themed/v2/button'

import { ChevronDown } from 'lucide-react'
import { BaseCol } from '../layout/base-col'
import { DropDownButton } from '../shadcn/ui/themed/dropdown-button'
import { IconButton } from '../shadcn/ui/themed/icon-button'

const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,

  'overflow-hidden'
  //[open, "border-border", "border-transparent hover:border-border"],
)

type IProps = IButtonProps & {
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
  menuClassName = '',
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
            <IconButton
              // ripple={false}
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
            </IconButton>

            <DropDownButton
              checked={open}
              // ripple={false}
              rounded={rounded}
              className="rounded-l-none"
              aria-label="Show dropdown menu"
              onClick={() => setOpen(true)}
            >
              <ChevronDown size={16} />
            </DropDownButton>
          </VCenterRow>
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
