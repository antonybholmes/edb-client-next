'use client'

import { useEffect, useState } from 'react'

import { ClientLayout } from '@/app/client-layout'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { useAppInfo } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { FileIcon } from '@/components/icons/file-icon'
import { BaseCol } from '@/components/layout/base-col'
import { Card } from '@/components/shadcn/ui/themed/card'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ITab, useToolbarTabs } from '@/components/tabs/tab-provider'
import {
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/components/toolbar/toolbar'
import { TEXT_SAVE_AS } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'
import { useSaveTxt } from '../../matcalc/hooks/save'
import APP_INFO from './manifest.json'
import { TextProvider, useTextSave } from './text-provider'
import { HomeToolbar } from './toolbars/home-toolbar'

export function TextViewerPage() {
  const { setAppInfo } = useAppInfo()
  const [showFileMenu, setShowFileMenu] = useState(false)

  const { text, setText } = useTextSave()
  const { save } = useSaveTxt()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

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

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      render: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save(text, 'data.txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_SAVE_AS}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>
      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel />
        </Toolbar>

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
      <TextProvider>
        <TextViewerPage />
      </TextProvider>
    </ClientLayout>
  )
}
