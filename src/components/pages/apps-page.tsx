// 'use client'

import { HEADER_LINKS } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import { BaseLink } from '@components/link/base-link'
import { ContentLayout } from '@layouts/content-layout'
import { cn } from '@lib/shadcn-utils'
import { CoreProviders } from '@providers/core-providers'
import { HCenterCol } from '../layout/h-center-col'
import { VCenterRow } from '../layout/v-center-row'

const APP_CLS = cn(
  FOCUS_RING_CLS,
  'border border-border/25',
  'flex flex-col bg-background lg:aspect-3/2 justify-center items-center h-full gap-2 p-2 rounded-2xl hover:scale-108 transition duration-500 ease-in-out'
)

export function Apps() {
  return (
    <ul className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6  ">
      {HEADER_LINKS.map(section => {
        return section.modules.filter(
          module =>
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
                <VCenterRow
                  className="w-12 aspect-square shrink-0 rounded-full justify-center bg-white text-2xl"
                  style={{
                    borderColor: module.color ?? 'lightslategray',
                    borderWidth: 3,
                    color: module.color ?? 'lightslategray',
                  }}
                >
                  <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
                  <span>{abbr[1]!.toLowerCase()}</span>
                </VCenterRow>
                <HCenterCol>
                  <p className="font-semibold text-center">{module.name}</p>
                  <p className="text-xs text-center">{module.description}</p>
                </HCenterCol>
              </BaseLink>
            </li>
          )
        })}
    </ul>
  )
}

function AppsPage({ title = 'Index' }: { title?: string }) {
  return (
    <ContentLayout title={title} signedRequired="never">
      <Apps />
    </ContentLayout>
  )
}

export function AppsQueryPage({ title = 'Index' }: { title?: string }) {
  return (
    <CoreProviders>
      <AppsPage title={title} />
    </CoreProviders>
  )
}
