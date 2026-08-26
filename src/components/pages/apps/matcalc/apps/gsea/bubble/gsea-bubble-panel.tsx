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
import { useUpdateEffect } from '@/hooks/update-effect'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { GseaBubbleDisplayPropsPanel } from '../../../../genes/gsea/gsea-plot/bubble/gsea-bubble-display-props-panel'
import { useGseaBubbleSettings } from '../../../../genes/gsea/gsea-plot/bubble/gsea-bubble-settings-store'
import { GseaBubblePlotSvg } from '../../../../genes/gsea/gsea-plot/bubble/gsea-bubble-svg'

export function GseaBubblePanel() {
  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const { settings, updateSettings } = useGseaBubbleSettings()

  const { autoSave, saveAs } = useSVG()

  const { setZoom } = useZoom({
    onChange: (v) => {
      updateSettings(
        produce(settings, (draft) => {
          draft.page.scale = v.zoom
        })
      )
    },
  })

  useUpdateEffect(() => {
    setZoom(settings.page.scale)
  }, [settings.page.scale])

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
          <GseaBubblePlotSvg />
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
