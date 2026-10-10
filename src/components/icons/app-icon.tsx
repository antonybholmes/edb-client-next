'use client'

import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { cn } from '@/lib/shadcn-utils'
import { capitalCase } from '@/lib/text/capital-case'
import type { IAppHeaderLink } from '@/menus'
import { CSSProperties, useMemo } from 'react'
import { CenterRow } from '../layout/center-row'

export const APP_ICON_CLS = `relative app-icon rounded-full aspect-square shrink-0 grow-0`

export function AppIcon({
  ref,
  appInfo,
  size = 2,
  className,
}: IDivProps & { size?: number; appInfo: IAppInfo | IAppHeaderLink }) {
  const abbr = useMemo(() => {
    if (appInfo.abbr) {
      return capitalCase(appInfo.abbr)
    } else {
      const words = appInfo.name.split(' ')
      return `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`
    }
  }, [appInfo])

  return (
    <CenterRow
      ref={ref}
      className={cn(APP_ICON_CLS, className)}
      // style={{
      //   backgroundColor: appInfo.color ?? 'lightslategray',
      // }}
      style={
        {
          '--base-color': appInfo.color ?? 'lightslategray',
          width: `${size}rem`,
          height: `${size}rem`,
        } as CSSProperties
      }
    >
      <span className="font-bold text-white">{abbr[0]!.toUpperCase()}</span>
      <span className="font-light text-white">{abbr.slice(1)}</span>
    </CenterRow>
  )
}
