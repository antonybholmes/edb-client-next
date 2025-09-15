'use client'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

import { HEADER_LINKS } from '@/menus'
import { BaseLink, BLANK_TARGET } from '@components/link/base-link'

import { FOCUS_INSET_RING_CLS } from '@/theme'
import { TAILWIND_MEDIA_SM, useWindowSize } from '@hooks/use-window-size'
import type { ILinkProps } from '@interfaces/link-props'
import { useEdbSettings } from '@lib/edb/edb-settings'
import { useState } from 'react'
import { GripIcon } from '../icons/grip-icon'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../shadcn/ui/themed/popover'

import { VCenterCol } from '../layout/v-center-col'
import { ButtonLink } from '../link/button-link'
import { SearchBox } from '../search-box'
import { Button } from '../shadcn/ui/themed/button'
import { MenuSeparator } from '../shadcn/ui/themed/dropdown-menu'
import type { IHeaderLinksProps } from './header-menu'
import { HeaderMenuSheet } from './header-menu-sheet'

export const SIDE_OVERLAY_CLS = cn(
  'fixed inset-0 z-overlay z-(--z-overlay) bg-overlay/30 backdrop-blur-xs duration-500 ease-in-out',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

export const BASE_MUTED_THEME_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'flex flex-col items-center shrink-0 grow-0 justify-center gap-2 group rounded-theme',
  'border border-transparent hover:border-border/50 hover:shadow-lg dark:hover:bg-foreground/10 aspect-10/9'
  //'transition duration-300 ease-in-out'
)

const ICON_CLS =
  'flex w-7.5 aspect-square shrink-0 flex-row items-center justify-center rounded-full text-sm border-2 bg-white gap-x-0.25'

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

export function HeaderLinks({
  search,
  handleClick,
  width,
  className,
}: IHeaderLinksProps & { width: string; search: string }) {
  const { settings } = useEdbSettings()

  // sort alphabetically and ignore sections
  let items = HEADER_LINKS.map((section) => {
    return section.modules.filter(
      (module) => module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
    )
  })
    .flat()
    .filter(
      (module) =>
        !search ||
        module.name.toLowerCase().includes(search.toLowerCase()) ||
        module.description.toLowerCase().includes(search.toLowerCase())
    )
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
                color: module.color ?? 'lightslategray',
                borderColor: module.color ?? 'lightslategray',
                //backgroundColor: `${module.color}cc`
              }}
            >
              <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
              <span>{abbr[1]!.toLowerCase()}</span>
            </div>

            <p className="text-[0.7rem] text-center truncate">{module.name}</p>
          </ModuleButtonLink>
        </li>
      )
    })

  // items.push(
  //   <li key={items.length}>
  //     <ModuleButtonLink
  //       href="/about"
  //       onClick={handleClick}
  //       aria-label="About"
  //       target={
  //         settings.modules.links.openInNewWindow ? BLANK_TARGET : undefined
  //       }
  //     >
  //       <div
  //         className={ICON_CLS}
  //         style={{
  //           color: 'lightslategray',
  //           borderColor: 'lightslategray',
  //           //backgroundColor: `${module.color}cc`
  //         }}
  //       >
  //         <span className="font-bold">?</span>
  //       </div>

  //       <p className="text-[0.7rem] text-center truncate">About</p>
  //     </ModuleButtonLink>
  //   </li>
  // )

  if (items.length === 0) {
    return (
      <VCenterCol className="items-center" style={{ width, minHeight: '6rem' }}>
        <p className="text-sm text-muted-foreground">{`No results found for "${search}"`}</p>
      </VCenterCol>
    )
  }

  return (
    <ul
      className={cn('grid grid-cols-5', className)}
      style={{ width, minHeight: '6rem' }}
    >
      {items}
    </ul>
  )
}

interface IFileMenu extends IDivProps {
  tab?: string
}

export function HeaderMenuGrid({ tab = '' }: IFileMenu) {
  const [open, setOpen] = useState(false)
  const { settings } = useEdbSettings()
  const windowSize = useWindowSize()
  const width = `${5 * 5.5}rem`
  const [search, setSearch] = useState('')

  if (windowSize.w > TAILWIND_MEDIA_SM) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        {/* <SimpleTooltip content="App launcher" side="right"> */}
        <PopoverTrigger asChild>
          <IconButton
            id="header-menu-popover-button"
            variant="muted"
            size="header"
            rounded="none"
            // ripple={false}
            checked={open}
            aria-label={open ? 'Close Menu' : 'Open Menu'}
            tooltip="App Launcher"
            tooltipSide="right"
          >
            <GripIcon />
          </IconButton>
        </PopoverTrigger>
        {/* </SimpleTooltip> */}
        <PopoverContent
          className="ml-1 flex flex-col gap-y-4 text-sm"
          variant="header"
        >
          <SearchBox
            variant="alt"
            placeholder="Find apps"
            value={search}
            onTextChange={setSearch}
          />
          <HeaderLinks
            search={search}
            tab={tab}
            handleClick={() => setOpen(false)}
            width={width}
          />

          <MenuSeparator />

          <ul className="grid grid-cols-5" style={{ width }}>
            <li>
              <Button
                flow="column"
                size="none"
                className="p-2 gap-y-2 w-full"
                onClick={() => {
                  window.open(
                    '/help/apps',
                    'HelpWindow',
                    'width=1080,height=720,toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
                  )

                  //close()
                }}
                aria-label="Help"
              >
                <div
                  className={ICON_CLS}
                  style={{
                    color: 'lightslategray',
                    borderColor: 'lightslategray',
                    //backgroundColor: `${module.color}cc`
                  }}
                >
                  <span className="font-bold">?</span>
                </div>

                <p className="text-[0.7rem] text-center truncate">Help</p>
              </Button>
            </li>
            <li>
              <ButtonLink
                variant="muted"
                flow="column"
                size="none"
                className="p-2 gap-y-2"
                href="/about"
                onClick={() => setOpen(false)}
                aria-label="About"
                target={
                  settings.modules.links.openInNewWindow
                    ? BLANK_TARGET
                    : undefined
                }
              >
                <div className={cn(ICON_CLS, 'text-theme/50 border-theme/50')}>
                  <span className="font-bold">i</span>
                </div>

                <p className="text-[0.7rem] text-center truncate">About</p>
              </ButtonLink>
            </li>
          </ul>

          {/*<VCenterRow className="gap-x-5 mb-2 justify-end">
            <ButtonLink
              variant="muted"
              href="/about"
              aria-label="About"
              className="text-xs"
              target={BLANK_TARGET}
            >
              About
            </ButtonLink>
    
          </VCenterRow> */}
        </PopoverContent>
      </Popover>
    )
  } else {
    // if the window is small, use the sheet overlay instead
    return <HeaderMenuSheet />
  }
}
