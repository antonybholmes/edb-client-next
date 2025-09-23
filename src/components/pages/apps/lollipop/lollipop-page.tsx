'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { OpenIcon } from '@icons/open-icon'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'

import { NO_DIALOG, TEXT_CANCEL, type IDialogParams } from '@/consts'
import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { FileImageIcon } from '@icons/file-image-icon'

import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { useContext, useRef, useState } from 'react'

import { ShortcutLayout } from '@layouts/shortcut-layout'

import axios from 'axios'

import { randID } from '@lib/id'

import { UploadIcon } from '@icons/upload-icon'
import { range } from '@lib/math/range'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import type { ITab } from '@components/tabs/tab-provider'
import { textToLines } from '@lib/text/lines'
import { useQueryClient } from '@tanstack/react-query'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { LayersIcon } from '@/components/icons/layers-icon'
import { SlidersIcon } from '@/components/icons/sliders-icon'
import { Card } from '@/components/shadcn/ui/themed/card'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/shadcn/ui/themed/resizable'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { ThinVResizeHandle } from '@/components/split-pane/thin-v-resize-handle'
import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import { ToolbarFooterPortal } from '@/components/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { produce } from 'immer'
import { SaveImageDialog } from '../../save-image-dialog'
import { PLOT_CLS } from '../matcalc/apps/heatmap/heatmap-panel'
import { useHistory } from '../matcalc/history/history-store'
import { UndoShortcuts } from '../matcalc/history/undo-shortcuts'
import { DatabasPropsPanel } from './database-props-panel'
import { FeaturePropsPanel } from './feature-props-panel'
import { LabelPropsPanel } from './label-props-panel'
import { LollipopPropsPanel } from './lollipop-props-panel'
import { LollipopContext, LollipopProvider } from './lollipop-provider'
import { useLollipopSettings } from './lollipop-settings-store'

import { BaseRow } from '@/components/layout/base-row'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { LollipopCountIcon } from './lollipop-count-icon'
import { LollipopSingleIcon } from './lollipop-single-icon'
import { LollipopSingleSvg } from './lollipop-single-svg'
import { LollipopStackIcon } from './lollipop-stack-icon'
import { LollipopStackSvg } from './lollipop-stack-svg'
import MODULE_INFO from './module.json'
import { ProteinAutocomplete } from './protein-autocomplete'
import { useProteins } from './protein-store'

function LollipopPage() {
  const queryClient = useQueryClient()

  const { sheet, sheets, gotoSheet, openBranch, addSheets } = useHistory()

  const { displayProps, setDisplayProps } = useLollipopSettings()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  // const dataTab: ITab = {
  //   id: nanoid(),
  //   icon: <TableIcon />,
  //   name: 'Table 1',
  //   content: <DataPanel />,
  //   isOpen: true,
  // }

  const svgRef = useRef<SVGSVGElement>(null)

  //const [foldersTab, setFoldersTab] = useState<ITab>(dataTab)
  //const [tab, setTab] = useState<ITab | undefined>(dataTab)

  const [selectedTab, setSelectedTab] = useState('Display')

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [proteinState, proteinDispatch] = useContext(ProteinContext)

  const { plotStyle, setPlotStyle, showMaxVariantOnly, setShowMaxVariantOnly } =
    useLollipopSettings()

  const { protein, setProtein, aaStats } = useContext(LollipopContext)!

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchUniprot } = useProteins()

  async function loadTestData() {
    // try {
    //   let res = await queryClient.fetchQuery("test_data", async () => {
    //     return await axios.get(
    //       "/data/test/bcca2024_29cl_20icg_hg19_chr3-187451979-187469971.maf.txt",
    //     )
    //   })

    //   const lines = res.data
    //     .split(/[\r\n]+/g)
    //     .filter((line: string) => line.length > 0)

    //   const table = new DataFrameReader().read(lines)

    //   //resolve({ ...table, name: file.name })

    //   historyDispatch({
    //     type: "reset",
    //     name: `Load "Mutations"`,
    //     sheets: [table.setName("Mutations")],
    //   })
    // } catch (error) {
    //   console.log(error)
    // }

    const gene = 'BTG1'

    try {
      const proteins = await searchUniprot(gene)

      const index = range(proteins.length).filter(
        (i) => proteins[i]!.organism === 'Human'
      )[0]!

      setProtein(
        produce(protein, (draft) => {
          draft.name = proteins[index]!.name
          draft.sequence = proteins[index]!.sequence
        })
      )

      // proteinDispatch({
      //   type: 'set',
      //   search: { text: gene, results: proteins },
      //   index,
      // })
    } catch (e) {
      console.log(e)
    }

    try {
      let res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_coding_mutations.txt'),
      })

      let lines = textToLines(res.data)

      let table = new DataFrameReader().keepDefaultNA(false).read(lines)

      openBranch(`Load mutations`, [table.setName('Mutations')])

      res = await queryClient.fetchQuery({
        queryKey: ['test_data'],
        queryFn: () => axios.get('/data/test/btg1_features.txt'),
      })

      lines = textToLines(res.data)

      // //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      addSheets([table.setName('Features')])

      // get rid of the plot
      //plotsDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      // //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  // useEffect(() => {
  //   setTab(dataTab)
  //   clearSelection()
  // }, [history])

  // useEffect(() => {
  //   if (plotState.plots.length > 0) {
  //     setPanelTab(plotState.plots[plotState.plots.length - 1].name)
  //   }
  // }, [plotState])

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('Location')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      addSheets([locationTable.setName('Locations')])
    } else {
      //setFilesToOpen([
      //  { name: "Mutations", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [
          {
            name: 'Mutations',
            text,
            ext: name.split('.').pop() || '',
          },
        ],
        {
          colNames: 1,
          indexCols: 0,
          delimiter: '\t',
          keepDefaultNA: false,
          skipRows: 0,
        }
      )
    }
    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }
  }

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openBranch(`Load ${tables[0]!.name}`, tables)
        }
      },
    })

    setShowFileMenu(false)
  }

  // useEffect(() => {
  //   if (step) {
  //     lollipopPlot()
  //   }
  // }, [step])

  // function lollipopPlot() {
  //   console.log('lollipopPlot')
  //   const mutDf = findSheet(step!, 'Mutations')

  //   if (!mutDf) {
  //     console.warn('No mutations data frame found')
  //     return
  //   }

  //   lollipopFromTable(mutDf, protein)

  // }

  const tabs: ITab[] = [
    {
      ////name: nanoid(),
      id: 'Home',
      //size: 2.1,
      content: (
        <>
          <ToolbarTabGroup title="File">
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
              aria-label="Save matrix to local file"
              onClick={() => {
                setShowDialog({
                  id: randID('save'),
                  params: {
                    name: 'lollipop',
                    format: 'png',
                  },
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Plot Style" className="gap-x-1">
            <BaseRow>
              <ToolbarIconButton
                title="Create a stacked lollipop plot"
                //className="rounded-r-none"
                checked={plotStyle === 'stack'}
                onClick={() => {
                  setPlotStyle('stack')
                }}
              >
                <LollipopStackIcon />
              </ToolbarIconButton>
              <ToolbarIconButton
                title="Create a single lollipop plot"
                //className="rounded-l-none"
                checked={plotStyle === 'single'}
                onClick={() => {
                  setPlotStyle('single')
                }}
              >
                <LollipopSingleIcon />
              </ToolbarIconButton>
            </BaseRow>
          </ToolbarTabGroup>

          <ToolbarSeparator />
          <ToolbarTabGroup title="View" className="gap-x-1">
            <ToolbarIconButton
              title="Show mutation counts on single lollipop plot"
              checked={displayProps.mutations.plot.showCounts}
              onClick={() => {
                setDisplayProps(
                  produce(displayProps, (draft) => {
                    draft.mutations.plot.showCounts =
                      !draft.mutations.plot.showCounts
                  })
                )
              }}
            >
              <LollipopCountIcon />
            </ToolbarIconButton>

            <ToolbarSeparator />

            <ToolbarCol className="gap-0.5 items-start">
              <ToolbarButton
                title="Show only maximum variant"
                checked={showMaxVariantOnly}
                onClick={() => {
                  setShowMaxVariantOnly(!showMaxVariantOnly)
                }}
              >
                Max variant
              </ToolbarButton>

              <ToolbarButton
                title="Lollipop sizes are proportional to the number of variants"
                checked={displayProps.mutations.plot.proportional}
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.mutations.plot.proportional =
                        !draft.mutations.plot.proportional
                    })
                  )
                }}
              >
                Proportional
              </ToolbarButton>
            </ToolbarCol>
          </ToolbarTabGroup>

          <ToolbarSeparator />
        </>
      ),
    },
  ]

  // const rightTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     icon: <LayerIcon />,
  //     name: "Groups",
  //     content: (
  //       <GroupsPanel
  //         df={history.step.dataframe}
  //         groups={groups}
  //         onGroupsChange={groupsDispatch}
  //         selection={selection}
  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <FilterIcon />,
  //     name: "Filter Table",
  //     content: (
  //       <FilterPanel
  //         df={history.step.dataframe}

  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <ClockRotateLeftIcon />,
  //     name: "History",
  //     content: (
  //       <HistoryPanel />
  //     ),
  //   },
  // ]

  // const plotRightTabs: ITab[] = [
  //   {
  //     icon: <SlidersIcon />,
  //     label: "Display",
  //     content: (
  //       <DisplayPropsPanel
  //         cf={clusterFrame.cf}
  //         displayProps={displayProps}
  //         onChange={props => setDisplayProps(props)}
  //       />
  //     ),
  //   },
  // ]

  // let svgPanel: ReactNode = null
  // if (clusterFrame.cf) {
  //   // switch (clusterFrame.type) {
  //   // case "heatmap":
  //   svgPanel = (
  //     <HeatMapSvg
  //       ref={svgRef}
  //       cf={clusterFrame.cf}
  //       groups={groups}
  //       search={search}
  //       displayProps={displayProps}
  //     />
  //   )

  // }

  // const topTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     icon: <TableIcon className="fill-theme" />,
  //     name: "Data",
  //     content: (
  //       <DataPanel />

  //     ),
  //   },
  // ]

  // plotState.plots.forEach((plot: IPlot) => {
  //   topTabs.push({
  //     id: nanoid(),
  //     name: plot.name,
  //     icon: <ChartIcon className="fill-theme" />,
  //     onDelete: () => plotDispatch({ type: "remove", id: plot.id }),
  //     content: (
  //       <LollipopPanelWrapper
  //         panelId={plot.name}
  //         df={plot.df}
  //       />
  //     ),
  //   })
  // })

  const rightTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   icon: <LayersIcon />,
    //   id: 'Protein',
    //   content: <ProteinPropsPanel />,
    // },
    {
      //id: nanoid(),
      icon: <SlidersIcon />,
      id: 'Display',
      content: <LollipopPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Databases',
      content: <DatabasPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Labels',
      content: <LabelPropsPanel />,
    },
    // {
    //   //id: nanoid(),
    //   icon: <ClockRotateLeftIcon />,
    //   id: 'History',
    //   content: <HistoryPanel branchId={branch?.id ?? ''} />,
    // },
  ]

  // useEffect(() => {
  //   const plotChildren: ITab[] = []

  //   for (const plot of plotsState.plots) {
  //     plotChildren.push({
  //       id: nanoid(),
  //       name: plot.name,
  //       icon: <ChartIcon className="fill-theme" />,
  //       onDelete: () => plotsDispatch({ type: 'remove', id: plot.id }),
  //       content: <LollipopPanelWrapper panelId={plot.id} df={plot.df} />,
  //     })
  //   }

  //   const tab: ITab = {
  //     ...makeFoldersRootNode(),
  //     children: [
  //       {
  //         //id: nanoid(),
  //         id: 'Data Tables',
  //         icon: <FolderIcon />,
  //         isOpen: true,
  //         children: [dataTab],
  //       },
  //       {
  //         //id: nanoid(),
  //         id: 'Plots',
  //         icon: <FolderIcon />,
  //         isOpen: true,
  //         children: plotChildren,
  //       },
  //     ],
  //   }

  //   setFoldersTab(tab)

  //   // if the children
  //   if (plotChildren.length > 0) {
  //     setTab(plotChildren[plotChildren.length - 1])
  //   } else {
  //     setTab(dataTab)
  //   }
  // }, [plotsState])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randID('open'), params: {} })}
        >
          <UploadIcon fill="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: '<divider>',
    },
    // {
    //   //id: nanoid(),
    //   id: TEXT_SAVE_AS,
    //   content: (
    //     <>
    //       <DropdownMenuItem
    //         aria-label={TEXT_DOWNLOAD_AS_TXT}
    //         onClick={() => {
    //           messageDispatch({
    //             source: 'matcalc',
    //             target: 'Data',
    //             text: 'save:txt',
    //           })
    //           // save("txt")}
    //         }}
    //       >
    //         <FileIcon stroke="" />
    //         <span>{TEXT_DOWNLOAD_AS_TXT}</span>
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         aria-label="Download as CSV"
    //         onClick={() => {
    //           messageDispatch({
    //             source: 'matcalc',
    //             target: 'Data',
    //             text: 'save:csv',
    //           })
    //           // save("txt")}
    //         }}
    //       >
    //         <span>{TEXT_DOWNLOAD_AS_CSV}</span>
    //       </DropdownMenuItem>
    //     </>
    //   ),
    // },
    {
      //id: nanoid(),
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'lollipop.png')
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'lollipop.svg')
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="lollipop"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signedRequired={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <ProteinAutocomplete />
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Plot test
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

        {/* <SlideBar
          id="lollipopl"
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          initialPosition={15}
          className="mt-2 mb-6"
        >
    
          <>{tab?.content}</>
          <VScrollPanel>
            <CollapseTree
              tab={foldersTab}
              value={tab!}
              onValueChange={t => {
                if (t && t.content) {
                  // only use tabs from the tree that have content, otherwise
                  // the ui will appear empty
                  setTab(t)
                }
              }}
              className="pl-1"
            />
          </VScrollPanel>
        </SlideBar> */}

        <TabSlideBar
          id="lollipop-data-panel"
          side="right"
          tabs={rightTabs}
          onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
          value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup
            direction="vertical"
            className="px-2 grow"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="chart"
              defaultSize={70}
              minSize={10}
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <Card variant="content" className=" grow">
                {aaStats.length > 0 && (
                  <div className={PLOT_CLS}>
                    {plotStyle === 'stack' ? (
                      <LollipopStackSvg ref={svgRef} />
                    ) : (
                      <LollipopSingleSvg ref={svgRef} />
                    )}
                  </div>
                )}
              </Card>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              className="flex flex-col text-sm"
              id="output"
              defaultSize={30}
              minSize={10}
              collapsible={true}
            >
              <TabbedDataFrames
                selectedSheet={sheet?.id ?? ''}
                dataFrames={sheets as AnnotationDataFrame[]}
                onTabChange={(selectedTab) => {
                  gotoSheet(selectedTab.tab.id)
                }}
                zoom={1}
                //className={DATA_PANEL_CLS}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>
      </ShortcutLayout>

      <ToolbarFooterPortal>
        <></>
        <></>
        <>
          <ZoomSlider
            onZoomChange={(zoom) => {
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.scale = zoom
                })
              )
            }}
          />
        </>
      </ToolbarFooterPortal>

      {(showDialog.id.includes('open') ||
        showDialog.id.includes('Location') ||
        showDialog.id.includes('clinical')) && (
        <OpenFiles
          open={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) =>
              parseFiles(message, files)
            )
          }
        />
      )}
    </>
  )
}

export function LollipopQueryPage() {
  return (
    <LollipopProvider id="lollipop-app:v2">
      <LollipopPage />
    </LollipopProvider>
  )
}
