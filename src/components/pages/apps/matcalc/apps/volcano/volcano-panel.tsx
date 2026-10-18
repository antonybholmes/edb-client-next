import {
  DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoDisplayOptions,
} from '@/components/pages/apps/volcano/volcano-plot-svg'

import { FooterSlotPortal } from '@/components/toolbar/footer-portal'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { getNumCol } from '@/lib/dataframe/dataframe-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'
import { useEffect } from 'react'

import { range } from '@/lib/math/range'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'

import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { ILim } from '@/lib/math/math'
import { useSVG } from '@/providers/svg-provider'
import { VolcanoPropsPanel } from '../../../volcano/volcano-props-panel'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

export function makeDefaultVolcanoProps(
  df: BaseDataFrame,
  x: string = VOLCANO_X,
  y: string = VOLCANO_Y
): IVolcanoDisplayOptions {
  const xdata = getNumCol(df, findCol(df, x))

  const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  const xlim: ILim = [Math.min(...xdata), Math.max(...xdata)]
  const ylim: ILim = [Math.min(...ydata), Math.max(...ydata)]

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
  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL)

  const { autoSave, saveAs } = useSVG()

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
      <ResizableSidebar side="right">
        <ExtScrollCard>
          <VolcanoPlotSvg />
        </ExtScrollCard>
        <VolcanoPropsPanel />
      </ResizableSidebar>

      <FooterSlotPortal slot="footer-right">
        <ZoomSlider />
      </FooterSlotPortal>
    </>
  )
}
