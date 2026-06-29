'use client'

import { BaseLink } from '@/components/link/base-link'
import { useDebouncedComponentSize } from '@/hooks/component-size'
import type { IRect } from '@/interfaces/rect'
import { CenterLayout } from '@/layouts/center-layout'
import { addAlphaToHex } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import { HEADER_LINKS, type IAppHeaderLink } from '@/menus'
import { CoreProviders } from '@/providers/core-providers'
import { FOCUS_RING_CLS } from '@/theme'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HeaderSlotPortal } from '../header/header-portal'
import { CompactLayoutIcon } from '../icons/compact-layout-icon'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import { GroupToggle, ToggleGroup } from '../shadcn/ui/themed/v2/toggle-group'
import { VScrollPanel } from '../v-scroll-panel'

const BASE_CLS = cn(
  FOCUS_RING_CLS,

  'relative group'
)

const APP_CLS = cn(
  BASE_CLS,
  'flex flex-col shrink-0 w-full h-full justify-start grow p-2 gap-y-1',
  'data-[view=grid]:items-center data-[view=grid]:text-center',
  'data-[view=grid]:aspect-10/9 data-[view=grid]:py-5'
)

const APP_BG_CLS = cn(
  'absolute rounded-2xl w-full h-full duration-300 ease-out transition-all',
  'pointer-events-none origin-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'data-[hover=true]:scale-101 data-[view=grid]:data-[hover=true]:scale-105'
  //'data-[hover=true]:shadow-lg'
)

function AppIcon({
  module,
  view,
  size,
}: {
  module: IAppHeaderLink
  view: string
  size: IRect
}) {
  const [hover, setHover] = useState(false)
  let abbr = ''

  if (module.abbr) {
    abbr = module.abbr
  } else {
    abbr = `${module.name[0]!.toUpperCase()}${module.name[1]!.toLowerCase()}`
  }

  return (
    <BaseLink
      aria-label={module.name}
      href={module.slug}
      data-view={view}
      className={APP_CLS}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
    >
      <span
        data-view={view}
        data-hover={hover}
        className={APP_BG_CLS}
        style={{
          backgroundColor: addAlphaToHex(
            module.color ?? '#c0c0c0',
            hover ? 0.2 : 0.1
          ),
        }}
      />
      <div
        data-view={view}
        className="flex items-center data-[view=grid]:flex-col gap-2"
      >
        <VCenterRow
          className="w-11 h-11 aspect-square shrink-0 rounded-[1.25rem] justify-center text-xl opacity-90"
          style={{
            backgroundColor: module.color ?? 'lightslategray',
          }}
        >
          <span className="font-bold text-white">{abbr[0]!.toUpperCase()}</span>
          <span className="font-thin text-white">{abbr[1]!.toLowerCase()}</span>
        </VCenterRow>

        <BaseCol
          data-view={view}
          className="items-start gap-y-1 data-[view=grid]:items-center"
        >
          <span className="font-semibold text-xs text-center group-hover:text-foreground">
            {module.name}
          </span>

          {size.w > 150 && (
            <span className="text-xs text-center opacity-50">
              {module.description}
            </span>
          )}
        </BaseCol>
      </div>
    </BaseLink>
  )
}

function GridView({ view }: { view: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const size = useDebouncedComponentSize(ref)
  const [colsClass, setColsClass] = useState('grid-cols-1')

  useEffect(() => {
    switch (view) {
      case 'compact':
        setColsClass('grid-cols-2 gap-x-4 gap-y-2')
        break
      case 'list':
        setColsClass('grid-cols-1 gap-2')
        break
      default:
        if (size.w > 1000) {
          setColsClass('grid-cols-6 gap-5')
        } else if (size.w > 800) {
          setColsClass('grid-cols-5 gap-5')
        } else if (size.w > 650) {
          setColsClass('grid-cols-4 gap-5')
        } else if (size.w > 400) {
          setColsClass('grid-cols-3 gap-5')
        } else if (size.w > 250) {
          setColsClass('grid-cols-2 gap-5')
        } else {
          setColsClass('grid-cols-1 gap-5')
        }
    }
  }, [size, view])

  return (
    <VScrollPanel className="grow w-7/10 xl:w-4/5 2xl:w-3/5 my-16 p-2">
      <ul ref={ref} className={cn('grid px-4 pb-8', colsClass)}>
        {HEADER_LINKS.map((section) => {
          return section.apps.filter(
            (module) =>
              module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
          )
        })
          .flat()
          .sort((modA, modB) => modA.name.localeCompare(modB.name))
          .map((module, moduleIndex) => {
            return (
              <li key={moduleIndex}>
                <AppIcon module={module} view={view} size={size} />
              </li>
            )
          })}
      </ul>
    </VScrollPanel>
  )
}

export function AppsPage({ title = 'Index' }: { title?: string }) {
  const [tab, setTab] = useState('grid')

  return (
    <CenterLayout signinRequired={false} title={title}>
      <HeaderSlotPortal slot="header-right">
        <ToggleGroup
          value={[tab]}
          onValueChange={(v) => {
            if (v[0]) {
              setTab(v[0])
            }
          }}
          size="md"
          aspect="icon"
          pad="none"
          rounded="none"
          className="rounded-theme overflow-hidden shrink-0 hidden lg:flex flex-row gap-x-px"
        >
          <GroupToggle value="grid" title="Grid view" aria-label="Grid view">
            <LayoutGrid size={16} />
          </GroupToggle>

          <GroupToggle value="list" title="List view" aria-label="List view">
            <LayoutList size={16} />
          </GroupToggle>
          <GroupToggle
            value="compact"
            title="Compact view"
            aria-label="Compact view"
          >
            <CompactLayoutIcon />
          </GroupToggle>
        </ToggleGroup>
      </HeaderSlotPortal>

      {/* <Apps view={view} />
       */}

      <GridView view={tab} />

      {/* <Tabs
        value={tab?.id ?? 'grid'}
        onValueChange={() => {}}
        className="w-9/10 xl:w-4/5 2xl:w-3/5"
      >
        <GridView />
        <ListView />

        <CompactView />
      </Tabs> */}
    </CenterLayout>
  )
}

export function AppsQueryPage({ title = 'Index' }: { title?: string }) {
  return (
    <CoreProviders>
      <AppsPage title={title} />
    </CoreProviders>
  )
}
