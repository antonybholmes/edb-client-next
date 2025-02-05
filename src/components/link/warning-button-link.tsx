import { ButtonLink, type IButtonLinkProps } from './button-link'

export function WarningButtonLink({ children, ...props }: IButtonLinkProps) {
  return (
    <ButtonLink variant="destructive" {...props}>
      {children}
    </ButtonLink>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
