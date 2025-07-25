import { BottomBar } from '@toolbar/bottom-bar'

import { type ITab, type ITabChange } from '@components/tabs/tab-provider'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { cn } from '@lib/shadcn-utils'
import type { TabsProps } from '@radix-ui/react-tabs'
import { useState } from 'react'
import type { IFileDropProps } from '../file-drop-panel'
import type { ITabReorder } from '../tabs/reorder-tabs'
import type { ITabMenu } from '../tabs/underline-tabs'
import { VirtualizedDataFrame } from './virtualized-dataframe'

const MAX_NAME_CHARS = 15

interface IProps
  extends TabsProps,
    ITabChange,
    IFileDropProps,
    ITabMenu,
    ITabReorder {
  dataFrames: AnnotationDataFrame[]
  selectedSheet?: string | undefined
  editable?: boolean
  allowReorder?: boolean
  zoom?: number | undefined
}

export function TabbedDataFrames({
  selectedSheet,
  dataFrames,
  editable = false,
  onValueChange = () => {},
  onTabChange = () => {},
  onFileDrop = undefined,
  menuActions = [],
  menuCallback = () => {},
  onReorder = () => {},
  allowReorder = false,
  zoom,
  className,
  style,
}: IProps) {
  const [_selectedSheet, setSelectedSheet] = useState(
    dataFrames && dataFrames.length > 0 ? dataFrames[0]!.id : ''
  )

  /* useEffect(() => {
    setSelectedSheet(dataFrames[0]!.id)
  }, []) */

  const tabs: ITab[] = dataFrames.map((df, i) => {
    const sheetId = `Sheet ${i + 1}`
    const name = df.name !== '' ? df.name : sheetId

    return {
      id: df.id, //sheetId, //nanoid(),
      name,
      content: (
        // <DataFrameCanvas
        //   df={df}
        //   key={i}
        //   scale={scale}
        //   editable={editable}
        //   className={contentClassName}
        // />

        <VirtualizedDataFrame df={df} key={i} editable={editable} zoom={zoom} />
      ),
      //content: <LazyGlideUI df={df} key={i} scale={scale} />,
    }
  })

  if (tabs.length === 0) {
    return null
  }

  const sheet = selectedSheet ? selectedSheet : _selectedSheet

  // transition between index based tabs and value selection
  // tables, possibly move to entirely name based tabs in the future
  return (
    <BottomBar
      value={sheet}
      tabs={tabs}
      maxNameLength={MAX_NAME_CHARS}
      onValueChange={onValueChange}
      onTabChange={selectedTab => {
        // historyDispatch({
        //   type: 'goto-sheet',
        //   sheetId: selectedTab.index,
        // })

        setSelectedSheet(selectedTab.tab.id)

        onTabChange?.(selectedTab)
      }}
      onFileDrop={onFileDrop}
      className={cn('gap-y-0.5', className)}
      style={style}
      menuActions={menuActions}
      menuCallback={menuCallback}
      allowReorder={allowReorder}
      onReorder={onReorder}
    />
  )
}
