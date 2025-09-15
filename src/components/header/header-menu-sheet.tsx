import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

import { HEADER_LINKS } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import { BaseLink, BLANK_TARGET } from '@components/link/base-link'
import { ThemeLink } from '@components/link/theme-link'
import { CloseIcon } from '@icons/close-icon'
import type { ILinkProps } from '@interfaces/link-props'
import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { BASE_MUTED_CLS, Button } from '@themed/button'
import { Sheet, SheetContent, SheetTrigger } from '@themed/sheet'
import { useState } from 'react'
import { GripIcon } from '../icons/grip-icon'
import { DialogTitle } from '../shadcn/ui/dialog'
import { DialogDescription } from '../shadcn/ui/themed/dialog'
import type { IHeaderLinksProps } from './header-menu'

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

export function HeaderLinks({ handleClick, className }: IHeaderLinksProps) {
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
            onClick={handleClick}
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

interface IFileMenu extends IDivProps {
  tab?: string
}

export function HeaderMenuSheet({ tab = '' }: IFileMenu) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id="header-menu-popover-button"
          variant="muted"
          size="none"
          rounded="none"
          // ripple={false}
          checked={open}
          className="h-header w-header"
          aria-label={open ? 'Close Menu' : 'Open Menu'}
        >
          <GripIcon />
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
          <HeaderLinks tab={tab} handleClick={() => setOpen(false)} />
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

        <VisuallyHidden asChild>
          <DialogTitle>Header Menu</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>Header Menu</DialogDescription>
        </VisuallyHidden>
      </SheetContent>
    </Sheet>
  )
}
