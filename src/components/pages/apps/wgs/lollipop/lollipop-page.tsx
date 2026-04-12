'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { OpenIcon } from '@/icons/open-icon'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  type IDialogParams,
} from '@/consts'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { FileImageIcon } from '@/icons/file-image-icon'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { useEffect, useRef, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { makeUuid, randId } from '@/lib/id'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { range } from '@/lib/math/range'

import type { ITab } from '@/components/tabs/tab-provider'
import { textToLines } from '@/lib/text/lines'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { SlidersIcon } from '@/components/icons/sliders-icon'
import { Card } from '@/themed/card'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import { ToolbarFooterPortal } from '@/components/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { produce } from 'immer'

import { useLollipopSettings } from './lollipop-settings-store'

import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { useStableId } from '@/hooks/stable-id'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-providers'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { Toast } from '@base-ui/react'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { OpenDialog } from '../../matcalc/open-dialog'
import { FeaturePropsPanel } from './feature-props-panel'
import { LollipopCountIcon } from './lollipop-count-icon'
import { LollipopPropsPanel } from './lollipop-props-panel'
import { LollipopSingleIcon } from './lollipop-single-icon'
import { LollipopSingleSvg } from './lollipop-single-svg'
import { LollipopStackIcon } from './lollipop-stack-icon'
import { LollipopStackSvg } from './lollipop-stack-svg'
import { useLollipopStore } from './lollipop-store'
import MODULE_INFO from './module.json'
import { ProteinAutocomplete } from './protein-autocomplete'
import { useProteins } from './protein-store'

function LollipopPage() {
  const _id = useStableId('lollipop-page')

  const { goto, openFile, addSheets } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheet = useSheet()
  const sheets = useSheets()

  const { protein, displayProps, setDisplayProps, setProtein } =
    useLollipopSettings()

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

  const [toolbarTab, setToolbarTab] = useState('Home')

  //const [search] = useState<string[]>([])
  //const [dataSetHeaders, setDataSetHeaders] = useState<any[]>([])
  //const [dataSetRows, setDataSetRows] = useState<any[]>([])
  //const svgRef = useRef<SVGSVGElement>(null)

  //const [locations, setLocations] = useState<GenomicLocation[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { add: addToast } = Toast.useToastManager()

  //const [proteinState, proteinDispatch] = useContext(ProteinContext)

  const { plotStyle, setPlotStyle, showMaxVariantOnly, setShowMaxVariantOnly } =
    useLollipopSettings()

  const { aaStats, lollipopFromTable, featuresFromTable } = useLollipopStore() // useContext(LollipopContext)!

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchUniprot } = useProteins()

  async function loadTestData() {
    const gene = 'BTG1'

    try {
      const proteins = await searchUniprot(gene)

      const index = range(proteins.length).filter(
        (i) => proteins[i]!.organism === 'Human'
      )[0]!

      // setProtein(
      //   produce(protein, draft => {
      //     draft.name = proteins[index]!.name
      //     draft.sequence = proteins[index]!.sequence
      //   })
      // )

      setProtein(proteins[index]!)

      // proteinDispatch({
      //   type: 'set',
      //   search: { text: gene, results: proteins },
      //   index,
      // })
    } catch (e) {
      console.log(e)
    }

    try {
      let res = await httpFetch.getText('/data/test/btg1_coding_mutations.txt')

      let lines = textToLines(res)

      let table = new DataFrameReader().keepDefaultNA(false).read(lines)

      openFile(`Variants`, { sheets: [table.setName('Variants')] })

      //const features = await httpFetch.getJson<Partial<IProteinFeature>[]>(
      //  '/data/test/btg1_features.json'
      //)

      //setFeatures(features)

      res = await httpFetch.getText('/data/test/btg1_features.txt')
      lines = textToLines(res)

      //setLocations(lines.slice(1).map((l: string) => parseLocation(l)))

      table = new DataFrameReader().keepDefaultNA(false).read(lines)

      addSheets([table.setName('Features')])

      featuresFromTable(table)

      // get rid of the plot
      //plotsDispatch({ type: 'clear' })

      // const table = new DataFrameReader() .read(lines)

      //resolve({ ...table, name: file.name })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (sheet && sheet.name === 'Variants' && protein) {
      console.log('Updating lollipop plot with sheet:', sheet.name)

      try {
        lollipopFromTable(sheet as BaseDataFrame, protein)
      } catch (error) {
        console.log('Error updating lollipop plot:', error)

        addToast({
          id: makeUuid(),
          title: 'Variants',
          description: error instanceof Error ? error.message : String(error),
          type: 'warning',
        })
      }
    }
  }, [sheet, protein])

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
      //  { name: "Variants", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [
          {
            name: 'Variants',
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
    console.log('Opening files:', files)
    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
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
  //   const mutDf = findSheet(step!, 'Variants')

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
                  console.log('open file menu')
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              aria-label="Save matrix to local file"
              onClick={() => {
                setShowDialog({
                  id: randId('save'),
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
          <ToolbarTabGroup title="View" className="gap-x-1 items-start">
            <ToolbarCol>
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
            </ToolbarCol>

            <ToolbarCol>
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
                checked={displayProps.variants.plot.proportional}
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.variants.plot.proportional =
                        !draft.variants.plot.proportional
                    })
                  )
                }}
              >
                Proportional
              </ToolbarButton>
            </ToolbarCol>

            <ToolbarIconButton
              title="Show mutation counts on single lollipop plot"
              checked={displayProps.variants.plot.showCounts}
              onClick={() => {
                setDisplayProps(
                  produce(displayProps, (draft) => {
                    draft.variants.plot.showCounts =
                      !draft.variants.plot.showCounts
                  })
                )
              }}
            >
              <LollipopCountIcon />
            </ToolbarIconButton>
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
      icon: <SlidersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
        >
          <UploadIcon fill="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: '<divider>',
    },
    {
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'lollipop.png')
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'lollipop.svg')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {(showDialog.id.startsWith('open:') ||
        showDialog.id.includes('Location') ||
        showDialog.id.includes('clinical')) && (
        <OpenFiles
          message={showDialog.id}
          //onOpenChange={() => setShowDialog({...NO_DIALOG})}
          // onFileChange={(message, files) =>
          //   onTextFileChange(message, files, files =>
          //     parseFiles(message, files)
          //   )}

          onFileChange={
            (message, files) =>
              onTextFileChange(message, files, (files) =>
                parseFiles(message, files)
              )
            // onTextFileChange(message, files, files => {
            //   setShowDialog({
            //     id: randId('open-file-dialog'),
            //     params: { files },
            //   })
            // })
          }
        />
      )}

      {showDialog.id.startsWith('open-file-dialog') && (
        <OpenDialog
          files={showDialog.params!.files as ITextFileOpen[]}
          openFiles={(files, options) => {
            openFiles(files, options)
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => {
            //setFilesToOpen([])
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="lollipop"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, (data as ISaveAsFormat).name)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <ProteinAutocomplete />
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={MODULE_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Plot test
              </ToolbarButton>
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

        <TabSlideBar
          id="lollipop-data-panel"
          side="right"
          tabs={rightTabs}
          //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
          //value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup
            orientation="vertical"
            className="px-2 h-full"
            //autoSaveId="rev-comp-vert"
          >
            <ResizablePanel
              id="chart"
              defaultSize="70%"
              minSize="0%"
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <Card variant="content" className="grow">
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
              defaultSize="30%"
              minSize="0%"
              collapsible={true}
            >
              <TabbedDataFrames
                selectedSheet={sheet?.id ?? ''}
                dataFrames={sheets.map((s) => s as AnnotationDataFrame)}
                onTabChange={(selectedTab) => {
                  goto({ app, file, sheet: selectedTab.tab })
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
    </>
  )
}

export function LollipopQueryPage() {
  return (
    <CoreProviders>
      {/* <LollipopProvider id="lollipop-app:v2"> */}
      <LollipopPage />
      {/* </LollipopProvider> */}
    </CoreProviders>
  )
}
