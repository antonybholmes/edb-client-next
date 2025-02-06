import { BaseCol } from '@/components/layout/base-col'
import { Button } from '@components/shadcn/ui/themed/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/shadcn/ui/themed/dialog'

import { GearIcon } from '@/components/icons/gear-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/accordion'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_CANCEL, TEXT_SETTINGS } from '@/consts'
import { TAILWIND_MEDIA_LG, useWindowSize } from '@/hooks/use-window-size'
import type { IChildrenProps } from '@/interfaces/children-props'
import { where } from '@/lib/math/math'
import { cn } from '@lib/class-names'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { X } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { getTabName, type ITab } from '../../tab-provider'
import { SideTabs } from '../../toolbar/side-tabs'
import type { IOKCancelDialogProps } from '../ok-cancel-dialog'
import { SettingsDarkModePanel } from './settings-dark-mode-panel'
import { SettingsToolbarPanel } from './settings-toolbar-panel'

export function getAccordionId(name: string): string {
  return name.toLowerCase().replaceAll(' ', '-')
}

export function SettingsAccordionItem({
  title,
  children,
  className,
}: IChildrenProps & { title: string }) {
  return (
    <AccordionItem
      value={getAccordionId(title)}
      className={cn('text-sm', className)}
    >
      <AccordionTrigger variant="basic">{title}</AccordionTrigger>
      <AccordionContent>
        <BaseCol className="gap-y-0.5 pb-4 border-b border-border">
          {children}{' '}
        </BaseCol>
      </AccordionContent>
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

export interface IProps extends IOKCancelDialogProps {
  tabs?: ITab[]
  defaultTab?: string
}

export function SettingsDialog({
  open = true,
  tabs = [],
  defaultTab = 'General',
  onOpenChange = () => {},
  onReponse = () => {},
  className = 'w-11/12 xl:w-3/4 3xl:w-7/12 h-2/3',
}: IProps) {
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
    onReponse?.(resp)
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

  if (winSize.width < TAILWIND_MEDIA_LG) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
          className={cn('text-sm flex flex-col', className)}
        >
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
        </DialogContent>
      </Dialog>
    )
  } else {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
          className={cn('text-sm grid grid-cols-1 lg:grid-cols-3', className)}
          contentVariant="glass"
          //overlayVariant="blurred"
          //overlayColor="trans"
        >
          <div className=" rounded-l-xl grid grid-cols-1 lg:grid-cols-2 grow p-5 text-xs">
            <BaseCol className="md:border-r md:border-border/50 md:gap-4">
              <h1 className="text-xl font-medium">{TEXT_SETTINGS}</h1>
              <SideTabs
                tabs={_tabs}
                value={getTabName(selectedTab)}
                onTabChange={(t) => setSelectedTab(t.tab)}
              />
            </BaseCol>
            <SideTabs
              tabs={selectedTab.children!}
              value={getTabName(subSelectedTab)}
              onTabChange={(t) => setSubSelectedTab(t.tab)}
              showIcons={false}
            />
          </div>

          <BaseCol className="col-span-2 bg-background rounded-r-xl text-xs">
            <DialogHeader className="mb-2 border-b border-border">
              <VCenterRow className="px-6 py-3 -mr-3 justify-between">
                <DialogTitle className="text-xl">
                  {getTabName(subSelectedTab)}
                </DialogTitle>

                <VCenterRow className="gap-x-2">
                  <Button
                    variant="accent"
                    size="icon-lg"
                    rounded="full"
                    pad="none"
                    onClick={() => _resp(TEXT_CANCEL)}
                  >
                    <X />
                  </Button>
                </VCenterRow>
              </VCenterRow>
            </DialogHeader>

            <BaseCol className="p-4 grow">
              <VScrollPanel className="grow">
                {/* Show sub blocks with a consistent UI */}
                {subSelectedTab.children && (
                  <Accordion
                    defaultValue={subSelectedTab.children.map((g) =>
                      getAccordionId(getTabName(g))
                    )}
                    type="multiple"
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
            </BaseCol>
          </BaseCol>

          <VisuallyHidden asChild>
            <DialogDescription>Application settings</DialogDescription>
          </VisuallyHidden>
        </DialogContent>
      </Dialog>
    )
  }
}
