'use client'

import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'

import { BaseLink, BLANK_TARGET } from '@/components/link/base-link'
import { HEADER_LINKS } from '@/menus'

import type { ILinkProps } from '@/interfaces/link-props'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { useEffect, useRef, useState } from 'react'
import { GripIcon } from '../icons/grip-icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../shadcn/ui/themed/v2/popover'

import { DOCS_URL } from '@/consts'
import {
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
} from '@/interfaces/icon-props'

import { HeaderIconButton } from '@/layouts/header-icon-button'
import gsap from 'gsap'
import { HelpCircle, Info, LayoutGrid } from 'lucide-react'
import { CenterCol } from '../layout/center-col'
import { VCenterCol } from '../layout/v-center-col'
import { ButtonLink } from '../link/button-link'
import { SearchBox } from '../search-box'
import { Button } from '../shadcn/ui/themed/v2/button'
import { LineSeparator } from '../shadcn/ui/themed/v2/dropdown-menu'
import { VScrollPanel } from '../v-scroll-panel'

import { AppIcon } from './app-icon'
import type { IHeaderLinksProps } from './header-menu'

export const SIDE_OVERLAY_CLS = cn(
  'fixed inset-0 z-(--z-overlay) bg-overlay/30 backdrop-blur-xs duration-500 ease-in-out',
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
)

export const BASE_MUTED_THEME_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'flex flex-col items-center shrink-0 grow-0 justify-center gap-3 group',
  'aspect-10/9 relative'
  //'transition duration-300 ease-in-out'
)

const MODULE_BG_CLS = cn(
  'absolute rounded-2xl w-full h-full duration-300 ease-out transition-all bg-background',
  'pointer-events-none origin-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'data-[hover=true]:scale-105 data-[hover=true]:bg-muted/50 rounded-xl'
)

const ICON_CLS = `flex w-9 h-9 aspect-square shrink-0 flex-row  
  items-center justify-center rounded-2xl text-sm gap-x-0.25`

export function ModuleButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  const [hover, setHover] = useState(false)

  return (
    <BaseLink
      className={cn(BASE_MUTED_THEME_CLS, className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      <span className={MODULE_BG_CLS} data-hover={hover} />
      <CenterCol className="grow w-full h-full z-10 relative gap-3">
        {children}
      </CenterCol>
    </BaseLink>
  )
}

export function HeaderLinks({
  search,
  handleClick,
  width,
  className,
}: IHeaderLinksProps & { width: string; search?: string }) {
  const { settings } = useEdbSettings()

  // sort alphabetically and ignore sections
  let items = HEADER_LINKS.map((section) => {
    return section.apps.filter(
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
      return (
        <li key={moduleIndex}>
          <ModuleButtonLink
            href={module.slug}
            onClick={handleClick}
            aria-label={module.name}
            target={
              settings.apps.links.openInNewWindow ? BLANK_TARGET : undefined
            }
            title={module.description}
          >
            <AppIcon appInfo={module} />

            <p className="  text-center truncate ">{module.name}</p>
          </ModuleButtonLink>
        </li>
      )
    })

  if (items.length === 0) {
    return (
      <VCenterCol className="items-center" style={{ width, minHeight: '6rem' }}>
        <p className="text-sm text-muted-foreground">{`No results found for "${search}"`}</p>
      </VCenterCol>
    )
  }

  return (
    <ul
      className={cn('grid grid-cols-5 mt-2', className)}
      style={{ width, minHeight: '6rem' }}
    >
      {items}
    </ul>
  )
}

export function SearchHeaderLinks({
  ref,
  search,
  handleClick,

  className,
}: IHeaderLinksProps & { width: string; search?: string }) {
  const { settings } = useEdbSettings()

  // sort alphabetically and ignore sections
  let items = HEADER_LINKS.map((section) => {
    return section.apps.filter(
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
          <ButtonLink
            variant="flat"
            href={module.slug}
            onClick={() => handleClick()}
            aria-label={module.name}
            target={
              settings.apps.links.openInNewWindow ? BLANK_TARGET : undefined
            }
            title={module.description}
            size="xl"
            className="w-full justify-start gap-3"
          >
            <div
              className={ICON_CLS}
              style={{
                //color: module.color ?? 'lightslategray',
                backgroundColor: module.color ?? 'lightslategray',
                //backgroundColor: `${module.color}cc`
              }}
            >
              <span className="font-bold text-white/95">
                {abbr[0]!.toUpperCase()}
              </span>
              <span className="text-white/80">{abbr[1]!.toLowerCase()}</span>
            </div>

            <p className="text-[0.7rem] text-center truncate font-medium">
              {module.name}
            </p>
          </ButtonLink>
        </li>
      )
    })

  return (
    <VScrollPanel
      className="absolute left-0 top-0 right-1 bottom-2 bg-background translate-x-1/4 z-100 opacity-0 invisible pointer-events-none"
      ref={ref}
    >
      {items.length > 0 ? (
        <ul className={cn('w-full pl-4 pr-3', className)}>{items}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">{`No results found for "${search}"`}</p>
      )}
    </VScrollPanel>
  )
}

interface IFileMenu extends IDivProps {
  tab?: string
}

export function HeaderMenuGrid({ tab = '' }: IFileMenu) {
  const [open, setOpen] = useState(false)
  const { settings } = useEdbSettings()
  //const windowSize = useWindowSize()
  const width = `${5 * 6}rem`
  const [search, setSearch] = useState('')

  const searchRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchRef.current || !gridRef.current) {
      return
    }

    if (search !== '') {
      gsap
        .timeline()
        .to(
          gridRef.current,
          {
            x: '-25%',
            opacity: 0,
            duration: 0.5,
            autoAlpha: 0, // visible + interactive
            pointerEvents: 'none',
            ease: 'power3.out',
          },
          0
        )
        .to(
          searchRef.current,
          {
            x: '0%',
            opacity: 1,
            duration: 0.5,
            autoAlpha: 1, // visible + interactive
            pointerEvents: 'auto',
            ease: 'power3.out',
          },
          0
        )
    } else {
      gsap
        .timeline()
        .to(
          searchRef.current,
          {
            x: '25%',
            opacity: 0,
            duration: 0.5,
            autoAlpha: 0, // hides + disables interaction
            pointerEvents: 'none',
            ease: 'power3.out',
          },
          0
        )
        .to(
          gridRef.current,

          {
            x: '0%',
            opacity: 1,
            duration: 0.5,
            autoAlpha: 1, // visible + interactive
            pointerEvents: 'auto',
            ease: 'power3.out',
          },
          0
        )
    }
  }, [search])

  // if (windowSize.w > TAILWIND_MEDIA_SM) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* <SimpleTooltip content="App launcher" side="right"> */}
      <PopoverTrigger
        render={
          <HeaderIconButton
            id="header-menu-popover-button"
            // ripple={false}
            checked={open}
            //aria-label={open ? 'Close Menu' : 'Open Menu'}
            //tooltip="App Launcher"
            //tooltipSide="right"
            title="App Launcher"
          >
            <GripIcon className={ICON_TRANSITION_FROM_CLS} />
            <LayoutGrid
              className={cn(
                'w-4.5 h-4.5 stroke-foreground/50',
                ICON_TRANSITION_TO_CLS
              )}
            />
          </HeaderIconButton>
        }
      />
      {/* </SimpleTooltip> */}
      <PopoverContent
        className="flex flex-col gap-y-4 pt-4 text-sm"
        variant="none"
      >
        <VCenterCol className="px-4">
          <SearchBox
            variant="alt"
            placeholder="Find apps..."
            value={search}
            onTextChange={setSearch}
            className="text-xs"
            clear={() => setSearch('')}
          />
        </VCenterCol>
        <VCenterCol className="relative overflow-hidden pb-2">
          <VCenterCol ref={gridRef} className="gap-y-4 px-4 bg-background">
            <HeaderLinks
              tab={tab}
              handleClick={() => setOpen(false)}
              width={width}
            />

            <LineSeparator />

            <ul className="grid grid-cols-5" style={{ width }}>
              <li>
                <Button
                  variant="flat"
                  flow="column"
                  size="none"
                  rounded="xl"
                  className="p-2 gap-3 aspect-10/9 w-full h-full"
                  onClick={() => {
                    window.open(
                      DOCS_URL,
                      'HelpWindow',
                      'width=1080,height=720,toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
                    )
                  }}
                  aria-label="Help"
                >
                  <div
                    className={ICON_CLS}
                    style={{
                      backgroundColor: 'lightslategray',
                    }}
                  >
                    <HelpCircle className="text-white/95" />
                  </div>

                  <p className="text-[0.7rem] text-center truncate">Help</p>
                </Button>
              </li>
              <li>
                <ButtonLink
                  variant="flat"
                  flow="column"
                  size="none"
                  rounded="xl"
                  className="p-2 gap-3 aspect-10/9 w-full h-full"
                  href="/about"
                  onClick={() => setOpen(false)}
                  aria-label="About"
                  target={
                    settings.apps.links.openInNewWindow
                      ? BLANK_TARGET
                      : undefined
                  }
                >
                  <div className={cn(ICON_CLS, 'bg-theme/80')}>
                    <Info className="text-white/95" />
                  </div>

                  <p className="text-[0.7rem] text-center truncate">About</p>
                </ButtonLink>
              </li>
            </ul>
          </VCenterCol>
          <SearchHeaderLinks
            ref={searchRef}
            tab={tab}
            handleClick={() => setOpen(false)}
            width={width}
            search={search}
          />
        </VCenterCol>
      </PopoverContent>
    </Popover>
  )
}
