'use client'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { PlayIcon } from '@icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { ToolbarButton } from '@toolbar/toolbar-button'

import { download } from '@lib/download-utils'

import { OpenFiles, onTextFileChange } from '@components/pages/open-files'

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { SaveIcon } from '@icons/save-icon'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { queryClient } from '@/query'
import { useEffect, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { ResizablePanel, ResizablePanelGroup } from '@themed/resizable'

import { PropsPanel } from '@components/props-panel'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { SlidersIcon } from '@icons/sliders-icon'
import { Checkbox } from '@themed/check-box'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import type { ITab } from '@components/tabs/tab-provider'
import { OpenIcon } from '@icons/open-icon'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { cn } from '@lib/shadcn-utils'
import { textToLines } from '@lib/text/lines'
import { randId } from '@lib/utils'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'

import axios from 'axios'

import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import {
  FILE_FORMAT_JSON,
  SaveTxtDialog,
} from '@components/pages/save-txt-dialog'
import { FileIcon } from '@icons/file-icon'
import { UploadIcon } from '@icons/upload-icon'
import { CoreProviders } from '@providers/core-providers'
import { Textarea } from '@themed/textarea'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
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

    for (let line of lines) {
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
    }

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

  function save(name: string, format: string) {
    if (outputSeqs.length === 0) {
      return
    }

    switch (format) {
      case 'json':
        download(JSON.stringify(outputSeqs), name)
        break
      default:
        //fasta
        download(
          outputSeqs.map((seq) => `>${seq.id}\n${seq.rev}`).join('\n'),
          name
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
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              arial-label="Save to local file"
              onClick={() => setShowDialog({ id: randId('save') })}
              title="Save sequences"
            >
              <SaveIcon />
            </ToolbarIconButton>
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
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: randId('open') })}
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
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="seqs"
          formats={[{ name: 'FASTA', ext: 'fasta' }, FILE_FORMAT_JSON]}
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              save(data!.name as string, (data!.format as ISaveAsFormat).ext)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout info={MODULE_INFO} signedRequired="never">
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>
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
          id="rev-comp"
          side="right"
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
              <Textarea
                className="grow whitespace-pre "
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
              <Textarea
                className="grow whitespace-pre "
                placeholder="Output"
                value={output}
                readOnly
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

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
