import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { BaseCol } from '@/layout/base-col'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { Card } from '@/themed/card'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-provider'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { useHistory } from '../../history/history-provider/history-provider'
import { PLOT_CLS, PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
import { BoxPlotDataPanel } from './boxplot-data-panel'
import { BoxPlotSvg } from './boxplot-plot-svg'
import { BoxPlotPropsPanel } from './boxplot-props-panel'
import { useBoxPlotContext } from './boxplot-provider'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

export function BoxPlotPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { updatePlot } = useHistory()
  const { sheets } = useCurrentSheets()

  const { plot } = useBoxPlotContext()

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'box-plot')

  const svgRef = useRef<SVGSVGElement>(null)

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { open: openDialog } = useDialogs()

  const [showSideBar, setShowSideBar] = useState(true)

  const df = sheets[0] as AnnotationDataFrame

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setSideTabs([
      {
        id: 'Display',
        component: BoxPlotPropsPanel,
      },
      {
        id: 'Data',
        icon: <SlidersIcon />,
        component: BoxPlotDataPanel,
      },
    ])
  }, [])

  useEffect(() => {
    //const filteredMessages = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          if (message.data.includes(':')) {
            downloadSvgAutoFormat(
              svgRef,
              `boxwhisker.${messageImageFileFormat(message)}`
            )
          } else {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'boxplot',
                svgRef,
              },
            })
          }
        }

        if (message.data.includes('show-sidebar')) {
          setShowSideBar(!showSideBar)
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    // plotsDispatch({
    //   type: 'update-display',
    //   id: plotId,
    //   displayOptions: { ...displayOptions, scale },
    // })

    updatePlot(
      produce(plot, (draft) => {
        draft.props.page.scale = zoom
      })
    )
  }, [zoom])

  return (
    <>
      {/* <DialogsRoot /> */}

      <BaseCol className="h-full overflow-hidden grow">
        {/* <ResizablePanelGroup
          orientation="horizontal"
          id="volcano-resizable-panels"
          className="overflow-hidden"
          //autoSaveId="volcano-resizable-panels"
        >
          <ResizablePanel
            id="volcano-svg"
            order={1}
            defaultSize="75%"
            minSize="50%"
            className="flex grow flex-col pt-2 pb-2 pl-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <VolcanoPlotSvg
                ref={svgRef}
                df={plot.cf.dataframes[MAIN_CLUSTER_FRAME]}
                displayProps={displayProps}
                x={x}
                y={y}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="volcano-svg-right"
            order={2}
            className="flex flex-col overflow-hidden"
            defaultSize="25%"
            minSize="15%"
            collapsedSize={0}
            collapsible={true}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          side="right"
          //onValueChange={setSelectedTab}
          //value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card variant="content" className="mx-2 mb-2 grow">
            <div className={PLOT_CLS}>
              <BoxPlotSvg ref={svgRef} />
            </div>
          </Card>
        </TabSlideBar>

        <FooterPortal className="shrink-0 grow-0 justify-end">
          <span>{getFormattedShape(df)}</span>
          <></>
          <>
            <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
          </>
        </FooterPortal>
      </BaseCol>
    </>
  )
}
