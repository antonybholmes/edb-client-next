import { CENTERED_ROW_CLS } from '@/theme'
import { cn } from '@lib/shadcn-utils'
import { Button } from '@themed/button'
import type { IMenuButtonProps } from '@toolbar/base-side-menu'
import { MenuButtonIcon } from './menu-button-icon'

export function MenuButtonOpen({ open, onClick, className }: IMenuButtonProps) {
  return (
    <Button
      variant="muted"
      size="icon-lg"
      rounded="none"
      onClick={onClick}
      className={cn('h-10 w-10', CENTERED_ROW_CLS, className)}
      aria-label={open ? 'Close Menu' : 'Open Menu'}

      // onMouseEnter={onMouseEnter}
      // onMouseLeave={onMouseLeave}
      // onFocus={onFocus}
      // onBlur={onBlur}
    >
      {/* <span ref={refl1} className={cn(cls, "top-7")} style={style} />
      <span ref={refl3} className={cn(cls, "top-9")} style={style} /> */}

      <MenuButtonIcon />
    </Button>
  )
}
