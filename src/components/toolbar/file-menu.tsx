import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import { type IOpenChange } from '@interfaces/open-change'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@components/shadcn/ui/themed/dropdown-menu'
import type { IModuleInfo } from '@interfaces/module-info'

import { TEXT_FILE } from '@/consts'
import type { ITab } from '@components/tab-provider'
import { CookieIcon } from '../icons/cookie-icon'
import { HelpIcon } from '../icons/help-icon'
import { InfoIcon } from '../icons/info-icon'
import { BLANK_TARGET } from '../link/base-link'
import { tabVariants, UNDERLINE_LABEL_CLS } from './underline-tabs'

export const SIDE_OVERLAY_CLS = cn(
  'fixed inset-0 z-overlay z-(--z-overlay) bg-overlay/30 backdrop-blur-sm duration-500 ease-in-out',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

interface IFileMenu extends IElementProps, IOpenChange {
  tabs?: ITab[]
  info?: IModuleInfo
}

export function FileMenu({
  open = false,
  onOpenChange = () => {},
  tabs = [],
}: IFileMenu) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          data-selected={open}
          aria-label="Open File Menu"
          //title="Open File Menu"
          className={tabVariants({
            variant: 'default',
            className: 'px-2.5 py-1  mb-1',
          })}
          onClick={() => onOpenChange?.(true)}
        >
          <span
            data-selected={open}
            aria-label={TEXT_FILE}
            className={UNDERLINE_LABEL_CLS}
          >
            {TEXT_FILE}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onEscapeKeyDown={() => onOpenChange?.(false)}
        onInteractOutside={() => onOpenChange?.(false)}
        align="start"
        className="w-full"
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
                <DropdownMenuSubContent>
                  {tab.content && tab.content}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )
        })}

        <MenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <InfoIcon stroke="" />
            <span>Info</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  window.open('/privacy', BLANK_TARGET)
                }}
                aria-label="Privacy"
              >
                <CookieIcon stroke="" />
                <span>Privacy and cookies</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open('/about', BLANK_TARGET)
                }}
                aria-label="About"
              >
                <HelpIcon stroke="" />
                <span>About</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
