import { SlidersIcon } from '@components/icons/sliders-icon'

import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

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
import { TEXT_DISPLAY } from '@/consts'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import type { IExtGseaDisplayOptions } from '../../../gene/gsea/ext-gsea-store'

import { Card } from '@/components/shadcn/ui/themed/card'
import { GenesetsContext } from '../../genesets-provider'
import { GroupsContext } from '../../groups-provider'
import { PLOT_CLS } from '../heatmap/heatmap-panel'
import { ExtGseaPropsPanel } from './ext-gsea-props-panel'
import { ExtGseaSvg } from './ext-gsea-svg'

export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
  return {
    ...DEFAULT_HEATMAP_PROPS,
    style: style.includes('Dot') ? 'Dot' : 'Square',
  }
}

interface IExtGseaPanelProps {
  //plotId: string
  plotAddr: IHistItemAddr
  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export const ExtGseaPanel = forwardRef(function ExtGseaPanel(
  { plotAddr, canvasRef, downloadRef }: IExtGseaPanelProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)

  if (plot === null) {
    return null
  }

  const displayOptions: IExtGseaDisplayOptions = plot.customProps
    .displayOptions as IExtGseaDisplayOptions

  //const extGsea: ExtGSEA = plot.customProps.extGsea as ExtGSEA

  const { groupState } = useContext(GroupsContext)
  const { genesetState } = useContext(GenesetsContext)
  // const [displayOptions, setdisplayOptions] = useState<IHeatMapProps>({
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
      message => message.target === plot.id
    )

    messages.forEach(message => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `extgsea.${messageImageFileFormat(message)}`
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
      content: <ExtGseaPropsPanel plotAddr={plotAddr} />,
    },
  ]

  const svg = useMemo(
    () => (
      <Card variant="content" className="mx-2 grow">
        <div className={PLOT_CLS}>
          <ExtGseaSvg
            ref={svgRef}
            plotAddr={plotAddr}
            //extGsea={extGsea}
            //displayOptions={displayOptions}
          />
        </div>
      </Card>
    ),
    [plot, groupState.groups, genesetState.genesets, displayOptions]
  )

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
              `extgsea.${format.ext}`
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
                displayOptions={displayOptions}
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
})
