import { SlidersIcon } from '@/icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { type ITab } from '@/components/tabs/tab-provider'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { NO_DIALOG, TEXT_CANCEL, type IDialogParams } from '@/consts'
import { Card } from '@/themed/card'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'

import { LayersIcon } from '@/components/icons/layers-icon'
import { randId } from '@/lib/id'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { produce } from 'immer'

import { useZoom } from '@/providers/zoom-provider'

import { DomainPropsPanel } from '../../../wgs/lollipop/domain-props-panel'
import { LabelPropsPanel } from '../../../wgs/lollipop/label-props-panel'
import { LollipopPropsPanel } from '../../../wgs/lollipop/lollipop-props-panel'
import { useLollipopSettings } from '../../../wgs/lollipop/lollipop-settings-store'
import { LollipopStackSvg } from '../../../wgs/lollipop/lollipop-stack-svg'
import { useLollipopStore } from '../../../wgs/lollipop/lollipop-store'
import { VariantPropsPanel } from '../../../wgs/lollipop/variant-props-panel'
import { MESSAGE_CHANNEL, OPTS_SIDEBAR_ID } from '../../data/data-panel'
import { usePlot } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { PLOT_ZOOM_CHANNEL } from '../heatmap/heatmap-panel'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

// export function makeDefaultHeatmapProps(style: string): IHeatMapDisplayOptions {
//   return {
//     ...DEFAULT_HEATMAP_PROPS,
//     mode: style.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
//   }
// }

interface ILollipopPanelProps {
  id: string
  plotAddr: string
}

function LollipopPanel({ plotAddr }: ILollipopPanelProps) {
  const plot = usePlot(plotAddr)!

  //const [selectedTab, setSelectedTab] = useState('Display')
  const svgRef = useRef<SVGSVGElement>(null)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'heatmap')

  const { settings, updateSettings } = useMatcalcSettings()

  //const { plotState, plotDispatch } = useContext(PlotContext)

  const { aaStats } = useLollipopStore()

  const { displayProps, setDisplayProps } = useLollipopSettings()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === plot?.id
    )

    for (const message of filteredMessages) {
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
    setDisplayProps(
      produce(displayProps, draft => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  // useEffect(() => {
  //   const df = plot.dataframes['main']! as BaseDataFrame

  //   lollipopFromTable(df, protein)
  // }, [])

  const rightTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   icon: <LayersIcon />,
    //   id: 'Protein',
    //   content: <ProteinPropsPanel />,
    // },
    {
      //id: nanoid(),
      icon: <SlidersIcon />,
      id: 'Display',
      content: <LollipopPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Databases',
      content: <VariantPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Features',
      content: <DomainPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Labels',
      content: <LabelPropsPanel />,
    },
    // {
    //   //id: nanoid(),
    //   icon: <ClockRotateLeftIcon />,
    //   id: 'History',
    //   content: <HistoryPanel branchId={branch?.id ?? ''} />,
    // },
  ]

  return (
    <>
      {showDialog.id.startsWith('save') && (
        <SaveImageDialog
          open={showDialog.id.startsWith('save')}
          name="lollipop"
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
        side="right"
        tabs={rightTabs}
        //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        //value={selectedTab}
        open={settings.sidebar.show}
        onOpenChange={v => {
          const newSettings = produce(settings, draft => {
            draft.sidebar.show = v
          })

          updateSettings(newSettings)
        }}
      >
        <Card variant="content" className=" grow">
          {aaStats.length > 0 && (
            <div className={PLOT_CLS}>
              <LollipopStackSvg ref={svgRef} />
            </div>
          )}
        </Card>
      </TabSlideBar>

      <ToolbarFooterPortal className="shrink-0 grow-0 ">
        <></>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

export function LollipopPanelQuery({ id, plotAddr }: ILollipopPanelProps) {
  return <LollipopPanel id={id} plotAddr={plotAddr} />
}
