'use client'

import { useEffect, useState } from 'react'

import { ClientLayout } from '@/app/client-layout'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { useAppInfo } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { BaseCol } from '@/components/layout/base-col'
import { Card } from '@/components/shadcn/ui/themed/card'
import { httpFetch } from '@/lib/http/http-fetch'
import APP_INFO from './manifest.json'

export function TextViewerPage() {
  const { setAppInfo } = useAppInfo()

  const [text, setText] = useState('')

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  // useEffect(() => {
  //   setToolbarTabs([
  //     {
  //       id: 'Home',
  //       component: HomeToolbar,
  //     },
  //   ])
  // }, [setToolbarTabs])

  useEffect(() => {
    async function load() {
      const urlParams = new URLSearchParams(window.location.search)
      const url = urlParams.get('url')

      if (url) {
        console.log('URL:', url)

        const text = await httpFetch.getText(url)

        setText(text)
      }
    }
    load()
  }, [])

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>
      <ShortcutLayout signinRequired={false}>
        <Card className="m-2 mt-4 grow">
          <BaseCol className="overflow-y-auto overflow-x-hidden custom-scrollbar relative grow">
            <pre className="whitespace-pre-wrap absolute">{text}</pre>
          </BaseCol>
        </Card>
      </ShortcutLayout>
    </>
  )
}

export function TextViewerQueryPage() {
  return (
    <ClientLayout>
      <TextViewerPage />
    </ClientLayout>
  )
}
