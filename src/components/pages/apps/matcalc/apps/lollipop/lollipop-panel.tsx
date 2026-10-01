import { useEffect } from 'react'

import { TabSlideBar } from '@/components/sidebar/tab-slide-bar'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Card } from '@/themed/card'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { produce } from 'immer'

import { MESSAGE_CHANNEL } from '../../data/data-panel'

import { useSideTabs } from '@/components/tabs/tab-provider'
//import { getPlot } from '../../history/history-provider/history-hooks'
import { useSVG } from '@/providers/svg-provider'
import { DomainPropsPanel } from '../../../ngs/wgs/lollipop/domain-props-panel'
import { LabelPropsPanel } from '../../../ngs/wgs/lollipop/label-props-panel'
import { LollipopDisplayPropsPanel } from '../../../ngs/wgs/lollipop/lollipop-display-props-panel'

import { useLollipopStore } from '../../../ngs/wgs/lollipop/lollipop-store'
import { LollipopStackSvg } from '../../../ngs/wgs/lollipop/svg/lollipop-stack-svg'
import { VariantPropsPanel } from '../../../ngs/wgs/lollipop/variant-props-panel'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

export const PLOT_CLS = 'relative overflow-scroll custom-scrollbar grow'

function LollipopPanel() {
  //const [selectedTab, setSelectedTab] = useState('Display')

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'heatmap')

  const { settings, updateSettings } = useMatcalcSettings()

  const { autoSave, saveAs } = useSVG()

  const { aaStats } = useLollipopStore()

  const { setTabs: setSideTabs } = useSideTabs()

  useEffect(() => {
    for (const message of messages) {
      if (typeof message.data === 'string' && message.data.includes('save')) {
        if (message.data.includes(':')) {
          autoSave(`heatmap.${messageImageFileFormat(message)}`)
        } else {
          saveAs('lollipop')
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

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
        component: LollipopDisplayPropsPanel,
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
              <LollipopStackSvg />
            </div>
          )}
        </Card>
      </TabSlideBar>

      <FooterPortal className="shrink-0 grow-0 ">
        <></>
        <></>
        <>
          <ZoomSlider />
        </>
      </FooterPortal>
    </>
  )
}

export function LollipopPanelQuery() {
  return <LollipopPanel />
}
