'use client'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  DOCS_URL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_EXPORT,
  TEXT_HOME,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'

import { type IClusterFrame } from '@/lib/math/hcluster'

import { useEffect, type ReactElement } from 'react'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { VolcanoPanel } from './apps/volcano/volcano-panel'
import { type PlotStyle } from './plots-provider'

import { DownloadIcon } from '@/icons/download-icon'
import { FileIcon } from '@/icons/file-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { OpenIcon } from '@/icons/open-icon'
import { UploadIcon } from '@/icons/upload-icon'

import { ShowSideButton } from '@/components/pages/show-side-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { type ITab } from '@/components/tabs/tab-provider'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'

import APP_INFO from './manifest.json'

import { useSettingsTabs } from '@/dialogs/settings/setting-tabs-store'

import { CubeIcon } from '@/icons/cube-icon'
import { ExportIcon } from '@/icons/export-icon'

import { DataPanel, MESSAGE_CHANNEL } from './data/data-panel'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { HeaderButton } from '@/layouts/header-button'
import type { IClusterGroup } from '@/lib/cluster-group'
import type { IGeneSet } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { CoreProviders } from '@/providers/core-provider'
import { HeatmapPanel } from './apps/heatmap/heatmap-panel'
import { HistoryLayout, HistoryShowButton } from './history/history-layout'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { useMessages } from '@/providers/message-provider'
import { HeatmapProvider } from './apps/heatmap/heatmap-provider'
import { VolcanoProvider } from './apps/volcano/volcano-provider'
import { OptsSidebarMenu } from './data/opts-sidebar-menu'
import { useHistory } from './history/history-provider/history-provider'

import { useTabs } from '@/components/tabs/tab-provider'
import { makeUuid } from '@/lib/id'
import { BoxPlotPanel } from './apps/boxplot/boxplot-panel'
import { BoxPlotProvider } from './apps/boxplot/boxplot-provider'
import { ExtGseaPanel } from './apps/ext-gsea/ext-gsea-panel'
import { ExtGseaProvider } from './apps/ext-gsea/ext-gsea-provider'
import {
  useCurrentPlots,
  useCurrentSelections,
  useCurrentSheets,
  useFiles,
} from './history/history-provider/history-contexts'
import { useAllPlots } from './history/history-provider/history-hooks'
import { HistoryPlot } from './history/history-provider/history-types'
import { UndoShortcuts } from './history/undo-shortcuts'
import { useOpenFiles } from './hooks/open'
import { MatcalcDialogsRoot, useMatcalcDialogs } from './matcalc-dialogs'
import { MatcalcFileTree } from './matcalc-file-tree'
import { useMatcalcSettings } from './settings/matcalc-settings'
import { SettingsAppsPanel } from './settings/settings-apps-panel'
import { DataToolbar } from './toolbars/data-toolbar'
import { GeneToolbar } from './toolbars/gene-toolbar'
import { GenomicToolbar } from './toolbars/genomic-toolbar'
import { HomeToolbar } from './toolbars/home-toolbar'

interface IClusterFrameProps {
  cf: IClusterFrame | null
  type: PlotStyle
  //params: IFieldMap
}

export const NO_CF: IClusterFrameProps = {
  cf: null,
  type: 'heatmap',
  //
}

const HELP_URL = DOCS_URL + '/apps/matcalc'

export const HIGHLIGHT_PANEL_CLS = 'bg-muted grow p-3 mb-2 rounded-lg'

export const TAB_PLOTS = 'Plots'

export const TEXT_HEATMAP = 'Heatmap'
export const TEXT_DOT_PLOT = 'Dot Plot'

const FOLDER_ID = 'matcalc-folders'

// const DEFAULT_DATA_TABLE_TAB: ITab = {
//   //id: nanoid(),
//   id: DEFAULT_TABLE_NAME,
//   icon: <TableIcon />,
//   isOpen: true,
// }

function plotElem(plot: HistoryPlot): ReactElement {
  switch (plot.style) {
    case 'heatmap':
    case 'dot':
      return (
        <HeatmapProvider plot={plot}>
          <HeatmapPanel />
        </HeatmapProvider>
      )
    case 'volcano':
      return (
        <VolcanoProvider plot={plot}>
          <VolcanoPanel />
        </VolcanoProvider>
      )
    case 'box':
      return (
        <BoxPlotProvider plot={plot}>
          <BoxPlotPanel />
        </BoxPlotProvider>
      )
    case 'ext-gsea':
      return (
        <ExtGseaProvider plot={plot}>
          <ExtGseaPanel />
        </ExtGseaProvider>
      )
    // case 'lollipop':
    //   return (
    //     <LollipopPanelQuery key={plot.id} id={plot.id} plotAddr={plot.id} />
    //   )
    default:
      return <></>
  }
}

export function MatcalcPage() {
  const { openFile } = useHistory()

  const { setAppInfo } = useAppInfo()

  const { settings, updateSettings } = useMatcalcSettings()

  const { sendMessage } = useMessages(MESSAGE_CHANNEL)

  const { setTabs: setToolbarTabs } = useTabs('toolbar')

  const { file } = useFiles()

  const { openDataFrames } = useOpenFiles()

  const { sheets } = useCurrentSheets()

  const { plots } = useCurrentPlots()

  const { selection: currentSelection } = useCurrentSelections()
  //const plots = usePlots()

  // we need all plots from all files in the current app to be
  // able to display them in the file tree and access
  // them when clicking on a plot tab
  const allPlots = useAllPlots()

  const { setSettingsTabs, setDefaultTab: setDefaultSettingsTab } =
    useSettingsTabs()

  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { open, setOpen } = useSlideBar(FOLDER_ID) //) //'matcalc') //useContext(MessageContext)

  //const extGseaWorkerRef = useRef<Worker | null>(null)

  //const {setTab: setToolbarTab} = useTabs(TOOLBAR_GROUP_ID)

  //const branch = searchForBranch(branch?.id??'', history)[0]
  //const step = currentStep(branch)[0]
  //const sheet = currentSheet(step)[0]
  //const sheets = step?.sheets

  useEffect(() => {
    // open a dedicated history app for this module
    //openApp(APP_INFO.name)
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setSettingsTabs([
      {
        id: makeUuid(),
        name: APP_INFO.name,
        icon: <CubeIcon fill="" />,
        component: SettingsAppsPanel,
      },
    ])
    setDefaultSettingsTab(APP_INFO.name)
  }, [setSettingsTabs, setDefaultSettingsTab])

  useEffect(() => {
    setToolbarTabs([
      {
        id: TEXT_HOME,
        component: HomeToolbar,
      },
      {
        id: 'Data',
        component: DataToolbar,
      },
      {
        id: 'Gene',
        component: GeneToolbar,
      },
      {
        id: 'Genomic',
        component: GenomicToolbar,
      },
      // {
      //   id: 'Help',
      //   component: () => <ToolbarHelpTabGroup url={HELP_URL} />,
      // },
    ])
  }, [setToolbarTabs])

  useEffect(() => {
    if (currentSelection?.id) {
      updateSettings(
        produce(settings, (draft) => {
          draft.view.panels.tab = currentSelection.id
        })
      )
    }
  }, [currentSelection])

  async function loadZTestData() {
    let res = await httpFetch.getText('/data/test/z_table.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    const resg = await httpFetch.getJson<IClusterGroup[]>(
      '/data/test/groups.json'
    )

    openFile(`Z Test`, {
      //mode: 'append',
      groups: resg,
      sheets: [table.setName('Z Test') as AnnotationDataFrame],
    })
  }

  async function loadDeseqTestData() {
    const res = await httpFetch.getText('/data/test/deseq2.tsv')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Deseq Test"`, [
    //   table.setName('Deseq Test') as AnnotationDataFrame,
    // ])

    openFile(`Deseq Test`, {
      //mode: 'append',

      sheets: [table.setName('Deseq Test') as AnnotationDataFrame],
    })
  }

  async function loadAnnotateTestData() {
    const res = await httpFetch.getText('/data/test/annotate.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(0).read(lines)

    openFile(`Test locations`, {
      sheets: [table.setName('Test Locations') as AnnotationDataFrame],
    })
  }

  async function loadGeneTestData() {
    const res = await httpFetch.getText('/data/test/geneconv.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().read(lines)

    console.log(table)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Gene Test"`, [
    //   table.setName('Gene Test') as AnnotationDataFrame,
    // ])

    openFile(`Gene Test`, {
      //mode: 'append',
      sheets: [table.setName('Gene Test') as AnnotationDataFrame],
    })
  }

  async function loadExtGseaTestData() {
    let res = await httpFetch.getText('/data/test/extgsea/vst_tpm0-01_in_3.tsv')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    //resolve({ ...table, name: file.name })

    // openBranch(`Load "Ext GSEA Test"`, [
    //   table.setName('Ext GSEA Test') as AnnotationDataFrame,
    // ])

    const groups = await httpFetch.getJson<IClusterGroup[]>(
      '/data/test/extgsea/groups.json'
    )

    const genesets = await httpFetch.getJson<IGeneSet[]>(
      '/data/test/extgsea/genesets.json'
    )

    openFile(`Ext GSEA Test`, {
      groups,
      genesets,
      sheets: [table.setName('Ext GSEA Test') as AnnotationDataFrame],
    })
  }

  // function makeLollipop() {
  //   const plot = newLollipopPlot('Lollipop', {
  //     main: sheet!.df as AnnotationDataFrame,
  //   })

  //   //console.log('aha', plot, history)

  //   _addPlots([plot])
  // }

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              fileTypes: ['json', 'cls'],
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) => {
                  openMatcalcDialog({
                    type: 'open-table-file',
                    payload: { files, callback: openDataFrames },
                  })
                })
              },
            })
          }}
        >
          <UploadIcon />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: '<divider>',
    },
    {
      id: TEXT_SAVE_AS,
      icon: <DownloadIcon />,
      component: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: file?.id ?? '',
                data: 'save:txt',
              })
              // save("txt")}
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_CSV}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: file?.id ?? '',
                data: 'save:csv',
              })
              // save("txt")}
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      component: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: 'plot', //plot?.id ?? '',
                data: 'save:png',
              })
              // save("txt")}
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              sendMessage({
                type: 'info',
                source: 'matcalc',
                target: 'plot',
                data: 'save:svg',
              })
              // save("txt")}
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const mainContent = (
    <Tabs
      value={settings.view.panels.tab}
      className="min-h-0 h-full flex flex-col grow"
    >
      {/* Shows the current sheet so tab needs id of current sheet. If no sheet, show empty data panel */}
      <TabsContent value={sheets[0]?.id ?? ''}>
        <DataPanel />
      </TabsContent>

      {allPlots.map((plot) => {
        return (
          <TabsContent key={plot.id} value={plot.id}>
            {plotElem(plot)}
          </TabsContent>
        )
      })}
    </Tabs>
  )

  return (
    <>
      <MatcalcDialogsRoot />

      <HeaderSlotPortal slot="header-left">
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<HeaderButton className="text-xs">Test Data</HeaderButton>}
          />

          <DropdownMenuContent align="end" className="text-sm">
            <DropdownMenuItem onClick={() => loadZTestData()}>
              Plot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadDeseqTestData()}>
              Deseq
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadGeneTestData()}>
              Genes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadExtGseaTestData()}>
              Ext GSEA
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => loadAnnotateTestData()}>
              Annotate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={settings.view.menus.file.show}
            onOpenChange={(open) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.view.menus.file.show = open
                })
              )
            }}
            fileMenuTabs={fileMenuTabs}
            info={APP_INFO}
            leftShortcuts={
              <>
                <ShowSideButton
                  open={open}
                  onClick={() => {
                    setOpen(!open)
                  }}
                />
                <UndoShortcuts />
              </>
            }
            rightShortcuts={<HistoryShowButton />}
          />
          <ToolbarPanel
            tabShortcutMenu={<OptsSidebarMenu open={settings.sidebar.show} />}
          />
        </Toolbar>
        <HistoryLayout>
          <ResizableSidebar
            id={FOLDER_ID}
            side="left"
            className="grow"
            showCloseButton={false}
          >
            {mainContent}
            <MatcalcFileTree />
          </ResizableSidebar>
        </HistoryLayout>
      </ShortcutLayout>
    </>
  )
}

export function MatcalcQueryPage() {
  return (
    <CoreProviders>
      <MatcalcPage />
    </CoreProviders>
  )
}
