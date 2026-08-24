import { useEffect } from 'react'

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
import { useSVG } from '@/providers/svg-provider'
import { PLOT_ZOOM_CHANNEL } from '../../../matcalc/apps/heatmap/heatmap-panel'
import { GseaBubbleDisplayPropsPanel } from '../gsea-plot/bubble/gsea-bubble-display-props-panel'
import { GseaBubblePlotSvg } from '../gsea-plot/bubble/gsea-bubble-svg'

export function GseaBubblePanel() {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const { open: openDialog } = useDialogs()

  const { ref: svgRef } = useSVG()

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
      <ResizableSidebar side="right">
        <ExtScrollCard className="pb-2">
          <GseaBubblePlotSvg />
        </ExtScrollCard>
        <GseaBubbleDisplayPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}
