'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import { BaseCol } from '@/layout/base-col'
import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { download } from '@/lib/download-utils'

import { onTextFileChange } from '@/components/pages/open-files'
import { MenuButton } from '@/toolbar/menu-button'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { FileLinesIcon } from '@/icons/file-lines-icon'
import { SaveIcon } from '@/icons/save-icon'

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

import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import {
  ToggleButtonTriggers,
  ToggleButtons,
} from '@/components/toggle-buttons'
import { VCenterRow } from '@/layout/v-center-row'

import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { Input } from '@/themed/v2/input'

import { Textarea } from '@/themed/textarea'

import { useDialogs } from '@/components/dialogs/dialogs'
import type { ITab } from '@/components/tabs/tab-provider'
import { useStableId } from '@/hooks/stable-id'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { dnaToJson, fetchDNA, type IDNA } from '@/lib/genomic/dna'
import {
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'

export function GetDNAPage() {
  const queryClient = useQueryClient()

  const [text, setText] = useState('')

  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('FASTA')
  const [outputSeqs, setOutputSeqs] = useState<IDNA[]>([])

  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const id = useStableId('get-dna-page')

  const { open: openDialog } = useDialogs()

  // function openFiles(files: IFileOpen[]) {
  //   setShowFileMenu(false)
  // }

  async function getDNA() {
    const lines = textToLines(text)

    const seqs: IGenomicLocation[] = []

    for (let line of lines) {
      line = line.trim()
      if (line.startsWith('>')) {
        const loc = parseGenomicLocation(line.substring(1))
        if (loc) {
          seqs.push(loc)
        }
      }
    }

    console.log(seqs)

    const dnaseqs: (IDNA | null)[] = await Promise.all(
      seqs.map(
        async (loc) =>
          await fetchDNA(queryClient, loc, {
            reverse: modeRev,
            complement: modeComp,
          })
      )
    )

    setOutputSeqs(dnaseqs.filter((x) => x !== null) as IDNA[])
  }

  function save(format = 'fasta') {
    if (outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case 'json':
        download(dnaToJson(outputSeqs), 'dna.json')
        break
      default:
        download(
          outputSeqs
            .map((seq) => `>${seq.location.toString()}\n${seq.seq}`)
            .join('\n'),
          'dna.fasta'
        )
        break
    }

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/get-dna.txt')

    setText(res)
  }

  useEffect(() => {
    if (outputSeqs.length > 0) {
      switch (outputMode) {
        case 'JSON':
          setOutput(dnaToJson(outputSeqs))
          break
        default:
          setOutput(
            outputSeqs
              .map((seq) => `>${seq.location.toString()}\n${seq.seq}`)
              .join('\n')
          )
          break
      }
    }
  }, [outputSeqs])

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    callback: (message, files) => {
                      onTextFileChange(message, files, (files) => {
                        setText(files[0]!.text)
                      })
                    },
                  },
                })
              }}
              multiple={true}
            />

            <ToolbarButton title="Save to local file" onClick={() => save()}>
              <SaveIcon className="-scale-100 fill-blue-400" />
            </ToolbarButton>
          </ToolbarTabGroup>
          {/* {resultsDF && (
            <ToolbarButton
              aria-label="Download pathway table"
              onClick={() => downloadFile(resultsDF)}
            >
              <SaveIcon className="-scale-100 text-blue-400" />
              Save
            </ToolbarButton>
          )} */}

          <ToolbarTabGroup title="Run">
            <ToolbarButton title="Reverse Complement" onClick={getDNA}>
              <PlayIcon />
              <span>Convert</span>
            </ToolbarButton>
          </ToolbarTabGroup>

          {/* <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              checked={modeRev}
              onClick={() => setModeRev(!modeRev)}
            >
              Reverse
            </ToolbarButton>
            <ToolbarButton
              checked={modeComp}
              onClick={() => setModeComp(!modeComp)}
            >
              Complement
            </ToolbarButton>
          </ToolbarTabGroup> */}

          {/* <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              checked={outputMode === "fasta"}
              onClick={() => setOutputMode("fasta")}
            >
              FASTA
            </ToolbarButton>
            <ToolbarButton
              checked={outputMode === "json"}
              onClick={() => setOutputMode("json")}
            >
              JSON
            </ToolbarButton>
          </ToolbarTabGroup> */}
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_SAVE_AS,
      content: (
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
      {/* <DialogsRoot /> */}

      <ShortcutLayout>
        <Toolbar>
          <ToolbarMenu
            groupId={id}
            tabs={tabs}
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
          <ToolbarPanel groupId={id} tabs={tabs} />
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
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
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

              <CollapseBlock name="Output">
                <Switch
                  checked={modeRev}
                  onCheckedChange={(state) => setModeRev(state)}
                >
                  Reverse
                </Switch>

                <Switch
                  checked={modeComp}
                  onCheckedChange={(state) => setModeComp(state)}
                >
                  Complement
                </Switch>
              </CollapseBlock>

              <CollapseBlock name="Format">
                <VCenterRow className="gap-x-2">
                  <ToggleButtons
                    tabs={[
                      {
                        //name: nanoid(),
                        id: 'FASTA',
                      },
                      {
                        //name: nanoid(),
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
