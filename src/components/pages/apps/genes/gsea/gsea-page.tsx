'use client'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { BaseCol } from '@layout/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import {
  onBinaryFileChange,
  OpenFiles,
  type IBinaryFileOpen,
} from '@components/pages/open-files'

import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { LayersIcon } from '@icons/layers-icon'

import { OpenIcon } from '@icons/open-icon'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@icons/upload-icon'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import {
  DOCS_URL,
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DISPLAY,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_IMAGE,
  TEXT_SELECT_ALL,
  type IDialogParams,
} from '@/consts'
import { ShortcutLayout } from '@layouts/shortcut-layout'

import { makeNanoIdLen12, randId } from '@lib/id'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

import JSZip from 'jszip'

import type { ITab } from '@components/tabs/tab-provider'

import { Checkbox } from '@themed/check-box'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'

import { useZoom } from '@/providers/zoom-provider'
import { Autocomplete, AutocompleteLi } from '@components/autocomplete'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { ToolbarHelpTabGroup } from '@help/toolbar-help-tab-group'
import { DownloadIcon } from '@icons/download-icon'
import { ExportIcon } from '@icons/export-icon'
import { FileImageIcon } from '@icons/file-image-icon'
import { SearchIcon } from '@icons/search-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { VCenterRow } from '@layout/v-center-row'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { BoolSearchQuery } from '@lib/search'
import { textToLines, textToTokens } from '@lib/text/lines'
import { Card } from '@themed/card'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import Fuse from 'fuse.js'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { GseaPropsPanel } from './gsea-props-panel'
import { GseaSvg } from './gsea-svg'
import type { IGeneRankScore, IGseaResult, IPathway } from './gsea-utils'
import MODULE_INFO from './module.json'

const HELP_URL = DOCS_URL + '/apps/gsea'

export function GseaPage() {
  //const [activeSideTab] = useState('Data')

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)

  const [search, setSearch] = useState('')

  const [phenotypes, setPhenotypes] = useState<string[]>([])

  const [rankedGenes, setGeneRank] = useState<IGeneRankScore[]>([])

  const [searchResults, setSearchResults] = useState<IPathway[]>([])

  const [allReports, setAllReports] = useState<Map<string, IPathway[]>>(
    new Map<string, IPathway[]>()
  )

  const [datasetsForUse, setDatasetsForUse] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  // const [searchReports, setSearchReports] = useState<Map<string, IPathway[]>>(
  //   new Map<string, IPathway[]>()
  // )

  const [resultsMap, setResults] = useState<Map<string, IGseaResult>>(
    new Map<string, IGseaResult>()
  )

  const svgRef = useRef<SVGSVGElement>(null)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const { zoom } = useZoom()

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

  useEffect(() => {
    setDisplayProps({ ...displayProps, scale: zoom })
  }, [zoom])

  const searchIndex = useMemo(() => {
    return new Fuse(phenotypes.map((k) => allReports.get(k)!).flat(), {
      keys: ['phen', 'name'], // Fields to search
      threshold: 0.3, // Fuzzy match level
    })
  }, [allReports])

  // function save(format: 'txt' | 'csv') {
  //   if (!sheet) {
  //     return
  //   }

  //   const sep = format === 'csv' ? ',' : '\t'

  //   downloadDataFrame(sheet as AnnotationDataFrame,  {
  //     hasHeader: true,
  //     hasIndex: false,
  //     file: `table.${format}`,
  //     sep,
  //   })

  //   setShowFileMenu(false)
  // }

  useEffect(() => {
    const pathways: [string, boolean][] = [...allReports.keys()]
      .sort()
      .map((report) =>
        allReports
          .get(report)!
          .map(
            (pathway) => [pathway.id, selectAllDatasets] as [string, boolean]
          )
      )
      .flat()

    setDatasetsForUse(new Map<string, boolean>(pathways))
  }, [allReports, selectAllDatasets])

  // useEffect(() => {
  //   if (search === '') {
  //     setSearchReports(allReports)
  //   } else {
  //     const r = new Map<string, IPathway[]>()

  //     const ls = search
  //       .toLowerCase()
  //       .split(',')
  //       .map(s => s.trim())

  //     for (const k of allReports.keys()) {
  //       r.set(
  //         k,
  //         allReports
  //           .get(k)!
  //           .filter(p =>
  //             ls.some(
  //               l =>
  //                 p.name.toLowerCase().includes(l) ||
  //                 k.toLowerCase().includes(l)
  //             )
  //           )
  //       )
  //     }

  //     setSearchReports(r)
  //   }
  // }, [search, allReports])

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

            {selectedTab === 0 && (
              <ToolbarIconButton
                title={TEXT_SAVE_IMAGE}
                onClick={() => {
                  setShowDialog({ id: 'export', params: {} })
                }}
              >
                <DownloadIcon />
              </ToolbarIconButton>
            )}
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
          <BaseCol className="h-full gap-y-3 pt-2 text-xs">
            <VCenterRow className="px-2">
              <Checkbox
                aria-label={`Select all gene sets`}
                checked={selectAllDatasets}
                onCheckedChange={() => setSelectAllDatasets(!selectAllDatasets)}
              >
                {TEXT_SELECT_ALL}
              </Checkbox>
            </VCenterRow>

            <ScrollAccordion value={reportTabs} onValueChange={setReportTabs}>
              {phenotypes.map((report, reporti) => {
                const reports = allReports.get(report)!

                return (
                  <AccordionItem value={report} key={reporti}>
                    <AccordionTrigger>{report}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-y-1.5" key={reporti}>
                        {reports.map((pathway: IPathway, di: number) => (
                          <li key={di}>
                            <Checkbox
                              aria-label={`Use ${pathway.name}`}
                              checked={datasetsForUse.get(pathway.id)!}
                              onCheckedChange={() => {
                                setDatasetsForUse(
                                  new Map<string, boolean>([
                                    ...datasetsForUse.entries(),
                                    [
                                      pathway.id,
                                      !datasetsForUse.get(pathway.id),
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
      // {
      //   id: 'History',
      //   icon: <ClockRotateLeftIcon />,

      //   content: <HistoryPanel branchId={branch?.id ?? ''} />,
      // },
    ]
  }, [selectAllDatasets, datasetsForUse, reportTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
      icon: <OpenIcon stroke="" />,
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
    // {
    //   //id: nanoid(),
    //   id: TEXT_SAVE_AS,
    //   content: (
    //     <>
    //       <DropdownMenuItem
    //         aria-label="Save text file"
    //         onClick={() => save('txt')}
    //       >
    //         <FileIcon stroke="" />
    //         <span>{TEXT_DOWNLOAD_AS_TXT}</span>
    //       </DropdownMenuItem>

    //       <DropdownMenuItem
    //         aria-label="Save CSV file"
    //         onClick={() => save('csv')}
    //       >
    //         <span>{TEXT_DOWNLOAD_AS_CSV}</span>
    //       </DropdownMenuItem>
    //     </>
    //   ),
    // },
    {
      //id: nanoid(),
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'gsea.png')
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'gsea.svg')
            }}
          >
            <span>Download as SVG</span>
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
            // we cache files as we read them for processing later

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
                id: makeNanoIdLen12(),
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

        // setDatasetsForUse(
        //   new Map<string, boolean>(
        //     [...reports.keys()]
        //       .sort()
        //       .map(report =>
        //         reports
        //           .get(report)!
        //           .map(
        //             pathway =>
        //               [pathway.id, selectAllDatasets] as [string, boolean]
        //           )
        //       )
        //       .flat()
        //   )
        // )

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

  function handleSearch(query: string) {
    setSearch(query)

    if (!searchIndex) {
      return
    }

    //console.log('q', query)

    //const results = searchIndex.search(query)

    if (query === '') {
      setSearchResults([])
      return
    }

    const q = new BoolSearchQuery(query)

    setSearchResults(
      phenotypes
        .map((k) =>
          allReports
            .get(k)!
            .filter((r) => q.match(k) || q.match(r.phen) || q.match(r.name))
        )
        .flat()
    )

    //setSearchResults(results.map(result => result.item))
  }

  return (
    <>
      {/* {showDialog.id === 'alert' && (
        <BasicAlertDialog onResponse={() => setShowDialog({...NO_DIALOG})}>
          {showDialog.params!.message}
        </BasicAlertDialog>
      )} */}

      {showDialog.id.includes('export') && (
        <SaveImageDialog
          name="gsea"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signedRequired={false} showAccountButton={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <Autocomplete
            value={search}
            onTextChange={handleSearch}
            className="w-3/4 lg:w-1/2 text-sm"
          >
            {phenotypes.map((p) => {
              return (
                // Split into each phenotype to make search cleaner
                <Fragment key={p}>
                  <li
                    key={p}
                    className="px-4 py-2 text-xxs text-theme/70 font-bold"
                  >
                    {p}
                  </li>

                  {searchResults
                    .filter((item) => item.phen === p)
                    .map((item) => (
                      <AutocompleteLi key={item.id}>
                        <SearchIcon />
                        <span className="grow">{item.name}</span>

                        <Checkbox
                          aria-label="Select gene set"
                          checked={datasetsForUse.get(item.id) ?? false}
                          onCheckedChange={() => {
                            setDatasetsForUse(
                              new Map<string, boolean>([
                                ...datasetsForUse.entries(),
                                [item.id, !datasetsForUse.get(item.id)],
                              ])
                            )
                          }}
                        />
                      </AutocompleteLi>
                    ))}
                </Fragment>
              )
            })}
          </Autocomplete>

          {/* <SearchBox
            variant="header"
 
            value={search}
            onTextChange={v => setSearch(v)}
            onSearch={(event, value) => {
              console.log(event)
              if (event === 'search') {
                setSearch(value)
              } else {
                setSearch('')
              }
            }}
            className="w-80 text-xs font-medium"
          /> */}
        </HeaderPortal>

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

        <TabSlideBar
          id="gsea"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="pr-2"
        >
          {rankedGenes.length > 0 ? (
            <FileDropZonePanel
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onBinaryFileChange('Open zip', files, openZipFiles)
                }
              }}
            >
              <Card variant="content" className="mx-2 mb-2 grow">
                <div className={PLOT_CLS}>
                  <GseaSvg
                    phenotypes={phenotypes}
                    rankedGenes={rankedGenes}
                    reports={
                      new Map<string, IPathway[]>(
                        allReports
                          .keys()
                          .map((report) => [
                            report,
                            allReports
                              .get(report)!
                              .filter((pathway) =>
                                datasetsForUse.get(pathway.id)
                              ),
                          ])
                      )
                    }
                    resultsMap={resultsMap}
                    ref={svgRef}
                  />
                </div>
              </Card>
            </FileDropZonePanel>
          ) : (
            <FileDropZonePanel
              onFileDrop={(files) => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  console.log('Dropped file:', files[0])

                  onBinaryFileChange('Open zip', files, openZipFiles)
                }
              }}
            >
              <div className="bg-background border border-border/50 rounded-xl m-8 p-8">
                <ol className="list-decimal ml-4 flex flex-col gap-y-2">
                  <li>
                    Create a zip file of the directory containing the output
                    from the Broad GSEA tool. It must contain all files.
                  </li>
                  <li>
                    Upload the zip file to this tool using either the{' '}
                    <strong>Open</strong> button or by dragging the file onto
                    this area.
                  </li>
                  <li>
                    Select which gene sets you want to plot. Use the{' '}
                    <strong>Display</strong> tab on the right to customize their
                    appearance. You can configure the grid layout for multiple
                    gene sets.
                  </li>
                  <li>Download the plot as an SVG or PNG image.</li>
                </ol>
              </div>
            </FileDropZonePanel>
          )}
        </TabSlideBar>

        {/* <ToolbarFooterPortal className="justify-end">
          <>
            {activeSideTab === 'Data' && (
              <span>{getFormattedShape(sheet)}</span>
            )}
          </>
          <></>
          <>{activeSideTab === 'Chart' && <ZoomSlider />}</>
        </ToolbarFooterPortal> */}

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
      </ShortcutLayout>
    </>
  )
}
