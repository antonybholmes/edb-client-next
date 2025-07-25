import { ButtonLink } from '@components/link/button-link'
import { type ILinkProps } from '@interfaces/link-props'

export function SecondaryButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <ButtonLink variant="secondary" size="lg" {...props}>
      {children}
    </ButtonLink>
  )
}
