import { ButtonLink } from '@components/link/button-link'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'

export function ModuleButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <ButtonLink
      variant="ghost"
      size="none"
      justify="start"
      items="start"
      pad="sm"
      className={cn(
        'h-full justify-start gap-x-2 py-2 data-[selected=true]:bg-muted data-[selected=false]:hover:bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </ButtonLink>
  )
}

//font-semibold bg-theme-600 hover:bg-theme-600 text-white shadow-md rounded px-5 py-3 trans"
