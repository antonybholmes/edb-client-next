'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { BaseCol } from '@/layout/base-col'
import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { MenuButton } from '@/toolbar/menu-button'

import { FileLinesIcon } from '@/icons/file-lines-icon'

import {
  FILE_MENU_ITEM_DESC_CLS,
  FILE_MENU_ITEM_HEADING_CLS,
  H2_CLS,
} from '@/theme'
import { useEffect, useState } from 'react'

import { TEXT_SAVE_AS, TEXT_SETTINGS } from '@/consts'

import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinHResizeHandle,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { CollapseBlock } from '@/components/collapse-block'

import {
  ToggleButtonTriggers,
  ToggleButtons,
} from '@/components/toggle-buttons'
import { VCenterRow } from '@/layout/v-center-row'

import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { Input } from '@/themed/v2/input'

import { Textarea } from '@/themed/textarea'

import type { ITab } from '@/components/tabs/tab-provider'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { dnaToJson } from '@/lib/genomic/dna'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { produce } from 'immer'
import { useDNA } from './dna-store'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useSave } from './use-save'

export function GetDNAPage() {
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('FASTA')

  const { settings, updateSettings } = useDNA()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { save } = useSave()
  const { setAppInfo } = useAppInfo()

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/get-dna.txt')

    updateSettings(
      produce(settings, (draft) => {
        draft.text = res
      })
    )
  }

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
    if (settings.outputSeqs.length > 0) {
      switch (outputMode) {
        case 'JSON':
          setOutput(dnaToJson(settings.outputSeqs))
          break
        default:
          setOutput(
            settings.outputSeqs
              .map((seq) => `>${seq.location.toString()}\n${seq.seq}`)
              .join('\n')
          )
          break
      }
    }
  }, [settings.outputSeqs, outputMode])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      render: (
        <BaseCol className="gap-y-6 p-6">
          <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

          <ul className="flex flex-col gap-y-1 text-xs">
            <li>
              <MenuButton
                aria-label="Save text file"
                onClick={() => save('fasta')}
              >
                <FileLinesIcon className="w-6" />
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as FASTA
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save sequences as FASTA.
                  </span>
                </p>
              </MenuButton>
            </li>
            <li>
              <MenuButton
                aria-label="Save JSON file"
                onClick={() => save('json')}
              >
                <p>
                  <span className={FILE_MENU_ITEM_HEADING_CLS}>
                    Download as JSON
                  </span>
                  <br />
                  <span className={FILE_MENU_ITEM_DESC_CLS}>
                    Save sequences as JSON.
                  </span>
                </p>
              </MenuButton>
            </li>
          </ul>
        </BaseCol>
      ),
    },
  ]

  return (
    <>
      <ShortcutLayout>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data."
              >
                Test data
              </ToolbarButton>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <ResizablePanelGroup orientation="horizontal" className="h-full pl-2">
          <ResizablePanel
            id="main"
            defaultSize="80%"
            minSize="50%"
            className="flex flex-col"
          >
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel
                id="dna"
                defaultSize="50%"
                minSize="0%"
                className="flex flex-col"
                collapsible={true}
              >
                <Textarea
                  className="grow whitespace-pre"
                  placeholder=">chr3:187453454-187454415"
                  value={settings.text}
                  onChange={(e) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.text = e.target.value
                      })
                    )
                  }}
                />
              </ResizablePanel>
              <ThinVResizeHandle />
              <ResizablePanel
                className="flex flex-col"
                id="output"
                defaultSize="50%"
                minSize="0%"
                collapsible={true}
              >
                <Textarea
                  className="grow"
                  placeholder="Output..."
                  value={output}
                  readOnly
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            defaultSize="20%"
            minSize="0%"
            collapsible={true}
            className="flex flex-col"
            id="right-tabs"
          >
            <BaseCol className="grow gap-y-1 px-2 text-xs">
              <h2 className={H2_CLS}>{TEXT_SETTINGS}</h2>

              <CollapseBlock name="Padding">
                <VCenterRow className="gap-x-4">
                  <Label className="shrink-0">5&apos; padding</Label>

                  <Input className="w-full rounded-theme" />
                </VCenterRow>
              </CollapseBlock>

              <CollapseBlock name="Output"></CollapseBlock>

              <CollapseBlock name="Format">
                <VCenterRow className="gap-x-2">
                  <ToggleButtons
                    tabs={[
                      {
                        id: 'FASTA',
                      },
                      {
                        id: 'JSON',
                      },
                    ]}
                    value={outputMode}
                    onTabChange={(selectedTab) =>
                      setOutputMode(selectedTab.tab.id)
                    }
                  >
                    <ToggleButtonTriggers />
                  </ToggleButtons>
                </VCenterRow>
              </CollapseBlock>
            </BaseCol>
          </ResizablePanel>
        </ResizablePanelGroup>

        <FooterPortal className="justify-end"></FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GetDNAQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <GetDNAPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
