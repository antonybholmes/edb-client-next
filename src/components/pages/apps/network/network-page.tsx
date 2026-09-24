'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { useEffect, useState } from 'react'

import { ClientLayout } from '@/app/client-layout'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import {
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { ExportIcon } from '@/icons/export-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import APP_INFO from './manifest.json'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'

import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import { useSVG } from '@/providers/svg-provider'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { OptsSidebarMenu } from '../matcalc/data/opts-sidebar-menu'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import { MatcalcDialogsRoot } from '../matcalc/matcalc-dialogs'
import { useNetwork } from './network-store'
import { NetworkPropsPanel } from './props/network-props-panel'
import { NetworkSvg } from './svg/network-svg'
import { HomeToolbar } from './toolbars/home-toolbar'

export function NetworkPage() {
  const { setAppInfo } = useAppInfo()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { settings: edbSettings } = useEdbSettings()

  const { openFile } = useHistory()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { autoSave } = useSVG()

  const { network } = useNetwork()
  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  // useEffect(() => {
  //   openFile('Motifs')
  // }, [openFile])

  // useEffect(() => {
  //   if (dfTab?.id) {
  //     //goto({ file, sheet: dfTab.id }) //, 'sheet')
  //   }
  // }, [dfTab?.id])

  // useEffect(() => {
  //   if (sheet.id) {
  //     setDFTab(sheet.id)
  //   }
  // }, [sheet.id, setDFTab])

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  // // sync local query state when the global search query changes
  // useEffect(() => {
  //   setQ(search.query)
  // }, [search.query])

  // // periodically trigger a search when the debounced query changes
  // useEffect(() => {
  //   updateSearch(
  //     produce(search, draft => {
  //       draft.query = debouncedQ
  //     })
  //   )
  // }, [debouncedQ])

  // useEffect(() => {
  //   if (!plot || settings.scale === zoom) {
  //     return
  //   }

  //   updateSettings(
  //     produce(settings, (draft) => {
  //       draft.scale = zoom
  //     })
  //   )
  // }, [plot, zoom])

  const fileMenuTabs: ITab[] = [
    // {
    //   id: TEXT_SAVE_AS,
    //   render: (
    //     <>
    //       <DropdownMenuItem
    //         aria-label="Download as TXT"
    //         onClick={() => {
    //           save('network.txt', 'txt')
    //         }}
    //       >
    //         <FileIcon stroke="" />
    //         <span>{TEXT_DOWNLOAD_AS_TXT}</span>
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         aria-label="Download as CSV"
    //         onClick={() => {
    //           save('network.csv', 'csv')
    //         }}
    //       >
    //         <span>{TEXT_DOWNLOAD_AS_CSV}</span>
    //       </DropdownMenuItem>
    //     </>
    //   ),
    // },
    {
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              autoSave(`network.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              autoSave(`network.svg`)
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  async function loadTestData() {
    let res = await httpFetch.getText(
      '/data/test/network/enrichment_map_nodes.tsv'
    )

    const table1 = new DataFrameReader().read(textToLines(res))

    res = await httpFetch.getText('/data/test/network/enrichment_map_edges.tsv')
    const table2 = new DataFrameReader().read(textToLines(res))

    openFile(`Network Test`, {
      sheets: [
        table1.setName('Nodes') as AnnotationDataFrame,
        table2.setName('Edges') as AnnotationDataFrame,
      ],
      mode: 'set',
    })
  }

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>

      <MatcalcDialogsRoot />

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data."
                >
                  Test data
                </ToolbarButton>
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <ResizableSidebar side="right">
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
              <ExtScrollCard>{<NetworkSvg />}</ExtScrollCard>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              //className="flex flex-col text-sm"
              id="output"
              defaultSize="30%"
              minSize="0%"
              collapsible={true}
            >
              <TabbedDataFrames className="relative grow overflow-hidden" />
            </ResizablePanel>
          </ResizablePanelGroup>

          <NetworkPropsPanel />
        </ResizableSidebar>

        <FooterPortal className="justify-between">
          <></>
          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function NetworkQueryPage() {
  return (
    <ClientLayout>
      <NetworkPage />
    </ClientLayout>
  )
}
