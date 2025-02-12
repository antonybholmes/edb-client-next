'use client'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { PlayIcon } from '@icons/play-icon'

import { ToolbarButton } from '@components/toolbar/toolbar-button'

import { download } from '@lib/download-utils'

import { OpenFiles, onTextFileChange } from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { SaveIcon } from '@icons/save-icon'

import { queryClient } from '@/query'
import { useEffect, useRef, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/shadcn/ui/themed/resizable'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { SlidersIcon } from '@components/icons/sliders-icon'
import { PropsPanel } from '@components/props-panel'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'

import { textToLines } from '@/lib/text/lines'
import { OpenIcon } from '@components/icons/open-icon'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import type { ITab } from '@components/tab-provider'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { cn } from '@lib/class-names'
import { makeRandId } from '@lib/utils'
import { UploadIcon } from '@radix-ui/react-icons'
import axios from 'axios'

import { FileIcon } from '@/components/icons/file-icon'
import MODULE_INFO from './module.json'

export type DNABase = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't'

const REV_MAP: { [K in DNABase]: DNABase } = {
  A: 'T',
  C: 'G',
  G: 'C',
  T: 'A',
  a: 't',
  c: 'g',
  g: 'c',
  t: 'a',
}

interface ISeq {
  id: string
  seq: string
}

interface IRevCompSeq extends ISeq {
  rev: string
}

function RevCompPage() {
  //const [dataFrame, setDataFile] = useState<BaseDataFrame>(INF_DATAFRAME)

  const downloadRef = useRef<HTMLAnchorElement>(null)

  const [text, setText] = useState('')

  const [output, setOutput] = useState('')
  const [outputMode] = useState('FASTA')
  const [outputSeqs, setOutputSeqs] = useState<IRevCompSeq[]>([])

  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  // function openFiles(files: IFileOpen[]) {
  //   setShowFileMenu(false)
  // }

  function revComp(seq: ISeq): string {
    let bases: DNABase[] = seq.seq.split('') as DNABase[]

    if (modeComp) {
      bases = bases.map((c) => REV_MAP[c] ?? c)
    }

    if (modeRev) {
      bases = bases.toReversed()
    }

    return bases.join('')
  }

  function applyRevComp() {
    const lines = textToLines(text)

    let name: string | null = null
    let buffer = ''
    const seqs: ISeq[] = []

    lines.forEach((line) => {
      line = line.trim()
      if (line.length === 0) {
        if (buffer.length > 0) {
          seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
        }

        // space so reset
        name = null
        buffer = ''
      } else if (line.startsWith('>')) {
        if (buffer.length > 0) {
          seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
        }

        name = line.substring(1)
      } else {
        buffer += line
      }
    })

    if (buffer.length > 0) {
      seqs.push({ id: name ?? `seq${seqs.length + 1}`, seq: buffer })
    }

    if (seqs.length === 0) {
      return
    }

    const revSeqs = seqs.map((s) => ({
      id: s.id,
      seq: s.seq,
      rev: revComp(s),
    }))

    console.log(revSeqs)

    setOutputSeqs(revSeqs)
  }

  function save(format = 'FASTA') {
    if (outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case 'JSON':
        download(JSON.stringify(outputSeqs), downloadRef, 'seqs.json')
        break
      default:
        download(
          outputSeqs.map((seq) => `>${seq.id}\n${seq.rev}`).join('\n'),
          downloadRef,
          'seqs.fasta'
        )
        break
    }

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/rev-comp.fasta'),
    })

    setText(res.data)
    // const lines = testData
    //   .split(/[\r\n]+/g)
    //   .filter((line: string) => line.length > 0)
  }

  useEffect(() => {
    if (outputSeqs.length > 0) {
      switch (outputMode) {
        case 'json':
          setOutput(JSON.stringify(outputSeqs))
          break
        default:
          setOutput(
            outputSeqs.map((seq) => `>${seq.id}\n${seq.rev}`).join('\n')
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
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarButton
              arial-label="Save to local file"
              onClick={() => save()}
              title="Save sequences"
            >
              <SaveIcon />
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />
          <ToolbarTabGroup title="Convert">
            <ToolbarButton title="Reverse Complement" onClick={applyRevComp}>
              <PlayIcon />
              <span>Convert</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
      icon: <OpenIcon stroke="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: makeRandId('open') })}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <SlidersIcon />,
      id: 'Settings',
      content: (
        <PropsPanel>
          <ScrollAccordion value={['output']}>
            <AccordionItem value="output">
              <AccordionTrigger>Output</AccordionTrigger>
              <AccordionContent>
                <Checkbox
                  checked={modeRev}
                  onCheckedChange={(state) => setModeRev(state)}
                >
                  Reverse
                </Checkbox>

                <Checkbox
                  checked={modeComp}
                  onCheckedChange={(state) => setModeComp(state)}
                >
                  Compliment
                </Checkbox>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
  ]

  return (
    <>
      {showDialog.id === 'alert' && (
        <BasicAlertDialog onReponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} showSignInError={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
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
        </Toolbar>

        <TabSlideBar
          side="Right"
          tabs={rightTabs}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="px-2"
        >
          <ResizablePanelGroup
            direction="vertical"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="dna"
              defaultSize={50}
              minSize={10}
              className={cn('flex flex-col text-sm p-2')}
              collapsible={true}
            >
              <Textarea3
                className="grow whitespace-pre border-none"
                textCls="custom-scrollbar"
                placeholder="FASTA/DNA sequences"
                value={text}
                onChange={(e) => {
                  console.log(e.target.value)
                  setText(e.target.value)
                }}
              />
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              className={cn('flex flex-col text-sm p-2')}
              id="output"
              defaultSize={50}
              minSize={10}
              collapsible={true}
            >
              <Textarea3
                className="grow whitespace-pre border-none"
                textCls="custom-scrollbar"
                placeholder="Output"
                value={output}
                readOnly
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooter className="justify-end"></ToolbarFooter>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => {
                setText(files[0]!.text)
              })
            }
            fileTypes={['fasta']}
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function RevCompQueryPage() {
  return <RevCompPage />
}
