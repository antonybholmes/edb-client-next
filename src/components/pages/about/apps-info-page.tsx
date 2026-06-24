'use client'

import { BaseCol } from '@/layout/base-col'
import { CoreProviders } from '@/providers/core-provider'

import { CenterLayout } from '@/layouts/center-layout'
import type { IAppInfo } from '@/lib/app-info'
import { httpFetch } from '@/lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

export function AppsInfoPage() {
  const { data } = useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      return await httpFetch.getJson<IAppInfo[]>('/apps.json')
    },
  })

  return (
    <CenterLayout signinRequired={false} title="Apps Info">
      <ul className="flex flex-col gap-y-4">
        {data?.map((app) => (
          <li key={app.name} className="text-sm border-b border-border pb-4">
            <BaseCol className="gap-y-1">
              <h1 className="text-xl font-semibold">{app.name}</h1>
              <p>{app.description}</p>
              <p>
                Build {app.version}.{app.build}
              </p>
              <p>Hash {app.hash}</p>
              <p>Updated {format(new Date(app.modified), 'MMM dd, yyyy')}</p>
              <p>{app.copyright}</p>
            </BaseCol>
          </li>
        ))}
      </ul>
    </CenterLayout>
  )
}

export function AppsInfoPageQueryPage() {
  return (
    <CoreProviders>
      <AppsInfoPage />
    </CoreProviders>
  )
}
