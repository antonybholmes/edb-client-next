'use client'

import { BaseLink } from '@/components/link/base-link'
import { useDebouncedComponentSize } from '@/hooks/component-size'
import { useStableId } from '@/hooks/stable-id'
import { CenterLayout } from '@/layouts/center-layout'
import { cn } from '@/lib/shadcn-utils'
import { HEADER_LINKS } from '@/menus'
import { CoreProviders } from '@/providers/core-providers'
import { FOCUS_RING_CLS } from '@/theme'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HeaderSlotPortal } from '../header/header-slot-portal'
import { CompactLayoutIcon } from '../icons/compact-layout-icon'
import { BaseCol } from '../layout/base-col'
import { HCenterCol } from '../layout/h-center-col'
import { VCenterRow } from '../layout/v-center-row'
import { Tabs, TabsContent } from '../shadcn/ui/themed/v2/tabs'
import { GroupToggle, ToggleGroup } from '../shadcn/ui/themed/v2/toggle-group'
import { useTabs } from '../tabs/tab-store'
import { VScrollPanel } from '../v-scroll-panel'

const BASE_CLS = cn(
  FOCUS_RING_CLS,
  'transition-color duration-300 ease-out',
  'relative overflow-hidden group'
)

const APP_CLS = cn(
  BASE_CLS,
  'flex flex-col aspect-10/9 shrink-0 justify-start grow px-4 py-5',
  'rounded-xl gap-y-1 border border-border/30 bg-background',
  'hover:shadow-xl'
)

const TABS = Object.freeze(['grid', 'list', 'compact'])

function GridView() {
  const ref = useRef<HTMLUListElement>(null)
  const size = useDebouncedComponentSize(ref)
  const [colsClass, setColsClass] = useState('grid-cols-1')

  useEffect(() => {
    if (size.w > 1000) {
      setColsClass('grid-cols-6')
    } else if (size.w > 750) {
      setColsClass('grid-cols-5')
    } else if (size.w > 550) {
      setColsClass('grid-cols-4')
    } else if (size.w > 400) {
      setColsClass('grid-cols-3')
    } else if (size.w > 250) {
      setColsClass('grid-cols-2')
    } else {
      setColsClass('grid-cols-1')
    }
  }, [size])

  return (
    <TabsContent value="grid" className="justify-center" keepMounted={true}>
      <ul ref={ref} className={cn('grid gap-4 grow', colsClass)}>
        {HEADER_LINKS.map((section) => {
          return section.modules.filter(
            (module) =>
              module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
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
                <BaseLink
                  aria-label={module.name}
                  href={module.slug}
                  className={APP_CLS}
                >
                  <HCenterCol className="gap-y-2">
                    <HCenterCol className="gap-y-2">
                      <VCenterRow
                        className="w-11 h-11 aspect-square shrink-0 rounded-[1.25rem] justify-center text-lg opacity-80 group-hover:opacity-100 trans-all"
                        style={{
                          backgroundColor: module.color ?? 'lightslategray',
                        }}
                      >
                        <span className="font-bold text-white/95">
                          {abbr[0]!.toUpperCase()}
                        </span>
                        <span className="font-thin text-white/80">
                          {abbr[1]!.toLowerCase()}
                        </span>
                      </VCenterRow>

                      <span className="font-semibold text-xs text-center group-hover:text-foreground">
                        {module.name}
                      </span>
                    </HCenterCol>
                    {size.w > 150 && (
                      <span className="text-xs text-center opacity-50">
                        {module.description}
                      </span>
                    )}
                  </HCenterCol>
                </BaseLink>
              </li>
            )
          })}
      </ul>
    </TabsContent>
  )
}

export function ListView() {
  return (
    <TabsContent
      value="list"
      className="grow h-[50vh] flex flex-col"
      keepMounted={true}
    >
      <VScrollPanel className="grow h-full">
        <ul className="flex flex-col">
          {HEADER_LINKS.map((section) => {
            return section.modules.filter(
              (module) =>
                module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
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
                  <BaseLink
                    aria-label={module.name}
                    href={module.slug}
                    className={cn(
                      BASE_CLS,
                      'flex flex-row items-center gap-x-4 p-3 rounded-xl justify-start'
                    )}
                  >
                    <VCenterRow
                      className="w-11 h-11 aspect-square shrink-0 rounded-[1.25rem] justify-center text-lg opacity-80 group-hover:opacity-100 trans-all"
                      style={{
                        backgroundColor: module.color ?? 'lightslategray',
                      }}
                    >
                      <span className="font-bold text-white/95">
                        {abbr[0]!.toUpperCase()}
                      </span>
                      <span className="font-thin text-white/80">
                        {abbr[1]!.toLowerCase()}
                      </span>
                    </VCenterRow>

                    <BaseCol>
                      <span className="font-semibold text-xs text-foreground/80 group-hover:text-foreground">
                        {module.name}
                      </span>
                      <span className="text-xs">{module.description}</span>
                    </BaseCol>
                  </BaseLink>
                </li>
              )
            })}
        </ul>
      </VScrollPanel>
    </TabsContent>
  )
}

export function CompactView() {
  const ref = useRef<HTMLUListElement>(null)
  const size = useDebouncedComponentSize(ref)
  const [colsClass, setColsClass] = useState('grid-cols-1')

  useEffect(() => {
    if (size.w > 600) {
      setColsClass('grid-cols-3')
    } else if (size.w > 200) {
      setColsClass('grid-cols-2')
    } else {
      setColsClass('grid-cols-1')
    }
  }, [size])

  return (
    <TabsContent
      value="compact"
      keepMounted={true}
      className="justify-center grow h-full"
    >
      <ul ref={ref} className={cn('grid gap-1', colsClass)}>
        {HEADER_LINKS.map((section) => {
          return section.modules.filter(
            (module) =>
              module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
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
                <BaseLink
                  aria-label={module.name}
                  href={module.slug}
                  className={cn(
                    BASE_CLS,
                    'flex flex-row items-center gap-x-4 p-3 rounded-xl justify-start'
                  )}
                >
                  <VCenterRow
                    className="w-11 h-11 aspect-square shrink-0 rounded-[1.25rem] justify-center text-lg opacity-80 group-hover:opacity-100 trans-all"
                    style={{
                      backgroundColor: module.color ?? 'lightslategray',
                    }}
                  >
                    <span className="font-bold text-white/95">
                      {abbr[0]!.toUpperCase()}
                    </span>
                    <span className="font-thin text-white/80">
                      {abbr[1]!.toLowerCase()}
                    </span>
                  </VCenterRow>

                  <BaseCol>
                    <span className="font-semibold text-xs text-foreground/80 group-hover:text-foreground">
                      {module.name}
                    </span>
                    <span className="text-xs">{module.description}</span>
                  </BaseCol>
                </BaseLink>
              </li>
            )
          })}
      </ul>
    </TabsContent>
  )
}

export function Apps({
  view = 'grid',
}: {
  view?: 'grid' | 'list' | 'compact'
}) {
  switch (view) {
    case 'list':
      return <ListView />
    case 'compact':
      return <CompactView />
    default:
      return <GridView />
  }
}

export function AppsPage({ title = 'Index' }: { title?: string }) {
  const _id = useStableId()

  const { tab, setTab } = useTabs(_id)

  return (
    <CenterLayout signinRequired={false} title={title}>
      <HeaderSlotPortal slot="header-right">
        <ToggleGroup
          value={[tab?.id ?? '']}
          onValueChange={(v) => {
            if (v[0]) {
              setTab({ id: v[0], index: TABS.indexOf(v[0]!) })
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

      <Tabs
        value={tab?.id ?? 'grid'}
        onValueChange={() => {}}
        className="w-9/10 xl:w-4/5 2xl:w-3/5"
      >
        <GridView />
        <ListView />

        <CompactView />
      </Tabs>
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
