import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

//import { ZoomSlider } from "@/toolbar/zoom-slider"
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import { ClockRotateLeftIcon } from '@/icons/clock-rotate-left-icon'

import { useEffect, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import type { ITab } from '@/components/tabs/tab-provider'
import { TEXT_CANCEL } from '@/consts'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useMessages } from '@/providers/message-provider'

import { MESSAGE_CHANNEL } from '../../matcalc/data/data-panel'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  useFile,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'

export function DataPanel() {
  const file = useFile()
  const sheet = useSheet()
  const sheets = useSheets()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Clinical Tracks')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //'onco-data-panel')

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  const df = sheet as AnnotationDataFrame

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
    const hasHeader = !sheet.name.includes('GCT')
    const hasIndex = !sheet.name.includes('GCT')

    downloadDataFrame(df, {
      hasHeader,
      hasIndex,
      file: name,
      sep,
    })

    //setShowFileMenu(false)
  }

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === file?.id
    )

    for (const message of filteredMessages) {
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

      removeMessage(message.id)
    }
  }, [messages])

  const rightTabs: ITab[] = [
    {
      ////name: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  return (
    <>
      {showSave && (
        <SaveTxtDialog
          name="oncoplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string; format: ISaveAsFormat }
              save(d.name, d.format.ext)
            }

            setShowSave('')
          }}
        />
      )}

      <TabSlideBar
        id="onco-data-panel"
        side="right"
        tabs={rightTabs}
        onTabChange={selectedTab => setSelectedTab(selectedTab.tab.id)}
        value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          selectedSheet={sheet?.id ?? ''}
          dataFrames={sheets as AnnotationDataFrame[]}
          onTabChange={selectedTab => {
            setSelectedTab(selectedTab.tab.id)
          }}
          //className={DATA_PANEL_CLS}
        />
      </TabSlideBar>

      <ToolbarFooterPortal className="justify-end">
        <span>{getFormattedShape(df)}</span>
        <></>
        <>
          {/* <ZoomSlider
              scaleIndex={scaleIndex}
              onZoomChange={index => setScaleIndex(index)}
            /> */}
        </>
      </ToolbarFooterPortal>
    </>
  )
}
