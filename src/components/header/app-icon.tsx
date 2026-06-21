'use client'

import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { cn } from '@/lib/shadcn-utils'
import type { IAppHeaderLink } from '@/menus'
const ICON_CLS = `flex w-button-md h-button-md aspect-square shrink-0 flex-row  
  items-center justify-center rounded-[0.9rem] text-sm gap-x-0.25`

export function AppIcon({
  appInfo,
  className,
}: IDivProps & { appInfo: IAppInfo | IAppHeaderLink }) {
  let abbr = ''

  const words = appInfo.name.split(' ')

  abbr = `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`

  return (
    <div
      className={cn(ICON_CLS, className)}
      style={{
        //color: appInfo.color ?? 'lightslategray',
        backgroundColor: appInfo.color ?? 'lightslategray',
        //backgroundColor: `${appInfo.color}cc`
      }}
    >
      <span className="font-medium text-white/95">
        {abbr[0]!.toUpperCase()}
      </span>
      <span className="font-light text-white/95">{abbr[1]!.toLowerCase()}</span>
    </div>
  )
}
