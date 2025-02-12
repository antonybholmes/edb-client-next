import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { ModuleLayout, type IModuleLayoutProps } from './module-layout'

import { cn } from '@lib/class-names'
import type { ReactNode } from 'react'

export interface IShortcutLayoutProps extends IModuleLayoutProps {
  mainClassName?: string
  shortcuts?: ReactNode
}

export function ShortcutLayout({
  info,
  shortcuts,
  children,
  mainClassName = 'gap-y-2 mb-6',
  ...props
}: IShortcutLayoutProps) {
  //const path = usePathname()

  //const c = Children.toArray(children)

  return (
    <ModuleLayout info={info} {...props}>
      <BaseRow
        className="min-h-0 grow overflow-hidden"
        id="shortcuts-layout-row"
      >
        {shortcuts && (
          <BaseCol className="bg-muted/50 w-11">{shortcuts}</BaseCol>
        )}

        <BaseCol
          className={cn('min-h-0 grow overflow-hidden', mainClassName)}
          id="shortcuts-layout-col"
        >
          {children}
        </BaseCol>
      </BaseRow>
    </ModuleLayout>
  )
}
