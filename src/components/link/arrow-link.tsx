import { IndexArrowIcon } from '@icons/index-arrow'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import { BaseLink } from './base-link'

export function ArrowLink({ className, children, ...props }: ILinkProps) {
  return (
    <BaseLink
      className={cn('inline-flex flex-row items-center gap-x-1', className)}
      {...props}
    >
      {children}

      <IndexArrowIcon className="w-4 stroke-2" />
    </BaseLink>
  )
}
