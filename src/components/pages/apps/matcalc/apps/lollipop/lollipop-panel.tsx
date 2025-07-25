import { SlidersIcon } from '@icons/sliders-icon'

import { useContext, useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { type ITab } from '@components/tabs/tab-provider'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'

import { NO_DIALOG, TEXT_CANCEL, type IDialogParams } from '@/consts'
import { Card } from '@themed/card'

import { SaveImageDialog } from '@components/pages/save-image-dialog'

import { LayersIcon } from '@/components/icons/layers-icon'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { randId } from '@lib/utils'
import { produce } from 'immer'
import { DatabasPropsPanel } from '../../../lollipop/database-props-panel'
import { FeaturePropsPanel } from '../../../lollipop/feature-props-panel'
import { LabelPropsPanel } from '../../../lollipop/label-props-panel'
import { LollipopPropsPanel } from '../../../lollipop/lollipop-props-panel'
import {
  LollipopContext,
  LollipopProvider,
} from '../../../lollipop/lollipop-provider'
import { useLollipopSettings } from '../../../lollipop/lollipop-settings-store'
import { LollipopStackSvg } from '../../../lollipop/lollipop-stack-svg'

import { usePlot } from '../../history/history-store'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

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

  const [selectedTab, setSelectedTab] = useState('Display')
  const svgRef = useRef<SVGSVGElement>(null)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { messages, removeMessage } = useMessages() //'heatmap')

  const { settings, updateSettings } = useMatcalcSettings()

  //const { plotState, plotDispatch } = useContext(PlotContext)

  const { protein, aaStats, lollipopFromTable } = useContext(LollipopContext)!

  const { displayProps, setDisplayProps } = useLollipopSettings()

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
    const df = plot.dataframes['main']! as BaseDataFrame

    lollipopFromTable(df, protein)
  }, [])

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
      content: <DatabasPropsPanel />,
    },
    {
      //id: nanoid(),
      icon: <LayersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
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
        id="lollipop-data-panel"
        side="right"
        tabs={rightTabs}
        onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        value={selectedTab}
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
          <ZoomSlider
            onZoomChange={zoom => {
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.scale = zoom
                })
              )
            }}
          />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

export function LollipopPanelQuery({ id, plotAddr }: ILollipopPanelProps) {
  return (
    <LollipopProvider id={id}>
      <LollipopPanel id={id} plotAddr={plotAddr} />
    </LollipopProvider>
  )
}
