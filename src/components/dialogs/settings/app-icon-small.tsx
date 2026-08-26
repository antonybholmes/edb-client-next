'use client'

import type { IDivProps } from '@/interfaces/div-props'
import type { IAppInfo } from '@/lib/app-info'
import { cn } from '@/lib/shadcn-utils'
import type { IAppHeaderLink } from '@/menus'

const ICON_CLS = `flex w-5 h-5 aspect-square shrink-0 flex-row  
  items-center justify-center rounded-[0.5rem] text-xs opacity-70 group-data-active:opacity-100`

export function AppIconSmall({
  appInfo,
  className,
}: IDivProps & { appInfo: IAppInfo | IAppHeaderLink }) {
  let abbr = ''

  const words = appInfo.name.split(' ')

  abbr = `${words[0]![0]!.toUpperCase()}` //${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`

  return (
    <div
      className={cn(ICON_CLS, className)}
      style={{
        //color: appInfo.color ?? 'lightslategray',
        //borderColor: appInfo.color ?? 'lightslategray',
        backgroundColor: appInfo.color ?? 'lightslategray',
        //backgroundColor: `${appInfo.color}cc`
      }}
    >
      <span className="font-medium text-white">{abbr[0]!.toUpperCase()}</span>
      {/* <span className="font-light text-white">{abbr[1]!.toLowerCase()}</span> */}
    </div>
  )
}
