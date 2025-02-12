import { BottomBar } from '@components/toolbar/bottom-bar'

import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { type ITab, type ITabChange } from '@components/tab-provider'
import { cn } from '@lib/class-names'
import type { TabsProps } from '@radix-ui/react-tabs'
import { forwardRef, useEffect, useState, type ForwardedRef } from 'react'
import type { IFileDropProps } from '../file-drop-panel'
import type { ITabReorder } from '../toolbar/reorder-tabs'
import type { ITabMenu } from '../toolbar/underline-tabs'
import { DataFrameCanvas } from './dataframe-canvas'

const MAX_NAME_CHARS = 15

interface IProps
  extends TabsProps,
    ITabChange,
    IFileDropProps,
    ITabMenu,
    ITabReorder {
  dataFrames: BaseDataFrame[]
  selectedSheet?: string
  scale?: number
  editable?: boolean
  contentClassName?: string
  allowReorder?: boolean
}

export const TabbedDataFrames = forwardRef(function TabbedDataFrames(
  {
    selectedSheet,
    dataFrames,
    scale = 1,
    editable = false,
    onValueChange = () => {},
    onTabChange = () => {},
    onFileDrop = undefined,

    menuActions = [],
    menuCallback = () => {},
    onReorder = () => {},
    allowReorder = false,
    contentClassName,
    className,
    style,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [_selectedSheet, setSelectedSheet] = useState('')

  useEffect(() => {
    setSelectedSheet(dataFrames[0]!.id)
  }, [])

  const tabs: ITab[] = dataFrames.map((df, i) => {
    const sheetId = `Sheet ${i + 1}`
    const name = df.name !== '' ? df.name : sheetId

    return {
      id: df.id, //sheetId, //nanoid(),
      name,
      content: (
        <DataFrameCanvas
          df={df}
          key={i}
          scale={scale}
          editable={editable}
          className={contentClassName}
        />
      ),
      //content: <LazyGlideUI df={df} key={i} scale={scale} />,
    }
  })

  if (tabs.length === 0) {
    return null
  }

  const sheet = selectedSheet !== undefined ? selectedSheet : _selectedSheet

  //const value = tabs[sheet ?? 0]!.id

  // transition between index based tabs and value selection
  // tables, possibly move to entirely name based tabs in the future
  return (
    <BottomBar
      ref={ref}
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

    // <Tabs
    //   selected={selectedTab}
    //   onTabChange={(tab: number) => setSelectedTab(tab)}
    //   className="grow flex flex-col"
    // >
    //   <TabPanels className="grow flex flex-col">
    //     {dataFrames.map((df, i) => (
    //       <TabPanel className="grow flex flex-col" key={i}>
    //         <DataFrameSimpleCanvasUI df={df} key={i} />
    //       </TabPanel>
    //     ))}
    //   </TabPanels>
    //   {dataFrames.length > 0 && (
    //     <VCenterRow>
    //       <ToolbarButton
    //         className="w-6 h-6 items-center justify-center"
    //         onClick={() => setSelectedTab(Math.max(0, selectedTab - 1))}
    //       >
    //         <ChevronLeftIcon />
    //       </ToolbarButton>
    //       <ToolbarButton
    //         className="w-6 h-6 items-center justify-center"
    //         onClick={() =>
    //           setSelectedTab(Math.min(dataFrames.length - 1, selectedTab + 1))
    //         }
    //       >
    //         <ChevronRightIcon />
    //       </ToolbarButton>
    //       <TabList className="flex flex-row px-1">
    //         {dataFrames
    //           .filter(df => df.name !== "")
    //           .map((df, i) => (
    //             <ToolbarTab key={i}>{df.name}</ToolbarTab>
    //           ))}
    //       </TabList>
    //     </VCenterRow>
    //   )}
    // </Tabs>
  )
})
