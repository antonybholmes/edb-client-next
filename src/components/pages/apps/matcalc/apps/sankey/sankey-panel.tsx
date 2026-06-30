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
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useHistory } from '../../history/history-provider/history-provider'
import { PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
import { SankeyPropsPanel } from './sankey-props-panel'
import { ISankeyDisplayOptions, useSankey } from './sankey-provider'
import { SankeySvg } from './sankey-svg'

export function SankeyPanel() {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { updatePlot } = useHistory()
  const { plot } = useSankey()
  const displayProps: ISankeyDisplayOptions = plot.props

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

  useEffect(() => {
    /*  plotsDispatch({
      type: 'update-display',
      id: plotId,
      displayOptions: { ...displayProps, scale },
    }) */

    updatePlot(
      produce(plot, (draft) => {
        draft.props.scale = zoom
      })
    )
  }, [zoom])

  return (
    <>
      <ResizableSidebar side="right">
        <ExtScrollCard>
          <SankeySvg ref={svgRef} />
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
