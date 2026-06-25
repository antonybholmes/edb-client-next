import { useEffect, useRef } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Card } from '@/themed/card'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { produce } from 'immer'

import { useZoom } from '@/providers/zoom'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DomainPropsPanel } from '../../../wgs/lollipop/domain-props-panel'
import { LabelPropsPanel } from '../../../wgs/lollipop/label-props-panel'
import { LollipopPropsPanel } from '../../../wgs/lollipop/lollipop-props-panel'
import { useLollipopSettings } from '../../../wgs/lollipop/lollipop-settings-store'
import { LollipopStackSvg } from '../../../wgs/lollipop/lollipop-stack-svg'
import { useLollipopStore } from '../../../wgs/lollipop/lollipop-store'
import { VariantPropsPanel } from '../../../wgs/lollipop/variant-props-panel'
import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-store'
import { getPlot } from '../../history/history-provider/history-hooks'
import { useHistory } from '../../history/history-provider/history-provider'
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
  const { present, plots } = useHistory()
  const plot = getPlot(present, plots, plotAddr)!

  //const [selectedTab, setSelectedTab] = useState('Display')
  const svgRef = useRef<SVGSVGElement>(null)

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'heatmap')

  const { settings, updateSettings } = useMatcalcSettings()

  //const { plotState, plotDispatch } = useContext(PlotContext)

  const { aaStats } = useLollipopStore()

  const { displayProps, setDisplayProps } = useLollipopSettings()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const { open: openDialog } = useDialogs()

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.target === plot?.id
    )

    for (const message of filteredMessages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `heatmap.${messageImageFileFormat(message)}`
          )
        } else {
          openDialog({
            type: 'save-image',
            payload: { svgRef, name: `lollipop` },
          })
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    setDisplayProps(
      produce(displayProps, (draft) => {
        draft.scale = zoom
      })
    )
  }, [zoom])

  // useEffect(() => {
  //   const df = plot.dataframes['main']! as BaseDataFrame

  //   lollipopFromTable(df, protein)
  // }, [])

  useEffect(() => {
    setSideTabs([
      // {
      //   //id: nanoid(),
      //   icon: <LayersIcon />,
      //   id: 'Protein',
      //   content: ()=> <ProteinPropsPanel />,
      // },
      {
        id: 'Display',
        component: LollipopPropsPanel,
      },
      {
        id: 'Databases',
        component: VariantPropsPanel,
      },
      {
        id: 'Features',
        component: DomainPropsPanel,
      },
      {
        id: 'Labels',
        component: LabelPropsPanel,
      },
      // {
      //   //id: nanoid(),
      //   icon: <ClockRotateLeftIcon />,
      //   id: 'History',
      //   content: ()=> <HistoryPanel branchId={branch?.id ?? ''} />,
      // },
    ])
  }, [setSideTabs])

  return (
    <>
      <TabSlideBar
        side="right"
        //onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        //value={selectedTab}
        open={settings.sidebar.show}
        onOpenChange={(v) => {
          const newSettings = produce(settings, (draft) => {
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

      <FooterPortal className="shrink-0 grow-0 ">
        <></>
        <></>
        <>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </>
      </FooterPortal>
    </>
  )
}

export function LollipopPanelQuery({ id, plotAddr }: ILollipopPanelProps) {
  return <LollipopPanel id={id} plotAddr={plotAddr} />
}
