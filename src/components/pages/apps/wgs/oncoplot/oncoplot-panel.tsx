import { OncoplotSvg } from './oncoplot-svg'

import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { DisplayPropsPanel } from './display-props-panel'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import { downloadSvgAutoFormat } from '@/lib/image-utils'

import { Card } from '@/themed/card'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import type { ITab } from '@/components/tabs/tab-provider'
import { TEXT_CANCEL, TEXT_SETTINGS } from '@/consts'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import { HistoryLayout } from '../../matcalc/history/history-layout'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { FeaturePropsPanel } from './feature-props-panel'
import { useOncoplotSettings } from './oncoplot-settings-store'

const PLOT_ZOOM_CHANNEL = 'oncoplot-plot-zoom'
export const PANEL_ID = 'oncoplot-panel'

interface IOncoplotPanelProps {
  panelId: string
  //oncoProps: IOncoProps
}

export function OncoplotPanel({ panelId = PANEL_ID }: IOncoplotPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()
  const { goto } = useHistory()
  const app = useApp()!
  const file = useFile()!

  const sheet = useSheet()
  const sheets = useSheets()

  const [activeSideTab, setActiveSideTab] = useState(TEXT_SETTINGS)

  const [showSave, setShowSave] = useState(false)
  const { messages, removeMessage } = useMessages('oncoplot') //'onco-panel')
  const { displayProps, setDisplayProps } = useOncoplotSettings()
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === panelId
    )

    for (const message of filteredMessages) {
      if (message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `oncoplot.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }

        removeMessage(message.id)
      }

      if (message.data.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    }
  }, [messages])

  useEffect(() => {
    // plotDispatch({
    //   type: 'display',
    //   displayProps: { ...plotState.displayProps, scale: zoom },
    // })

    setDisplayProps(
      produce(displayProps, draft => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //name: nanoid(),
      icon: <SlidersIcon />,
      id: 'Display',
      content: <DisplayPropsPanel />,
    },
    {
      //name: nanoid(),
      icon: <SlidersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
    },
  ]

  return (
    <>
      {showSave && (
        <SaveImageDialog
          name="oncoplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name)
            }

            setShowSave(false)
          }}
        />
      )}

      <HistoryLayout>
        <TabSlideBar
          id="oncoplot-panel-tabs"
          side="right"
          tabs={plotRightTabs}
          onTabChange={selectedTab => setActiveSideTab(selectedTab.tab.id)}
          value={activeSideTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ResizablePanelGroup orientation="vertical" className="px-2 grow">
            <ResizablePanel
              id="chart"
              defaultSize="70%"
              minSize="0%"
              className="flex flex-col text-sm"
              collapsible={true}
            >
              <Card variant="content" className="grow">
                <div className={PLOT_CLS}>
                  <OncoplotSvg ref={svgRef} />
                </div>
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
                dataFrames={sheets as AnnotationDataFrame[]}
                onTabChange={selectedTab => {
                  goto({ app, file, sheet: selectedTab.tab })
                }}
                zoom={1}
                //className={DATA_PANEL_CLS}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>
      </HistoryLayout>

      <ToolbarFooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

//interface IOncoplotPanelWrapperProps extends IPlotState, IOncoplotPanelProps {}

// export function OncoplotPanelWrapper({
//   panelId,
//   mutationFrame,
//   clinicalTracks,
//   displayProps,
//   oncoProps,
// }: IOncoplotPanelWrapperProps) {
//   return (
//     <PlotProvider
//       mutationFrame={mutationFrame}
//       clinicalTracks={clinicalTracks}
//       displayProps={displayProps}
//     >
//       <OncoplotPanel panelId={panelId} oncoProps={oncoProps} />
//     </PlotProvider>
//   )
// }
