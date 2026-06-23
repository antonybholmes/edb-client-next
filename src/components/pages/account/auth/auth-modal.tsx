'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { CenterCol } from '@/components/layout/center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'

interface IProps extends IChildrenProps {
  title: string
}

/**
 * Shows a centered message for authentication-related actions usually
 * to indicate user has signed out or is not allowed to view page without
 * signing in.
 *
 * @param param0
 * @returns
 */
export function AuthModal({ title, className, children }: IProps) {
  return (
    <CenterCol className={cn('gap-y-2', className)}>
      <VCenterRow className="gap-x-2">
        <AppIcon size={10} />
        <p className="font-semibold text-lg text-nowrap">{title}</p>
      </VCenterRow>

      {children}
    </CenterCol>
  )
}
