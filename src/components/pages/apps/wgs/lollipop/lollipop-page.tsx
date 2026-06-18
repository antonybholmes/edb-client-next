'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { OpenIcon } from '@/icons/open-icon'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { TEXT_DOWNLOAD_AS_PNG } from '@/consts'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { FileImageIcon } from '@/icons/file-image-icon'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { useEffect, useRef, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { range } from '@/lib/math/range'

import type { ITab } from '@/components/tabs/tab-provider'
import { textToLines } from '@/lib/text/lines'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import { SlidersIcon } from '@/components/icons/sliders-icon'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import { FooterPortal } from '@/components/toolbar/footer-portal'
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

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { useZoom } from '@/providers/zoom-provider'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { FeaturePropsPanel } from './feature-props-panel'
import { LollipopCountIcon } from './lollipop-count-icon'
import { LollipopPropsPanel } from './lollipop-props-panel'
import { LollipopSingleIcon } from './lollipop-single-icon'
import { LollipopSingleSvg } from './lollipop-single-svg'
import { LollipopStackIcon } from './lollipop-stack-icon'
import { LollipopStackSvg } from './lollipop-stack-svg'
import { useLollipopStore } from './lollipop-store'
import APP_INFO from './manifest.json'
import { ProteinAutocomplete } from './protein-autocomplete'
import { useProteins } from './protein-store'

function LollipopPage() {
  const _id = useStableId('lollipop-page')

  const { goto, openFile, addSheets, undo } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheet = useSheet()
  const sheets = useSheets()

  const { protein, displayProps, setDisplayProps, setProtein } =
    useLollipopSettings()

  const { setAppInfo } = useAppInfo()

  const { zoom } = useZoom()

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

  //const [proteinState, proteinDispatch] = useContext(ProteinContext)

  const { plotStyle, setPlotStyle, showMaxVariantOnly, setShowMaxVariantOnly } =
    useLollipopSettings()

  const { aaStats, lollipopFromTable, featuresFromTable } = useLollipopStore() // useContext(LollipopContext)!

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchUniprot } = useProteins()

  const { open: openDialog } = useDialogs()

  async function loadTestData() {
    const gene = 'BTG1'

    try {
      const proteins = await searchUniprot(gene)

      const index = range(proteins.length).filter(
        (i) => proteins[i]!.organism === 'Human'
      )[0]!

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

      addSheets([table.setName('Features')], { mode: 'append' })

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
    setAppInfo(APP_INFO)
  }, [])

  useEffect(() => {
    if (!sheet || sheet.name !== 'Variants' || !protein) {
      return
    }
    console.log('Updating lollipop plot with sheet:', sheet.name)

    try {
      lollipopFromTable(sheet as BaseDataFrame, protein)
    } catch (error) {
      //remove([{ app, file, sheet } as SheetPath]) // remove the offending sheet to prevent repeated errors

      openDialog({
        type: 'alert',
        payload: {
          title: APP_INFO.name,
          content: error instanceof Error ? error.message : String(error),
          type: 'warning',
          callback: () => {
            // go back in history to undo the action that caused the error
            undo()
          },
        },
      })
    }
  }, [sheet, protein])

  useEffect(() => {
    setDisplayProps(
      produce(displayProps, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('locations')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      addSheets([locationTable.setName('Locations')], { mode: 'append' })
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

  function _open(message: string) {
    openDialog({
      type: 'open',
      payload: {
        message,
        callback: (message, files) => {
          onTextFileChange(message, files, (files) =>
            parseFiles(message, files)
          )
        },
      },
    })
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
              onOpen={() => {
                console.log('open file menu')
                _open('variants')
              }}
              multiple={true}
            />

            <ToolbarIconButton
              aria-label="Save image"
              onClick={() => {
                openDialog({
                  type: 'save-image',
                  payload: {
                    name: 'lollipop',
                    svgRef,
                  },
                })
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

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
          onClick={() => _open('variants')}
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
            aria-label=" TEXT_DOWNLOAD_AS_SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'lollipop.svg')
            }}
          >
            <span>TEXT_DOWNLOAD_AS_SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {/* <DialogsRoot /> */}

      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <>
            <AppHeaderIcon />
            <AppInfoButton />
          </>
          <ProteinAutocomplete />
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            info={APP_INFO}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data."
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
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup orientation="vertical" className="px-2 h-full">
            <ResizablePanel
              id="chart"
              defaultSize="70%"
              minSize="0%"
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <ExtScrollCard>
                {aaStats.length > 0 && (
                  <div className={PLOT_CLS}>
                    {plotStyle === 'stack' ? (
                      <LollipopStackSvg ref={svgRef} />
                    ) : (
                      <LollipopSingleSvg ref={svgRef} />
                    )}
                  </div>
                )}
              </ExtScrollCard>
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
                //zoom={1}
                //className={DATA_PANEL_CLS}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>
      </ShortcutLayout>

      <FooterPortal>
        <></>
        <></>

        <ZoomSlider />
      </FooterPortal>
    </>
  )
}

export function LollipopQueryPage() {
  return (
    <CoreProviders>
      <LollipopPage />
    </CoreProviders>
  )
}
