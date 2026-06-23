import { OncoplotSvg } from './oncoplot-svg'

import { useEffect, useRef, useState } from 'react'

import { DisplayPropsPanel } from './display-props-panel'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { downloadSvgAutoFormat } from '@/lib/image-utils'

import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import type { ITab } from '@/components/tabs/tab-provider'
import { TEXT_SETTINGS } from '@/consts'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { messageImageFileFormat, useMessages } from '@/providers/messages'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { HistoryLayout } from '../../matcalc/history/history-layout'

import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { FeaturePropsPanel } from './feature-props-panel'
import { useOncoplotSettings } from './oncoplot-settings-store'

//const PLOT_ZOOM_CHANNEL = 'oncoplot-plot-zoom'
export const PANEL_ID = 'oncoplot-panel'

interface IOncoplotPanelProps {
  panelId: string
  //oncoProps: IOncoProps
}

export function OncoplotPanel({ panelId = PANEL_ID }: IOncoplotPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { zoom } = useZoom() //PLOT_ZOOM_CHANNEL) //Ctx()
  const { goto } = useHistory()

  const { file } = useFiles()

  const { sheet, sheets } = useCurrentSheets()

  const [activeSideTab, setActiveSideTab] = useState(TEXT_SETTINGS)

  const { open: openDialog } = useDialogs()
  const { messages, removeMessage } = useMessages('oncoplot') //'onco-panel')
  const { displayProps, setDisplayProps } = useOncoplotSettings()
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.target === panelId
    )

    for (const message of filteredMessages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          if (message.data.includes(':')) {
            downloadSvgAutoFormat(
              svgRef,
              `oncoplot.${messageImageFileFormat(message)}`
            )
          } else {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'oncoplot',
                svgRef,
              },
            })
          }
        }

        if (message.data.includes('show-sidebar')) {
          setShowSideBar(!showSideBar)
        }

        removeMessage(message.id)
      }
    }
  }, [messages])

  useEffect(() => {
    setDisplayProps(
      produce(displayProps, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //name: nanoid(),
      //icon: <SlidersIcon />,
      id: 'Display',
      content: <DisplayPropsPanel />,
    },
    {
      //name: nanoid(),
      //icon: <SlidersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
    },
  ]

  return (
    <>
      {/* <DialogsRoot filter={['save-image']} /> */}

      <HistoryLayout>
        <TabSlideBar
          id="oncoplot-panel-tabs"
          side="right"
          tabs={plotRightTabs}
          onTabChange={(selectedTab) => setActiveSideTab(selectedTab.tab.id)}
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
              <ExtScrollCard>
                <OncoplotSvg ref={svgRef} />
              </ExtScrollCard>
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
                onTabChange={(selectedTab) => {
                  goto({ file, sheet: selectedTab.tab })
                }}
                zoom={1}
                //className={DATA_PANEL_CLS}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>
      </HistoryLayout>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <>
          <ZoomSlider />
        </>
      </FooterPortal>
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
