import { OncoplotSvg } from './oncoplot-svg'

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

import { OncoplotPropsPanel } from './oncoplot-props-panel'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import {
  MessageContext,
  messageImageFileFormat,
} from '@/components/pages/message-provider'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { downloadImageAutoFormat } from '@lib/image-utils'
import type { IOncoProps } from './oncoplot-utils'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TEXT_SETTINGS } from '@/consts'
import { LayersIcon } from '@components/icons/layers-icon'
import type { ITab } from '@components/tab-provider'
import { PLOT_CLS } from '../matcalc/modules/heatmap/heatmap-panel'
import { ClinicalPropsPanel } from './clinical-props-panel'
import { PlotContext, PlotProvider, type IPlotState } from './plot-provider'

interface IOncoplotPanelProps {
  panelId: string

  oncoProps: IOncoProps
  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

const OncoplotPanel = forwardRef(function OncoplotPanel(
  { panelId, oncoProps, canvasRef, downloadRef }: IOncoplotPanelProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  const svgRef = useRef<SVGSVGElement>(null)

  const [scale, setScale] = useState(3)

  const [activeSideTab, setActiveSideTab] = useState(TEXT_SETTINGS)

  const [showSave, setShowSave] = useState(false)
  const { messageState, messageDispatch } = useContext(MessageContext)
  const { plotState, plotDispatch } = useContext(PlotContext)
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const messages = messageState.queue.filter(
      message => message.target === panelId
    )

    messages.forEach(message => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `oncoplot.${messageImageFileFormat(message)}`
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

    plotDispatch({
      type: 'display',
      displayProps: { ...plotState.displayProps, scale },
    })
  }

  const plotRightTabs: ITab[] = [
    {
      //name: nanoid(),
      icon: <SlidersIcon />,
      id: 'Display',
      content: <OncoplotPropsPanel />,
    },
    {
      //name: nanoid(),
      icon: <LayersIcon />,
      id: 'Clinical',
      content: <ClinicalPropsPanel />,
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
              `oncoplot.${format.ext}`
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
          className="flex min-h-0 flex-col pl-2 pt-2 pb-2"
        >
          <div className="custom-scrollbar relative min-h-0 grow overflow-scroll rounded-lg border bg-white">
            <OncoplotSvg ref={svgRef} oncoProps={oncoProps} />
          </div>
        </ResizablePanel>
        <ThinHResizeHandle />
        <ResizablePanel
          id="plot-svg-right"
          order={2}
          className="flex min-h-0 flex-col"
          defaultSize={25}
          minSize={15}
          collapsible={true}
          collapsedSize={0}
        >
          <SideBarTextTabs
            value={activeSideTab}
            onValueChange={setActiveSideTab}
            tabs={plotRightTabs}
            side="top"
          />
        </ResizablePanel>
      </ResizablePanelGroup> */}

      <TabSlideBar
        side="Right"
        tabs={plotRightTabs}
        onTabChange={selectedTab => setActiveSideTab(selectedTab.tab.id)}
        value={activeSideTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <div className={PLOT_CLS}>
          <OncoplotSvg ref={svgRef} oncoProps={oncoProps} />
        </div>
      </TabSlideBar>

      <ToolbarFooter className="shrink-0 grow-0 justify-end">
        <></>
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

interface IOncoplotPanelWrapperProps extends IPlotState, IOncoplotPanelProps {}

export const OncoplotPanelWrapper = forwardRef(function OncoplotPanelWrapper(
  {
    panelId,
    mutationFrame,
    clinicalTracks,
    displayProps,
    oncoProps,
    canvasRef,
    downloadRef,
  }: IOncoplotPanelWrapperProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <PlotProvider
      mutationFrame={mutationFrame}
      clinicalTracks={clinicalTracks}
      displayProps={displayProps}
    >
      <OncoplotPanel
        panelId={panelId}
        ref={ref}
        oncoProps={oncoProps}
        canvasRef={canvasRef}
        downloadRef={downloadRef}
      />
    </PlotProvider>
  )
})
