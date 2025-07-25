import { CheckIcon } from '@components/icons/check-icon'
import { cn } from '@lib/shadcn-utils'
import { Children, type ComponentProps } from 'react'
import { Button, DROPDOWN_MENU_ICON_CONTAINER_CLS } from './button'

export function DropdownMenuButton({
  ref,
  checked,
  variant = 'menu',
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const c = Children.toArray(children)

  return (
    <Button
      ref={ref}
      variant={variant}
      checked={checked}
      rounded="menu"
      className={cn('flex-row', className)}
      {...props}
    >
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length === 1 && checked && (
          <CheckIcon w="w-3.5 h-3.5" stroke="" style={{ strokeWidth: 3 }} />
        )}
        {c.length > 1 && c[0]}
      </span>

      {c.length > 0 && (
        <span className="grow">{c.length > 1 ? c[1] : c[0]}</span>
      )}
      <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
        {c.length > 2 && c[2]}
      </span>
    </Button>
  )
}
