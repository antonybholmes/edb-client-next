import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'

import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { HEADER_LINKS } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import { CloseIcon } from '@components/icons/close-icon'
import { BaseLink, BLANK_TARGET } from '@components/link/base-link'
import { ThemeLink } from '@components/link/theme-link'
import { BASE_MUTED_CLS, Button } from '@components/shadcn/ui/themed/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@components/shadcn/ui/themed/sheet'
import type { ILinkProps } from '@interfaces/link-props'
import { useState, type MouseEventHandler } from 'react'
import { FavIcon } from '../icons/favicon'

export function ModuleButtonLink({
  className,
  children,
  ...props
}: ILinkProps) {
  return (
    <BaseLink
      className={cn(
        BASE_MUTED_CLS,
        'flex flex-row items-center shrink-0 grow-0 justify-start gap-3 p-2 px-3 rounded-lg group',
        FOCUS_RING_CLS,
        className
      )}
      {...props}
    >
      {children}
    </BaseLink>
  )
}

interface IHeaderLinksProps extends IElementProps {
  tab?: string
  onClick: MouseEventHandler<HTMLAnchorElement>
}

export function HeaderLinks({ onClick, className }: IHeaderLinksProps) {
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
        abbr = `${module.name[0]!.toUpperCase()}${module.name[1]!.toLowerCase()}`
      }

      return (
        <li key={moduleIndex}>
          <ModuleButtonLink
            href={module.slug}
            onClick={onClick}
            aria-label={module.name}
            target={BLANK_TARGET}
            title={module.description}
          >
            {/* <GearIcon className="mt-1"/> */}

            <div
              className="flex h-7 w-7 shrink-0 flex-row items-center justify-center rounded-full text-sm text-white/95 opacity-75 group-hover:opacity-100 group-focus:opacity-100 trans-opacity"
              style={{
                backgroundColor: module.color ?? 'lightslategray',
              }}
            >
              <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
              <span>{abbr[1]!.toLowerCase()}</span>
            </div>

            <p className="text-xs font-medium text-center truncate">
              {module.name}
            </p>
          </ModuleButtonLink>
        </li>
      )
    })

  return (
    <ul className={cn('p-3 flex flex-col gap-1 w-64', className)}>{items}</ul>
  )
}

interface IFileMenu extends IElementProps {
  tab?: string
}

export function HeaderMenuSheet({ tab = '' }: IFileMenu) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id="header-menu-popover-button"
          variant="trans"
          size="none"
          rounded="none"
          ripple={false}
          selected={open}
          className="h-11 w-11"
          aria-label={open ? 'Close Menu' : 'Open Menu'}
        >
          <FavIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        surface="glass"
        overlayFill="" //"bg-foreground/10"
      >
        <VCenterRow className="justify-end p-2">
          <Button
            variant="muted"
            rounded="full"
            size="icon"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </Button>
        </VCenterRow>
        <BaseCol className="overflow-y-auto custom-scrollbar">
          <HeaderLinks tab={tab} onClick={() => setOpen(false)} />
        </BaseCol>
        <VCenterRow className="p-4 gap-x-5 ">
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
      </SheetContent>
    </Sheet>
  )
}
