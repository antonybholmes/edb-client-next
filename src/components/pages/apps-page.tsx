'use client'

import { ClientLayout } from '@/app/client-layout'
import { BaseLink } from '@/components/link/base-link'
import { useDebouncedComponentSize } from '@/hooks/component-size'
import type { IRect } from '@/interfaces/rect'
import { CenterLayout } from '@/layouts/center-layout'
import { addAlphaToHex } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import { HEADER_LINKS, type IAppHeaderLink } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../icons/app-icon'
import { CenterCol } from '../layout/center-col'
import { VScrollPanel } from '../v-scroll-panel'

const APP_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-col shrink-0 w-full h-full justify-start grow p-2 gap-y-2'
)

const APP_BG_CLS = cn(
  'absolute rounded-3xl w-full aspect-square shrink-0 grow-0',
  'pointer-events-none origin-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
)

function AppTile({
  module,
  view,
  size,
}: {
  module: IAppHeaderLink
  view: string
  size: IRect
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!ref) {
      return
    }
    gsap.timeline().to(ref.current, {
      backgroundColor: addAlphaToHex(
        module.color ?? '#c0c0c0',
        hover ? 0.2 : 0.08
      ),
      scale: hover ? 1.05 : 1,
      duration: 0.3,
      ease: 'power1.out',
    }) // Placeholder for GSAP animation
  }, [hover])

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
      <CenterCol className="relative w-full aspect-square">
        <span ref={ref} className={APP_BG_CLS} />

        <AppIcon appInfo={module} size={3} className="text-lg" />
      </CenterCol>
      <span className="text-xs text-center group-hover:text-foreground">
        {module.name}
      </span>
    </BaseLink>
  )
}

function GridView({ view }: { view: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const size = useDebouncedComponentSize(ref)
  const [colsClass, setColsClass] = useState('grid-cols-1')

  useEffect(() => {
    // switch (view) {
    //   case 'compact':
    //     setColsClass('grid-cols-2 gap-x-4 gap-y-2')
    //     break
    //   case 'list':
    //     setColsClass('grid-cols-1 gap-2')
    //     break
    //   default:
    if (size.w > 700) {
      setColsClass('grid-cols-7 gap-2')
    } else if (size.w > 600) {
      setColsClass('grid-cols-6 gap-2')
    } else if (size.w > 500) {
      setColsClass('grid-cols-5 gap-2')
    } else if (size.w > 400) {
      setColsClass('grid-cols-4 gap-2')
    } else if (size.w > 300) {
      setColsClass('grid-cols-3 gap-2')
    } else if (size.w > 200) {
      setColsClass('grid-cols-2 gap-2')
    } else {
      setColsClass('grid-cols-1 gap-2')
    }
    // }
    //}
  }, [size.w])

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
                <AppTile module={module} view={view} size={size} />
              </li>
            )
          })}
      </ul>
    </VScrollPanel>
  )
}

export function AppsPage({ title = 'Index' }: { title?: string }) {
  const [tab] = useState('grid')

  return (
    <CenterLayout signinRequired={false} title={title}>
      {/* <HeaderSlotPortal slot="header-right">
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
      </HeaderSlotPortal> */}

      <GridView view={tab} />
    </CenterLayout>
  )
}

export function AppsQueryPage({ title = 'Index' }: { title?: string }) {
  return (
    <ClientLayout>
      <AppsPage title={title} />
    </ClientLayout>
  )
}
