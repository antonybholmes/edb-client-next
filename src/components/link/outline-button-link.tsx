import { ButtonLink } from '@components/link/button-link'
import { type ILinkProps } from '@interfaces/link-props'

import { cn } from '@lib/class-names'

export const OUTLINE_BUTTON_LINK_CLS = `border`

export function OutlineButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <ButtonLink className={cn(OUTLINE_BUTTON_LINK_CLS, className)} {...props}>
      {children}
    </ButtonLink>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
