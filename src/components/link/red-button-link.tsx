import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import { ColorButtonLink } from './color-button-link'

export const RED_BUTTON_CLS =
  'bg-red-200 hover:bg-red-300 text-red-600 focus:ring-red-400'

export function RedButtonLink({ className, children, ...props }: ILinkProps) {
  return (
    <ColorButtonLink className={cn(RED_BUTTON_CLS, className)} {...props}>
      {children}
    </ColorButtonLink>
  )
}
