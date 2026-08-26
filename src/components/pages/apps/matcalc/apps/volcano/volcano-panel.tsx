import {
  DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoDisplayOptions,
} from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { autoLim } from '@/components/plot/axes/axis'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { getNumCol } from '@/lib/dataframe/dataframe-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'
import { useEffect } from 'react'
import { useVolcanoSettings } from './volcano-settings-store'

import { range } from '@/lib/math/range'

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
import { VolcanoPropsPanel } from './volcano-props-panel'
import { useVolcanoContext } from './volcano-provider'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

export function makeDefaultVolcanoProps(
  df: BaseDataFrame,
  x: string = VOLCANO_X,
  y: string = VOLCANO_Y
): IVolcanoDisplayOptions {
  const xdata = getNumCol(df, findCol(df, x))

  const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  let props: IVolcanoDisplayOptions = { ...DEFAULT_VOLCANO_PROPS }

  props = {
    ...props,
    axes: {
      ...props.axes,
      xaxis: {
        ...props.axes.xaxis,
        domain: xlim,
      },
      yaxis: {
        ...props.axes.yaxis,
        domain: ylim,
      },
    },
  }

  return props
}

export function VolcanoPanel() {
  const { plot } = useVolcanoContext()
  const { settings, updateSettings } = useVolcanoSettings()
  const displayProps: IVolcanoDisplayOptions = plot.props

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const { autoSave, saveAs } = useSVG()

  const { setZoom } = useZoom({
    onChange: (v) =>
      updateSettings(
        produce(settings, (draft) => {
          draft.scale = v.zoom
        })
      ),
  })

  useUpdateEffect(() => {
    setZoom(settings.scale)
  }, [settings.scale])

  useEffect(() => {
    //const filteredMessage = messages.filter(m => m.target === plot?.id)

    for (const message of messages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          autoSave(`volcano.${messageImageFileFormat(message)}`)
        } else {
          saveAs('volcano')
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
        <ExtScrollCard>
          <VolcanoPlotSvg
            //displayProps={displayOptions}
            x={displayProps.axes.xaxis.name}
            y={displayProps.axes.yaxis.name}
          />
        </ExtScrollCard>
        <VolcanoPropsPanel />
      </ResizableSidebar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider />
      </FooterPortal>
    </>
  )
}
