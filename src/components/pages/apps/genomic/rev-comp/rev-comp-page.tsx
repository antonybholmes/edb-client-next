'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { download } from '@/lib/download-utils'

import { onTextFileChange } from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { useEffect, useState } from 'react'

import { TEXT_OPEN, TEXT_OPEN_FILE, TEXT_SAVE_AS } from '@/consts'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { PropsPanel } from '@/components/props-panel'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { SlidersIcon } from '@/icons/sliders-icon'
import { Checkbox } from '@/themed/v2/check-box'

import type { ITab } from '@/components/tabs/tab-provider'
import { OpenIcon } from '@/icons/open-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { cn } from '@/lib/shadcn-utils'
import { textToLines } from '@/lib/text/lines'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import type { ISaveAsFileType } from '@/dialogs/save-as-dialog'
import { FILE_FORMAT_JSON } from '@/dialogs/save-txt-dialog'
import { useStableId } from '@/hooks/stable-id'
import { FileIcon } from '@/icons/file-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { HeaderButton } from '@/layouts/header-button'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'
import { Textarea } from '@/themed/textarea'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import APP_INFO from './manifest.json'

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

const FASTA_FILE_TYPE: ISaveAsFileType = {
  name: 'FASTA',
  ext: 'fasta',
}

interface ISeq {
  id: string
  seq: string
}

interface IRevCompSeq extends ISeq {
  rev: string
}

export function RevCompPage() {
  const _id = useStableId('rev-comp-page')

  const [text, setText] = useState('')

  const [output, setOutput] = useState('')
  const [outputMode] = useState('FASTA')
  const [outputSeqs, setOutputSeqs] = useState<IRevCompSeq[]>([])
  const { setAppInfo } = useAppInfo()
  const [modeRev, setModeRev] = useState(true)
  const [modeComp, setModeComp] = useState(true)
  const [showSideBar, setShowSideBar] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

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
    try {
      const res = await httpFetch.getText('/data/test/rev-comp.fasta')

      setText(res)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

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
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    fileTypes: ['fasta'],
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

            <ToolbarIconButton
              arial-label="Save to local file"
              onClick={() => {
                openDialog({
                  type: 'save',
                  payload: {
                    name: 'rev-comp',
                    fileTypes: [FASTA_FILE_TYPE, FILE_FORMAT_JSON],
                    callback: (data) => {
                      save(data.name, data.format.ext)
                    },
                  },
                })
              }}
              title="Save sequences"
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Convert">
            <ToolbarButton title="Convert" onClick={applyRevComp}>
              <PlayIcon />
              <span>Convert</span>
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openDialog({
              type: 'open',
              payload: {
                fileTypes: ['fasta'],
                callback: (message, files) => {
                  onTextFileChange(message, files, (files) => {
                    setText(files[0]!.text)
                  })
                },
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
        <PropsPanel className="pr-2">
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
                  Complement
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
      {/* <DialogsRoot /> */}

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
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
        </Toolbar>

        <ToolbarPanel
          groupId={_id}
          tabs={tabs}
          tabShortcutMenu={
            <ShowOptionsMenu
              show={showSideBar}
              onClick={() => {
                setShowSideBar(!showSideBar)
              }}
            />
          }
        />

        <TabSlideBar
          id="rev-comp"
          side="right"
          tabs={rightTabs}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="px-2"
        >
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
        </TabSlideBar>
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
