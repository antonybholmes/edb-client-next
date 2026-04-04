import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { type ReactNode } from 'react'

import { config } from '@/config'
import type { IDivProps } from '@/interfaces/div-props'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { FavIcon } from '../icons/favicon'
import { BaseLink } from '../link/base-link'
import { HeaderMenuGrid } from './header-menu-grid'

export interface IHeaderChildrenProps {
  leftHeaderChildren?: ReactNode
  headerCenterChildren?: ReactNode
  headerRightChildren?: ReactNode
}

export interface IHeaderProps extends IHeaderChildrenProps, IDivProps {}

export function Header({
  leftHeaderChildren,
  headerRightChildren,

  className, //'bg-linear-to-r from-blue-500 to-indigo-500',
  children,
}: IHeaderProps) {
  return (
    <header className={cn('grid grid-cols-8 md:grid-cols-4 p-1.5', className)}>
      <VCenterRow className="gap-x-1">
        <HeaderMenuGrid />

        <VCenterRow className="hidden md:flex gap-x-4 shrink-0">
          <BaseLink
            className={cn(
              FOCUS_INSET_RING_CLS,
              'hover:bg-muted/50 trans-color rounded-theme'
            )}
            href="/"
            title={`${config.appName} Home`}
          >
            <FavIcon />
          </BaseLink>
        </VCenterRow>
        <VCenterRow id="header-left">{leftHeaderChildren}</VCenterRow>
      </VCenterRow>

      <VCenterRow
        className="justify-center col-span-6 md:col-span-2"
        id="header-center"
      >
        {children}
      </VCenterRow>

      <VCenterRow
        id="header-right"
        className="justify-start hidden md:flex flex-row-reverse gap-x-1"
      >
        {headerRightChildren}
      </VCenterRow>
    </header>
  )
}
