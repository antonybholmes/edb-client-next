'use client'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
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
import { ZoomSlider } from '@toolbar/zoom-slider'

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

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { LayersIcon } from '@icons/layers-icon'
import { OpenIcon } from '@icons/open-icon'
import { type IDataset } from '@lib/gene/pathway/pathway'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@icons/upload-icon'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import {
  DOCS_URL,
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_RUN,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  TEXT_SELECT_ALL,
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
} from '@lib/edb/edb'
import { makeNanoIdLen12, randId } from '@lib/id'
import axios from 'axios'

import { range } from '@lib/math/range'
import { truncate } from '@lib/text/text'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ITab } from '@components/tabs/tab-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Checkbox } from '@themed/check-box'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'

import { randomHexColor } from '@lib/color/color'

import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { PropsPanel } from '@components/props-panel'
import { FileIcon } from '@icons/file-icon'

import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import type { IGeneset } from '@lib/gsea/geneset'
import { httpFetch } from '@lib/http/http-fetch'
import { sum } from '@lib/math/sum'
import { textToLines } from '@lib/text/lines'

import { ToastSpinner } from '@themed/toast'
import MODULE_INFO from './module.json'
//import { toast } from '@themed/use-toast'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { DownloadIcon } from '@components/icons/download-icon'
import { ToolbarHelpTabGroup } from '@help/toolbar-help-tab-group'
import { toast } from '@themed/crisp'
import { toast as sonnerToast } from 'sonner'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  HISTORY_ACTION_OPEN_APP,
  HISTORY_ACTION_OPEN_BRANCH,
  useHistory,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'

const HELP_URL = DOCS_URL + '/apps/pathway'

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

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)
  //const [showHelp, setShowHelp] = useState(false)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const [selectedTab] = useState(0)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)
  const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  //const [showHelp, setShowHelp] = useState(false)

  const [datasetInfos, setDatasetInfos] = useState<IOrgInfo[]>([])

  const [datasetInfoTabs, setDatasetInfoTabs] = useState<string[]>([])

  const [datasetsForUse, setDatasetsForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const {
    branch,
    sheet,
    sheets,
    dispatch,
    //openBranch,
    gotoStep,
    addStep,
  } = useHistory()

  const [validGeneSet, setValidGeneSet] = useState(new Set<string>())

  useEffect(() => {
    dispatch({ type: HISTORY_ACTION_OPEN_APP, name: MODULE_INFO.name })

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

  // function adjustScale(scale: number) {
  //   setScale(scale)
  //   setDisplayProps({ ...displayProps, scale })
  // }

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
    dispatch({
      type: HISTORY_ACTION_OPEN_BRANCH,
      name: `Load ${table.name}`,
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

    if (!sheet) {
      return
    }

    if (sheet.size === 0 || sheet.name === DEFAULT_SHEET_NAME) {
      toast({
        title: 'Pathway',
        description: 'You must load at least 1 geneset.',
        variant: 'destructive',
      })

      return
    }

    const genes = await getValidGenes()

    // only keep genes in approved list
    const genesets: IGeneset[] = range(sheet.shape[1]).map(() => {
      return {
        id: makeNanoIdLen12(),
        name: sheet.col(0).name.toString(),
        genes: sheet
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
      const id = toast({
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

        const dfOut = new AnnotationDataFrame({ data, columns }).setName(
          'Pathways'
        )

        //console.log('pathway', e.data)

        addStep('Pathway', [dfOut])

        // we've finished so get rid of the animations
        //dismiss()
        sonnerToast.dismiss(id)
      }

      workerRef.current.postMessage({ genesets, datasets })
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
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            {selectedTab === 0 && (
              <ToolbarIconButton
                onClick={() => setShowDialog({ id: randId('save') })}
                title={TEXT_SAVE_TABLE}
              >
                <DownloadIcon />
              </ToolbarIconButton>
            )}
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Pathways">
            <ToolbarButton
              onClick={() => runLocal()}
              aria-label="Run pathway analysis"
            >
              <PlayIcon />
              <span>{TEXT_RUN}</span>
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
          <ToolbarHelpTabGroup url={HELP_URL} />
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
              className="pl-1"
            >
              {TEXT_SELECT_ALL}
            </Checkbox>

            <ScrollAccordion
              value={datasetInfoTabs}
              onValueChange={setDatasetInfoTabs}
            >
              {datasetInfos.map((org: IOrgInfo, oi) => {
                return (
                  <AccordionItem
                    value={org.name}
                    key={oi}
                    className="flex flex-col gap-y-1"
                  >
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
                                        makeDatasetId(dataset),
                                        !datasetsForUse.get(
                                          makeDatasetId(dataset)
                                        ),
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
        content: <HistoryPanel branchId={branch?.id ?? ''} />,
      },
    ]
  }, [datasetsForUse, datasetInfoTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
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
            onClick={() => save('pathways.txt', 'txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('pathways.csv', 'csv')}
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

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="pathways"
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

      {/* <ZoomProvider> */}
      <ShortcutLayout signedRequired={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarButton>
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
          id="pathway"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          {/* <Card variant="content" className="mx-2 pb-0"> */}
          <TabbedDataFrames
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              gotoStep(selectedTab.tab.id)
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

        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet)}</span>

          <></>

          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
      {/* </ZoomProvider> */}
    </>
  )
}
