'use client'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { BaseCol } from '@/components/layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { ZoomSlider } from '@components/toolbar/zoom-slider'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import {
  onBinaryFileChange,
  OpenFiles,
  type IBinaryFileOpen,
} from '@components/pages/open-files'

import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { LayersIcon } from '@components/icons/layers-icon'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { currentSheet, HistoryContext } from '@providers/history-provider'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'

import {
  NO_DIALOG,
  TEXT_DISPLAY,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_HELP,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'

import { makeRandId } from '@lib/utils'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import JSZip from 'jszip'

import { HistoryPanel } from '@components/pages/history-panel'
import type { ITab } from '@components/tab-provider'

import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'

import { FileDropPanel } from '@/components/file-drop-panel'
import { FileIcon } from '@/components/icons/file-icon'
import { HelpSlideBar } from '@/components/slide-bar/help-slide-bar'
import { DownloadIcon } from '@components/icons/download-icon'
import { HelpIcon } from '@components/icons/help-icon'
import { SlidersIcon } from '@components/icons/sliders-icon'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SearchBox } from '@components/search-box'
import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { textToLines, textToTokens } from '@lib/text/lines'
import { CoreProviders } from '@providers/core-providers'
import { PLOT_CLS } from '../../matcalc/modules/heatmap/heatmap-panel'
import { GseaPropsPanel } from './gsea-props-panel'
import { GseaSvg } from './gsea-svg'
import type { IGeneRankScore, IGseaResult, IPathway } from './gsea-utils'
import MODULE_INFO from './module.json'

const HELP_URL = '/help/modules/gsea'

export function GseaPage() {
  const [activeSideTab] = useState('Data')

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)

  const [showHelp, setShowHelp] = useState(false)

  const [search, setSearch] = useState('')

  const [phenotypes, setPhenotypes] = useState<string[]>([])

  const [rankedGenes, setGeneRank] = useState<IGeneRankScore[]>([])

  const [allReports, setAllReports] = useState<Map<string, IPathway[]>>(
    new Map<string, IPathway[]>()
  )

  const [searchReports, setSearchReports] = useState<Map<string, IPathway[]>>(
    new Map<string, IPathway[]>()
  )

  const [resultsMap, setResults] = useState<Map<string, IGseaResult>>(
    new Map<string, IGseaResult>()
  )
  const svgRef = useRef<SVGSVGElement>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const downloadRef = useRef<HTMLAnchorElement>(null)
  //const canvasRef = useRef<HTMLCanvasElement>(null)

  const { history } = useContext(HistoryContext)

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

  const [reportTabs, setReportTabs] = useState<string[]>([])

  useEffect(() => {
    setReportTabs(['gsea-results', ...phenotypes])
  }, [phenotypes])

  // const [geneSets, setGeneSets] = useState<
  //   {
  //     database: string
  //     genesets: {
  //       name: string
  //       url: string
  //     }[]
  //   }[]
  // >([])

  const [datasetsForUse, setDatasetsForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

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

  useEffect(() => {
    const pathways: [string, boolean][] = [...searchReports.keys()]
      .sort()
      .map((report) =>
        searchReports
          .get(report)!
          .map(
            (pathway) => [pathway.name, selectAllDatasets] as [string, boolean]
          )
      )
      .flat()

    setDatasetsForUse(new Map<string, boolean>(pathways))
  }, [searchReports, selectAllDatasets])

  useEffect(() => {
    if (search === '') {
      setSearchReports(allReports)
    } else {
      const r = new Map<string, IPathway[]>()

      const ls = search.toLowerCase()

      for (const k of allReports.keys()) {
        r.set(
          k,
          allReports
            .get(k)!
            .filter(
              (p) =>
                p.name.toLowerCase().includes(ls) || k.toLowerCase().includes(k)
            )
        )
      }

      setSearchReports(r)
    }
  }, [search, allReports])

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup>
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
              <ToolbarIconButton
                title="Save image"
                onClick={() => {
                  setShowDialog({ id: 'export', params: {} })
                }}
              >
                <DownloadIcon stroke="" />
              </ToolbarIconButton>
            )}
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      id: 'Help',
      content: (
        <ToolbarTabGroup>
          <ToolbarButton
            onClick={() => setShowHelp(true)}
            title="Get help using GSEA"
          >
            <HelpIcon /> <span>{TEXT_HELP}</span>
          </ToolbarButton>
        </ToolbarTabGroup>
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
          <BaseCol className="h-full gap-y-3 pt-2 text-xs">
            {/* <SearchBox
              onSearch={(event, value) => {
                if (event === 'search') {
                  setSearch(value)
                } else {
                  setSearch('')
                }
              }}
            /> */}
            <Checkbox
              aria-label={`Select all gene sets`}
              checked={selectAllDatasets}
              onCheckedChange={() => setSelectAllDatasets(!selectAllDatasets)}
            >
              Select All
            </Checkbox>

            <ScrollAccordion value={reportTabs} onValueChange={setReportTabs}>
              {phenotypes.map((report, reporti) => {
                const reports = searchReports.get(report)!

                return (
                  <AccordionItem value={report} key={reporti}>
                    <AccordionTrigger>{report}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-y-1.5" key={reporti}>
                        {reports.map((pathway: IPathway, di: number) => (
                          <li key={di}>
                            <Checkbox
                              aria-label={`Use ${pathway.name}`}
                              checked={datasetsForUse.get(pathway.name)!}
                              onCheckedChange={() => {
                                setDatasetsForUse(
                                  new Map<string, boolean>([
                                    ...datasetsForUse.entries(),
                                    [
                                      pathway.name,
                                      !datasetsForUse.get(pathway.name),
                                    ],
                                  ])
                                )
                              }}
                            >
                              {pathway.name}
                            </Checkbox>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </ScrollAccordion>
          </BaseCol>
        ),
      },
      {
        //id: nanoid(),
        id: TEXT_DISPLAY,
        icon: <SlidersIcon />,
        content: <GseaPropsPanel />,
      },
      {
        id: 'History',
        icon: <ClockRotateLeftIcon />,

        content: <HistoryPanel />,
      },
    ]
  }, [selectAllDatasets, datasetsForUse, searchReports, reportTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
      icon: <OpenIcon stroke="" />,
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

  function openZipFiles(files: IBinaryFileOpen[]) {
    if (files.length > 0) {
      const file = files[0]!

      const zip = new JSZip()

      zip.loadAsync(file.data).then(async function (zip) {
        // you now have every files contained in the loaded zip
        //console.log(zip)

        const reportNames: string[] = []
        const reportPromises: Promise<string>[] = []

        const genesets: string[] = []
        const genesetPromises: Promise<string>[] = []

        zip.forEach(async (_, zipEntry) => {
          if (zipEntry.name.includes('ranked_gene_list')) {
            // Check if the entry is a file, not a directory
            const content = await zipEntry.async('string')

            setGeneRank(
              textToTokens(content)
                .slice(1)
                .filter((tokens) => tokens.length > 2)
                .map((tokens, ti) => ({
                  gene: tokens[0]!,
                  rank: ti,
                  score: Number(tokens[2]!),
                  leading: false,
                }))
            )

            //console.log(content)
          }

          if (zipEntry.name.endsWith('rpt')) {
            // Check if the entry is a file, not a directory
            const content = await zipEntry.async('string')

            const lines = textToLines(content).filter((tokens) =>
              tokens.includes('cls')
            )

            if (lines.length > 0) {
              let tokens = lines[0]!.split('#')

              const vs = tokens[1]!

              tokens = vs?.split('_versus_')

              const phen1 = tokens[0]!
              const phen2 = tokens[1]!

              setPhenotypes([phen1, phen2])
            }

            //console.log(content)
          }

          const matcher = zipEntry.name.match(
            /.*gsea_report_for_(.+)_\d+\.(?:tsv|xls)/
          )

          if (matcher) {
            reportNames.push(matcher[1]!)
            reportPromises.push(zipEntry.async('string'))
          }

          if (
            !zipEntry.name.includes('ranked_gene_list') &&
            !zipEntry.name.includes('gsea_report') &&
            !zipEntry.name.includes('gene_set_sizes') &&
            (zipEntry.name.includes('tsv') || zipEntry.name.includes('xls'))
          ) {
            genesetPromises.push(zipEntry.async('string'))

            genesets.push(
              zipEntry.name
                .replace(/^.+\//, '')
                .replace('.xls', '')
                .replace('.tsv', '')
            )
          }
        })

        const reports = new Map<string, IPathway[]>()

        for (const [pi, promise] of reportPromises.entries()) {
          // Check if the entry is a file, not a directory
          const content = await promise

          textToTokens(content)
            .slice(1)
            .filter((tokens) => tokens.length > 7)
            .forEach((tokens) => {
              const name = tokens[0]!
              const phen = reportNames[pi]!

              if (!reports.has(phen)) {
                reports.set(phen, [])
              }

              reports.get(phen)!.push({
                name,
                phen: reportNames[pi]!,
                size: Number(tokens[3]),
                nes: Number(tokens[5]),
                q: Number(tokens[7]),
                rank: Number(tokens[9]),
              })
            })
        }

        setAllReports(reports)

        const results = new Map<string, IGseaResult>()

        for (const [pi, promise] of genesetPromises.entries()) {
          // Check if the entry is a file, not a directory
          const content = await promise

          const es = textToTokens(content)
            .slice(1)
            .filter((tokens) => tokens.length > 5)
            .map((tokens) => ({
              gene: tokens[1]!,
              rank: Number(tokens[3]!),
              score: Number(tokens[5]!),
              leading: tokens[6]!.includes('Yes'),
            })) as IGeneRankScore[]

          const name = genesets[pi]!

          results.set(name, { name, es })
        }

        setResults(results)
      })
    }
  }

  return (
    <>
      {/* {showDialog.id === 'alert' && (
        <BasicAlertDialog onReponse={() => setShowDialog({...NO_DIALOG})}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )} */}

      {showDialog.id.includes('export') && (
        <SaveImageDialog
          open="open"
          onSave={(format) => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `gsea.${format.ext}`
            )
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        showSignInError={false}
        headerCenterChildren={
          <SearchBox
            variant="header"
            //value={search}
            // onChange={e =>
            //   setSearch({
            //     search: e.target.value,
            //     reverse: revComp,
            //     complement: revComp,
            //   })
            // }
            onSearch={(event, value) => {
              if (event === 'search') {
                setSearch(value)
              } else {
                setSearch('')
              }
            }}
            className="w-80 text-xs font-medium"
          />
        }
      >
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
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
            className="pr-2"
          >
            {/* <TabbedDataFrames
            selectedSheet={currentStep(history)[0]!.sheetIndex}
            dataFrames={currentSheets(history)[0]!}
            onTabChange={selectedTab => {
              historyDispatch({
                type: 'goto-sheet',
                sheetId: selectedTab.index,
              })
            }}
            className={SHEET_PANEL_CLS}
          /> */}

            {rankedGenes.length > 0 ? (
              <FileDropPanel
                onFileDrop={(files) => {
                  if (files.length > 0) {
                    onBinaryFileChange('Open zip', files, openZipFiles)
                  }
                }}
              >
                <div className={PLOT_CLS}>
                  <GseaSvg
                    phenotypes={phenotypes}
                    rankedGenes={rankedGenes}
                    reports={
                      new Map<string, IPathway[]>(
                        searchReports
                          .keys()
                          .map((report) => [
                            report,
                            searchReports
                              .get(report)!
                              .filter((pathway) =>
                                datasetsForUse.get(pathway.name)
                              ),
                          ])
                      )
                    }
                    resultsMap={resultsMap}
                    ref={svgRef}
                  />
                </div>
              </FileDropPanel>
            ) : (
              <FileDropPanel
                onFileDrop={(files) => {
                  if (files.length > 0) {
                    //setDroppedFile(files[0]);
                    console.log('Dropped file:', files[0])

                    onBinaryFileChange('Open zip', files, openZipFiles)
                  }
                }}
              >
                <div className="bg-background shadow-md border border-border/50 rounded-theme m-8 p-8">
                  <ol className="list-decimal list-inside flex flex-col gap-y-1">
                    <li>
                      Find the directory containing the output from the GSEA
                      tool.
                    </li>
                    <li>
                      Create a zip file of the directory and all its contents.
                    </li>
                    <li>
                      Use the <strong>Open</strong> button or drag the zip file
                      here to upload it.
                    </li>
                    <li>
                      Select which gene sets you want to plot. Use the{' '}
                      <strong>Display</strong> tab to customize their
                      appearance.
                    </li>
                    <li>Download the plot as an SVG or PNG image.</li>
                  </ol>
                </div>
              </FileDropPanel>
            )}
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
            fileTypes={['zip']}
            onFileChange={(message, files) => {
              onBinaryFileChange(message, files, openZipFiles)

              setShowDialog({ ...NO_DIALOG })
            }}
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function GseaQueryPage() {
  return (
    <CoreProviders>
      <GseaPage />
    </CoreProviders>
  )
}
