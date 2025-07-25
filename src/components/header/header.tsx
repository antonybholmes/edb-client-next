import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import { type ReactNode } from 'react'

import { APP_NAME } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { FavIcon } from '../icons/favicon'
import { BaseLink } from '../link/base-link'
import { HeaderMenuGrid } from './header-menu-grid'

export interface IHeaderChildrenProps {
  leftHeaderChildren?: ReactNode
  headerCenterChildren?: ReactNode
  headerRightChildren?: ReactNode
  headerTrayChildren?: ReactNode
}

export interface IHeaderProps extends IHeaderChildrenProps, IDivProps {}

export function Header({
  leftHeaderChildren,
  headerRightChildren,
  headerTrayChildren,
  className, //'bg-linear-to-r from-blue-500 to-indigo-500',
  children,
}: IHeaderProps) {
  return (
    <header
      className={cn('grid grid-cols-8 md:grid-cols-4 h-header', className)}
    >
      <VCenterRow>
        <HeaderMenuGrid />

        <VCenterRow className="hidden md:flex gap-x-4 shrink-0">
          <BaseLink
            className={cn(FOCUS_INSET_RING_CLS, 'hover:bg-muted trans-color')}
            href="/"
            title={`${APP_NAME} Home`}
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

      <VCenterRow className="hidden md:flex justify-end">
        <VCenterRow id="header-right">{headerRightChildren}</VCenterRow>
        {headerTrayChildren}
      </VCenterRow>
    </header>
  )
}
