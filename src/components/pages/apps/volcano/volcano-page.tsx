'use client'

import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { FooterSlotPortal } from '@/components/toolbar/footer-portal'
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

import { FileImageIcon } from '@/components/icons/computer/file-image-icon'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/baseui/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { ExportIcon } from '@/icons/export-icon'
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

import { useAllPlots } from '../matcalc/history/history-provider/history-hooks'
import { IVolcanoPlot } from '../matcalc/history/history-provider/history-types'
import { HomeToolbar } from './toolbars/home-toolbar'
import { ViewToolbar } from './toolbars/view-toolbar'
import { VolcanoPlotSvg } from './volcano-plot-svg'
import { VolcanoPropsPanel } from './volcano-props-panel'
import { VolcanoProvider } from './volcano-provider'

export function VolcanoPage() {
  const { setAppInfo } = useAppInfo()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { settings: edbSettings } = useEdbSettings()

  const { openFile } = useHistory()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { autoSave } = useSVG()

  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },

      {
        id: 'View',
        component: ViewToolbar,
      },
    ])
  }, [setToolbarTabs])

  const fileMenuTabs: ITab[] = [
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
    const res = await httpFetch.getText('/data/test/deseq2.tsv')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(1).read(lines)

    openFile(`Deseq Test`, {
      sheets: [table.setName('Deseq Test') as AnnotationDataFrame],
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
          <ResizablePanelGroup orientation="vertical" className="px-2 h-full">
            <ResizablePanel
              id="chart"
              defaultSize="70%"
              minSize="0%"
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <ExtScrollCard>
                <VolcanoPlotSvg />
              </ExtScrollCard>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              id="output"
              defaultSize="30%"
              minSize="0%"
              collapsible={true}
            >
              <TabbedDataFrames className="relative grow overflow-hidden" />
            </ResizablePanel>
          </ResizablePanelGroup>

          <VolcanoPropsPanel />
        </ResizableSidebar>

        <FooterSlotPortal slot="footer-right">
          <ZoomSlider />
        </FooterSlotPortal>
      </ShortcutLayout>
    </>
  )
}

export function VolcanoPlotPage() {
  const allPlots = useAllPlots()

  return (
    <VolcanoProvider plot={allPlots[0] as IVolcanoPlot}>
      <VolcanoPage />
    </VolcanoProvider>
  )
}

export function VolcanoQueryPage() {
  return (
    <ClientLayout>
      <VolcanoPlotPage />
    </ClientLayout>
  )
}
