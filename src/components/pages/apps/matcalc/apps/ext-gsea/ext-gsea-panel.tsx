import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import { TEXT_CANCEL, TEXT_DISPLAY } from '@/consts'
import { SaveImageDialog } from '@/dialogs/save-image-dialog'

import { messageImageFileFormat, useMessages } from '@/providers/messages'
import { useZoom } from '@/providers/zoom-provider'
import { Card } from '@/themed/card'
import { produce } from 'immer'

import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-store'
import { getPlot } from '../../history/history-provider/history-hooks'
import { useHistory } from '../../history/history-provider/history-provider'
import { ExtGseaPlot } from '../../history/history-provider/history-types'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { PLOT_CLS, PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
import { ExtGseaPropsPanel } from './ext-gsea-props-panel'
import { ExtGseaSvg } from './ext-gsea-svg'

export function makeDefaultHeatmapProps(mode: string): IHeatMapDisplayOptions {
  return {
    ...DEFAULT_HEATMAP_PROPS,
    mode: mode.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
  }
}

interface IExtGseaPanelProps {
  //plotId: string
  plotAddr: string
}

function ExtGseaPanel({ plotAddr }: IExtGseaPanelProps) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updatePlot, present, plots } = useHistory()

  const plot = getPlot(present, plots, plotAddr)! as ExtGseaPlot

  //const sheet = plot!.dataframes['main']! as AnnotationDataFrame

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const svgRef = useRef<SVGSVGElement>(null)

  const [showSave, setShowSave] = useState(false)
  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'ext-gsea')
  const { settings, updateSettings } = useMatcalcSettings()

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    setSideTabs([
      {
        id: TEXT_DISPLAY,
        icon: <SlidersIcon />,
        component: () => <ExtGseaPropsPanel plotAddr={plotAddr} />,
      },
    ])
  }, [])

  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.target === plot?.id
    )

    for (const message of filteredMessages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `extgsea.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    updatePlot(
      produce(plot, (draft) => {
        draft.props.page.scale = zoom
      })
    )
  }, [zoom])

  return (
    <>
      {showSave && (
        <SaveImageDialog
          name="ext-gsea"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name)
            }

            setShowSave(false)
          }}
        />
      )}

      {/* <ResizablePanelGroup
          orientation="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize="75%"
            minSize="50%"
            className="flex flex-col pl-2 pt-2 pb-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <HeatMapSvg
                ref={svgRef}
                cf={plot!.cf}
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
            defaultSize="25%"
            minSize="15%"
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        side="right"
        //tabs={plotRightTabs}
        //onValueChange={setSelectedTab}
        //value={selectedTab}
        open={settings.sidebar.show}
        onOpenChange={(v) => {
          const newSettings = produce(settings, (draft) => {
            draft.sidebar.show = v
          })

          updateSettings(newSettings)
        }}
      >
        <Card variant="content" className="mx-2 mb-2 grow">
          <div className={PLOT_CLS}>
            <ExtGseaSvg
              ref={svgRef}
              plotAddr={plotAddr}
              //extGsea={extGsea}
              //displayOptions={displayOptions}
            />
          </div>
        </Card>
      </TabSlideBar>

      <FooterPortal className="shrink-0 grow-0 ">
        <></>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </FooterPortal>
    </>
  )
}

export function ExtGseaPanelQuery({ plotAddr }: IExtGseaPanelProps) {
  return <ExtGseaPanel plotAddr={plotAddr} />
}
