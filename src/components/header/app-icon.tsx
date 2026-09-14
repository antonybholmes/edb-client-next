'use client'

import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { cn } from '@/lib/shadcn-utils'
import { capitalCase } from '@/lib/text/capital-case'
import type { IAppHeaderLink } from '@/menus'
import { CSSProperties } from 'react'

export const APP_ICON_CLS = `app-icon flex w-9 h-9 aspect-square shrink-0 flex-row  
  items-center justify-center rounded-full text-sm`

export function AppIcon({
  appInfo,
  className,
}: IDivProps & { appInfo: IAppInfo | IAppHeaderLink }) {
  let abbr = ''

  if (appInfo.abbr) {
    abbr = capitalCase(appInfo.abbr)
  } else {
    const words = appInfo.name.split(' ')

    abbr = `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`
  }

  return (
    <div
      className={cn(APP_ICON_CLS, className)}
      // style={{
      //   backgroundColor: appInfo.color ?? 'lightslategray',
      // }}
      style={
        { '--base-color': appInfo.color ?? 'lightslategray' } as CSSProperties
      }
    >
      <span className="font-bold text-white">{abbr[0]!.toUpperCase()}</span>
      <span className="font-light text-white">{abbr.slice(1)}</span>
    </div>
  )
}
