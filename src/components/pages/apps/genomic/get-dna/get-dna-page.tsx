import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { PlayIcon } from '@icons/play-icon'
import { BaseCol } from '@layout/base-col'
import { Toolbar, ToolbarMenu, ToolbarPanel } from '@toolbar/toolbar'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { ToolbarTabPanel } from '@toolbar/toolbar-tab-panel'

import { ToolbarButton } from '@toolbar/toolbar-button'

import { download } from '@lib/download-utils'

import { OpenFiles, onTextFileChange } from '@components/pages/open-files'
import { MenuButton } from '@toolbar/menu-button'

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { FileLinesIcon } from '@icons/file-lines-icon'
import { SaveIcon } from '@icons/save-icon'

import {
  FILE_MENU_ITEM_DESC_CLS,
  FILE_MENU_ITEM_HEADING_CLS,
  H2_CLS,
} from '@/theme'
import { useEffect, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_SAVE_AS,
  TEXT_SETTINGS,
  type IDialogParams,
} from '@/consts'
import { HResizeHandle } from '@components/split-pane/h-resize-handle'
import { ResizablePanel, ResizablePanelGroup } from '@themed/resizable'

import { CollapseBlock } from '@components/collapse-block'
import { VResizeHandle } from '@components/split-pane/v-resize-handle'
import { ToggleButtonTriggers, ToggleButtons } from '@components/toggle-buttons'
import { VCenterRow } from '@layout/v-center-row'
import { GenomicLocation, parseLocation } from '@lib/genomic/genomic'
import { Switch } from '@themed/switch'

import { Input } from '@themed/input'
import { Label } from '@themed/label'

import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import type { ITab } from '@components/tabs/tab-provider'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { dnaToJson, fetchDNA, type IDNA } from '@lib/genomic/dna'
import { randId } from '@lib/id'
import { textToLines } from '@lib/text/lines'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function GetDNAPage() {
  const queryClient = useQueryClient()

  const [text, setText] = useState('')

  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState('FASTA')
  const [outputSeqs, setOutputSeqs] = useState<IDNA[]>([])

  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  // function openFiles(files: IFileOpen[]) {
  //   setShowFileMenu(false)
  // }

  async function getDNA() {
    const lines = textToLines(text)

    const seqs: GenomicLocation[] = []

    for (let line of lines) {
      line = line.trim()
      if (line.startsWith('>')) {
        const loc = parseLocation(line.substring(1))
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
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/get-dna.txt'),
    })

    setText(res.data)
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
        <ToolbarTabPanel>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: randId('open'),
                  })
                }
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

          <ToolbarSeparator />

          <ToolbarButton title="Reverse Complement" onClick={getDNA}>
            <PlayIcon />
            <span>Convert</span>
          </ToolbarButton>

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
        </ToolbarTabPanel>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    // {
    //   tab: "Open",
    //   icon: <OpenIcon fill="" w="w-5" />,
    //   content: (
    //     <BaseCol className="gap-y-6 p-6 ">
    //       <h1 className="text-2xl">Open</h1>

    //       <ul className="flex flex-col gap-y-2 text-xs">
    //         <li>
    //           <MenuButton
    //             aria-label="Open file on your computer"
    //             onClick={() => setShowDialog({ name: "open", params: {} })}
    //           >
    //             <OpenIcon className="w-6 fill-amber-300" />
    //             <p>
    //               <span className={FILE_MENU_ITEM_HEADING_CLS}>
    //                 Open local file
    //               </span>
    //               <br />
    //               <span>Open a local file on your computer.</span>
    //             </p>
    //           </MenuButton>
    //         </li>
    //       </ul>
    //     </BaseCol>
    //   ),
    // },
    {
      //id: nanoid(),
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
      {showDialog.id === 'alert' && (
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      <ShortcutLayout>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Test data
              </ToolbarButton>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <ResizablePanelGroup direction="horizontal" className="grow pl-2">
          <ResizablePanel
            id="main"
            defaultSize={80}
            minSize={50}
            className="flex flex-col"
          >
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                id="dna"
                defaultSize={50}
                minSize={10}
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
              <VResizeHandle />
              <ResizablePanel
                className="flex flex-col"
                id="output"
                defaultSize={50}
                minSize={10}
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
          <HResizeHandle />
          <ResizablePanel
            defaultSize={20}
            minSize={10}
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

        <ToolbarFooterPortal className="justify-end"></ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(_, files) =>
              onTextFileChange(_, files, (files) => {
                setText(files[0]!.text)
              })
            }
            fileTypes={['fasta']}
          />
        )}
      </ShortcutLayout>
    </>
  )
}
