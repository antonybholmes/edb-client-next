import { BaseCol } from '@/components/layout/base-col'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { TEXT_CANCEL, TEXT_CLEAR } from '@/consts'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import type { ISelectionRange } from '@components/table/use-selection-range'

import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { colMean, getColIdxFromGroup } from '@lib/dataframe/dataframe-utils'
import { argsort } from '@lib/math/argsort'
import { range } from '@lib/math/range'
import { HistoryContext } from '@providers/history-provider'

import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@components/shadcn/ui/themed/button'
import { useContext, useEffect } from 'react'
import { GroupsContext } from './groups-provider'
import { MatcalcSettingsContext } from './matcalc-settings-provider'

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null

  selection: ISelectionRange
  onSort: (df: BaseDataFrame) => void
  onCancel: () => void
}

export function SortRowDialog({
  open = true,
  df,

  selection,
  onSort,
  onCancel,
}: IProps) {
  //const [withinGroups, setWithinGroups] = useState(false)
  //const [text, setText] = useState<string>("")
  const { settings, updateSettings } = useContext(MatcalcSettingsContext)
  const { historyDispatch } = useContext(HistoryContext)
  const { groupState } = useContext(GroupsContext)

  useEffect(() => {
    if (df && selection.start.row > -1) {
      updateSettings({
        ...settings,
        sortByRow: {
          ...settings.sortByRow,
          text: range(selection.start.row, selection.end.row + 1)
            .map((i) => df.index.getName(i))
            .join(', '),
        },
      })
    }
  }, [selection])

  function sortDataFrame() {
    if (!df) {
      onCancel()
      return
    }

    let idx: number[]
    let sortDf: BaseDataFrame

    const ids = settings.sortByRow.text
      .split(/[\r\n\t,;]+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0)

    if (settings.sortByRow.sortWithinGroups) {
      idx = groupState.order
        .map((i) => groupState.groups.get(i)!)
        .map((group) => {
          // all indices for this group from full table
          const idx = getColIdxFromGroup(df, group)

          console.log(group, idx)

          // subset table
          sortDf = df.iloc(':', idx)

          console.log(sortDf.shape, 'blob')

          // get the row ids of the gene(s) of interest
          let rowIdx = ids.map((id) => sortDf.index.find(id)).flat()

          // get col means
          sortDf = sortDf.iloc(rowIdx, ':')

          //console.log(sortDf.shape)

          const mean = colMean(sortDf)

          let sortedColIdx = argsort(mean)

          // need to map sortedcolidx back to original idx from full table
          sortedColIdx = sortedColIdx.map((i) => idx[i]!)

          return sortedColIdx
        })
        .flat()

      // add missing indices that won't be sorted to the end
      const s = new Set(idx)
      const idx2 = range(df!.shape[1]).filter((i) => !s.has(i))
      idx = idx.concat(idx2)

      const ret = df.iloc(':', idx)

      historyDispatch({
        type: 'add-step',
        description: 'Sort by row',
        sheets: [ret],
      })

      onSort(ret)
    } else {
      idx = ids.map((id) => df.index.find(id)).flat()

      // get col means
      const sortDf = df.iloc(idx, ':')

      console.log(sortDf.shape, idx.length, 'blob')

      const mean = colMean(sortDf)

      idx = argsort(mean)
      const ret = df.iloc(':', idx)

      console.log(sortDf.shape, idx.length, 'blob2')

      historyDispatch({
        type: 'add-step',
        description: 'Sort by row',
        sheets: [ret],
      })

      onSort(ret)
    }
  }

  return (
    <OKCancelDialog
      open={open}
      title="Sort By Rows"
      onReponse={(r) => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          sortDataFrame()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <BaseCol className="gap-y-4 text-sm">
        <Textarea3
          id="top-rows"
          value={settings.sortByRow.text}
          onChange={(e) =>
            updateSettings({
              ...settings,
              sortByRow: {
                ...settings.sortByRow,
                text: e.target.value,
              },
            })
          }
          className="h-24"
          placeholder="Row names to sort on..."
        />

        <VCenterRow className="gap-x-2 justify-between">
          <Checkbox
            checked={settings.sortByRow.sortWithinGroups}
            onCheckedChange={(value) => {
              updateSettings({
                ...settings,
                sortByRow: { ...settings.sortByRow, sortWithinGroups: value },
              })
            }}
          >
            Sort within groups
          </Checkbox>

          <Button
            variant="link"
            size="sm"
            pad="none"
            ripple={false}
            onClick={() =>
              updateSettings({
                ...settings,
                sortByRow: {
                  ...settings.sortByRow,
                  text: '',
                },
              })
            }
          >
            {TEXT_CLEAR}
          </Button>
        </VCenterRow>
      </BaseCol>
    </OKCancelDialog>
  )
}
