// 'use client'

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

import { ZoomSlider } from '@toolbar/zoom-slider'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { OpenFiles } from '@components/pages/open-files'

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { queryClient } from '@/query'
import { createAnnotationTable } from '@lib/genomic/annotate'

import { useEffect, useState } from 'react'

import { SlidersIcon } from '@icons/sliders-icon'

import {
  type IDialogParams,
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
} from '@/consts'
import { API_GENOME_GENOMES_URL } from '@lib/edb/edb'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'

import { ShortcutLayout } from '@layouts/shortcut-layout'
import axios from 'axios'

import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { PropsPanel } from '@components/props-panel'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import type { ITab } from '@components/tabs/tab-provider'
import { FileIcon } from '@icons/file-icon'
import { UploadIcon } from '@icons/upload-icon'
import { VCenterRow } from '@layout/v-center-row'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { httpFetch } from '@lib/http/http-fetch'
import { textToLines } from '@lib/text/lines'
import { truncate } from '@lib/text/text'
import { randId } from '@lib/utils'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { Label } from '@themed/label'
import { RadioGroup, RadioGroupItem } from '@themed/radio-group'
import { ToolbarButton } from '@toolbar/toolbar-button'
import { Buffer } from 'buffer'

import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { DownloadIcon } from '@components/icons/download-icon'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  HISTORY_ACTION_OPEN_APP,
  useHistory,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import MODULE_INFO from './module.json'

export interface IGeneDbInfo {
  name: string
  genome: string
  version: string
}

function AnnotationPage() {
  const [assembly, setAssembly] = useState<string | null>(null)

  const { branch, sheet, sheets, gotoSheet, openBranch, addStep, dispatch } =
    useHistory()

  const [rightTab, setRightTab] = useState(TEXT_SETTINGS)
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  useEffect(() => {
    dispatch({ type: HISTORY_ACTION_OPEN_APP, name: MODULE_INFO.name })
  }, [])

  function onFileChange(_message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file: File = files[0]! // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter(line => line.length > 0)
        //.slice(0, 100)

        //const locs = parseLocations(lines)
        const retMap: { [key: string]: Set<string> } = {}
        const geneSets: string[] = lines[0]!.split('\t')

        for (const gs of lines[0]!.split('\t')) {
          retMap[gs] = new Set<string>()
        }

        for (const line of lines.slice(1)) {
          for (const [genei, gene] of line.split('\t').entries()) {
            if (gene.length > 0 && gene !== '----') {
              retMap[geneSets[genei]!]!.add(gene)
            }
          }
        }

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        openBranch(`Load ${name}`, [
          table.setName(truncate(name, { length: 16 })) as AnnotationDataFrame,
        ])

        // setTestGeneCollection({
        //   name,
        //   genesets: geneSets.map(geneSetName => ({
        //     name: geneSetName,
        //     genes: retMap[geneSetName],
        //   })),
        // })
      }
    }

    fileReader.readAsText(files[0]!)
  }

  async function annotate() {
    if (!sheet) {
      return
    }

    console.log(genomesQuery.data)

    const a =
      assembly ??
      (genomesQuery && genomesQuery.data && genomesQuery.data.length > 0
        ? genomesQuery.data[0]!.genome
        : '')

    const dfa = await createAnnotationTable(queryClient, sheet, a)

    if (dfa) {
      addStep(`Annotated`, [dfa])
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

  // useEffect(() => {
  //   //setFileData({})

  //   fileStore.files.forEach(async (file: IExtFile) => {
  //     switch (file.type) {
  //       case "local":
  //         const fileReader = new FileReader()

  //         fileReader.onload = e => {
  //           const result = e.target?.result

  //           if (result) {
  //             const text: string =
  //               typeof result === "string"
  //                 ? result
  //                 : Buffer.from(result).toString()

  //             // only load first 100
  //             const lines = text
  //               .split(/[\r\n]+/g)
  //               .filter(line => line.length > 0)
  //             //.slice(0, 100)

  //             setFileData(fileData => {
  //               return { ...fileData, [file.name]: lines }
  //             })
  //           }
  //         }

  //         if (file.file) {
  //           fileReader.readAsText(file.file)
  //         }
  //         break
  //       case "remote":
  //         if (file.url) {
  //           try {
  //             const response = await axios.get(file.url, {
  //               responseType: "text",
  //             })
  //             const data = response.data
  //             const lines = data
  //               .split(/[\r\n]+/g)
  //               .filter((line: string) => line.length > 0)
  //             //.slice(0, 100)

  //             setFileData(fileData => {
  //               return { ...fileData, [file.name]: lines }
  //             })
  //           } catch (error) {
  //             console.error(error)
  //           }
  //         }

  //         break
  //       default:
  //         break
  //     }
  //   })
  // }, [fileStore.files])

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get("/data/modules/pathways/genesets.json")
  //     const data = response.data

  //     setGeneSets(data)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/annotate.txt'),
    })

    const lines = textToLines(res.data)

    const table = new DataFrameReader().indexCols(0).read(lines)

    //resolve({ ...table, name: file.name })

    openBranch(`Load test locations`, [
      table.setName('Test Locations') as AnnotationDataFrame,
    ])
  }

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGeneDbInfo[] }>(
        API_GENOME_GENOMES_URL
      )

      return res.data
    },
  })

  const dbs: IGeneDbInfo[] = genomesQuery.data ? genomesQuery.data : []

  //
  // Load available pathways
  //

  // const { data } = useQuery("pathways", async () => {
  //   const res = await fetch("/data/modules/pathways/genesets.json")

  //   if (!res.ok) {
  //     throw new Error("Network response was not ok")
  //   }

  //   return res.json()
  // })

  // let dimText = "Load a pathway file"

  // switch (activeSideTab) {
  //   case 0:
  //     if (df) {
  //       dimText = `${df.shape[0]} rows x ${df.shape[1]} cols`
  //     }
  //     break
  //   case 1:
  //     if (resultsDF) {
  //       dimText = `${resultsDF.shape[0]} rows x ${resultsDF.shape[1]} cols`
  //     }
  //     break
  //   default:
  //     break
  // }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpenChange={open => {
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
          <ToolbarTabGroup title="Analysis">
            <ToolbarTabGroup>
              <ToolbarButton
                arial-label="Annotate locations"
                onClick={annotate}
              >
                <PlayIcon />
                <span>{TEXT_RUN}</span>
              </ToolbarButton>
            </ToolbarTabGroup>
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
          <ScrollAccordion value={['databases']}>
            <AccordionItem value="databases">
              <AccordionTrigger>Databases</AccordionTrigger>
              <AccordionContent>
                {dbs.length > 0 && (
                  <RadioGroup
                    defaultValue={assembly ?? dbs[0]!.genome}
                    className="flex flex-col gap-y-1.5"
                  >
                    {dbs.map((db: IGeneDbInfo, dbi: number) => (
                      <VCenterRow key={dbi} className="gap-x-1">
                        <RadioGroupItem
                          value={db.genome}
                          onClick={() => setAssembly(db.genome)}
                        />
                        <Label htmlFor={db.genome}>{db.genome}</Label>
                      </VCenterRow>
                    ))}
                  </RadioGroup>
                )}
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
      icon: <OpenIcon iconMode="colorful" />,
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
            onClick={() => save('genomic-annotation.txt', 'txt')}
          >
            <FileIcon />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('genomic-annotation.csv', 'csv')}
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

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="genomic-annotation"
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

      <ShortcutLayout info={MODULE_INFO} signedRequired="never">
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
          id="annotate"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
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
            onTabChange={selectedTab => {
              gotoSheet(selectedTab.tab.id)
            }}
            className="mx-2"
            style={{ marginBottom: '-2px' }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <>
            <span>{getFormattedShape(sheet)}</span>
          </>
          <></>
          <>
            <ZoomSlider />
          </>
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={onFileChange}
          />
        )}
      </ShortcutLayout>
    </>
  )
}

export function AnnotationQueryPage() {
  return (
    <CoreProviders>
      {/* <ZoomProvider> */}
      <AnnotationPage />
      {/* </ZoomProvider> */}
    </CoreProviders>
  )
}
