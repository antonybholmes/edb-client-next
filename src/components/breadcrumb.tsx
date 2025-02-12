import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import type { ReactNode } from 'react'

import { ChevronRightIcon } from '@components/icons/chevron-right-icon'

import type { ICrumbProps } from '@lib/crumbs'
import { BaseLink } from './link/base-link'

const LINK_CLS =
  'trans-color text-theme/75 group-hover:text-theme dark:text-theme dark:group-hover:text-white'

interface IBreadcrumbProps extends IElementProps, ICrumbProps {}

export function Breadcrumb({ crumbs, className }: IBreadcrumbProps) {
  if (!crumbs) {
    return null
  }

  const ret: ReactNode[] = []

  ret.push(
    <li key="home">
      {/* <BaseLink
        href="/"
        aria-label="Home"
        className="trans-300 transition-color fill-sky-500/75 hover:fill-sky-500 dark:fill-sky-400 dark:hover:fill-white"
      >
        <HomeIcon w="w-4" />
      </BaseLink> */}
      <BaseLink href="/" aria-label="Home" className={LINK_CLS}>
        Home
      </BaseLink>
    </li>
  )

  // ret.push(<li key={`crumb-${ret.length}`}>{getCrumbLink(["Home", "/"], mode)}</li>)

  for (let i = 0; i < crumbs.length; ++i) {
    const crumb = crumbs[i]!

    ret.push(
      <li key={`divider-${i}`} className="group flex flex-row gap-x-2">
        <ChevronRightIcon
          w="w-3"
          className="trans-300 transition-all stroke-theme group-hover:translate-x-0.5 group-hover:stroke-theme dark:group-hover:stroke-white"
          stroke=""
        />
        <BaseLink
          href={crumb[1]}
          aria-label={`Visit ${crumb[0]}`}
          className={LINK_CLS}
        >
          {crumb[0]}
        </BaseLink>
      </li>
    )
  }

  return (
    <ul
      className={cn(
        'flex flex-row flex-nowrap items-center gap-x-2 text-xs',
        className
      )}
    >
      {ret}
    </ul>
  )
}
