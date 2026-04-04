import { cn } from '@/lib/shadcn-utils'
import { ChevronDown } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarButton } from './toolbar-button'

type IProps = ComponentProps<typeof ToolbarButton> & {
  icon: ReactNode
  menuClassName?: string
  showArrow?: boolean
}

export function ToolbarDropdownButton({
  icon,
  className = '',
  menuClassName = '',
  showArrow = true,
  title,
  children,
}: IProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <ToolbarButton
            //size={showArrow ? 'icon' : 'toolbar'}
            aspect={showArrow ? 'auto' : 'icon'}
            pad={showArrow ? 'xs' : 'none'}
            className={cn('gap-x-1', className)}
            title={title}
          >
            {icon}

            {showArrow && <ChevronDown size={16} strokeWidth={2} />}
          </ToolbarButton>
        }
      />

      <DropdownMenuContent
        //onInteractOutside={() => setOpen(false)}
        //onEscapeKeyDown={() => setOpen(false)}
        align="start"
        //sideOffset={20}
        className={menuClassName}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
