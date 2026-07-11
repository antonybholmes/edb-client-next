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
import { getTabName, renderTab, useTabs } from '../../tabs/tab-provider'
import { GlassSideDialog } from '../glass-side-dialog'
import type { IOKCancelDialogProps } from '../ok-cancel-dialog'
import { useSettingsTabs } from './setting-tabs-store'
import { SettingsCardsPanel } from './settings-general-panel'

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
  const { tabs } = useSettingsTabs()
  const { selectedTab, setTabs } = useTabs('settings-dialog-tabs')

  useEffect(() => {
    setTabs(tabs)
  }, [tabs, setTabs])

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
          {tabs.map((tab, ti) => {
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
