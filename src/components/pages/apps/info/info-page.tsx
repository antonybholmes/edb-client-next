'use client'

import { ThemeLink } from '@/components/link/theme-link'
import { BaseCol } from '@/layout/base-col'

import LINKS from '@/about-links.json'
import { AutoRowCol } from '@/components/layout/auto-row-col'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import { Card } from '@/components/shadcn/ui/themed/card'
import { config } from '@/config'
import type { IChildrenProps } from '@/interfaces/children-props'
import { VCenterRow } from '@/layout/v-center-row'
import { SignInLayout } from '@/layouts/signin-layout'
import { API_ABOUT_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { useQuery } from '@tanstack/react-query'

import { CenterRow } from '@/components/layout/center-row'
import { IS_DEV_MODE } from '@/consts'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { formatString } from '@/lib/text/format-string'
import { format } from 'date-fns'
import { useEffect } from 'react'
import { BaseImage } from '../../../base-image'
import { HCenterCol } from '../../../layout/h-center-col'
import { VCenterCol } from '../../../layout/v-center-col'
import { BaseLink, BLANK_TARGET } from '../../../link/base-link'
import { ThemeIndexLink } from '../../../link/theme-index-link'
import APP_INFO from './manifest.json'

export function InfoPage({ children }: IChildrenProps) {
  const { setAppInfo } = useAppInfo()

  const { data: serverInfo } = useQuery({
    queryKey: ['server-about'],
    queryFn: () =>
      httpFetch.getJson<{ version: string; updated: string; build: number }>(
        API_ABOUT_URL
      ),
  })

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  return (
    <>
      {/* <HeaderSlotPortal>
        <AppInfoButton />
      </HeaderSlotPortal> */}

      <SignInLayout title="Info" signinRequired={false}>
        <HCenterCol className="w-9/10 md:w-3/4 lg:w-1/2 2xl:w-1/3 mx-auto gap-y-12 mt-16">
          <Card className="text-sm w-full" shadow="xl" rounded="2xl">
            <VCenterRow className="gap-x-4 py-2">
              <BaseImage
                src="/favicon.svg"
                width={512}
                height={512}
                alt={config.name}
                className="w-12 aspect-square"
              />

              <VCenterCol>
                <span className="text-xl font-semibold">{config.name}</span>
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
                  Build {config.version}.{config.build}
                </p>
                {IS_DEV_MODE && <p>{config.hash.slice(0, 12)}</p>}
                <p>
                  Updated {format(new Date(config.modified), 'MMM dd, yyyy')}
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

            <ThemeLink href="/about/apps">Apps</ThemeLink>
            {serverInfo && (
              <>
                <LineSeparator />

                <BaseCol>
                  <p className="font-semibold">Server</p>
                  <p>
                    Build {serverInfo.version}.{serverInfo.build}
                  </p>
                  <p>
                    Updated{' '}
                    {format(new Date(serverInfo.updated), 'MMM dd, yyyy')}
                  </p>
                </BaseCol>
              </>
            )}

            <LineSeparator />
            <BaseCol className="gap-y-2">
              <p className="font-semibold">{config.name}</p>
              <p>{formatString(config.copyright)}</p>
              <CenterRow className="gap-x-4 mt-4">
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
                <ThemeLink
                  href={config.author.url}
                  aria-label={`Visit homepage of ${config.author.name}`}
                  //data-underline={true}
                >
                  antonyholmes.dev
                </ThemeLink>
              </CenterRow>
            </BaseCol>
          </Card>

          <BaseCol className="gap-y-2 text-sm w-full px-4">
            <p>
              This application is made possible by open source software and
              other services:
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
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
