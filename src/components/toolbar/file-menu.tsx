import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { type IOpenChange } from '@/interfaces/open-change'

import {
  dropdownContentVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import { renderTab, type ITab } from '@/components/tabs/tab-provider'
import { TEXT_FILE, TEXT_OPTIONS, TEXT_SETTINGS } from '@/consts'
import type { VariantProps } from 'class-variance-authority'
import { useSettingsTabs } from '../dialogs/settings/setting-tabs-store'
import { CookieIcon } from '../icons/cookie-icon'

import { useAppInfo } from '@/lib/edb/edb-settings'
import { format } from 'date-fns'
import { Globe } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDialogs } from '../dialogs/dialogs'
import { AppInfoContent } from '../header/app-info-button'
import { HelpIcon } from '../icons/help-icon'
import { InfoIcon } from '../icons/info-icon'
import { OptionsIcon } from '../icons/options-icon'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import { BLANK_TARGET } from '../link/base-link'
import { LinkButton } from '../shadcn/ui/themed/link-button'
import { Button } from '../shadcn/ui/themed/v2/button'

export const SIDE_OVERLAY_CLS = cn(
  'fixed inset-0 z-(--z-overlay) bg-overlay/30 backdrop-blur-xs duration-500 ease-in-out',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

interface IFileMenu
  extends IDivProps, IOpenChange, VariantProps<typeof dropdownContentVariants> {
  tabs?: ITab[]
  extMenus?: Record<string, ReactNode>
}

function AppInfo() {
  const { appInfo } = useAppInfo()

  const { open: openDialog } = useDialogs()

  if (!appInfo) {
    return null
  }

  return (
    <>
      <BaseCol className="text-xxs tracking-wide p-2 gap-y-2">
        <VCenterRow className="justify-between gap-x-1">
          <p className="font-bold">{appInfo?.name} Info</p>
          <LinkButton
            onClick={() => {
              openDialog({
                type: 'alert',
                payload: {
                  type: 'default',
                  title: `About ${appInfo?.name}`,
                  component: AppInfoContent,
                },
              })
            }}
          >
            More
          </LinkButton>
        </VCenterRow>

        <BaseCol className="gap-y-1">
          <p>{appInfo?.description}</p>
          <p>
            Build {appInfo.version}.{appInfo.build}
          </p>
          <p>Updated {format(appInfo.modified, 'MMM dd, yyyy')}</p>
          {/* <p>{formatString(appInfo?.copyright)}</p> */}
        </BaseCol>
      </BaseCol>

      <MenuSeparator />
    </>
  )
}

export function FileMenu({
  open = false,
  onOpenChange = () => {},
  tabs = [],
  extMenus = {},
  variant = 'default',
}: IFileMenu) {
  const { openSettings } = useSettingsTabs()

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            data-checked={open}
            aria-label="Open File Menu"
            //title="Open File Menu"
            size="xs"
            pad="sm"
            onClick={() => onOpenChange?.(true)}
          >
            <span data-checked={open} aria-label={TEXT_FILE}>
              {TEXT_FILE}
            </span>
          </Button>
        }
      />

      <DropdownMenuContent
        //onEscapeKeyDown={() => onOpenChange?.(false)}
        //onInteractOutside={() => onOpenChange?.(false)}
        align="start"
        className="w-full"
        variant={variant}
      >
        {tabs.map((tab, ti) => {
          if (tab.id === '<divider>') {
            return <MenuSeparator key={ti} />
          }

          return (
            <DropdownMenuSub key={ti}>
              <DropdownMenuSubTrigger>
                {tab.icon && tab.icon}
                <span>{tab.id}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent variant={variant}>
                  {renderTab(tab)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )
        })}

        <MenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <InfoIcon stroke="" iconMode="bw" />
            <span>Info</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent variant={variant}>
              {extMenus['info'] && (
                <>
                  {extMenus['info']}
                  <MenuSeparator />
                </>
              )}

              <AppInfo />

              <DropdownMenuItem
                onClick={() => {
                  window.open('/privacy', BLANK_TARGET)
                }}
                aria-label="Privacy"
              >
                <CookieIcon />
                <span>Privacy and Cookies</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open('/about', BLANK_TARGET)
                }}
                aria-label="About"
              >
                <HelpIcon />
                <span>About</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <OptionsIcon />
            <span>{TEXT_OPTIONS}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent variant={variant}>
              <DropdownMenuItem
                onClick={() => openSettings()}
                aria-label="Show options"
              >
                <Globe
                  size={20}
                  strokeWidth={1.5}
                  className="stroke-foreground fill-background"
                />
                <span>{TEXT_SETTINGS}</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
