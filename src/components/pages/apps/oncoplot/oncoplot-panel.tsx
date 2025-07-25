import { OncoplotSvg } from './oncoplot-svg'

import { SlidersIcon } from '@icons/sliders-icon'

import { useContext, useEffect, useRef, useState } from 'react'

import { OncoplotPropsPanel } from './oncoplot-props-panel'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import type { IOncoProps } from './oncoplot-utils'

import { TEXT_CANCEL, TEXT_SETTINGS } from '@/consts'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import type { ITab } from '@components/tabs/tab-provider'
import { LayersIcon } from '@icons/layers-icon'
import { PLOT_CLS } from '../matcalc/apps/heatmap/heatmap-panel'
import { ClinicalPropsPanel } from './clinical-props-panel'
import { PlotContext, PlotProvider, type IPlotState } from './plot-provider'

interface IOncoplotPanelProps {
  panelId: string

  oncoProps: IOncoProps
}

function OncoplotPanel({ panelId, oncoProps }: IOncoplotPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { zoom } = useZoom()

  const [activeSideTab, setActiveSideTab] = useState(TEXT_SETTINGS)

  const [showSave, setShowSave] = useState(false)
  const { messages, removeMessage } = useMessages() //'onco-panel')
  const { plotState, plotDispatch } = useContext(PlotContext)
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === panelId
    )

    for (const message of filteredMessages) {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `oncoplot.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }

        removeMessage(message.id)
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    }
  }, [messages])

  useEffect(() => {
    plotDispatch({
      type: 'display',
      displayProps: { ...plotState.displayProps, scale: zoom },
    })
  }, [zoom])

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
          name="oncoplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowSave(false)
          }}
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
        id="oncoplot-panel-tabs"
        side="right"
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

      <ToolbarFooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <>
          <ZoomSlider />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

interface IOncoplotPanelWrapperProps extends IPlotState, IOncoplotPanelProps {}

export function OncoplotPanelWrapper({
  panelId,
  mutationFrame,
  clinicalTracks,
  displayProps,
  oncoProps,
}: IOncoplotPanelWrapperProps) {
  return (
    <PlotProvider
      mutationFrame={mutationFrame}
      clinicalTracks={clinicalTracks}
      displayProps={displayProps}
    >
      <OncoplotPanel panelId={panelId} oncoProps={oncoProps} />
    </PlotProvider>
  )
}
