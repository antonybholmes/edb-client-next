import { ICON_BUTTON_CLS } from '@/theme'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { cn } from '@lib/shadcn-utils'
import { buttonVariants, type IButtonProps } from '@themed/button'
import { forwardRef, type ComponentProps } from 'react'

const Pagination = ({ className, ...props }: ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('flex', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & IButtonProps &
  ComponentProps<'button'>

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <button
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: 'muted',
        justify: 'center',
        size,
      }),
      className
    )}
    data-checked={isActive}
    data-outline={true}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="icon"
    className={cn('gap-1 ', className)}
    {...props}
  >
    <ChevronRightIcon className="rotate-180" />
    {/* <span>Previous</span> */}
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="icon"
    className={cn('gap-1', className)}
    {...props}
  >
    {/* <span>Next</span> */}
    <ChevronRightIcon />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(
      'flex justify-center items-center',
      ICON_BUTTON_CLS,
      className
    )}
    {...props}
  >
    <span>...</span>
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
