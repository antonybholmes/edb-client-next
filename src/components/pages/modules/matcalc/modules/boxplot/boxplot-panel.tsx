import { SlidersIcon } from '@components/icons/sliders-icon'

import {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import { BaseCol } from '@/components/layout/base-col'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'

import {
  currentSheet,
  getPlotFromAddr,
  HistoryContext,
  type IHistItemAddr,
} from '@providers/history-provider'

import {
  MessageContext,
  messageImageFileFormat,
} from '@/components/pages/message-provider'
import { Card } from '@/components/shadcn/ui/themed/card'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import type { ITab } from '@components/tab-provider'
import { PLOT_CLS } from '../heatmap/heatmap-panel'
import { BoxPlotDataPanel } from './boxplot-data-panel'
import { BoxPlotSvg, type IBoxPlotDisplayOptions } from './boxplot-plot-svg'
import { BoxPlotPropsPanel } from './boxplot-props-panel'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

interface IPanelProps {
  plotAddr: IHistItemAddr
  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export const BoxPlotPanel = forwardRef(function BoxPlotPanel(
  { plotAddr, canvasRef, downloadRef }: IPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)

  if (plot === null) {
    return null
  }

  const displayOptions: IBoxPlotDisplayOptions = plot.customProps
    .displayOptions as IBoxPlotDisplayOptions

  const { messageState, messageDispatch } = useContext(MessageContext)

  const svgRef = useRef<SVGSVGElement>(null)

  const [scale, setScale] = useState(1)

  const [showSave, setShowSave] = useState(false)

  // const [displayProps, setDisplayProps] = useState<IVolcanoProps>(() => {
  //   const xdata = getNumCol(df, findCol(df, x))

  //   const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  //   const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  //   const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  //   return makeDefaultVolcanoProps(xlim, ylim)
  // })

  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const messages = messageState.queue.filter(m => m.target === plot.id)

    messages.forEach(message => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `boxwhisker.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    })

    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }

    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  function adjustScale(scale: number) {
    setScale(scale)

    // plotsDispatch({
    //   type: 'update-display',
    //   id: plotId,
    //   displayOptions: { ...displayOptions, scale },
    // })

    historyDispatch({
      type: 'update-custom-prop',
      addr: plotAddr,
      name: 'displayOptions',
      prop: {
        ...displayOptions,
        scale,
      },
    })
  }

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
      {showSave && (
        <SaveImageDialog
          open="open"
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `boxwhiskers.${format.ext}`
            )
            setShowSave(false)
          }}
          onCancel={() => setShowSave(false)}
        />
      )}

      <BaseCol ref={ref} className="h-full overflow-hidden grow">
        {/* <ResizablePanelGroup
          direction="horizontal"
          id="volcano-resizable-panels"
          className="overflow-hidden"
          //autoSaveId="volcano-resizable-panels"
        >
          <ResizablePanel
            id="volcano-svg"
            order={1}
            defaultSize={75}
            minSize={50}
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
            defaultSize={25}
            minSize={15}
            collapsedSize={0}
            collapsible={true}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          side="Right"
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

        <ToolbarFooter className="shrink-0 grow-0 justify-end">
          <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
          <></>
          <>
            <ZoomSlider scale={scale} onZoomChange={adjustScale} />
          </>
        </ToolbarFooter>
      </BaseCol>
    </>
  )
})
