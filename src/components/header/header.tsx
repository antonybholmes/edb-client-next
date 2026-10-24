import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { type ReactNode } from 'react'

import type { IDivProps } from '@/interfaces/div-props'
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
    <header className={cn('grid grid-cols-8 md:grid-cols-4', className)}>
      <VCenterRow id="header-left">
        <HeaderMenuGrid />

        {leftHeaderChildren}
      </VCenterRow>

      <VCenterRow
        className="justify-center col-span-6 md:col-span-2"
        id="header-center"
      >
        {children}
      </VCenterRow>

      <VCenterRow
        id="header-right"
        className="justify-start hidden md:flex flex-row-reverse"
      >
        {headerRightChildren}
      </VCenterRow>
    </header>
  )
}
