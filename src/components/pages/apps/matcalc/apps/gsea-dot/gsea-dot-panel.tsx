import { useEffect, useRef } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useUpdateEffect } from '@/hooks/update-effect'
import { useHistory } from '../../history/history-provider/history-provider'
import { PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
import { GseaDotPlotSvg } from './gsea-dot-plot-svg'
import { GseaDotPropsPanel } from './gsea-dot-props-panel'
import { useGseaDotContext } from './gsea-dot-provider'

export function GseaDotPanel() {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { updatePlot } = useHistory()
  const { plot } = useGseaDotContext()
  const displayProps = plot.props

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const svgRef = useRef<SVGSVGElement>(null)

  const { open: openDialog } = useDialogs()

  useEffect(() => {
    //const filteredMessage = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `volcano.${messageImageFileFormat(message)}`
          )
        } else {
          openDialog({
            type: 'save-image',
            payload: { svgRef, name: `volcano` },
          })
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useUpdateEffect(() => {
    updatePlot(
      produce(plot, (draft) => {
        draft.props.scale = zoom
      })
    )
  }, [zoom])

  return (
    <>
      {/* <TabSlideBar
        side="right"
        open={settings.sidebar.show}
        onOpenChange={(v) => {
          const newSettings = produce(settings, (draft) => {
            draft.sidebar.show = v
          })

          updateSettings(newSettings)
        }}
      >
        <Card variant="content" className="ml-2 mb-2 grow">
          <div className={PLOT_CLS}>
            <VolcanoPlotSvg
              ref={svgRef}
              //displayProps={displayOptions}
              x={displayProps.axes.xaxis.name}
              y={displayProps.axes.yaxis.name}
            />
          </div>
        </Card>
      </TabSlideBar> */}

      <ResizableSidebar side="right">
        <ExtScrollCard>
          <GseaDotPlotSvg
            ref={svgRef}
            //displayProps={displayOptions}
            x={displayProps.axes.xaxis.name}
          />
        </ExtScrollCard>
        <GseaDotPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}
