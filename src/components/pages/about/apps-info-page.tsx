'use client'

import { ClientLayout } from '@/app/client-layout'

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
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 w-9/10 lg:w-2/3">
        {data?.map((app) => (
          <li
            key={app.name}
            className="flex flex-col text-xs hover:border-border border-l-2 border-transparent pl-2 trans-color"
          >
            <h1 className="text-base font-semibold">{app.name}</h1>
            <span>{app.description}</span>
            <span>
              Build {app.version}.{app.build} ({app.hash.slice(0, 12)})
            </span>
            <span>
              Updated {format(new Date(app.modified), 'MMM dd, yyyy')}
            </span>
            <span>{app.copyright}</span>
          </li>
        ))}
      </ul>
    </CenterLayout>
  )
}

export function AppsInfoPageQueryPage() {
  return (
    <ClientLayout>
      <AppsInfoPage />
    </ClientLayout>
  )
}
