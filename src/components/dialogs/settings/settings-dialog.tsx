'use client'

import type { IChildrenProps } from '@/interfaces/children-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/themed/v2/accordion'

// import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
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
import { SettingsAccordionPanel } from './settings-accordion-panel'

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
        side="right"
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

// export function SettingsDialogBlock({
//   title,
//   children,
// }: IChildrenProps & { title: string }) {
//   return (
//     <BaseCol
//       className="mx-2 py-6 gap-y-4 border-b border-border/50"
//       key={title}
//     >
//       <h2 className="font-semibold text-sm">{title}</h2>
//       <BaseCol className="gap-y-0.5">{children}</BaseCol>
//     </BaseCol>
//   )
// }

export function SettingsDialog({
  onOpenChange = () => {},
  onResponse = () => {},
}: IOKCancelDialogProps) {
  const { tabs } = useSettingsTabs()
  const { selectedTab, setTabs } = useTabs('settings-dialog-tabs')

  // let _tabs: ITab[] = useMemo(
  //   () => [
  //     ...tabs,
  //     // general is reserved for the default tab,
  //     // so we move it to the top and merge its children with the other tabs
  //     //...tabs.filter((tab) => getTabName(tab).toLowerCase() !== 'general'),
  //   ],
  //   [tabs]
  // )

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
      {/* <Tabs
        value={selectedTab?.id ?? ''}
        onValueChange={(v) => {
          setDefaultTab(v)
        }}
        orientation="vertical"
        className="flex flex-col grow text-xs pr-1"
      >
        <TabsList className="py-1 gap-y-px">
          {_tabs.map((tab, ti) => {
            const name = getTabName(tab)
            return (
              <TabsTrigger
                value={name}
                key={ti}
                className="grow"
                variant="sidebar"
                rounded="theme"
              >
                {name}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs> */}

      <BaseCol className="p-2 py-4">
        <OutlookTabs id="settings-dialog-tabs" className="text-xs" />
      </BaseCol>

      <VScrollPanel className="grow">
        <Tabs
          value={selectedTab?.id ?? ''}
          orientation="vertical"
          className="flex flex-col grow text-xs px-2"
        >
          {tabs.map((tab, ti) => {
            return (
              <TabsContent value={tab.id} key={ti}>
                {renderTab(tab)}
                {tab.children && tab.children.length > 0 && (
                  <SettingsAccordionPanel tabs={tab.children} />
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
