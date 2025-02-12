'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { PlayIcon } from '@icons/play-icon'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

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
  type ITextFileOpen,
} from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { LayersIcon } from '@components/icons/layers-icon'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import { type IDataset } from '@modules/gene/pathway/pathway'
import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_HELP,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import {
  BaseDataFrame,
  DEFAULT_SHEET_NAME,
} from '@lib/dataframe/base-dataframe'

import {
  API_PATHWAY_DATASET_URL,
  API_PATHWAY_DATASETS_URL,
  API_PATHWAY_GENES_URL,
} from '@/lib/edb/edb'
import { DataFrame } from '@lib/dataframe/dataframe'
import { makeRandId, nanoid } from '@lib/utils'
import axios from 'axios'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { range } from '@lib/math/range'
import { truncate } from '@lib/text/text'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { HistoryPanel } from '@components/pages/history-panel'
import type { ITab } from '@components/tab-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'

import { HelpIcon } from '@/components/icons/help-icon'

import { ToastSpinner } from '@/components/shadcn/ui/themed/toast'
import { HelpSlideBar } from '@/components/slide-bar/help-slide-bar'
import { useToast } from '@/hooks/use-toast'
import { randomHexColor } from '@/lib/color'

import { FileIcon } from '@/components/icons/file-icon'
import { PropsPanel } from '@/components/props-panel'
import type { IGeneset } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { sum } from '@lib/math/sum'
import { CoreProviders } from '@providers/core-providers'
import MODULE_INFO from './module.json'

const HELP_URL = '/help/modules/pathway'

interface IDatasetInfo {
  organization: string
  name: string
  pathways: number
}

interface IOrgInfo {
  name: string
  datasets: IDatasetInfo[]
}

function makeDatasetId(dataset: IDatasetInfo) {
  return `${dataset.organization}:${dataset.name}`
}

export function PathwayPage() {
  const queryClient = useQueryClient()

  const workerRef = useRef<Worker | null>(null)

  const [activeSideTab] = useState('Data')

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)
  //const [showHelp, setShowHelp] = useState(false)

  const { toast } = useToast()

  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const canvasRef = useRef<HTMLCanvasElement>(null)

  const { history, historyDispatch } = useContext(HistoryContext)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const [scale, setScale] = useState(3)
  const [selectedTab] = useState(0)
  const [displayProps, setDisplayProps] = useState({
    scale: 1,
    xrange: [0, 500],
    yrange: [0, 1000],
  })

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  const [showHelp, setShowHelp] = useState(false)

  const [datasetInfos, setDatasetInfos] = useState<IOrgInfo[]>([])

  const [datasetInfoTabs, setDatasetInfoTabs] = useState<string[]>([])

  const [datasetsForUse, setDatasetsForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [validGeneSet, setValidGeneSet] = useState(new Set<string>())

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./pathway.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    )

    return () => {
      // Terminate the worker when component unmounts
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  /**
   * Lazy fetch valid genes if not already cached.
   */
  const getValidGenes = useCallback(async () => {
    if (validGeneSet.size > 0) {
      return validGeneSet
    }

    const ret = new Set<string>()

    // Only fetch if data is missing
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['genes'],
        queryFn: () =>
          httpFetch.getJson<{ data: string[] }>(API_PATHWAY_GENES_URL),
      })

      const dataset = res.data

      for (const gene of dataset.map((g: string) => g.toLowerCase())) {
        ret.add(gene)
      }
    } catch (e) {
      console.log(e)
    }

    setValidGeneSet(ret)
    return ret
  }, [validGeneSet])

  function adjustScale(scale: number) {
    setScale(scale)
    setDisplayProps({ ...displayProps, scale })
  }

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file: File = files[0]! // OR const file = files.item(i);

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       const text: string = result as string

  //       const lines = text.split(/[\r\n]+/g).filter(line => line.length > 0)
  //       //.slice(0, 100)

  //       const table = new DataFrameReader()
  //         .indexCols(0)
  //         .ignoreRows(file.name.includes('gmx') ? [1] : [])
  //         .read(lines)
  //         .setName(file.name)

  //       //setDataFile(table)

  //       open(table)
  //     }
  //   }

  //   fileReader.readAsText(file)
  // }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/pathway.txt'),
    })

    try {
      const lines = textToLines(res.data)

      const table = new DataFrameReader()
        .keepDefaultNA(false)
        .indexCols(0)
        .read(lines)
        .setName('Genesets')

      //resolve({ ...table, name: file.name })

      open(table)
    } catch {
      // do nothing
    }
  }

  function open(table: BaseDataFrame) {
    // if (workerRef.current) {
    //   workerRef.current.terminate()
    // }

    historyDispatch({
      type: 'open',
      description: `Load ${table.name}`,
      sheets: [table.setName(truncate(table.name, { length: 16 }))],
    })
  }

  function openFiles(files: ITextFileOpen[]) {
    if (files.length > 0) {
      filesToDataFrames(queryClient, files, {
        parseOpts: {
          ...DEFAULT_PARSE_OPTS,
          indexCols: 0,
          colNames: files[0]!.name.includes('gmx') ? 0 : 1,
          skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
          delimiter: files[0]!.ext === 'csv' ? ',' : '\t',
        },
        onSuccess: (tables) => {
          if (tables.length > 0) {
            open(tables[0]!)
          }
        },
      })
    }
  }

  async function runLocal() {
    //setIsRunning(true)

    const df = currentSheet(history)[0]!

    if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
      toast({
        title: 'Pathway',
        description: 'You must load at least 1 geneset to test.',
        variant: 'destructive',
      })

      return
    }

    const genes = await getValidGenes()

    // only keep genes in approved list
    const genesets: IGeneset[] = range(df.shape[1]).map(() => {
      return {
        id: nanoid(),
        name: df.col(0).name.toString(),
        genes: df
          .col(0)
          .strs.filter((v) => v !== '' && genes.has(v.toLowerCase())),
        color: randomHexColor(),
      }
    })

    if (sum(genesets.map((geneset) => geneset.genes.length)) === 0) {
      // setShowDialog({
      //   name: "alert",
      //   params: {
      //     message: "You must load at least 1 geneset to test.",
      //   },
      // })

      // toast({
      //   type: 'set',
      //   alert: makeErrorAlert({
      //     title: 'Pathway',
      //     content:
      //       'None of your gene sets appear to contain valid gene symbols.',
      //     //size: 'dialog',
      //   }),
      // })

      toast({
        title: 'Pathway',
        description:
          'None of your gene sets appear to contain valid gene symbols.',
        variant: 'destructive',
      })

      return
    }

    const queryDatasets = datasetInfos
      .map((org) =>
        org.datasets.filter((dataset) =>
          datasetsForUse.get(makeDatasetId(dataset))
        )
      )
      .flat()

    const datasets: IDataset[] = []

    console.log(API_PATHWAY_DATASET_URL)

    try {
      for (const qd of queryDatasets) {
        const res = await queryClient.fetchQuery({
          queryKey: ['dataset'],
          queryFn: () =>
            httpFetch.postJson<{ data: IDataset }>(API_PATHWAY_DATASET_URL, {
              body: {
                organization: qd.organization,
                name: qd.name,
              },
            }),
        })

        const dataset = res.data

        datasets.push(dataset) //{organization:dataset.organization, name:dataset, genes:new Set<string>(dataset.genes)})
      }
    } catch (e) {
      console.log(e)
    }

    if (datasets.length < 1) {
      setShowDialog({
        id: 'alert',
        params: {
          message: 'You must select some datasets to test.',
        },
      })

      return
    }

    //const runningAlertId = nanoid()
    // toast({
    //   type: 'set',
    //   alert: makeAlert({
    //     //id: runningAlertId,
    //     //title: "Pathway",
    //     icon: <LoadingSpinner />,
    //     content: 'Running analysis, this may take a few seconds...',

    //     onClose: () => {
    //       //console.log("terminated")
    //       if (worker.current) {
    //         worker.current.terminate()
    //       }
    //     },
    //   }),
    // })
    if (workerRef.current) {
      const { dismiss: dismissSpinnerToast } = toast({
        title: 'Pathway',
        description: (
          <ToastSpinner>
            Calculating pathway enrichment, please do not refresh your browser
            window...
          </ToastSpinner>
        ),
        durationMs: 60000,
        // onClose: () => {
        //   //console.log("terminated")
        //   if (workerRef.current) {
        //     workerRef.current.terminate()
        //   }
        // },
      })

      // stopunknown current jobs before continuing
      // if (workerRef.current) {
      //   workerRef.current.terminate()
      // }

      // workerRef.current = new Worker(
      //   new URL('./pathway.worker.ts', import.meta.url),

      // )

      workerRef.current.onmessage = function (e) {
        const { data, columns } = e.data

        const dfOut = new DataFrame({ data, columns }).setName('Pathways')

        //console.log('pathway', e.data)

        // filter for log10q > 0

        historyDispatch({
          type: 'add-step',
          description: 'Pathway',
          sheets: [dfOut],
        })

        // we've finished so get rid of the animations
        dismissSpinnerToast()
      }

      workerRef.current.postMessage({ genesets, datasets })
    }
  }

  // export const PATHWAY_TABLE_COLS = [
  //   "Geneset",
  //   "Dataset",
  //   "Pathway",
  //   "# Genes in Gene Set (K)",
  //   "# Genes in Comparison (n)",
  //   "# Genes in overlap (k)",
  //   "# Genes in Universe",
  //   "# Gene Sets",
  //   "p",
  //   "q",
  //   "-log10q",
  //   "rank",
  //   "Ratio k/n",
  //   "Genes in overlap",
  // ]

  // async function run() {
  //   const queryDatasets = datasetInfos
  //     .map(org =>
  //       org.datasets.filter(dataset =>
  //         datasetsForUse.get(makeDatasetId(dataset)),
  //       ),
  //     )
  //     .flat()
  //     .map(dataset => makeDatasetId(dataset))

  //   console.log(queryDatasets)

  //   if (queryDatasets.length === 0) {
  //     setShowDialog({
  //       name: "alert",
  //       params: {
  //         message: "You must select at least 1 dataset to test.",
  //       },
  //     })

  //     return
  //   }

  //   const df = historyState.currentStep.currentSheet

  //   if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
  //     setShowDialog({
  //       name: "alert",
  //       params: {
  //         message: "You must load at least 1 geneset to test.",
  //       },
  //     })

  //     return
  //   }

  //   try {
  //     const out: SeriesType[][] = []

  //     for (const col of range(df.shape[1])) {
  //       const geneset = {
  //         name: df.col(col).name,
  //         genes: df.col(col).strs.filter(v => v !== ""),
  //       }

  //       const res = await queryClient.fetchQuery({
  //         queryKey: ["pathway"],
  //         queryFn: () =>
  //           axios.post(
  //             API_PATHWAY_OVERLAP_URL,
  //             {
  //               geneset,
  //               datasets: queryDatasets,
  //             },
  //             { timeout: TIMEOUT_MS },
  //             // {
  //             //   headers: {
  //             //     //Authorization: bearerTokenHeader(token),
  //             //     "Content-Type": "application/json",
  //             //   },
  //             // },
  //           ),
  //       })

  //       console.log(res.data)

  //       const data = res.data

  //       const datasets = data.datasets

  //       data.pathway.forEach((pathway: string, pi: number) => {
  //         const di = data.datasetIdx[pi]

  //         const row: SeriesType[] = new Array(PATHWAY_TABLE_COLS.length).fill(0)

  //         row[0] = geneset.name
  //         row[1] = datasets[di]
  //         row[2] = pathway
  //         row[3] = pi === 0 ? data.validGenes.join(",") : ""
  //         row[4] = data.validGenes.length
  //         row[5] = data.pathwayGeneCounts[pi]
  //         row[6] = data.overlapGeneCounts[pi]
  //         row[7] = data.genesInUniverseCount
  //         row[8] = data.pvalues[pi]
  //         row[9] = data.qvalues[pi]
  //         //row[9] = -Math.log10(row[8] as number)
  //         row[10] = data.kdivK[pi]
  //         row[11] = data.overlapGeneList[pi]
  //         out.push(row)
  //       })
  //     }

  //     const ret = new DataFrame({ data: out, columns: PATHWAY_TABLE_COLS })

  //     // console.log(ret)

  //     historyDispatch({
  //       type: "replace_sheet",
  //       sheetId: `Pathways`,
  //       sheet: ret.setName("Pathways"),
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

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

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IOrgInfo[] }>(
        API_PATHWAY_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetsQuery.data) {
      setDatasetInfos(datasetsQuery.data)
    }
  }, [datasetsQuery.data])

  useEffect(() => {
    setDatasetsForUse(
      new Map<string, boolean>(
        datasetInfos
          .map((org) =>
            org.datasets.map(
              (dataset: IDatasetInfo) =>
                [makeDatasetId(dataset), true] as [string, boolean]
            )
          )
          .flat()
      )
    )

    setDatasetInfoTabs(datasetInfos.map((org: IOrgInfo) => org.name))
  }, [datasetInfos])

  useEffect(() => {
    setDatasetsForUse(
      new Map<string, boolean>(
        datasetInfos
          .map((org) =>
            org.datasets.map(
              (dataset: IDatasetInfo) =>
                [makeDatasetId(dataset), selectAllDatasets] as [string, boolean]
            )
          )
          .flat()
      )
    )
  }, [selectAllDatasets])

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

            {selectedTab === 0 && (
              <ToolbarIconButton onClick={() => save('txt')} title="Save table">
                <SaveIcon />
              </ToolbarIconButton>
            )}
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Run">
            <ToolbarButton
              aria-label="Pathway analysis"
              onClick={() => runLocal()}
              title="Run pathway analysis"
            >
              <PlayIcon />
              {/* <span>Test Pathways</span> */}
            </ToolbarButton>

            {/* <Tooltip content="Create bar plot">
              <ToolbarButton aria-label="Create bar plot" onClick={makeBarPlot}>
                Bar Plot
              </ToolbarButton>
            </Tooltip> */}
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
    {
      id: 'Help',
      content: (
        <>
          <ToolbarTabGroup title="Help">
            <ToolbarButton
              onClick={() => setShowHelp(true)}
              title="Get help using Pathway"
            >
              <HelpIcon /> <span>{TEXT_HELP}</span>
            </ToolbarButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = useMemo(() => {
    return [
      {
        //id: nanoid(),
        icon: <LayersIcon />,
        id: 'Gene Sets',
        content: (
          <PropsPanel className="gap-y-3 pt-2 text-xs">
            <Checkbox
              aria-label="Select all gene sets"
              checked={selectAllDatasets}
              onCheckedChange={() => setSelectAllDatasets(!selectAllDatasets)}
              className="pl-2"
            >
              Select All
            </Checkbox>

            <ScrollAccordion
              value={datasetInfoTabs}
              onValueChange={setDatasetInfoTabs}
            >
              {datasetInfos.map((org: IOrgInfo, oi) => {
                return (
                  <AccordionItem value={org.name} key={oi}>
                    <AccordionTrigger>{org.name}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-y-1.5">
                        {org.datasets.map(
                          (dataset: IDatasetInfo, di: number) => (
                            <li key={di}>
                              <Checkbox
                                aria-label={`Use dataset ${dataset.name}`}
                                checked={
                                  datasetsForUse.get(makeDatasetId(dataset))!
                                }
                                onCheckedChange={() => {
                                  setDatasetsForUse(
                                    new Map<string, boolean>([
                                      ...datasetsForUse.entries(),
                                      [
                                        dataset.name,
                                        !datasetsForUse.get(dataset.name),
                                      ],
                                    ])
                                  )
                                }}
                              >
                                {`${
                                  dataset.name
                                } (${dataset.pathways.toLocaleString()})`}
                              </Checkbox>
                            </li>
                          )
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
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
  }, [datasetsForUse, datasetInfoTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
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
            value={toolbarTab}
            onValueChange={setToolbarTab}
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

        <HelpSlideBar
          open={showHelp}
          onOpenChange={setShowHelp}
          helpUrl={HELP_URL}
        >
          <TabSlideBar
            side="Right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          >
            {/* <Card variant="content" className="mx-2 pb-0"> */}
            <TabbedDataFrames
              selectedSheet={currentSheetId(history)[0]!}
              dataFrames={currentSheets(history)[0]!}
              onTabChange={(selectedTab) => {
                historyDispatch({
                  type: 'goto-sheet',
                  sheetId: selectedTab.index,
                })
              }}
              onFileDrop={(files) => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  console.log('Dropped file:', files[0])

                  onTextFileChange('Open dropped file', files, openFiles)
                }
              }}
              className="mx-2"
              style={{ marginBottom: '-2px' }}
            />
            {/* </Card> */}
          </TabSlideBar>
        </HelpSlideBar>

        <ToolbarFooter className="justify-end">
          <>
            {activeSideTab === 'Data' && (
              <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
            )}
          </>
          <></>
          <>
            {activeSideTab === 'Chart' && (
              <ZoomSlider scale={scale} onZoomChange={adjustScale} />
            )}
          </>
        </ToolbarFooter>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) => {
              onTextFileChange(message, files, (files) => {
                if (files.length > 0) {
                  filesToDataFrames(queryClient, files, {
                    parseOpts: {
                      ...DEFAULT_PARSE_OPTS,
                      colNames: files[0]!.name.includes('gmx') ? 0 : 1,
                      skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
                    },
                    onSuccess: (tables) => {
                      if (tables.length > 0) {
                        open(tables[0]!)
                      }
                    },
                  })
                }
              })

              setShowDialog({ ...NO_DIALOG })
            }}
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />

        {/* <canvas ref={canvasRef} width={0} height={0} className="hidden" /> */}
      </ShortcutLayout>
    </>
  )
}

export function PathwayQueryPage() {
  return (
    <CoreProviders>
      <PathwayPage />
    </CoreProviders>
  )
}
