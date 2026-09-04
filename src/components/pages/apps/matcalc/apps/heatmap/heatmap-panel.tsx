import { useEffect } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import type { IClusterFrame } from '@/lib/math/hcluster'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useSVG } from '@/providers/svg-provider'
import { useHistory } from '../../history/history-provider/history-provider'
import { useHeatmapContext } from './heatmap-provider'
import { HeatMapSvg } from './heatmap-svg'
import { HeatmapPropsPanel } from './props-panel/heatmap-props-panel'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

// export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
//   return {
//     ...DEFAULT_HEATMAP_PROPS,
//     mode: style.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
//   }
// }

export function HeatmapPanel() {
  const { zoom } = useZoom({
    onChange: (z) => {
      if (!plot) {
        return
      }
      updatePlot(
        produce(plot, (draft) => {
          draft.props.zoom = z.zoom
        })
      )
    },
  })

  const { plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  const cf = plot?.dataframes['main'] as IClusterFrame

  const { autoSave, saveAs } = useSVG()

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL)

  useEffect(() => {
    for (const message of messages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          if (message.data.includes(':')) {
            autoSave(`heatmap.${messageImageFileFormat(message)}`)
          } else {
            saveAs('heatmap')
          }
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  if (!plot || !cf) {
    return null
  }

  return (
    <>
      <ResizableSidebar side="right">
        <ExtScrollCard>
          <HeatMapSvg scale={zoom} />
        </ExtScrollCard>
        <HeatmapPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 ">
        <></>
        <></>

        <ZoomSlider />
      </FooterPortal>
    </>
  )
}
