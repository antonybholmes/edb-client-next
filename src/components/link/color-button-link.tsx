import { ButtonLink } from '@components/link/button-link'
import { type ILinkProps } from '@interfaces/link-props'

import { cn } from '@lib/class-names'

export const COLOR_BUTTON_CLS = 'text-white stroke-white border-transparent'

//export const GRAY_BUTTON_CLS = "hover:bg-gray-200/60 dark:hover:bg-gray-700"

export function ColorButtonLink({ className, children, ...props }: ILinkProps) {
  return (
    <ButtonLink className={cn(COLOR_BUTTON_CLS, className)} {...props}>
      {children}
    </ButtonLink>
  )
}
