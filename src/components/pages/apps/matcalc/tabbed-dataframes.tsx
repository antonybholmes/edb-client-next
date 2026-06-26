import { BottomBar } from '@/components/pages/apps/matcalc/bottom-bar'

import { IClassProps } from '@/interfaces/class-props'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { cn } from '@/lib/shadcn-utils'
import type { IFileDropProps } from '../../../file-drop-panel'
import { BaseCol } from '../../../layout/base-col'
import { VirtualDataFrame } from '../../../table/virtual-dataframe/virtual-dataframe'
import type { ITabMenu } from '../../../tabs/underline-tabs'
import { useCurrentSheets } from './history/history-provider/history-contexts'

export const DATAFRAME_TABS = 'dataframe-tabs'

const MAX_NAME_CHARS = 15

interface IProps extends IFileDropProps, ITabMenu, IClassProps {
  //groupId?: string
  //dataFrames: AnnotationDataFrame[]
  //selectedSheet?: UndefStr
  editable?: boolean
  allowReorder?: boolean
  zoom?: number | undefined
  // decimal places for formatting numbers in the table, -1 for auto
  dp?: number
  commas?: boolean
}

export function TabbedDataFrames({
  ///groupId = DATAFRAME_TABS,
  //selectedSheet,
  //dataFrames,
  editable = false,
  //onValueChange = () => {},
  //onTabChange = () => {},
  onFileDrop = undefined,
  menuActions = [],
  menuCallback = () => {},
  //onReorder = () => {},
  allowReorder = false,
  zoom = 1,
  dp = 4,
  commas = true,
  className,
  style,
}: IProps) {
  const { sheet } = useCurrentSheets()

  /* useEffect(() => {
    setSelectedSheet(dataFrames[0]!.id)
  }, []) */

  // useEffect(() => {
  //   const tabs: ITab[] = sheets.map((df, i) => {
  //     const sheetId = `Sheet ${i + 1}`
  //     const name = df.name !== '' ? df.name : sheetId

  //     return {
  //       id: df.id, //sheetId, //nanoid(),
  //       name,
  //       // component: () => (
  //       //   <VirtualDataFrame
  //       //     df={df}
  //       //     key={i}
  //       //     editable={editable}
  //       //     zoom={zoom}
  //       //     dp={dp}
  //       //     commas={commas}
  //       //   />
  //       // ),
  //     }
  //   })

  //   setTabs(tabs)
  // }, [dataFrames])

  // const df = useMemo(() => {
  //   const dfs = dataFrames.filter((df) => df.id === selectedTab?.id)

  //   return dfs.length > 0 ? dfs[0] : undefined
  // }, [selectedTab, dataFrames])

  // if (tabs.length === 0) {
  //   return null
  // }

  // transition between index based tabs and value selection
  // tables, possibly move to entirely name based tabs in the future
  return (
    <BaseCol className={cn('grow', className)} style={style}>
      <BaseCol className="grow" id="dataframe-container">
        {sheet && (
          <VirtualDataFrame
            df={sheet as AnnotationDataFrame}
            key={sheet.id}
            editable={editable}
            zoom={zoom}
            dp={dp}
            commas={commas}
          />
        )}
      </BaseCol>
      <BottomBar
        //groupId={groupId}
        maxNameLength={MAX_NAME_CHARS}
        //onValueChange={onValueChange}
        onFileDrop={onFileDrop}
        //style={style}
        menuActions={menuActions}
        menuCallback={menuCallback}
        allowReorder={allowReorder}
        //onReorder={onReorder}
      />
    </BaseCol>
  )
}
