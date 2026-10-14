'use client'

import { ClientLayout } from '@/app/client-layout'
import { CenterLayout } from '@/layouts/center-layout'
import { cn } from '@/lib/shadcn-utils'
import { HEADER_LINKS } from '@/menus'
import { useState } from 'react'
import { AppTile } from '../icons/app-icon'

function GridView({ view }: { view: string }) {
  // useEffect(() => {

  //   if (size.w > 700) {
  //     setColsClass('grid-cols-7 gap-2')
  //   } else if (size.w > 600) {
  //     setColsClass('grid-cols-6 gap-2')
  //   } else if (size.w > 500) {
  //     setColsClass('grid-cols-5 gap-2')
  //   } else if (size.w > 400) {
  //     setColsClass('grid-cols-4 gap-2')
  //   } else if (size.w > 300) {
  //     setColsClass('grid-cols-3 gap-2')
  //   } else if (size.w > 200) {
  //     setColsClass('grid-cols-2 gap-2')
  //   } else {
  //     setColsClass('grid-cols-1 gap-2')
  //   }

  // }, [size.w])

  return (
    <ul className={cn('grid grid-cols-3 gap-1 md:grid-cols-4 lg:grid-cols-5')}>
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
              <AppTile module={module} />
            </li>
          )
        })}
    </ul>
  )
}

export function AppsPage({ title = 'Index' }: { title?: string }) {
  const [tab] = useState('grid')

  return (
    <CenterLayout signinRequired={false} title={title}>
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
