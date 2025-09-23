'use client'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { PlayIcon } from '@icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { ToolbarButton } from '@toolbar/toolbar-button'

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

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { queryClient } from '@/query'
import { useState } from 'react'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_RUN,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  TEXT_SETTINGS,
  type IDialogParams,
} from '@/consts'

import { PropsPanel } from '@components/props-panel'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { SlidersIcon } from '@icons/sliders-icon'
import { UploadIcon } from '@icons/upload-icon'
import { API_DNA_GENOMES_URL } from '@lib/edb/edb'
import { createDNATable, type FORMAT_TYPE } from '@lib/genomic/dna'
import { Checkbox } from '@themed/check-box'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { RadioGroup, RadioGroupItem } from '@themed/radio-group'

import { ShortcutLayout } from '@layouts/shortcut-layout'
import { randID } from '@lib/id'
import axios from 'axios'

import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import type { ITab } from '@components/tabs/tab-provider'
import { PropRow } from '@dialog/prop-row'
import { FileIcon } from '@icons/file-icon'
import { VCenterRow } from '@layout/v-center-row'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { httpFetch } from '@lib/http/http-fetch'
import { textToLines } from '@lib/text/lines'
import { useQuery } from '@tanstack/react-query'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Label } from '@themed/label'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ZoomSlider } from '@toolbar/zoom-slider'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/shadcn/ui/themed/toggle-group'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { DownloadIcon } from '@icons/download-icon'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import { useHistory } from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import MODULE_INFO from './module.json'

export function DNAPage() {
  const { branch, sheet, sheets, gotoSheet, openBranch, addStep } = useHistory()

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
          openBranch(`Load ${tables[0]!.name}`, tables)
        }
      },
    })

    setShowFileMenu(false)
  }

  async function addDNA() {
    const dfa = await createDNATable(
      queryClient,
      sheet as AnnotationDataFrame,
      {
        assembly,
        format,
        mask,
        reverse,
        complement,
      }
    )

    if (dfa) {
      addStep(`DNA`, [dfa])
    }
  }

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: name,
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

      openBranch(`Load "DNA Test"`, [
        table.setName('DNA Test') as AnnotationDataFrame,
      ])
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
                    id: randID('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_TABLE}
              onClick={() => setShowDialog({ id: randID('save') })}
            >
              <DownloadIcon />
            </ToolbarIconButton>
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
                {/* <Tabs
                    value={format}
                    onValueChange={(v) => {
                      setFormat(v as FORMAT_TYPE)
                    }}
                  >
                    <IOSTabsList
                      defaultWidth="72px"
                      value={format}
                      tabs={[{ id: 'Auto' }, { id: 'Upper' }, { id: 'Lower' }]}
                    />
                  </Tabs> */}
                <PropRow title="Letters" />
                <ToggleGroup
                  //variant="outline"
                  type="single"
                  value={format}
                  onValueChange={(v) => {
                    setFormat(v as FORMAT_TYPE)
                  }}
                >
                  <ToggleGroupItem value="Auto" className="px-2">
                    Auto
                  </ToggleGroupItem>

                  <ToggleGroupItem value="Upper" className="px-2">
                    Upper
                  </ToggleGroupItem>

                  <ToggleGroupItem value="Lower" className="px-2">
                    Lower
                  </ToggleGroupItem>
                </ToggleGroup>

                <PropRow title="Mask" />
                <VCenterRow className="gap-x-4">
                  <Checkbox
                    checked={mask === 'n'}
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
                    checked={mask === 'lower'}
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
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon iconMode="colorful" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: randID('open'), params: {} })}
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
            onClick={() => save('dna.txt', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('dna.csv', 'csv')}
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
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      {showDialog.id.includes('open') && (
        <OpenFiles
          open={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, openFiles)
          }
        />
      )}

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="dna"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              save(
                data!.name as string,
                (data!.format as ISaveAsFormat)!.ext! as string
              )
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signedRequired={false} showAccountButton={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>
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

        <TabSlideBar
          id="dna"
          side="right"
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
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              gotoSheet(selectedTab.tab.id)
            }}
            className="mx-2"
            style={{ marginBottom: '-2px' }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet)}</span>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}
