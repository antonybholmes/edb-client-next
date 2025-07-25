import { SlidersIcon } from '@icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { autoLim } from '@/components/plot/axis'
import {
  DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoDisplayOptions,
} from '@components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { BaseCol } from '@layout/base-col'
import { findCol, type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { getFormattedShape, getNumCol } from '@lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import { useHistory, usePlot } from '../../history/history-store'

import { range } from '@lib/math/range'

import { NO_DIALOG, TEXT_CANCEL, type IDialogParams } from '@/consts'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { SaveImageDialog } from '@components/pages/save-image-dialog'
import type { ITab } from '@components/tabs/tab-provider'
import type { IDivProps } from '@interfaces/div-props'
import { randId } from '@lib/utils'
import { Card } from '@themed/card'
import { produce } from 'immer'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { PLOT_CLS } from '../heatmap/heatmap-panel'
import { VolcanoPropsPanel } from './volcano-props-panel'

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
  plotAddr: string
  x?: string
  y?: string
}

export function VolcanoPanel({
  ref,
  plotAddr,
  x = 'Log2 fold change',
  y = '-log10 p-value',
}: IPanelProps) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { zoom } = useZoom()

  const { updateProps } = useHistory()
  const plot = usePlot(plotAddr)!

  const sheet = plot!.dataframes['main']! as BaseDataFrame

  const displayOptions =
    (plot?.customProps.displayOptions as IVolcanoDisplayOptions) ??
    DEFAULT_VOLCANO_PROPS

  const { messages, removeMessage } = useMessages() //'volcano')

  const svgRef = useRef<SVGSVGElement>(null)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { settings, updateSettings } = useMatcalcSettings()

  //const df = plot.customProps.df

  // const [displayProps, setDisplayProps] = useState<IVolcanoProps>(() => {
  //   const xdata = getNumCol(df, findCol(df, x))

  //   const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  //   const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  //   const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  //   return makeDefaultVolcanoProps(xlim, ylim)
  // })

  useEffect(() => {
    const filteredMessage = messages.filter(m => m.target === plot?.id)

    for (const message of filteredMessage) {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `volcano.${messageImageFileFormat(message)}`
          )
        } else {
          setShowDialog({ id: randId('save') })
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

    updateProps(
      plotAddr,
      'displayOptions',
      produce(displayOptions, draft => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Display',
      icon: <SlidersIcon />,

      content: <VolcanoPropsPanel x={x} y={y} plotAddr={plotAddr} />,
    },
  ]

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          name="volcano"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <BaseCol ref={ref} className="h-full overflow-hidden grow">
        {/* <ResizablePanelGroup
          direction="horizontal"
          id="volcano-resizable-panels"
          className="overflow-hidden"
          //autoSaveId="volcano-resizable-panels"
        >
          <ResizablePanel
            id="volcano-svg"
            order={1}
            defaultSize={75}
            minSize={50}
            className="flex grow flex-col pt-2 pb-2 pl-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <VolcanoPlotSvg
                ref={svgRef}
                df={plot.cf.dataframes[MAIN_CLUSTER_FRAME]}
                displayProps={displayProps}
                x={x}
                y={y}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="volcano-svg-right"
            order={2}
            className="flex flex-col overflow-hidden"
            defaultSize={25}
            minSize={15}
            collapsedSize={0}
            collapsible={true}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          id="volcano-panel"
          side="right"
          tabs={plotRightTabs}
          //onValueChange={setSelectedTab}
          //value={selectedTab}
          open={settings.sidebar.show}
          onOpenChange={v => {
            const newSettings = produce(settings, draft => {
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
                plotAddr={plotAddr}
              />
            </div>
          </Card>
        </TabSlideBar>

        <ToolbarFooterPortal className="shrink-0 grow-0 justify-end">
          <span>{getFormattedShape(sheet)}</span>
          <></>
          <>
            <ZoomSlider />
          </>
        </ToolbarFooterPortal>
      </BaseCol>
    </>
  )
}
