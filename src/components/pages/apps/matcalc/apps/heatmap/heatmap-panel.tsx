import { SlidersIcon } from '@icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { HeatmapPropsPanel } from './heatmap-props-panel'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { type ITab } from '@components/tabs/tab-provider'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DISPLAY,
  type IDialogParams,
} from '@/consts'
import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@components/plot/heatmap/heatmap-svg-props'
import { Card } from '@themed/card'

import { SaveImageDialog } from '@components/pages/save-image-dialog'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import type { IClusterFrame } from '@lib/math/hcluster'
import { randId } from '@lib/utils'
import { produce } from 'immer'
import { useHistory, usePlot } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { HeatMapSvg } from './heatmap-svg'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

// export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
//   return {
//     ...DEFAULT_HEATMAP_PROPS,
//     mode: style.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
//   }
// }

interface IHeatmapPanelProps {
  //plotId: string
  plotAddr: string
}

export function HeatmapPanel({ plotAddr }: IHeatmapPanelProps) {
  const { zoom } = useZoom()

  const { updateProps } = useHistory()
  const plot = usePlot(plotAddr)!
  const cf = plot.dataframes['main']! as IClusterFrame

  const displayOptions: IHeatMapDisplayOptions =
    (plot?.customProps.displayOptions as IHeatMapDisplayOptions) ??
    DEFAULT_HEATMAP_PROPS

  const { settings, updateSettings } = useMatcalcSettings()

  const svgRef = useRef<SVGSVGElement>(null)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { messages, removeMessage } = useMessages() //'heatmap')

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === plot?.id
    )

    for (const message of filteredMessages) {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
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
    const newOptions = produce(displayOptions, draft => {
      draft.zoom = zoom
    })

    updateProps(plotAddr, 'displayOptions', newOptions)
  }, [zoom])

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

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="heatmap"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {/* <ResizablePanelGroup
          direction="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize={75}
            minSize={50}
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
            defaultSize={25}
            minSize={15}
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        id="heatmap-panel"
        tabs={plotRightTabs}
        side="right"
        //tabs={plotRightTabs}
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
          <ZoomSlider />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

// export function HeatmapPanelQuery({ plotAddr }: IHeatMapPanelProps) {
//   return <HeatMapPanel plotAddr={plotAddr} />
// }
