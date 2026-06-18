'use client'

import {
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { BUTTON_LG_W_CLS } from '@/theme'
import { VCenterRow } from '../layout/v-center-row'
import { AppIcon } from './app-icon'
import { HomeIcon } from './home-icon'

export function FavIcon() {
  return (
    <VCenterRow
      //onMouseEnter={() => setHover(true)}
      //onMouseLeave={() => setHover(false)}
      className={cn(
        BUTTON_LG_W_CLS,
        'aspect-square justify-center group relative'
      )}
    >
      <HomeIcon
        stroke="stroke-theme dark:stroke-foreground stroke-2"
        className={ICON_TRANSITION_FROM_CLS}
      />

      <AppIcon className={ICON_TRANSITION_TO_CLS} />
    </VCenterRow>
  )
}
