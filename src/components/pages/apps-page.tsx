'use client'

import { HEADER_LINKS } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import { BaseLink } from '@components/link/base-link'
import { ContentLayout } from '@layouts/content-layout'
import { cn } from '@lib/shadcn-utils'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'

const APP_CLS = cn(
  FOCUS_RING_CLS,
  'border border-border/25',
  'flex flex-col bg-background h-30 shrink-0 justify-start items-start grow gap-2 p-4',
  'rounded-3xl hover:outline-ring transition-colors duration-300 ease-in-out'
)

export function Apps() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                <VCenterRow className="gap-x-2">
                  <VCenterRow
                    className="w-10 h-10 aspect-square shrink-0 rounded-full justify-center bg-white text-xl"
                    style={{
                      borderColor: module.color ?? 'lightslategray',
                      borderWidth: 2,
                      color: module.color ?? 'lightslategray',
                    }}
                  >
                    <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
                    <span>{abbr[1]!.toLowerCase()}</span>
                  </VCenterRow>
                  <p className="font-semibold">{module.name}</p>
                </VCenterRow>
                <BaseCol className="justify-start items-start">
                  <p className="text-xs">{module.description}</p>
                </BaseCol>
              </BaseLink>
            </li>
          )
        })}
    </ul>
  )
}

export function AppsPage({ title = 'Index' }: { title?: string }) {
  return (
    <ContentLayout title={title} signedRequired="never">
      <Apps />
    </ContentLayout>
  )
}
