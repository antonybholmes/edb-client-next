import { LollipopSvg } from './lollipop-svg'

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

import { LollipopPropsPanel } from './lollipop-props-panel'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import {
  MessageContext,
  messageImageFileFormat,
} from '@/components/pages/message-provider'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { downloadImageAutoFormat } from '@lib/image-utils'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TEXT_SETTINGS } from '@/consts'
import { LayersIcon } from '@components/icons/layers-icon'
import type { ITab } from '@components/tab-provider'
import { PLOT_CLS } from '../matcalc/modules/heatmap/heatmap-panel'
import { FeaturePropsPanel } from './feature-props-panel'
import { LabelPropsPanel } from './label-props-panel'
import {
  PlotContext,
  PlotProvider,
  type ILollipopDataFrame,
} from './plot-context'

interface ILollipopPanelProps {
  panelId: string

  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

const LollipopPanel = forwardRef(function LollipopPanel(
  {
    panelId,

    canvasRef,
    downloadRef,
  }: ILollipopPanelProps,
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
      console.log(message)

      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `lollipop.${messageImageFileFormat(message)}`
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
      displayProps: { ...plotState.df.displayProps, scale },
    })
  }

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <SlidersIcon />,
      id: 'Display',
      content: <LollipopPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel downloadRef={downloadRef} />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Labels',
      content: <LabelPropsPanel downloadRef={downloadRef} />,
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
              `lollipop.${format.ext}`
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
            <LollipopSvg ref={svgRef} />
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
        value={activeSideTab}
        onTabChange={selectedTab => setActiveSideTab(selectedTab.tab.id)}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <div className={PLOT_CLS}>
          <LollipopSvg ref={svgRef} />
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

interface ILollipopPanelWrapperProps extends ILollipopPanelProps {
  df: ILollipopDataFrame
}

/**
 * Wrapper to give the context to the actual panel and its children and
 * also to prevent forward ref errors when creating components. If the
 * naked <PlotProvider df={df}> is used in a tabs component, react will
 * complain that the ref cannot be forwarded, so we need a wrapper to
 * satify this requirement, which itself forwards to the real component.
 */
export const LollipopPanelWrapper = forwardRef(function LollipopPanelWrapper(
  { panelId, df, canvasRef, downloadRef }: ILollipopPanelWrapperProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <PlotProvider df={df}>
      <LollipopPanel
        panelId={panelId}
        ref={ref}
        canvasRef={canvasRef}
        downloadRef={downloadRef}
      />
    </PlotProvider>
  )
})
