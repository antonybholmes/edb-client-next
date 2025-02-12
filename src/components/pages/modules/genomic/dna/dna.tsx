'use client'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

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

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { Tooltip } from '@components/tooltip'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import {
  currentSheet,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'

import { queryClient } from '@/query'
import { useContext, useRef, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_RUN,
  TEXT_SAVE_AS,
  TEXT_SETTINGS,
  type IDialogParams,
} from '@/consts'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { API_DNA_GENOMES_URL } from '@/lib/edb/edb'
import { createDNATable, type FORMAT_TYPE } from '@/lib/genomic/dna'
import { SlidersIcon } from '@components/icons/sliders-icon'
import { UploadIcon } from '@components/icons/upload-icon'
import { PropsPanel } from '@components/props-panel'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  RadioGroup,
  RadioGroupItem,
} from '@components/shadcn/ui/themed/radio-group'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { makeRandId } from '@lib/utils'
import axios from 'axios'

import { FileIcon } from '@/components/icons/file-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { HistoryPanel } from '@components/pages/history-panel'
import { PropRow } from '@components/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Label } from '@components/shadcn/ui/themed/label'
import type { ITab } from '@components/tab-provider'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

function DNAPage() {
  //const [dataFrame, setDataFile] = useState<BaseDataFrame>(INF_DATAFRAME)

  const [activeSideTab] = useState(0)
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const { history, historyDispatch } = useContext(HistoryContext)

  const [rightTab, setRightTab] = useState(TEXT_SETTINGS)
  const [showSideBar, setShowSideBar] = useState(true)

  const [assembly, setAssembly] = useState('grch38')
  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('Auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  function openFiles(
    files: ITextFileOpen[],
    parseOpts: IParseOptions = { ...DEFAULT_PARSE_OPTS }
  ) {
    filesToDataFrames(queryClient, files, {
      ...parseOpts,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          historyDispatch({
            type: 'open',
            description: `Load ${tables[0]!.name}`,
            sheets: tables,
          })
        }
      },
    })

    setShowFileMenu(false)
  }

  async function addDNA() {
    const df = currentSheet(history)[0]!

    const dfa = await createDNATable(queryClient, df, {
      assembly,
      format,
      mask,
      reverse,
      complement,
    })

    if (dfa) {
      historyDispatch({
        type: 'add-step',
        description: `DNA`,
        sheets: [dfa],
      })
    }
  }

  function save(format: 'txt' | 'csv') {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/dna.txt'),
    })

    try {
      const lines = textToLines(res.data)

      const table = new DataFrameReader().indexCols(0).read(lines)

      //resolve({ ...table, name: file.name })

      historyDispatch({
        type: 'open',
        description: `Load "DNA Test"`,
        sheets: [table.setName('DNA Test')],
      })
    } catch {
      // do nothing
    }
  }

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: string[] }>(
        API_DNA_GENOMES_URL
      )

      return res.data
    },
  })

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
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

            <Tooltip content="Save table">
              <ToolbarButton
                arial-label="Save table to local file"
                onClick={() => save('txt')}
              >
                <SaveIcon />
              </ToolbarButton>
            </Tooltip>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title={TEXT_RUN}>
            <ToolbarButton title="Add DNA" onClick={addDNA}>
              <PlayIcon />
              <span>Add DNA</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
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
          <ScrollAccordion value={['assembly', 'display']}>
            <AccordionItem value="assembly">
              <AccordionTrigger>Assembly</AccordionTrigger>
              <AccordionContent>
                {genomesQuery.data && (
                  <RadioGroup
                    defaultValue={assembly ?? genomesQuery.data[0]}
                    className="flex flex-col gap-y-1.5"
                  >
                    {genomesQuery.data.map((assembly: string, dbi: number) => (
                      <RadioGroupItem
                        key={dbi}
                        value={assembly}
                        onClick={() => setAssembly(assembly)}
                      >
                        <Label>{assembly}</Label>
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="display">
              <AccordionTrigger>Display</AccordionTrigger>
              <AccordionContent>
                <VCenterRow className="gap-x-4">
                  <ToggleButtons
                    tabs={[
                      { name: 'Auto', id: 'Auto' },
                      { name: 'Upper', id: 'Upper' },
                      { name: 'Lower', id: 'Lower' },
                    ]}
                    value={format}
                    onTabChange={(selectedTab) => {
                      setFormat(selectedTab.tab.id as FORMAT_TYPE)
                    }}
                  >
                    <ToggleButtonTriggers
                      defaultWidth={3.5}
                      className="rounded-theme overflow-hidden bg-background border border-border"
                    />
                  </ToggleButtons>
                </VCenterRow>

                <PropRow title="Mask" />
                <VCenterRow className="gap-x-4">
                  <Checkbox
                    checked={mask == 'n'}
                    onCheckedChange={() => {
                      if (mask != 'n') {
                        setMask('n')
                      } else {
                        setMask('')
                      }
                    }}
                  >
                    <span>N</span>
                  </Checkbox>

                  <Checkbox
                    checked={mask == 'lower'}
                    onCheckedChange={() => {
                      if (mask != 'lower') {
                        setMask('lower')
                      } else {
                        setMask('')
                      }
                    }}
                  >
                    <span>Lowercase</span>
                  </Checkbox>
                </VCenterRow>

                <PropRow title="Strand" />
                <VCenterRow className="gap-x-4">
                  <Checkbox
                    checked={reverse}
                    onCheckedChange={() => setReverse(!reverse)}
                  >
                    <span>Reverse</span>
                  </Checkbox>
                  <Checkbox
                    checked={complement}
                    onCheckedChange={() => setComplement(!complement)}
                  >
                    <span>Complement</span>
                  </Checkbox>
                </VCenterRow>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon stroke="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: makeRandId('open'), params: {} })}
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
            leftShortcuts={<UndoShortcuts />}
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

        {/* <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            id="tables"
            defaultSize={80}
            minSize={50}
            className="flex flex-col pt-2 pl-2"
          >
            <TabbedDataFrames
              selectedSheet={currentStep(history)[0]!.sheetIndex}
              dataFrames={currentSheets(history)[0]!}
              onTabChange={(tab: number) => {
                historyDispatch({ type: "goto-sheet", sheetId: tab })
              }}
            />
          </ResizablePanel>
          <HResizeHandle />
          <ResizablePanel
            className="flex flex-col"
            id="right-tabs"
            defaultSize={20}
            minSize={10}
            collapsible={true}
          >
            <SideBarTextTabs
              tabs={rightTabs}
              value={rightTab}
              onTabChange={selectedTab=>setRightTab(selectedTab.tab.name)}
            />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          side="Right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
          <TabbedDataFrames
            selectedSheet={currentSheet(history)[0]!.id}
            dataFrames={currentSheets(history)[0]!}
            onTabChange={(selectedTab) => {
              historyDispatch({
                type: 'goto-sheet',
                sheetId: selectedTab.index,
              })
            }}
            className="mx-2"
            style={{ marginBottom: '-2px' }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 0 && (
              <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
            )}
          </>
        </ToolbarFooter>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, openFiles)
            }
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function DNAQueryPage() {
  return (
    <CoreProviders>
      <DNAPage />
    </CoreProviders>
  )
}
