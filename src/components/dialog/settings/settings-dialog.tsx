'use client'

import { BaseCol } from '@layout/base-col'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@themed/dialog'

import { TEXT_CANCEL, TEXT_SETTINGS } from '@/consts'
import { VScrollPanel } from '@components/v-scroll-panel'
import { TAILWIND_MEDIA_LG, useWindowSize } from '@hooks/use-window-size'
import { GearIcon } from '@icons/gear-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import { VCenterRow } from '@layout/v-center-row'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@themed/accordion'

import { where } from '@lib/math/where'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Fragment, useEffect, useState } from 'react'
import { getTabName, type ITab } from '../../tabs/tab-provider'
import { SideTabs } from '../../toolbar/side-tabs'
import { GlassSideDialog } from '../glass-side-dialog'
import type { IOKCancelDialogProps } from '../ok-cancel-dialog'
import { useSettingsTabs } from './setting-tabs-store'
import { SettingsDarkModePanel } from './settings-dark-mode-panel'
import { ModulesToolbarPanel } from './settings-modules-panel'
import { SettingsToolbarPanel } from './settings-toolbar-panel'

export function getAccordionId(name: string): string {
  return name.toLowerCase().replaceAll(' ', '-')
}

export function SettingsAccordionItem({
  title,
  value,
  children,
  className,
}: IChildrenProps & { title: string; value?: string }) {
  return (
    <AccordionItem value={getAccordionId(value ?? title)} className={className}>
      <AccordionTrigger variant="settings">{title}</AccordionTrigger>
      <AccordionContent variant="settings">{children}</AccordionContent>
    </AccordionItem>
  )
}

export function SettingsDialogBlock({
  title,
  children,
}: IChildrenProps & { title: string }) {
  return (
    <BaseCol
      className="mx-2 py-6 gap-y-4 border-b border-border/50"
      key={title}
    >
      <h2 className="font-semibold text-sm">{title}</h2>
      <BaseCol className="gap-y-0.5">{children}</BaseCol>
    </BaseCol>
  )
}

export function SettingsDialog({
  open = true,

  onOpenChange = () => {},
  onResponse = () => {},
  //className = 'w-11/12 xl:w-3/4 3xl:w-7/12 h-2/3',
}: IOKCancelDialogProps) {
  const { tabs, defaultTab } = useSettingsTabs()

  let _tabs: ITab[] = [
    {
      id: 'General',
      icon: <GearIcon stroke="" w="w-4.5" strokeWidth={2} />,
      children: [
        {
          id: 'Appearance',
          children: [
            {
              id: 'Dark mode',
              content: <SettingsDarkModePanel />,
            },
            {
              id: 'Toolbars',
              content: <SettingsToolbarPanel />,
            },
            {
              id: 'Modules',
              content: <ModulesToolbarPanel />,
            },
          ],
        },
      ],
    },
  ]

  _tabs = [
    ..._tabs,
    ...tabs.filter((tab) => getTabName(tab).toLowerCase() !== 'general'),
  ]

  // update general
  for (const tab of tabs.filter(
    (tab) => getTabName(tab).toLowerCase() === 'general'
  )) {
    _tabs[0]?.children?.push(tab)
  }

  function _resp(resp: string) {
    onResponse?.(resp)
  }

  const [selectedTab, setSelectedTab] = useState(_tabs[0]!) //= useMemo(() => getTabFromValue(value, tabs), [value, tabs])
  const [subSelectedTab, setSubSelectedTab] = useState(_tabs[0]!.children![0]!)

  useEffect(() => {
    const idx = where(_tabs, (tab) => getTabName(tab) === defaultTab)

    if (idx.length > 0) {
      setSelectedTab(_tabs[idx[0]!]!)
    }
  }, [defaultTab])

  useEffect(() => {
    setSubSelectedTab(selectedTab.children![0]!)
  }, [selectedTab])

  const winSize = useWindowSize()

  if (winSize.w < TAILWIND_MEDIA_LG) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
          className="text-sm flex flex-col w-9/10 h-1/2"
        >
          <VCenterRow className="p-3 justify-between">
            <DialogTitle className="text-xl">
              {getTabName(subSelectedTab)}
            </DialogTitle>
          </VCenterRow>
          <VScrollPanel className="grow">
            {_tabs.map((tab, tabi) => {
              return (
                <Fragment key={tabi}>
                  {tab.children?.map((childTab, childi) => {
                    return (
                      <Fragment key={childi}>
                        {childTab.content && childTab.content}

                        {/* Show sub blocks with a consistent UI */}
                        {childTab.children &&
                          childTab.children.map((g, gi) => {
                            return (
                              <SettingsDialogBlock
                                title={getTabName(g)}
                                key={gi}
                              >
                                {g.content}
                              </SettingsDialogBlock>
                            )
                          })}
                      </Fragment>
                    )
                  })}
                </Fragment>
              )
            })}
          </VScrollPanel>

          <VisuallyHidden asChild>
            <DialogDescription>Application settings</DialogDescription>
          </VisuallyHidden>
        </DialogContent>
      </Dialog>
    )
  } else {
    return (
      <GlassSideDialog
        title={getTabName(subSelectedTab)}
        //span={7}
        cols={3}
        open={open}
        onOpenChange={onOpenChange}
        onResponse={onResponse}
        overlayColor="trans"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 grow text-xs tracking-wide">
          <BaseCol className="md:border-r md:border-border/50 md:gap-4 px-2 col-span-1">
            <h1 className="text-base tracking-normal font-semibold">
              {TEXT_SETTINGS}
            </h1>
            <SideTabs
              tabs={_tabs}
              value={getTabName(selectedTab)}
              onTabChange={(t) => setSelectedTab(t.tab)}
              showIcons={false}
            />
          </BaseCol>
          <SideTabs
            tabs={selectedTab.children!}
            value={getTabName(subSelectedTab)}
            onTabChange={(t) => setSubSelectedTab(t.tab)}
            showIcons={false}
          />
        </div>

        <VScrollPanel className="grow">
          {/* Show sub blocks with a consistent UI */}
          {subSelectedTab.children && (
            <Accordion
              defaultValue={subSelectedTab.children.map((g) =>
                getAccordionId(getTabName(g))
              )}
              type="multiple"
              variant="settings"
            >
              {subSelectedTab.children.map((g, gi) => {
                return (
                  <SettingsAccordionItem title={getTabName(g)} key={gi}>
                    {g.content}
                  </SettingsAccordionItem>
                )
              })}
            </Accordion>
          )}

          {/* To show custom ui boxes */}
          {subSelectedTab.content && subSelectedTab.content}
        </VScrollPanel>
      </GlassSideDialog>
    )
  }
}
