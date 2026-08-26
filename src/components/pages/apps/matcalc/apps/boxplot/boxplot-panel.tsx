import { useEffect, useState } from 'react'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useUpdateEffect } from '@/hooks/update-effect'
import { useSVG } from '@/providers/svg-provider'
import { useHistory } from '../../history/history-provider/history-provider'
import { BoxPlotPropsPanel } from './box-plot-props-panel'
import { BoxPlotSvg } from './boxplot-plot-svg'
import { useBoxPlotContext } from './boxplot-provider'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

export function BoxPlotPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { updatePlot } = useHistory()

  const { plot } = useBoxPlotContext()

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'box-plot')

  const { autoSave, saveAs } = useSVG()

  const { setZoom } = useZoom({
    onChange: (z) => {
      updatePlot(
        produce(plot, (draft) => {
          draft.props.page.scale = z.zoom
        })
      )
    },
  })

  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    //const filteredMessages = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          if (message.data.includes(':')) {
            autoSave(`boxwhisker.${messageImageFileFormat(message)}`)
          } else {
            saveAs('boxplot')
          }
        }

        if (message.data.includes('show-sidebar')) {
          setShowSideBar(!showSideBar)
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useUpdateEffect(() => {
    setZoom(plot.props.page.scale)
  }, [plot.props.page.scale])

  return (
    <>
      {/* <BaseCol className="h-full overflow-hidden grow">
        <TabSlideBar
          side="right"

          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card variant="content" className="mx-2 mb-2 grow">
            <div className={PLOT_CLS}>
              <BoxPlotSvg ref={svgRef} />
            </div>
          </Card>
        </TabSlideBar> */}

      <ResizableSidebar side="right">
        <ExtScrollCard>
          <BoxPlotSvg />
        </ExtScrollCard>
        <BoxPlotPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider />
      </FooterPortal>
    </>
  )
}
