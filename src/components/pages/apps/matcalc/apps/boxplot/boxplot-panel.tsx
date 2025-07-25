import { SlidersIcon } from '@icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { BaseCol } from '@layout/base-col'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import { useHistory, usePlot } from '../../history/history-store'

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
import { PLOT_CLS } from '../heatmap/heatmap-panel'
import { BoxPlotDataPanel } from './boxplot-data-panel'
import {
  BoxPlotSvg,
  DEFAULT_BOX_PLOT_DISPLAY_PROPS,
  type IBoxPlotDisplayOptions,
} from './boxplot-plot-svg'
import { BoxPlotPropsPanel } from './boxplot-props-panel'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

interface IPanelProps extends IDivProps {
  plotAddr: string
}

export function BoxPlotPanel({ ref, plotAddr }: IPanelProps) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)
  const { sheet, updateProps } = useHistory()

  const plot = usePlot(plotAddr)

  const displayOptions: IBoxPlotDisplayOptions =
    (plot?.customProps.displayOptions as IBoxPlotDisplayOptions) ??
    DEFAULT_BOX_PLOT_DISPLAY_PROPS

  const { messages, removeMessage } = useMessages() //'box-plot')

  const svgRef = useRef<SVGSVGElement>(null)

  const { zoom } = useZoom()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  // const [displayProps, setDisplayProps] = useState<IVolcanoProps>(() => {
  //   const xdata = getNumCol(df, findCol(df, x))

  //   const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

  //   const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  //   const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  //   return makeDefaultVolcanoProps(xlim, ylim)
  // })

  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const filteredMessages = messages.filter(m => m.target === plot?.id)

    for (const message of filteredMessages) {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `boxwhisker.${messageImageFileFormat(message)}`
          )
        } else {
          setShowDialog({ id: randId('save') })
        }
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    // plotsDispatch({
    //   type: 'update-display',
    //   id: plotId,
    //   displayOptions: { ...displayOptions, scale },
    // })

    updateProps(
      plotAddr,
      'displayOptions',
      produce(displayOptions, draft => {
        draft.page.scale = zoom
      })
    )
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Display',
      icon: <SlidersIcon />,

      content: <BoxPlotPropsPanel plotAddr={plotAddr} />,
    },
    {
      //id: nanoid(),
      id: 'Data',
      icon: <SlidersIcon />,

      content: <BoxPlotDataPanel plotAddr={plotAddr} />,
    },
  ]

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          name="boxplot"
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
          id="boxplot"
          side="right"
          tabs={plotRightTabs}
          //onValueChange={setSelectedTab}
          //value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card variant="content" className="mx-2 mb-2 grow">
            <div className={PLOT_CLS}>
              <BoxPlotSvg ref={svgRef} plotAddr={plotAddr} />
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
