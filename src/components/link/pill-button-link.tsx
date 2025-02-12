import { BASE_BUTTON_CLS, FOCUS_RING_CLS, PILL_BUTTON_CLS } from '@/theme'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import { BaseLink } from './base-link'

const PILL_CLS = cn(BASE_BUTTON_CLS, FOCUS_RING_CLS, PILL_BUTTON_CLS)

export function PillButtonLink({ className, children, ...props }: ILinkProps) {
  return (
    <BaseLink className={cn(PILL_CLS, className)} {...props}>
      {children}
    </BaseLink>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
