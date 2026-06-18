'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { OpenIcon } from '@/icons/open-icon'

import { queryClient } from '@/qcp'
import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_RUN,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
} from '@/consts'

import { PropsPanel } from '@/components/props-panel'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { SlidersIcon } from '@/icons/sliders-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { createDNATable, type FORMAT_TYPE } from '@/lib/genomic/dna'
import { Checkbox } from '@/themed/v2/check-box'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import {
  HeaderPortal,
  HeaderSlotPortal,
} from '@/components/header/header-portal'
import { BaseCol } from '@/components/layout/base-col'
import { useStableId } from '@/hooks/stable-id'
import { DownloadIcon } from '@/icons/download-icon'
import { AssemblySelect } from '@/lib/edb/assembly-select'
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'
import { CoreProviders } from '@/providers/core-providers'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import APP_INFO from './manifest.json'

export function DNAPage() {
  const _id = useStableId('dna-page')
  const { openApp, goto, openFile, addSheets } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()
  const { setAppInfo } = useAppInfo()
  const [showSideBar, setShowSideBar] = useState(true)
  const { settings } = useEdbSettings()

  //const [assembly, setAssembly] = useState('grch38')
  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  useEffect(() => {
    setAppInfo(APP_INFO)
    openApp(APP_INFO.name)
  }, [])

  function openFiles(
    files: ITextFileOpen[],
    parseOpts: IParseOptions = { ...DEFAULT_PARSE_OPTS }
  ) {
    filesToDataFrames(files, {
      ...parseOpts,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
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
        assembly: settings.genomic.assembly,
        format,
        mask,
        reverse,
        complement,
      }
    )

    if (dfa) {
      addSheets([dfa], { name: `DNA` })
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
    const res = await httpFetch.getText('/data/test/dna.txt')

    try {
      const lines = textToLines(res)

      const table = new DataFrameReader().indexCols(0).read(lines)

      //resolve({ ...table, name: file.name })

      openFile(`DNA Test`, {
        sheets: [table.setName('DNA Test') as AnnotationDataFrame],
      })
    } catch {
      // do nothing
    }
  }

  // const genomesQuery = useQuery({
  //   queryKey: ['genomes'],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     const res = await httpFetch.getJson<{ data: string[] }>(
  //       API_DNA_GENOMES_URL
  //     )

  //     return res.data
  //   },
  // })

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    callback: (message, files) => {
                      onTextFileChange(message, files, openFiles)
                    },
                  },
                })
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_TABLE}
              onClick={() =>
                openDialog({
                  type: 'save',
                  payload: {
                    callback: (data) => {
                      save(data.name, data.format!.ext! as string)
                    },
                  },
                })
              }
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title={TEXT_RUN}>
            <ToolbarButton title="Add DNA" onClick={addDNA}>
              <PlayIcon />
              <span>Add DNA</span>
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Letters">
            <ToggleGroup
              direction="toolbar"
              className="overflow-hidden rounded-theme"
              //rounded="none"
              size="toolbar"
              value={[format]}
              onValueChange={(v) => {
                setFormat(v[0] as FORMAT_TYPE)
              }}
            >
              <GroupToggle value="auto" className="px-2">
                Auto
              </GroupToggle>

              <GroupToggle value="upper" className="px-2">
                Upper
              </GroupToggle>

              <GroupToggle value="lower" className="px-2">
                Lower
              </GroupToggle>
            </ToggleGroup>
          </ToolbarTabGroup>
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
          <ScrollAccordion value={['assembly', 'letters', 'mask', 'strand']}>
            {/* <AccordionItem value="assembly">
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
            </AccordionItem> */}

            {/* <AccordionItem value="letters">
              <AccordionTrigger>Letters</AccordionTrigger>
              <AccordionContent>
                <ToggleGroup
                  direction="row"
                  className="overflow-hidden rounded-theme"
                  rounded="none"
                  value={[format]}
                  onValueChange={v => {
                    setFormat(v[0] as FORMAT_TYPE)
                  }}
                >
                  <GroupToggle value="auto" className="px-2">
                    Auto
                  </GroupToggle>

                  <GroupToggle value="upper" className="px-2">
                    Upper
                  </GroupToggle>

                  <GroupToggle value="lower" className="px-2">
                    Lower
                  </GroupToggle>
                </ToggleGroup>
              </AccordionContent>
            </AccordionItem> */}

            <AccordionItem value="mask">
              <AccordionTrigger>Mask</AccordionTrigger>
              <AccordionContent>
                <BaseCol className="gap-y-1">
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
                    N
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
                    Lowercase
                  </Checkbox>
                </BaseCol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="strand">
              <AccordionTrigger>Strand</AccordionTrigger>
              <AccordionContent>
                <BaseCol className="gap-y-1">
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
                </BaseCol>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    // {
    //   //id: nanoid(),
    //   icon: <ClockRotateLeftIcon />,
    //   id: 'History',
    //   content: <HistoryPanel />,
    // },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openDialog({
              type: 'open',
              payload: {
                callback: (message, files) => {
                  onTextFileChange(message, files, openFiles)
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
      {/* <DialogsRoot /> */}

      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <></>
        <AssemblySelect />
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <HeaderSlotPortal slot="header-right"></HeaderSlotPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  role="button"
                  title="Load test data."
                  className="text-xs"
                >
                  Test data
                </ToolbarButton>
                <HistoryShowButton />
              </>
            }
          />
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
        </Toolbar>

        <HistoryLayout>
          <TabSlideBar
            id="dna"
            side="right"
            tabs={rightTabs}
            //value={rightTab}
            //onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
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
                goto({ app, file, sheet: selectedTab.tab })
              }}
              className="mx-2"
            />
            {/* </Card> */}
          </TabSlideBar>
        </HistoryLayout>
      </ShortcutLayout>

      <FooterPortal className="justify-end">
        <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
        <></>
        <ZoomSlider />
      </FooterPortal>
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
