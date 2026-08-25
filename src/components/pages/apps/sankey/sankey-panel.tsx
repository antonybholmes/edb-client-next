import { useEffect } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../matcalc/data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useUpdateEffect } from '@/hooks/update-effect'
import { useSVG } from '@/providers/svg-provider'
import { PLOT_ZOOM_CHANNEL } from '../matcalc/apps/heatmap/heatmap-panel'
import { SankeyPropsPanel } from './props-panel/sankey-props-panel'
import { useSankeySettings } from './sankey-settings-store'
import { SankeySvg } from './sankey-svg'

export function SankeyPanel() {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { autoSave, saveAs } = useSVG()
  const { settings, updateSettings } = useSankeySettings()

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  useEffect(() => {
    //const filteredMessage = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          autoSave(`sankey.${messageImageFileFormat(message)}`)
        } else {
          saveAs('sankey')
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useUpdateEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  return (
    <>
      <ResizableSidebar side="right">
        <ExtScrollCard>
          <SankeySvg />
        </ExtScrollCard>
        <SankeyPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}
