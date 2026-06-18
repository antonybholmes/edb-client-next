'use client'

import { config } from '@/config'
import {
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

import { useAppInfo } from '@/lib/edb/edb-settings'
import { HomeIcon } from '../icons/home-icon'
import { VCenterRow } from '../layout/v-center-row'
import { BaseLink } from '../link/base-link'
import { AppIcon } from './app-icon'

export function AppHeaderIcon() {
  const { appInfo } = useAppInfo()

  if (!appInfo) {
    return null
  }

  return (
    <BaseLink href="/" title={`${config.name} Home`}>
      <VCenterRow
        //onMouseEnter={() => setHover(true)}
        //onMouseLeave={() => setHover(false)}
        className={cn(
          //BUTTON_LG_W_CLS,
          'aspect-square justify-center group relative'
        )}
      >
        <AppIcon appInfo={appInfo} className={ICON_TRANSITION_FROM_CLS} />

        <HomeIcon
          className={ICON_TRANSITION_TO_CLS}
          stroke=""
          //strokeWidth={0}
          style={{
            fill: appInfo.color ?? 'lightslategray',
            stroke: appInfo.color ?? 'lightslategray',
          }}
        />
      </VCenterRow>
    </BaseLink>
  )
}
