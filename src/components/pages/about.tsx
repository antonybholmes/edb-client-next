'use client'

import { BaseCol } from '@/components/layout/base-col'
import { ThemeLink } from '@components/link/theme-link'

import { VCenterRow } from '@/components/layout/v-center-row'
import { APP_NAME, SITE_NAME, UPDATED, VERSION } from '@/consts'
import type { IChildrenProps } from '@/interfaces/children-props'
import { API_ABOUT_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { Card, CardContainer } from '@components/shadcn/ui/themed/card'
import { MenuSeparator } from '@components/shadcn/ui/themed/dropdown-menu'
import { HeaderLayout } from '@layouts/header-layout'
import { getCopyright } from '@lib/copyright'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'

import { BLANK_TARGET } from '../link/base-link'
import { ThemeIndexLink } from '../link/theme-index-link'

const LINKS = [
  ['Astro', 'https://astro.build/'],
  ['React', 'https://reactjs.org'],
  ['Tailwind', 'https://tailwindcss.com/'],
  ['Lucide', 'https://lucide.dev/'],
  ['Font Awesome', 'https://fontawesome.com/'],
  ['Node.js', 'https://nodejs.org/'],
  ['Go', 'https://go.dev/'],
  ['GitHub', 'https://github.com'],
  ['Visual Studio Code', 'https://code.visualstudio.com'],
]

function AboutPage({ children }: IChildrenProps) {
  const { data } = useQuery({
    queryKey: ['about'],
    queryFn: () =>
      httpFetch.getJson<{ version: string; updated: string }>(API_ABOUT_URL),
  })

  //if (isPending) return "Loading..."

  const serverVersion = data?.version ?? ''
  const serverUpdated = data?.updated ?? ''

  return (
    <HeaderLayout title="Help">
      <CardContainer className="gap-y-6">
        <Card className="text-xs" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <VCenterRow className="gap-x-4 py-4 px-6">
            {/* <LogoIcon w="w-12" /> */}

            <img
              src="/favicon.svg"
              width={512}
              height={512}
              alt={SITE_NAME}
              className="w-12 aspect-square"
            />

            <span className="text-xl font-medium">{APP_NAME}</span>
          </VCenterRow>

          <MenuSeparator />

          <VCenterRow className="justify-between px-6">
            <BaseCol className="gap-y-1">
              <p>Client version {VERSION}</p>
              <p>Updated {UPDATED}</p>
            </BaseCol>
            <ThemeIndexLink
              href="/changelog"
              target={BLANK_TARGET}
              aria-label="View changelog"
            >
              Changelog
            </ThemeIndexLink>
          </VCenterRow>
          {serverVersion && (
            <>
              <MenuSeparator />

              <BaseCol className="gap-y-1 px-6">
                <p>{`Server version ${serverVersion}`}</p>
                <p>{`Updated ${serverUpdated}`}</p>
              </BaseCol>
            </>
          )}
        </Card>
        <Card className="text-xs">
          <BaseCol className="gap-y-1">
            <p>{APP_NAME}</p>
            <p>
              {getCopyright()}{' '}
              <ThemeLink
                href="https://www.antonyholmes.dev"
                aria-label="Email Antony Holmes"
                //data-underline={true}
              >
                Antony Holmes
              </ThemeLink>
              . All rights reserved.
            </p>
          </BaseCol>

          <BaseCol className="gap-y-1">
            <p>
              This application is made possible by open source software and
              other services:
            </p>

            <ul className="flex flex-col gap-y-1">
              {LINKS.map((link, li) => {
                return (
                  <li key={li}>
                    <ThemeLink
                      href={link[1]!}
                      aria-label="View tool"
                      //data-underline={true}
                    >
                      {link[0]}
                    </ThemeLink>
                  </li>
                )
              })}
            </ul>
          </BaseCol>
        </Card>
        {children}
      </CardContainer>
    </HeaderLayout>
  )
}

export function AboutQueryPage({ children }: IChildrenProps) {
  return (
    <CoreProviders>
      <AboutPage>{children}</AboutPage>
    </CoreProviders>
  )
}
