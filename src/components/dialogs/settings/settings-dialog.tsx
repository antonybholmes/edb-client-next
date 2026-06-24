'use client'

import { BaseCol } from '@/layout/base-col'

import { Dialog, DialogContent, DialogTitle } from '@/themed/v2/dialog'

import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_SETTINGS } from '@/consts'
import { TAILWIND_MEDIA_LG, useWindowSize } from '@/hooks/window-size'

import type { IChildrenProps } from '@/interfaces/children-props'
import { VCenterRow } from '@/layout/v-center-row'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { SettingsIcon } from '@/components/icons/settings-icon'
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { UndefStr } from '@/lib/text/text'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { SideTabs } from '../../tabs/side-tabs'
import { getTabName, type ITab } from '../../tabs/tab-provider'
import { GlassSideDialog } from '../glass-side-dialog'
import type { IOKCancelDialogProps } from '../ok-cancel-dialog'
import { useSettingsTabs } from './setting-tabs-store'
import { SettingsDarkModePanel } from './settings-dark-mode-panel'
import { AppsToolbarPanel } from './settings-modules-panel'
import { SettingsToolbarPanel } from './settings-toolbar-panel'

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

// These tabs always appear in the UI
const DEFAULT_TABS: ITab[] = [
  {
    id: 'General',
    icon: <SettingsIcon stroke="" size="w-4.5" strokeWidth={2} />,
    children: [
      {
        id: 'Appearance',
        children: [
          {
            id: 'Dark Mode',
            description:
              'Dark mode is a popular feature for reducing eye strain and improving readability in low-light environments.',
            component: () => <SettingsDarkModePanel />,
          },
          {
            id: 'Toolbars',
            description: 'Customize toolbar settings.',
            component: () => <SettingsToolbarPanel />,
          },
          {
            id: 'Apps',
            description: 'Manage and configure apps.',
            component: () => <AppsToolbarPanel />,
          },
        ],
      },
    ],
  },
]

export function SettingsDialog({
  open = true,

  onOpenChange = () => {},
  onResponse = () => {},
  //className = 'w-11/12 xl:w-3/4 3xl:w-7/12 h-2/3',
}: IOKCancelDialogProps) {
  const { tabs } = useSettingsTabs()

  let _tabs: ITab[] = [
    ...DEFAULT_TABS,
    ...tabs.filter((tab) => getTabName(tab).toLowerCase() !== 'general'),
  ]

  // update general
  for (const tab of tabs.filter(
    (tab) => getTabName(tab).toLowerCase() === 'general'
  )) {
    _tabs[0]?.children?.push(tab)
  }

  const [selectedTab, setSelectedTab] = useState(_tabs[0]!) //= useMemo(() => getTabFromValue(value, tabs), [value, tabs])
  const [subSelectedTab, setSubSelectedTab] = useState(_tabs[0]!.children![0]!)

  useEffect(() => {
    setSubSelectedTab(selectedTab.children![0]!)
  }, [selectedTab])

  const winSize = useWindowSize()

  const activeSideTab = getTabName(selectedTab)
  const activeSubSideTab = getTabName(subSelectedTab)

  if (winSize.w < TAILWIND_MEDIA_LG) {
    const accordionValues: string[] = _tabs
      .filter((tab) => tab.children)
      .map((tab) =>
        tab
          .children!.filter((childTab) => childTab.children)
          .map((childTab) =>
            childTab.children!.map((g) => getAccordionId(getTabName(g)))
          )
          .flat()
      )
      .flat()

    console.log('Accordion Values:', accordionValues)

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          //onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
          className="text-sm flex flex-col w-9/10 h-1/2"
        >
          <VCenterRow className="p-3 justify-between">
            <DialogTitle className="text-xl">
              {getTabName(subSelectedTab)}
            </DialogTitle>
          </VCenterRow>
          <ScrollAccordion
            value={accordionValues}
            className="grow"
            variant="settings"
          >
            {_tabs.map((tab, tabi) => {
              return (
                <Fragment key={tabi}>
                  {tab.children?.map((childTab, childi) => {
                    return (
                      <Fragment key={childi}>
                        {childTab.component && childTab.component}

                        {/* Show sub blocks with a consistent UI */}
                        {childTab.children &&
                          childTab.children.map((g, gi) => {
                            return (
                              <SettingsAccordionItem
                                title={getTabName(g)}
                                key={gi}
                              >
                                {g.component}
                              </SettingsAccordionItem>
                            )
                          })}
                      </Fragment>
                    )
                  })}
                </Fragment>
              )
            })}
          </ScrollAccordion>

          {/* <VisuallyHidden asChild>
            <DialogDescription>Application settings</DialogDescription>
          </VisuallyHidden> */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 grow text-xs">
          <BaseCol className="md:gap-4 px-2 col-span-1">
            <h1 className="text-base font-bold">{TEXT_SETTINGS}</h1>

            <SideTabs
              tabs={_tabs}
              value={activeSideTab}
              onTabChange={(t) => {
                setSelectedTab(t.tab)
              }}
              showIcons={false}
            />
          </BaseCol>

          <SideTabs
            tabs={selectedTab.children!}
            value={activeSubSideTab}
            onTabChange={(t) => {
              setSubSelectedTab(t.tab)
            }}
            showIcons={false}
            className="h-full"
          />
        </div>

        <VScrollPanel className="grow">
          {/* Show sub blocks with a consistent UI */}
          {subSelectedTab.children && (
            <Accordion
              defaultValue={subSelectedTab.children.map((g) =>
                getAccordionId(getTabName(g))
              )}
              multiple={true}
              variant="settings"
            >
              {subSelectedTab.children.map((g, gi) => {
                return (
                  <SettingsAccordionItem
                    title={getTabName(g)}
                    description={g.description}
                    key={gi}
                    showBorder={gi > 0}
                  >
                    {g.component}
                  </SettingsAccordionItem>
                )
              })}
            </Accordion>
          )}

          {/* To show custom ui boxes */}
          {subSelectedTab.component && subSelectedTab.component}
        </VScrollPanel>
      </GlassSideDialog>
    )
  }
}
