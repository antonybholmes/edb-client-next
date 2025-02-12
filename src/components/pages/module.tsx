'use client'

import { BaseCol } from '@/components/layout/base-col'
import { HEADER_LINKS } from '@/menus'
import { FOCUS_RING_CLS } from '@/theme'
import { BaseLink } from '@components/link/base-link'
import { ContentLayout } from '@layouts/content-layout'
import { cn } from '@lib/class-names'
import { CoreProviders } from '@providers/core-providers'
import { VCenterRow } from '../layout/v-center-row'

function ModulePage({ title = 'Index' }: { title?: string }) {
  return (
    <ContentLayout title={title}>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-8">
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
                    FOCUS_RING_CLS,
                    'trans-color flex flex-row items-center h-full p-6 pr-4 gap-4 rounded-xl bg-background  hover:bg-foreground/10  trans-color'
                  )}
                >
                  <VCenterRow
                    className="w-12 aspect-square shrink-0 rounded-full justify-center bg-white"
                    style={{
                      borderColor: module.color ?? 'lightslategray',
                      borderWidth: 3,
                      color: module.color ?? 'lightslategray',
                    }}
                  >
                    <span className="font-bold">{abbr[0]!.toUpperCase()}</span>
                    <span>{abbr[1]!.toLowerCase()}</span>
                  </VCenterRow>
                  <BaseCol>
                    <p className="font-semibold">{module.name}</p>
                    <p className="text-xs">{module.description}</p>
                  </BaseCol>
                </BaseLink>
              </li>
            )
          })}
      </ul>
    </ContentLayout>
  )
}

export function ModuleQueryPage({ title = 'Index' }: { title?: string }) {
  return (
    <CoreProviders>
      <ModulePage title={title} />
    </CoreProviders>
  )
}
