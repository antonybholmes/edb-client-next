import { SlidersIcon } from '@components/icons/sliders-icon'

import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'

import { HeatmapPropsPanel } from './heatmap-props-panel'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@components/tab-provider'
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

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { Card } from '@/components/shadcn/ui/themed/card'
import { TEXT_DISPLAY } from '@/consts'
import { IClusterFrame } from '@/lib/math/hcluster'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { GroupsContext } from '../../groups-provider'
import { HeatMapSvg } from './heatmap-svg'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
  return {
    ...DEFAULT_HEATMAP_PROPS,
    style: style.includes('Dot') ? 'Dot' : 'Square',
  }
}

interface IHeatMapPanelProps {
  //plotId: string
  plotAddr: IHistItemAddr
  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export function HeatMapPanel({
  plotAddr,
  canvasRef,
  downloadRef,
}: IHeatMapPanelProps) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)

  const displayOptions: IHeatMapDisplayOptions =
    (plot?.customProps.displayOptions as IHeatMapDisplayOptions) ??
    DEFAULT_HEATMAP_PROPS

  const { groupState } = useContext(GroupsContext)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>({
  //   ...DEFAULT_DISPLAY_PROPS,
  //   style: plot.type === "Dot Plot" ? "dot" : "square",
  // })

  const svgRef = useRef<SVGSVGElement>(null)

  const [scale, setScale] = useState(1)

  const [showSave, setShowSave] = useState(false)
  const { messageState, messageDispatch } = useContext(MessageContext)
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const messages = messageState.queue.filter(
      (message) => message.target === plot?.id
    )

    messages.forEach((message) => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `heatmap.${messageImageFileFormat(message)}`
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
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: (
        <HeatmapPropsPanel
          plotAddr={plotAddr}
          cf={plot?.customProps.cf as IClusterFrame}
        />
      ),
    },
  ]

  const svg = useMemo(
    () => (
      <Card variant="content" className="mx-2 mb-2 grow">
        <div className={PLOT_CLS}>
          <HeatMapSvg
            ref={svgRef}
            cf={plot?.customProps.cf as IClusterFrame}
            plotAddr={plotAddr}
          />
        </div>
      </Card>
    ),
    [plot, groupState.groups, displayOptions]
  )

  return (
    <>
      {showSave && (
        <SaveImageDialog
          open="open"
          onSave={(format) => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `heatmap.${format.ext}`
            )
            setShowSave(false)
          }}
          onCancel={() => setShowSave(false)}
        />
      )}

      {/* <ResizablePanelGroup
          direction="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize={75}
            minSize={50}
            className="flex flex-col pl-2 pt-2 pb-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <HeatMapSvg
                ref={svgRef}
                cf={plot.cf}
                groups={groups}
                displayProps={displayProps}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="plot-svg-right"
            order={2}
            className="flex flex-col"
            defaultSize={25}
            minSize={15}
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        tabs={plotRightTabs}
        side="Right"
        //tabs={plotRightTabs}
        //onValueChange={setSelectedTab}
        //value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        {svg}
      </TabSlideBar>

      <ToolbarFooter className="shrink-0 grow-0 ">
        <span>{getFormattedShape(currentSheet(history)[0]!)} </span>
        <></>
        <>
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />

      <canvas ref={canvasRef} width={0} height={0} className="hidden" />
    </>
  )
}
