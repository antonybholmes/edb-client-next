import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { BaseCol } from '@/layout/base-col'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useHistory, usePlot, type BoxPlot } from '../../history/history-store'

import { NO_DIALOG, TEXT_CANCEL, type IDialogParams } from '@/consts'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import type { ITab } from '@/components/tabs/tab-provider'
import type { IDivProps } from '@/interfaces/div-props'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { randId } from '@/lib/id'
import { Card } from '@/themed/card'
import { produce } from 'immer'
import { MESSAGE_CHANNEL, OPTS_SIDEBAR_ID } from '../../data/data-panel'
import { PLOT_CLS, PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
import { BoxPlotDataPanel } from './boxplot-data-panel'
import { BoxPlotSvg } from './boxplot-plot-svg'
import { BoxPlotPropsPanel } from './boxplot-props-panel'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

interface IPanelProps extends IDivProps {
  plotAddr: string
}

export function BoxPlotPanel({ ref, plotAddr }: IPanelProps) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { sheet, updatePlot } = useHistory()

  const plot = usePlot(plotAddr)! as BoxPlot

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'box-plot')

  const svgRef = useRef<SVGSVGElement>(null)

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  // const [displayProps, setDisplayProps] = useState<IVolcanoProps>(() => {
  //   const xdata = getNumCol(df, findCol(df, x))

  //   const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  //   const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  //   const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  //   return makeDefaultVolcanoProps(xlim, ylim)
  // })

  const [showSideBar, setShowSideBar] = useState(true)

  const df = sheet?.df as AnnotationDataFrame

  useEffect(() => {
    const filteredMessages = messages.filter(m => m.target === plot?.id)

    for (const message of filteredMessages) {
      if (message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `boxwhisker.${messageImageFileFormat(message)}`
          )
        } else {
          setShowDialog({ id: randId('save') })
        }
      }

      if (message.data.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
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
      produce(plot, draft => {
        draft.props.page.scale = zoom
      })
    )
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Display',
      icon: <SlidersIcon />,

      content: <BoxPlotPropsPanel plotAddr={plotAddr} />,
    },
    {
      //id: nanoid(),
      id: 'Data',
      icon: <SlidersIcon />,

      content: <BoxPlotDataPanel plotAddr={plotAddr} />,
    },
  ]

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          name="boxplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <BaseCol ref={ref} className="h-full overflow-hidden grow">
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
          id={OPTS_SIDEBAR_ID}
          side="right"
          tabs={plotRightTabs}
          //onValueChange={setSelectedTab}
          //value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card variant="content" className="mx-2 mb-2 grow">
            <div className={PLOT_CLS}>
              <BoxPlotSvg ref={svgRef} plotAddr={plotAddr} />
            </div>
          </Card>
        </TabSlideBar>

        <ToolbarFooterPortal className="shrink-0 grow-0 justify-end">
          <span>{getFormattedShape(df)}</span>
          <></>
          <>
            <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
          </>
        </ToolbarFooterPortal>
      </BaseCol>
    </>
  )
}
