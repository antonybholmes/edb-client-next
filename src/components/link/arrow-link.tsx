import { IndexArrowIcon } from '@/components/icons/index-arrow-icon'
import { type ILinkProps } from '@/interfaces/link-props'
import { cn } from '@/lib/shadcn-utils'
import { useState } from 'react'
import { BaseLink } from './base-link'

export function ArrowLink({
  stroke = 'stroke-foreground',
  className,
  children,
  ...props
}: ILinkProps & { stroke?: string }) {
  const [hover, setHover] = useState(false)
  return (
    <BaseLink
      className={cn('inline-flex flex-row items-center', className)}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      {...props}
    >
      {children}

      <IndexArrowIcon className="w-4" stroke={stroke} hover={hover} />
    </BaseLink>
  )
}
