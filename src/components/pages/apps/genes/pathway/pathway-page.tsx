// 'use client'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { ToolbarButton } from '@/toolbar/toolbar-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'

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
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { LayersIcon } from '@/icons/layers-icon'
import { OpenIcon } from '@/icons/open-icon'
import { type IDataset } from '@/lib/gene/pathway/pathway'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@/icons/upload-icon'

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
  type IDialogParams,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import {
  BaseDataFrame,
  DEFAULT_SHEET_NAME,
} from '@/lib/dataframe/base-dataframe'

import { API_PATHWAY_DATASET_URL, API_PATHWAY_GENES_URL } from '@/lib/edb/edb'
import { makeUuid, randId } from '@/lib/id'

import { range } from '@/lib/math/range'
import { truncate } from '@/lib/text/text'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ITab } from '@/components/tabs/tab-provider'

import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { randomHexColor } from '@/lib/color/color'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import { FileIcon } from '@/icons/file-icon'

import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { IGeneset } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { sum } from '@/lib/math/sum'
import { textToLines } from '@/lib/text/lines'

import MODULE_INFO from './module.json'
//import { toast } from '@/themed/use-toast'
import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarHelpTabGroup } from '@/help/toolbar-help-tab-group'
import { useStableId } from '@/hooks/stable-id'
import { CoreProviders } from '@/providers/core-providers'

import { Toast } from '@base-ui/react/toast'
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
import { PathwayPropsPage } from './pathway-props-panel'
import { makeDatasetId, usePathways } from './pathway-store'

const HELP_URL = DOCS_URL + '/apps/pathway'

export function PathwayPage() {
  const { add: addToast, close: closeToast } = Toast.useToastManager()

  const _id = useStableId('pathway-page')

  const { datasets, datasetsForUse, genesInUniverse } = usePathways()

  const workerRef = useRef<Worker | null>(null)

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)
  //const [showHelp, setShowHelp] = useState(false)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const [selectedTab] = useState(0)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [showHelp, setShowHelp] = useState(false)

  const { openApp, openFile, goto, addSheets } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()

  const df = sheet as AnnotationDataFrame

  const [validGeneSet, setValidGeneSet] = useState(new Set<string>())

  useEffect(() => {
    openApp(MODULE_INFO.name)

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
      const res = await httpFetch.getJson<{ data: string[] }>(
        API_PATHWAY_GENES_URL
      )

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
    const res = await httpFetch.getText('/data/test/pathway.txt')

    try {
      const lines = textToLines(res)

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

    openFile(`Load ${table.name}`, {
      sheets: [table.setName(truncate(table.name, { length: 16 }))],
    })
  }

  function openFiles(files: ITextFileOpen[]) {
    if (files.length > 0) {
      filesToDataFrames(files, {
        parseOpts: {
          ...DEFAULT_PARSE_OPTS,
          indexCols: 0,
          colNames: files[0]!.name.includes('gmx') ? 0 : 1,
          skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
          delimiter: files[0]!.ext === 'csv' ? ',' : '\t',
        },
        onSuccess: tables => {
          if (tables.length > 0) {
            open(tables[0]!)
          }
        },
      })
    }
  }

  async function runLocal() {
    //setIsRunning(true)

    if (!df) {
      return
    }

    if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
      addToast({
        id: makeUuid(),
        title: 'Pathway',
        description: 'You must load at least 1 geneset.',
        type: 'destructive',
        timeout: 10000,
      })

      return
    }

    const genes = await getValidGenes()

    // only keep genes in approved list
    const genesets: IGeneset[] = range(df.shape[1]).map(() => {
      return {
        id: makeUuid(),
        name: df.col(0).name.toString(),
        genes: df
          .col(0)
          .strs.filter(v => v !== '' && genes.has(v.toLowerCase())),
        color: randomHexColor(),
        type: 'geneset',
      }
    })

    if (sum(genesets.map(geneset => geneset.genes.length)) === 0) {
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

      addToast({
        id: makeUuid(),
        title: 'Pathway',
        description:
          'None of your gene sets appear to contain valid gene symbols.',
        type: 'destructive',
      })

      return
    }

    const queryDatasets = datasets
      .map(org =>
        org.datasets.filter(dataset => datasetsForUse[makeDatasetId(dataset)])
      )
      .flat()

    const fullDatasets: IDataset[] = []

    try {
      for (const qd of queryDatasets) {
        const res = await httpFetch.postJson<{ data: IDataset }>(
          API_PATHWAY_DATASET_URL,
          {
            body: {
              organization: qd.organization,
              name: qd.name,
            },
          }
        )

        const dataset = res.data

        fullDatasets.push(dataset) //{organization:dataset.organization, name:dataset, genes:new Set<string>(dataset.genes)})
      }
    } catch (e) {
      console.log(e)
    }

    if (fullDatasets.length < 1) {
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
      const id = makeUuid()
      addToast({
        id,
        title: 'Pathway',
        description:
          'Calculating pathway enrichment, please do not refresh your browser window...',

        timeout: 60000,
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

        console.log('Pathway analysis result:', dfOut)
        addSheets([dfOut], { name: 'Pathway' })

        // we've finished so get rid of the animations

        closeToast(id)
      }

      workerRef.current.postMessage({
        genesets,
        datasets: fullDatasets,
        genesInUniverse,
      })
    }
  }

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, {
      hasHeader: true,
      hasIndex: false,
      file: name,
      sep,
    })

    setShowFileMenu(false)
  }

  // useEffect(() => {
  //   setDatasetsForUse(
  //     new Map<string, boolean>(
  //       datasetInfos
  //         .map(org =>
  //           org.datasets.map(
  //             (dataset: IDatasetInfo) =>
  //               [makeDatasetId(dataset), true] as [string, boolean]
  //           )
  //         )
  //         .flat()
  //     )
  //   )

  //   setDatasetInfoTabs(datasetInfos.map((org: IOrgInfo) => org.name))
  // }, [datasetInfos])

  // useEffect(() => {
  //   setDatasetsForUse(
  //     new Map<string, boolean>(
  //       datasetInfos
  //         .map(org =>
  //           org.datasets.map(
  //             (dataset: IDatasetInfo) =>
  //               [makeDatasetId(dataset), selectAllDatasets] as [string, boolean]
  //           )
  //         )
  //         .flat()
  //     )
  //   )
  // }, [selectAllDatasets])

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
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

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Gene Sets',
      content: <PathwayPropsPage />,
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
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
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
          message={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          onFileChange={(message, files) => {
            onTextFileChange(message, files, files => {
              if (files.length > 0) {
                filesToDataFrames(files, {
                  parseOpts: {
                    ...DEFAULT_PARSE_OPTS,
                    colNames: files[0]!.name.includes('gmx') ? 0 : 1,
                    skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
                  },
                  onSuccess: tables => {
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
              const d = data as {
                name: string
                format: ISaveAsFormat
              }

              save(
                d.name as string,
                (d.format as ISaveAsFormat)!.ext! as string
              )
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderSlotPortal>
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data to use features."
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
            id="pathway"
            side="right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          >
            {/* <Card variant="content" className="mx-2 pb-0"> */}
            <TabbedDataFrames
              selectedSheet={df?.id ?? ''}
              dataFrames={sheets.map(s => s as AnnotationDataFrame)}
              onTabChange={selectedTab => {
                goto({ app, file, sheet: selectedTab.tab })
              }}
              onFileDrop={files => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  console.log('Dropped file:', files[0])

                  onTextFileChange('Open dropped file', files, openFiles)
                }
              }}
              className="mx-2"
            />
            {/* </Card> */}
          </TabSlideBar>
        </HistoryLayout>
        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(df)}</span>

          <></>

          <ZoomSlider />
        </ToolbarFooterPortal>
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
