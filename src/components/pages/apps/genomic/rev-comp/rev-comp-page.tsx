'use client'

import {
    ShowOptionsMenu,
    Toolbar,
    ToolbarMenu,
    ToolbarPanel,
} from '@/toolbar/toolbar'

import { download } from '@/lib/download-utils'

import {
    onTextFileChange,
    openFilesDialog,
} from '@/components/pages/open-files'

import { useEffect, useState } from 'react'

import { TEXT_OPEN, TEXT_OPEN_FILE, TEXT_SAVE_AS } from '@/consts'
import {
    ResizablePanel,
    ResizablePanelGroup,
    ThinVResizeHandle,
} from '@/themed/resizable'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'

import type { ITab } from '@/components/tabs/tab-provider'
import { OpenIcon } from '@/icons/open-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { cn } from '@/lib/shadcn-utils'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { HeaderButton } from '@/layouts/header-button'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-provider'
import { Textarea } from '@/themed/textarea'
import { produce } from 'immer'
import APP_INFO from './manifest.json'
import { useRevComp } from './rev-comp-store'
import { HomeToolbar } from './toolbars/home-toolbar'

function RevCompPage() {
  const [output, setOutput] = useState('')
  const [outputMode] = useState('FASTA')
  const { settings, updateSettings } = useRevComp()
  const { setAppInfo } = useAppInfo()

  const [showSideBar, setShowSideBar] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { open: openDialog } = useDialogs()

  // function openFiles(files: IFileOpen[]) {
  //   setShowFileMenu(false)
  // }

  function save(name: string, format: string) {
    if (settings.outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case 'json':
        download(JSON.stringify(settings.outputSeqs), name)
        break
      default:
        //fasta
        download(
          settings.outputSeqs.map((seq) => `>${seq.id}\n${seq.rev}`).join('\n'),
          name
        )
        break
    }

    setShowFileMenu(false)
  }

  async function loadTestData() {
    try {
      const res = await httpFetch.getText('/data/test/rev-comp.fasta')

      updateSettings(
        produce(settings, (draft) => {
          draft.text = res
        })
      )
    } catch (e) {
      console.error(e)
    }
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
        case 'json':
          setOutput(JSON.stringify(settings.outputSeqs))
          break
        default:
          setOutput(
            settings.outputSeqs
              .map((seq) => `>${seq.id}\n${seq.rev}`)
              .join('\n')
          )
          break
      }
    }
  }, [settings.outputSeqs])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              fileTypes: ['fasta'],
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.text = files[0]!.text
                    })
                  )
                })
              },
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: TEXT_SAVE_AS,
      component: () => (
        <>
          <DropdownMenuItem
            aria-label="Save FASTA file"
            onClick={() => save('seqs.fasta', 'fasta')}
          >
            <FileIcon stroke="" />
            <span>Download as FASTA</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save JSON file"
            onClick={() => save('seqs.json', 'json')}
          >
            <span>Download as JSON</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <HeaderButton
          onClick={() => loadTestData()}
          role="button"
          title="Load test data."
          className="text-xs"
        >
          Test data
        </HeaderButton>
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
        </Toolbar>

        <ToolbarPanel
          tabShortcutMenu={
            <ShowOptionsMenu
              show={showSideBar}
              onClick={() => {
                setShowSideBar(!showSideBar)
              }}
            />
          }
        />

        <ResizablePanelGroup
          orientation="vertical"
          //autoSaveId="rev-comp-vert"
        >
          <ResizablePanel
            id="dna"
            defaultSize="50%"
            minSize="0%"
            className={cn('flex flex-col text-sm p-2')}
            collapsible={true}
          >
            <Textarea
              className="grow whitespace-pre"
              placeholder="FASTA/DNA sequences"
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
            className={cn('flex flex-col text-sm p-2')}
            id="output"
            defaultSize="50%"
            minSize="0%"
            collapsible={true}
          >
            <Textarea
              className="grow whitespace-pre "
              placeholder="Output"
              value={output}
              readOnly
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ShortcutLayout>
    </>
  )
}

export function RevCompQueryPage() {
  return (
    <CoreProviders>
      <RevCompPage />
    </CoreProviders>
  )
}
