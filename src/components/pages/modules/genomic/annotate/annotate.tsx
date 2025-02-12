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

import { ZoomSlider } from '@components/toolbar/zoom-slider'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { OpenFiles } from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { Tooltip } from '@components/tooltip'

import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'

import { createAnnotationTable } from '@/lib/genomic/annotate'
import { queryClient } from '@/query'

import { useContext, useRef, useState } from 'react'

import { SlidersIcon } from '@components/icons/sliders-icon'

import {
  type IDialogParams,
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_RUN,
  TEXT_SAVE_AS,
  TEXT_SETTINGS,
} from '@/consts'
import { API_GENES_GENOMES_URL } from '@/lib/edb/edb'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import axios from 'axios'

import { FileIcon } from '@/components/icons/file-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { UploadIcon } from '@components/icons/upload-icon'
import { HistoryPanel } from '@components/pages/history-panel'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { Label } from '@components/shadcn/ui/themed/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@components/shadcn/ui/themed/radio-group'
import type { ITab } from '@components/tab-provider'
import { truncate } from '@lib/text/text'
import { makeRandId } from '@lib/utils'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

export interface IGeneDbInfo {
  name: string
  genome: string
  version: string
}

function AnnotationPage() {
  //const [dataFrame, setDataFile] = useState<BaseDataFrame>(INF_DATAFRAME)

  //const [, setTestGeneCollection] = useState<IGeneSetCollection | null>(null)

  const downloadRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [assembly, setAssembly] = useState<string | null>(null)

  const { history, historyDispatch } = useContext(HistoryContext)

  const [rightTab, setRightTab] = useState(TEXT_SETTINGS)
  const [showSideBar, setShowSideBar] = useState(true)

  const [scale, setScale] = useState(3)
  const [selectedTab] = useState(0)
  const [displayProps, setDisplayProps] = useState({
    scale: 1,
    xrange: [0, 500],
    yrange: [0, 1000],
  })

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  function onFileChange(_message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file: File = files[0]! // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter((line) => line.length > 0)
        //.slice(0, 100)

        //const locs = parseLocations(lines)
        const retMap: { [key: string]: Set<string> } = {}
        const geneSets: string[] = lines[0]!.split('\t')

        lines[0]!.split('\t').forEach((gs) => {
          retMap[gs] = new Set<string>()
        })

        lines.slice(1).forEach((line) => {
          line.split('\t').forEach((gene, genei) => {
            if (gene.length > 0 && gene !== '----') {
              retMap[geneSets[genei]!]!.add(gene)
            }
          })
        })

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        historyDispatch({
          type: 'open',
          description: `Load ${name}`,
          sheets: [table.setName(truncate(name, { length: 16 }))],
        })

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
    const df = currentSheet(history)[0]!

    console.log(genomesQuery.data)

    const a =
      assembly ??
      (genomesQuery && genomesQuery.data ? genomesQuery.data[0].genome : '')

    const dfa = await createAnnotationTable(queryClient, df, a)

    if (dfa) {
      historyDispatch({
        type: 'add-step',
        description: `Annotated`,
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

    historyDispatch({
      type: 'open',
      description: `Load test locations`,
      sheets: [table.setName('Test Locations')],
    })
  }

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGeneDbInfo[] }>(
        API_GENES_GENOMES_URL
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
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
            />

            {selectedTab === 0 && (
              <Tooltip content="Save table">
                <ToolbarIconButton
                  arial-label="Save table to local file"
                  onClick={() => save('txt')}
                >
                  <SaveIcon />
                </ToolbarIconButton>
              </Tooltip>
            )}
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Analysis">
            <ToolbarTabGroup>
              <ToolbarButton title="Run pathway analysis" onClick={annotate}>
                <PlayIcon />
                <span>{TEXT_RUN}</span>
              </ToolbarButton>
            </ToolbarTabGroup>
          </ToolbarTabGroup>{' '}
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
            <FileIcon />
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
            defaultSize={75}
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
          <ResizablePanel className="flex flex-col" id="right-tabs">
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
            selectedSheet={currentSheetId(history)[0]!}
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
            <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
          </>
          <></>
          <>
            <ZoomSlider scale={scale} onZoomChange={adjustScale} />
          </>
        </ToolbarFooter>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={onFileChange}
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function AnnotationQueryPage() {
  return (
    <CoreProviders>
      <AnnotationPage />
    </CoreProviders>
  )
}
