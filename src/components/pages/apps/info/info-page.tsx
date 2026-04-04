// 'use client'

import { ThemeLink } from '@/components/link/theme-link'
import { BaseCol } from '@/layout/base-col'

import LINKS from '@/about-links.json'
import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { AutoRowCol } from '@/components/layout/auto-row-col'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import { Card } from '@/components/shadcn/ui/themed/card'
import { config } from '@/config'
import { UPDATED, VERSION } from '@/consts'
import type { IChildrenProps } from '@/interfaces/children-props'
import { VCenterRow } from '@/layout/v-center-row'
import { SignInLayout } from '@/layouts/signin-layout'
import { getCopyright } from '@/lib/copyright'
import { API_ABOUT_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import { BaseImage } from '../../../base-image'
import { HCenterCol } from '../../../layout/h-center-col'
import { VCenterCol } from '../../../layout/v-center-col'
import { BaseLink, BLANK_TARGET } from '../../../link/base-link'
import { ThemeIndexLink } from '../../../link/theme-index-link'
import MODULE_INFO from './module.json'

export function InfoPage({ children }: IChildrenProps) {
  const { data } = useQuery({
    queryKey: ['server-about'],
    queryFn: () =>
      httpFetch.getJson<{ version: string; updated: string }>(API_ABOUT_URL),
  })

  //if (isPending) return "Loading..."

  const serverVersion = data?.version ?? ''
  const serverUpdated = data?.updated ?? ''

  return (
    <>
      <HeaderSlotPortal>
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal>

      <SignInLayout title="Help" signinRequired={false}>
        <HCenterCol className="w-9/10 md:w-3/4 lg:w-1/2 2xl:w-2/5 mx-auto gap-y-12 mt-16">
          <Card className="text-sm" shadow="xl" rounded="2xl">
            <VCenterRow className="gap-x-4 py-2">
              <BaseImage
                src="/favicon.svg"
                width={512}
                height={512}
                alt={config.appName}
                className="w-12 aspect-square"
              />

              <VCenterCol>
                <span className="text-xl font-semibold">{config.appName}</span>
                <span className="text-sm text-foreground/50">
                  {config.description}
                </span>
              </VCenterCol>
            </VCenterRow>
            <LineSeparator />
            <AutoRowCol className="justify-between gap-4" breakpoint={400}>
              <BaseCol>
                <p className="font-semibold">Web App</p>
                <p>
                  Version {VERSION} ({UPDATED})
                </p>
              </BaseCol>

              <ThemeIndexLink
                href="/changelog"
                aria-label="View changelog"
                target={BLANK_TARGET}
                //data-underline={true}
                //className="text-sm text-foreground/50 hover:text-foreground"
              >
                Changelog
              </ThemeIndexLink>
            </AutoRowCol>
            {serverVersion && (
              <>
                <LineSeparator />

                <BaseCol>
                  <p className="font-semibold">Server</p>
                  <p>
                    Version {serverVersion} ({serverUpdated})
                  </p>
                </BaseCol>
              </>
            )}

            <LineSeparator />
            <BaseCol className="gap-y-2">
              <p className="font-semibold">{config.appName}</p>
              <p>
                {getCopyright()}{' '}
                <ThemeLink
                  href={config.author.url}
                  aria-label={`Visit homepage of ${config.author.name}`}
                  //data-underline={true}
                >
                  {config.author.name}
                </ThemeLink>
                .
              </p>
              <p>
                <BaseLink
                  href={config.author.github}
                  aria-label="Visit GitHub repository"
                >
                  <img
                    src="/images/icons/GitHub_Invertocat_Black.svg"
                    alt="GitHub Logo"
                    className="w-6 h-6 inline-block aspect-square"
                  />
                </BaseLink>
              </p>

              <p>
                This application is made possible by open source software and
                other services:
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {LINKS.sort((a, b) =>
                  a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                ).map((link, li) => {
                  return (
                    <li key={li}>
                      <ThemeLink
                        href={link.url}
                        aria-label="View tool"
                        //data-underline={true}
                      >
                        {link.name}
                      </ThemeLink>
                    </li>
                  )
                })}
              </ul>
            </BaseCol>
          </Card>
          {children}
        </HCenterCol>
      </SignInLayout>
    </>
  )
}

export function InfoQueryPage({ children }: IChildrenProps) {
  return (
    <CoreProviders>
      <InfoPage>{children}</InfoPage>
    </CoreProviders>
  )
}
