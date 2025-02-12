import { VCenterRow } from '@/components/layout/v-center-row'
import { cn } from '@lib/class-names'
import { type ReactNode } from 'react'

import type { IElementProps } from '@interfaces/element-props'
import Link from 'next/link'
import { FavIcon } from '../icons/favicon'
import { HeaderMenu } from './header-menu'

export interface IHeaderChildrenProps {
  leftHeaderChildren?: ReactNode
  headerCenterChildren?: ReactNode
  headerRightChildren?: ReactNode
  headerTrayChildren?: ReactNode
}

export interface IHeaderProps extends IHeaderChildrenProps, IElementProps {}

export function Header({
  leftHeaderChildren,
  headerRightChildren,
  headerTrayChildren,
  className, //'bg-gradient-to-r from-blue-500 to-indigo-500',
  children,
}: IHeaderProps) {
  return (
    <header className={cn('grid grid-cols-3 h-11', className)}>
      <VCenterRow>
        <HeaderMenu />

        <VCenterRow className="hidden md:flex gap-x-4 shrink-0">
          <Link className="hover:bg-muted trans-color" href="/">
            <FavIcon />
          </Link>
          {/* {leftHeaderChildren && (
            <span className="h-6 w-0.5 bg-foreground/50" />
          )} */}
        </VCenterRow>
        {leftHeaderChildren}
      </VCenterRow>

      <VCenterRow className="justify-center">{children}</VCenterRow>

      <VCenterRow className="justify-end">
        {headerRightChildren}
        {headerTrayChildren}
      </VCenterRow>
    </header>
  )
}
