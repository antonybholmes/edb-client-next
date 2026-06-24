import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef } from 'react'

import {
  DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoDisplayOptions,
} from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { autoLim } from '@/components/plot/axis'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { BaseCol } from '@/layout/base-col'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { getFormattedShape, getNumCol } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { range } from '@/lib/math/range'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom'

import { useDialogs } from '@/components/dialogs/dialogs'
import type { IDivProps } from '@/interfaces/div-props'
import { Card } from '@/themed/card'
import { produce } from 'immer'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-store'
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

interface IPanelProps extends IDivProps {
  //plotId: string

  x?: string
  y?: string
}

export function VolcanoPanel({
  ref,

  x = 'Log2 fold change',
  y = '-log10 p-value',
}: IPanelProps) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { updatePlot } = useHistory()
  const { plot } = useVolcanoContext()

  const sheet = plot?.dataframes['main'] as BaseDataFrame

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'volcano')

  const svgRef = useRef<SVGSVGElement>(null)

  const { open: openDialog } = useDialogs()

  const { settings, updateSettings } = useMatcalcSettings()
  const { setTabs: setSideTabs } = useSideTabs()
  useEffect(() => {
    setSideTabs([
      {
        //id: nanoid(),
        id: 'Display',
        icon: <SlidersIcon />,

        component: () => <VolcanoPropsPanel x={x} y={y} />,
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
    <BaseCol ref={ref} className="h-full overflow-hidden grow">
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
              x={x}
              y={y}
            />
          </div>
        </Card>
      </TabSlideBar>

      <FooterPortal className="shrink-0 grow-0 justify-end">
        <span>{getFormattedShape(sheet)}</span>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </FooterPortal>
    </BaseCol>
  )
}
