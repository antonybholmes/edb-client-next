'use client'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import { OpenIcon } from '@/icons/open-icon'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import { TEXT_DOWNLOAD_AS_PNG } from '@/consts'

import { FileImageIcon } from '@/icons/file-image-icon'

import { ToolbarButton } from '@/toolbar/toolbar-button'

import { useEffect, useState } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { range } from '@/lib/math/range'

import type { ITab } from '@/components/tabs/tab-provider'
import { textToLines } from '@/lib/text/lines'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
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

import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { useZoom } from '@/providers/zoom'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'

import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-store'
import { SVGProvider, useSVG } from '@/providers/svg-provider'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { FeaturePropsPanel } from './feature-props-panel'
import { LollipopPropsPanel } from './lollipop-props-panel'
import { LollipopSingleSvg } from './lollipop-single-svg'
import { LollipopStackSvg } from './lollipop-stack-svg'
import { useLollipopStore } from './lollipop-store'
import APP_INFO from './manifest.json'
import { ProteinAutocomplete } from './protein-autocomplete'
import { useProteins } from './protein-store'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useOpen } from './use-open'

function LollipopPage() {
  const { goto, openFile, addSheets, undo } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()

  const { setAppInfo } = useAppInfo()

  const { zoom } = useZoom()

  const { open } = useOpen()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  // const dataTab: ITab = {
  //   id: nanoid(),
  //   icon: <TableIcon />,
  //   name: 'Table 1',
  //   content: ()=> <DataPanel />,
  //   isOpen: true,
  // }

  const { svgRef } = useSVG()
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

  const {
    plotStyle,

    protein,
    displayProps,
    setDisplayProps,
    setProtein,
  } = useLollipopSettings()

  const { aaStats, lollipopFromTable, featuresFromTable } = useLollipopStore() // useContext(LollipopContext)!

  const [showSideBar, setShowSideBar] = useState(true)

  const { searchUniprot } = useProteins()

  const { open: openDialog } = useDialogs()

  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

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
  }, [setAppInfo])

  useEffect(() => {
    const tabs: ITab[] = [
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ]
    setToolbarTabs(tabs)
  }, [setToolbarTabs])

  useEffect(() => {
    setSideTabs([
      // {
      //   //id: nanoid(),
      //   icon: <LayersIcon />,
      //   id: 'Protein',
      //   content: ()=> <ProteinPropsPanel />,
      // },
      {
        id: 'Display',
        component: LollipopPropsPanel,
      },
      {
        id: 'Features',
        component: FeaturePropsPanel,
      },
    ])
  }, [setSideTabs])

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

  // const rightTabs: ITab[] = [
  //   {
  //     // id: randId(),
  //     icon: <LayerIcon />,
  //     name: "Groups",
  //     content: ()=>(
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
  //     content: ()=>(
  //       <FilterPanel
  //         df={history.step.dataframe}

  //       />
  //     ),
  //   },
  //   {
  //     // id: randId(),
  //     icon: <ClockRotateLeftIcon />,
  //     name: "History",
  //     content: ()=>(
  //       <HistoryPanel />
  //     ),
  //   },
  // ]

  // const plotRightTabs: ITab[] = [
  //   {
  //     icon: <SlidersIcon />,
  //     label: "Display",
  //     content: ()=>(
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
  //     content: ()=>(
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
  //     content: ()=>(
  //       <LollipopPanelWrapper
  //         panelId={plot.name}
  //         df={plot.df}
  //       />
  //     ),
  //   })
  // })

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() => open('variants')}
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
      component: () => (
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
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <ProteinAutocomplete />
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
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
          side="right"
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
                  goto({ file, sheet: selectedTab.tab })
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
      <SVGProvider>
        <LollipopPage />
      </SVGProvider>
    </CoreProviders>
  )
}
