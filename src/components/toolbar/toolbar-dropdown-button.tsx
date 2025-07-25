import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { cn } from '@lib/shadcn-utils'
import { useState, type ComponentProps, type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/dropdown-menu'
import { ToolbarButton } from './toolbar-button'

interface IProps extends ComponentProps<'button'> {
  icon: ReactNode
  menuClassName?: string
}

export function ToolbarDropdownButton({
  icon,
  className,
  menuClassName,
  children,
  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className={cn('gap-x-2', className)}
          {...props}
          //checked={open}
          //onClick={() => setOpen(true)}
        >
          {icon}

          <ChevronRightIcon
            className="rotate-90 -mr-1"
            stroke="stroke-foreground stroke-2"
          />
        </ToolbarButton>
      </DropdownMenuTrigger>

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
