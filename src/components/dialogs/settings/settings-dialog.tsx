'use client'

import type { IChildrenProps } from '@/interfaces/children-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/themed/v2/accordion'

import { BaseCol } from '@/components/layout/base-col'
import { OutlookTabs } from '@/components/pages/apps/matcalc/data/outlook-tabs'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import type { UndefStr } from '@/lib/text/text'
import { useEffect, type ReactNode } from 'react'
import { getTabName, ITab, renderTab, useTabs } from '../../tabs/tab-provider'
import { GlassSideDialog } from '../glass-side-dialog'
import type { IOKCancelDialogProps } from '../ok-cancel-dialog'

import { SettingsCytobandPanel } from '@/components/pages/apps/genomic/seq-browser/settings/settings-cytoband-panel'
import { SettingsPlotPanel } from '@/components/pages/apps/genomic/seq-browser/settings/settings-plot-panel'
import { SettingsTracksPanel } from '@/components/pages/apps/genomic/seq-browser/settings/settings-tracks-panel'
import { SettingsAppsPanel } from '@/components/pages/apps/matcalc/settings/settings-apps-panel'
import { Compass, Layers, Settings } from 'lucide-react'
import {
  SettingsCardsPanel,
  SettingsGeneralPanel,
} from './settings-general-panel'

import { AppIconSmall } from '@/components/dialogs/settings/app-icon-small'
import SEQ_BROWSER_APP_INFO from '@/components/pages/apps/genomic/seq-browser/manifest.json'
import MATCALC_APP_INFO from '@/components/pages/apps/matcalc/manifest.json'

// These tabs always appear in the UI
export const DEFAULT_TABS: readonly ITab[] = Object.freeze([
  {
    id: '019f0ae9-18f6-730c-b7f5-6e619b5bbe4e',
    name: 'General',
    icon: <Settings size="w-4.5" strokeWidth={1.5} />,
    component: SettingsGeneralPanel,
  },
  {
    id: '019f3a36-ee0d-7ac1-ad56-e92dbec44927',
    name: MATCALC_APP_INFO.name,
    icon: <AppIconSmall appInfo={MATCALC_APP_INFO} />,
    component: SettingsAppsPanel,
  },
  {
    id: '01a03f83-1204-7632-afdf-6eb4877a5efc',
    name: SEQ_BROWSER_APP_INFO.name,
    icon: <AppIconSmall appInfo={SEQ_BROWSER_APP_INFO} />,

    children: [
      {
        id: '01a03fe2-87fc-777d-8231-093de6dec6b7',
        name: 'Plot',
        icon: <Compass />,
        component: SettingsPlotPanel,
      },
      {
        id: '01a03fe2-c801-77e4-b95e-b1d25d86dd9e',
        name: 'Tracks',
        icon: <Layers />,
        component: SettingsTracksPanel,
      },
      {
        id: '01a03fe3-0697-713c-b933-a060b1b866d5',
        name: 'Cytobands',
        icon: <Layers />,
        component: SettingsCytobandPanel,
      },
    ],
  },
])

export function getAccordionId(name: string): string {
  return name.toLowerCase().replaceAll(' ', '-')
}

export function SettingsAccordionItem({
  title,
  value,
  description,
  showBorder = true,
  rightChildren,
  children,
}: IChildrenProps & {
  title: string
  value?: string
  description?: UndefStr
  showBorder?: boolean
  rightChildren?: ReactNode
}) {
  return (
    <AccordionItem value={getAccordionId(value ?? title)} variant="settings">
      <AccordionTrigger
        variant="settings"
        side="right"
        data-show-border={showBorder}
        rightChildren={rightChildren}
      >
        {title}
      </AccordionTrigger>
      {description && (
        <div className="text-sm text-foreground/50">{description}</div>
      )}
      <AccordionContent variant="settings">{children}</AccordionContent>
    </AccordionItem>
  )
}

export function SideAccordionItem({
  title,
  value,
  description,
  showBorder = true,
  rightChildren,
  children,
}: IChildrenProps & {
  title: string
  value?: string
  description?: UndefStr
  showBorder?: boolean
  rightChildren?: ReactNode
}) {
  return (
    <AccordionItem value={getAccordionId(value ?? title)} variant="sidebar">
      <AccordionTrigger
        variant="sidebar"
        //side="right"
        data-show-border={showBorder}
        rightChildren={rightChildren}
      >
        {title}
      </AccordionTrigger>
      {description && (
        <div className="text-sm text-foreground/50">{description}</div>
      )}
      <AccordionContent variant="sidebar">{children}</AccordionContent>
    </AccordionItem>
  )
}

export function SettingsDialog({
  onOpenChange = () => {},
  onResponse = () => {},
}: IOKCancelDialogProps) {
  const { selectedTab, setTabs } = useTabs('settings-dialog-tabs')

  useEffect(() => {
    setTabs(DEFAULT_TABS)
  }, [setTabs])

  //const winSize = useWindowSize()

  return (
    <GlassSideDialog
      title={getTabName(selectedTab)}
      cols={4}
      onOpenChange={onOpenChange}
      onResponse={onResponse}
      overlayColor="trans"
    >
      <BaseCol className="p-3 py-4">
        <OutlookTabs id="settings-dialog-tabs" className="text-xs" />
      </BaseCol>

      <VScrollPanel className="grow">
        <Tabs
          value={selectedTab?.id ?? ''}
          orientation="vertical"
          className="flex flex-col grow text-xs"
        >
          {DEFAULT_TABS.map((tab, ti) => {
            return (
              <TabsContent value={tab.id} key={ti}>
                {renderTab(tab)}
                {tab.children && tab.children.length > 0 && (
                  <SettingsCardsPanel tabs={tab.children} />
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </VScrollPanel>
    </GlassSideDialog>
  )
  //}
}
