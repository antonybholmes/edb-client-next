'use client'

import { ThemeLink } from '@components/link/theme-link'
import { BaseCol } from '@layout/base-col'

import { APP_NAME, SITE_NAME, UPDATED, VERSION } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import type { IChildrenProps } from '@interfaces/children-props'
import { VCenterRow } from '@layout/v-center-row'
import { getCopyright } from '@lib/copyright'
import { API_ABOUT_URL } from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@themed/card'
import { MenuSeparator } from '@themed/dropdown-menu'
import { BaseImage } from '../base-image'
import { BLANK_TARGET } from '../link/base-link'

const LINKS = [
  ['Next.js', 'https://nextjs.org/'],
  ['React', 'https://reactjs.org'],
  ['Tailwind', 'https://tailwindcss.com/'],
  ['Lucide', 'https://lucide.dev/'],
  ['Font Awesome', 'https://fontawesome.com/'],
  ['Node.js', 'https://nodejs.org/'],
  ['Go', 'https://go.dev/'],
  ['GitHub', 'https://github.com'],
  ['Visual Studio Code', 'https://code.visualstudio.com'],
]

export function AboutPage({ children }: IChildrenProps) {
  const { data } = useQuery({
    queryKey: ['about'],
    queryFn: () =>
      httpFetch.getJson<{ version: string; updated: string }>(API_ABOUT_URL),
  })

  //if (isPending) return "Loading..."

  const serverVersion = data?.version ?? ''
  const serverUpdated = data?.updated ?? ''

  return (
    <CenterLayout title="Help" signedRequired="never">
      <Card
        className="text-sm shadow-md w-128"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <VCenterRow className="gap-x-4 py-2 px-6">
          <BaseImage
            src="/favicon.svg"
            width={512}
            height={512}
            alt={SITE_NAME}
            className="w-12 aspect-square"
          />

          <span className="text-xl font-semibold tracking-wide">
            {APP_NAME}
          </span>
        </VCenterRow>

        <MenuSeparator />

        <VCenterRow className="justify-between px-6">
          <BaseCol className="gap-y-1">
            <p>
              Client v{VERSION} ({UPDATED})
            </p>
          </BaseCol>
          {/* <Button
              variant="link"
              //target={BLANK_TARGET}
              aria-label="View changelog"
              onClick={() => {
                window.open(
                  '/changelog',
                  'ChangeLogWindow',
                  'width=1080,height=720,toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
                )
              }}
            >
              Changelog
            </Button> */}

          <ThemeLink
            href="/changelog"
            aria-label="View changelog"
            target={BLANK_TARGET}
            //data-underline={true}
            //className="text-sm text-foreground/50 hover:text-foreground"
          >
            Changelog
          </ThemeLink>
        </VCenterRow>
        {serverVersion && (
          <>
            <MenuSeparator />

            <BaseCol className="gap-y-1 px-6">
              <p>
                Server v{serverVersion} ({serverUpdated})
              </p>
            </BaseCol>
          </>
        )}
      </Card>
      <Card className="text-sm shadow-md w-128 mt-8">
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
            This application is made possible by open source software and other
            services:
          </p>

          <ul className="flex flex-col gap-y-0.5">
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
    </CenterLayout>
  )
}
