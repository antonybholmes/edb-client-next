import { useEffect, useRef } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@/components/tabs/tab-provider'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { TEXT_DISPLAY } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { messageImageFileFormat, useMessages } from '@/providers/messages'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-store'
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

export const PLOT_ZOOM_CHANNEL = 'matcalc-plot'

export function HeatmapPanel() {
  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  const cf = plot?.dataframes['main'] as IClusterFrame

  const svgRef = useRef<SVGSVGElement>(null)

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL)

  const { open: openDialog } = useDialogs()

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    const plotRightTabs: ITab[] = [
      {
        id: TEXT_DISPLAY,
        component: HeatmapPropsPanel,
      },
    ]
    setSideTabs(plotRightTabs)
  }, [])

  useEffect(() => {
    for (const message of messages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          if (message.data.includes(':')) {
            downloadSvgAutoFormat(
              svgRef,
              `heatmap.${messageImageFileFormat(message)}`
            )
          } else {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'heatmap',
                svgRef,
              },
            })
          }
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    if (!plot) {
      return
    }
    updatePlot(
      produce(plot, (draft) => {
        draft.props.zoom = zoom
      })
    )
  }, [plot, zoom])

  if (!plot || !cf) {
    return null
  }

  return (
    <>
      <TabSlideBar side="right">
        <ExtScrollCard>
          <HeatMapSvg ref={svgRef} />
        </ExtScrollCard>
      </TabSlideBar>

      <FooterPortal className="shrink-0 grow-0 ">
        <span>{getFormattedShape(cf.df)} </span>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </FooterPortal>
    </>
  )
}
