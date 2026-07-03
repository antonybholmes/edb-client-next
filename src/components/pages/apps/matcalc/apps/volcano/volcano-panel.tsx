import { useEffect, useRef } from 'react'

import {
  DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoDisplayOptions,
} from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { autoLim } from '@/components/plot/axis'
import { TabSlideBar } from '@/components/sidebar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { BaseCol } from '@/layout/base-col'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { getNumCol } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { range } from '@/lib/math/range'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { Card } from '@/themed/card'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-provider'
import { useHistory } from '../../history/history-provider/history-provider'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { PLOT_CLS, PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'
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
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { updatePlot } = useHistory()
  const { plot } = useVolcanoContext()
  const displayProps: IVolcanoDisplayOptions = plot.props
  const sheet = plot?.dataframes['main'] as BaseDataFrame

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const svgRef = useRef<SVGSVGElement>(null)

  const { open: openDialog } = useDialogs()

  const { settings, updateSettings } = useMatcalcSettings()
  const { setTabs: setSideTabs } = useSideTabs()
  useEffect(() => {
    setSideTabs([
      {
        id: 'Display',
        component: VolcanoPropsPanel,
      },
    ])
  }, [])

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
    <BaseCol className="h-full overflow-hidden grow">
      <TabSlideBar
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
      </TabSlideBar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <></>
        <></>
        <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
      </FooterPortal>
    </BaseCol>
  )
}
