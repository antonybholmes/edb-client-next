'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

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
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { OpenIcon } from '@/icons/open-icon'

import { queryClient } from '@/query'
import { useEffect, useState } from 'react'

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
  type IDialogParams,
} from '@/consts'

import { PropsPanel } from '@/components/props-panel'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { SlidersIcon } from '@/icons/sliders-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { API_DNA_GENOMES_URL } from '@/lib/edb/edb'
import { createDNATable, type FORMAT_TYPE } from '@/lib/genomic/dna'
import { Checkbox } from '@/themed/v2/check-box'
import { RadioGroup, RadioGroupItem } from '@/themed/v2/radio-group'

import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { randId } from '@/lib/id'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
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
import { useQuery } from '@tanstack/react-query'

import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { BaseCol } from '@/components/layout/base-col'
import { useStableId } from '@/hooks/stable-id'
import { DownloadIcon } from '@/icons/download-icon'
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
import MODULE_INFO from './module.json'

export function DNAPage() {
  const _id = useStableId('dna-page')
  const { openApp, goto, openFile, addSheets } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()
  //const [rightTab, setRightTab] = useState(TEXT_SETTINGS)
  const [showSideBar, setShowSideBar] = useState(true)

  const [assembly, setAssembly] = useState('grch38')
  const [reverse, setReverse] = useState(false)
  const [complement, setComplement] = useState(false)
  const [format, setFormat] = useState<FORMAT_TYPE>('auto')
  const [mask, setMask] = useState<'' | 'lower' | 'n'>('')

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  useEffect(() => {
    openApp(MODULE_INFO.name)
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
        assembly,
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
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_TABLE}
              onClick={() => setShowDialog({ id: randId('save') })}
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
        <PropsPanel className="pr-2">
          <ScrollAccordion
            value={['assembly', 'letters', 'mask', 'strand']}
            variant="sidebar"
          >
            <AccordionItem value="assembly">
              <AccordionTrigger variant="sidebar">Assembly</AccordionTrigger>
              <AccordionContent variant="sidebar">
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

            <AccordionItem value="letters">
              <AccordionTrigger variant="sidebar">Letters</AccordionTrigger>
              <AccordionContent variant="sidebar">
                <ToggleGroup
                  direction="row"
                  className="overflow-hidden rounded-theme"
                  rounded="none"
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mask">
              <AccordionTrigger variant="sidebar">Mask</AccordionTrigger>
              <AccordionContent variant="sidebar">
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
              <AccordionTrigger variant="sidebar">Strand</AccordionTrigger>
              <AccordionContent variant="sidebar">
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
      icon: <OpenIcon variant="colorful" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
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
          message={showDialog.id}
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
              const d = data as { name: string; format: ISaveAsFormat }
              save(d.name, d.format!.ext! as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderSlotPortal>
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <HeaderSlotPortal slot="header-right">
          <ToolbarButton
            onClick={() => loadTestData()}
            role="button"
            title="Load test data to use features."
            className="text-xs"
          >
            Test data
          </ToolbarButton>
        </HeaderSlotPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={<HistoryShowButton />}
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

      <ToolbarFooterPortal className="justify-end">
        <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
        <></>
        <ZoomSlider />
      </ToolbarFooterPortal>
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
