import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

import { useEffect, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'

import { TEXT_CANCEL } from '@/consts'
import type { ISaveAsFileType } from '@/dialogs/save-as-dialog'
import { SaveTxtDialog } from '@/dialogs/save-txt-dialog'
import { useMessages } from '@/providers/message-provider'

import { useSideTabs } from '@/components/tabs/tab-provider'
import { useFooter } from '@/providers/footer-provider'
import { MESSAGE_CHANNEL } from '../../matcalc/data/data-panel'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useSave } from '../../matcalc/hooks/save'

export function DataPanel() {
  // the current file, sheet and all sheets from the history context
  const { file } = useFiles()
  const { sheets } = useCurrentSheets()
  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  //const [selectedTab, setSelectedTab] = useState('Clinical Tracks')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const { messages, removeMessages } = useMessages(MESSAGE_CHANNEL) //'onco-data-panel')

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  const { setTabs: setSideTabs } = useSideTabs()

  const { save } = useSave()

  const { addDFSize } = useFooter()

  useEffect(() => {
    addDFSize()
  }, [addDFSize])

  useEffect(() => {
    setSideTabs([
      {
        id: 'History',
        component: HistoryPanel,
      },
    ])
  }, [])

  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.target === file?.id
    )

    for (const message of filteredMessages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save')) {
          let format = 'txt'

          if (message.data.includes(':')) {
            format = message.data.split(':')[1]!
          }

          setShowSave(format)
        }

        if (message.data.includes('show-sidebar')) {
          setShowSideBar(!showSideBar)
        }
      }
    }

    // bulk remove messages after processing
    removeMessages(messages.map((m) => m.id))
  }, [messages])

  return (
    <>
      {showSave && (
        <SaveTxtDialog
          name="oncoplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string; format: ISaveAsFileType }
              save(d.name, d.format.ext)
            }

            setShowSave('')
          }}
        />
      )}

      <TabSlideBar
        side="right"
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
        //selectedSheet={sheet?.id ?? ''}
        //dataFrames=sheets as AnnotationDataFrame[]}
        />
      </TabSlideBar>

      {/* <FooterPortal className="justify-end">
        <span>{getFormattedShape(df)}</span>
      </FooterPortal> */}
    </>
  )
}
