import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

import { HEADER_LINKS } from '@/menus'
import { BaseLink, BLANK_TARGET } from '@components/link/base-link'
import { ThemeLink } from '@components/link/theme-link'

import { FOCUS_RING_CLS } from '@/theme'
import { TAILWIND_MEDIA_SM, useWindowSize } from '@hooks/use-window-size'
import type { ILinkProps } from '@interfaces/link-props'
import { VCenterRow } from '@layout/v-center-row'
import { useEdbSettings } from '@lib/edb/edb-settings'
import { useState, type MouseEventHandler } from 'react'
import { GripIcon } from '../icons/grip-icon'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../shadcn/ui/themed/popover'
import { HeaderMenuSheet } from './header-menu-sheet'

export const SIDE_OVERLAY_CLS = cn(
  'fixed inset-0 z-overlay z-(--z-overlay) bg-overlay/30 backdrop-blur-xs duration-500 ease-in-out',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

export const BASE_MUTED_THEME_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-row items-center shrink-0 grow-0 justify-start gap-3 p-2 px-3 group rounded-theme',
  'border border-transparent hover:bg-background/50 hover:border-border hover:shadow-xs'
)

const ICON_CLS =
  'flex w-7.5 aspect-square shrink-0 flex-row items-center justify-center rounded-full text-sm border-2 bg-white'

export function ModuleButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <BaseLink className={cn(BASE_MUTED_THEME_CLS, className)} {...props}>
      {children}
    </BaseLink>
  )
}

export interface IHeaderLinksProps extends IDivProps {
  tab?: string
  handleClick: MouseEventHandler<HTMLAnchorElement>
}

export function HeaderLinks({ handleClick, className }: IHeaderLinksProps) {
  const { settings } = useEdbSettings()

  // sort alphabetically and ignore sections
  const items = HEADER_LINKS.map((section) => {
    return section.modules.filter(
      (module) => module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
    )
  })
    .flat()
    .sort((modA, modB) => modA.name.localeCompare(modB.name))
    .map((module, moduleIndex) => {
      let abbr = ''

      if (module.abbr) {
        abbr = module.abbr
      } else {
        const words = module.name.split(' ')

        abbr = `${words[0]![0]!.toUpperCase()}${words[words.length - 1]![words.length > 1 ? 0 : 1]!.toLowerCase()}`
      }

      return (
        <li key={moduleIndex}>
          <ModuleButtonLink
            href={module.slug}
            onClick={handleClick}
            aria-label={module.name}
            target={
              settings.modules.links.openInNewWindow ? BLANK_TARGET : undefined
            }
            title={module.description}
          >
            <div
              className={ICON_CLS}
              style={{
                borderColor: module.color ?? 'lightslategray',
              }}
            >
              <div
                style={{
                  color: module.color ?? 'lightslategray',
                }}
              >
                <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
                <span>{abbr[1]!.toLowerCase()}</span>
              </div>
            </div>

            <p className="text-xs text-center truncate">{module.name}</p>
          </ModuleButtonLink>
        </li>
      )
    })

  return (
    <ul className={cn('p-2 grid grid-cols-2 gap-1 w-100', className)}>
      {items}
    </ul>
  )
}

interface IFileMenu extends IDivProps {
  tab?: string
}

export function HeaderMenu({ tab = '' }: IFileMenu) {
  const [open, setOpen] = useState(false)

  const windowSize = useWindowSize()

  if (windowSize.w > TAILWIND_MEDIA_SM) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconButton
            id="header-menu-popover-button"
            variant="muted"
            size="2xl"
            rounded="none"
            // ripple={false}
            checked={open}
            aria-label={open ? 'Close Menu' : 'Open Menu'}
          >
            <GripIcon />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent className="ml-1" variant="glass">
          <HeaderLinks tab={tab} handleClick={() => setOpen(false)} />

          <VCenterRow className="p-4 gap-x-5">
            <ThemeLink
              href="/about"
              aria-label="About"
              className="text-xs"
              target={BLANK_TARGET}
            >
              About
            </ThemeLink>
            <ThemeLink
              href="/privacy"
              aria-label="Privacy"
              className="text-xs"
              target={BLANK_TARGET}
            >
              Privacy
            </ThemeLink>
          </VCenterRow>
        </PopoverContent>
      </Popover>
    )
  } else {
    // if the window is small, use the sheet overlay instead
    return <HeaderMenuSheet />
  }
}
