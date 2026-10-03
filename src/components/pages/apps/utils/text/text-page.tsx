'use client'

import { useEffect, useMemo, useState } from 'react'

import { ClientLayout } from '@/app/client-layout'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { useAppInfo } from '@/components/edb/edb-settings'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { FileIcon } from '@/components/icons/file-icon'
import { Textarea } from '@/components/shadcn/ui/themed/textarea'
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
import { useTextSettings } from './text-settings'
import { HomeToolbar } from './toolbars/home-toolbar'

export function TextPage() {
  const { setAppInfo } = useAppInfo()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const { settings, updateSettings } = useTextSettings()
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

  const align = useMemo(() => {
    switch (settings.text.font.textAnchor) {
      case 'start':
        return 'left'
      case 'middle':
        return 'center'
      case 'end':
        return 'right'
      default:
        return 'left'
    }
  }, [settings.text.font.textAnchor])

  console.log('align:', align)

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

        {/* <BaseCol className="overflow-y-auto overflow-x-hidden custom-scrollbar relative grow">
            <pre className="whitespace-pre-wrap absolute">{text}</pre>
          </BaseCol> */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mx-2 mb-2"
          style={{
            fontFamily: settings.text.font.fontFamily,
            fontSize: settings.text.font.fontSize,
            fontWeight: settings.text.font.fontWeight,
            fontStyle: settings.text.font.fontStyle,
            color: settings.text.font.fill.value,
            textAlign: align,
          }}
        />
      </ShortcutLayout>
    </>
  )
}

export function TextQueryPage() {
  return (
    <ClientLayout>
      <TextProvider>
        <TextPage />
      </TextProvider>
    </ClientLayout>
  )
}
