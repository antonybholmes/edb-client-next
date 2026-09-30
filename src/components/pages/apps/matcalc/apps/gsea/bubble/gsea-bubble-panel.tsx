import { useEffect } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'

import { MESSAGE_CHANNEL } from '../../../data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useSVG } from '@/providers/svg-provider'
import { GseaBubbleDisplayPropsPanel } from '../../../../genes/gsea/gsea-plot/bubble/gsea-bubble-display-props-panel'
import { GseaBubblePlotsSvg } from '../../../../genes/gsea/gsea-plot/bubble/svg/gsea-bubble-plots-svg'

export function GseaBubblePanel() {
  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const { autoSave, saveAs } = useSVG()

  useEffect(() => {
    //const filteredMessage = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          autoSave(`volcano.${messageImageFileFormat(message)}`)
        } else {
          saveAs('gsea-bubble')
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  return (
    <>
      <ResizableSidebar side="right">
        <ExtScrollCard className="pb-2">
          <GseaBubblePlotsSvg />
        </ExtScrollCard>
        <GseaBubbleDisplayPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider />
      </FooterPortal>
    </>
  )
}
