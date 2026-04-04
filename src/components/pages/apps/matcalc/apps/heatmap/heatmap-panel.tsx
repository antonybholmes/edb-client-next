import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@/components/tabs/tab-provider'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DISPLAY,
  type IDialogParams,
} from '@/consts'
import { Card } from '@/themed/card'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'

import { randId } from '@/lib/id'
import type { IClusterFrame } from '@/lib/math/hcluster'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { MESSAGE_CHANNEL, OPTS_SIDEBAR_ID } from '../../data/data-panel'
import {
  useHistory,
  usePlot,
  type HeatMapPlot,
} from '../../history/history-store'
import { HeatmapPropsPanel } from './heatmap-props-panel'
import { HeatMapSvg } from './heatmap-svg'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

// export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
//   return {
//     ...DEFAULT_HEATMAP_PROPS,
//     mode: style.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
//   }
// }

export const PLOT_ZOOM_CHANNEL = 'matcalc-plot'

interface IHeatmapPanelProps {
  //plotId: string
  plotAddr: string
}

export function HeatmapPanel({ plotAddr }: IHeatmapPanelProps) {
  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { updatePlot } = useHistory()
  console.log('Rendering HeatmapPanel with { file: plotAddr }', {
    file: plotAddr,
  })
  const plot = usePlot(plotAddr)! as HeatMapPlot
  const cf = plot?.dataframes['main'] as IClusterFrame

  //const { settings, updateSettings } = useMatcalcSettings()

  const svgRef = useRef<SVGSVGElement>(null)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'heatmap')

  useEffect(() => {
    // const filteredMessages = messages.filter(
    //   message => message.target === plot?.id
    // )

    for (const message of messages) {
      if (message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `heatmap.${messageImageFileFormat(message)}`
          )
        } else {
          setShowDialog({ id: randId('save') })
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
      produce(plot, draft => {
        draft.props.zoom = zoom
      }),
      { file: plotAddr }
    )
  }, [plot, zoom])

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: (
        <HeatmapPropsPanel
          plotAddr={plotAddr}
          //cf={plot?.customProps.cf as IClusterFrame}
        />
      ),
    },
  ]

  // const svg = useMemo(
  //   () => (
  //     <Card variant="content" className="mx-2 mb-2 grow">
  //       <div className={PLOT_CLS}>
  //         <HeatMapSvg ref={svgRef}  />
  //       </div>
  //     </Card>
  //   ),
  //   [plot, groupState.groups, displayOptions]
  // )

  if (!plot || !cf) {
    return null
  }

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="heatmap"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {/* <ResizablePanelGroup
          orientation="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize="75%"
            minSize="50%"
            className="flex flex-col pl-2 pt-2 pb-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <HeatMapSvg
                ref={svgRef}
                cf={plot.cf}
                groups={groups}
                displayProps={displayProps}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="plot-svg-right"
            order={2}
            className="flex flex-col"
            defaultSize="25%"
            minSize="15%"
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        id={OPTS_SIDEBAR_ID}
        tabs={plotRightTabs}
        side="right"
        //tabs={plotRightTabs}
        //onValueChange={setSelectedTab}
        //value={selectedTab}
        // open={settings.sidebar.show}
        // onOpenChange={v => {
        //   const newSettings = produce(settings, draft => {
        //     draft.sidebar.show = v
        //   })

        //   updateSettings(newSettings)
        // }}
      >
        {/* {svg} */}

        <Card variant="content" className="mx-2 mb-2 grow">
          <div className={PLOT_CLS}>
            <HeatMapSvg ref={svgRef} plotAddr={plotAddr} />
          </div>
        </Card>
      </TabSlideBar>

      <ToolbarFooterPortal className="shrink-0 grow-0 ">
        <span>{getFormattedShape(cf.df)} </span>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

// export function HeatmapPanelQuery({ { file: plotAddr } }: IHeatMapPanelProps) {
//   return <HeatMapPanel { file: plotAddr }={{ file: plotAddr }} />
// }
