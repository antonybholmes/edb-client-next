import { Alerts } from '@/components/alerts/alerts'
import { SettingsDialog } from '@/components/dialog/settings/settings-dialog'
import { GearIcon } from '@/components/icons/gear-icon'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Toaster } from '@/components/shadcn/ui/themed/toaster'
import type { ITab } from '@/components/tab-provider'
import { TEXT_SETTINGS } from '@/consts'
import { Header, type IHeaderChildrenProps } from '@components/header/header'
import { cn } from '@lib/class-names'
import { useState } from 'react'
import { type ILayoutProps } from '../interfaces/layout-props'
// import { Toaster } from "@components/shadcn/ui/toaster"

export interface IHeaderLayoutProps extends IHeaderChildrenProps, ILayoutProps {
  headerClassName?: string
  settingsTabs?: ITab[]
  defaultSettingsTab?: string
}

export function HeaderLayout({
  leftHeaderChildren,
  headerCenterChildren,
  headerRightChildren,
  headerTrayChildren,
  headerClassName,
  settingsTabs = [],
  defaultSettingsTab = 'General',
  className,
  children,
}: IHeaderLayoutProps) {
  const [settingsVisible, setSettingsVisible] = useState(false)

  return (
    <>
      <SettingsDialog
        open={settingsVisible}
        tabs={settingsTabs}
        defaultTab={defaultSettingsTab}
        onOpenChange={setSettingsVisible}
        onReponse={() => setSettingsVisible(false)}
      />

      <Header
        leftHeaderChildren={leftHeaderChildren}
        headerRightChildren={headerRightChildren}
        headerTrayChildren={
          <>
            <Button
              id="header-settings-button"
              variant="accent"
              size="header"
              rounded="none"
              ripple={false}
              title={TEXT_SETTINGS}
              selected={settingsVisible}
              onClick={() => setSettingsVisible(true)}
            >
              <GearIcon />
            </Button>

            {headerTrayChildren}
          </>
        }
        className={headerClassName}
      >
        {headerCenterChildren}
      </Header>
      <main
        className={cn('flex flex-col grow relative', className)}
        id="main-layout"
      >
        {children}
      </main>

      <Alerts />
      <Toaster />
    </>
  )
}
