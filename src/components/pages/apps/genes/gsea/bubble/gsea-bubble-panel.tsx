import { useEffect, useRef } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { MESSAGE_CHANNEL } from '../../../matcalc/data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { PLOT_ZOOM_CHANNEL } from '../../../matcalc/apps/heatmap/heatmap-panel'
import { GseaBubblePropsPanel } from '../gsea-plot/bubble/gsea-bubble-props-panel'
import { GseaBubblePlotSvg } from '../gsea-plot/bubble/gsea-bubble-svg'

export function GseaBubblePanel() {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

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
            payload: { svgRef, name: `gsea-bubble` },
          })
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

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
        <ExtScrollCard className="pb-2">
          <GseaBubblePlotSvg
            ref={svgRef}
            //displayProps={displayOptions}
          />
        </ExtScrollCard>
        <GseaBubblePropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}
