import { OKCancelDialog } from '@dialog/ok-cancel-dialog'

import { TEXT_CANCEL, TEXT_CLEAR } from '@/consts'
import type { ISelectionRange } from '@providers/selection-range'
import { Checkbox } from '@themed/check-box'

import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { colMean, getColIdxFromGroup } from '@lib/dataframe/dataframe-utils'
import { argsort } from '@lib/math/argsort'
import { range } from '@lib/math/range'

import { VCenterRow } from '@layout/v-center-row'
import { Button } from '@themed/button'
import { Textarea } from '@themed/textarea'
import { useEffect } from 'react'

import { useHistory } from './history/history-store'
import { useMatcalcSettings } from './settings/matcalc-settings'

export interface IProps {
  open?: boolean
  selection: ISelectionRange
  onSort: (df: BaseDataFrame) => void
  onCancel: () => void
}

export function SortRowDialog({
  open = true,
  selection,
  onSort,
  onCancel,
}: IProps) {
  //const [withinGroups, setWithinGroups] = useState(false)
  //const [text, setText] = useState<string>("")
  const { settings, updateSettings } = useMatcalcSettings()
  const { sheet, addStep, groups } = useHistory()

  useEffect(() => {
    if (sheet && selection.start.row > -1) {
      updateSettings({
        ...settings,
        sortByRow: {
          ...settings.sortByRow,
          text: range(selection.start.row, selection.end.row + 1)
            .map(i => sheet.index.str(i))
            .join(', '),
        },
      })
    }
  }, [selection])

  function sortDataFrame() {
    if (!sheet) {
      onCancel()
      return
    }

    let idx: number[]
    let sortDf: BaseDataFrame

    const ids = settings.sortByRow.text
      .split(/[\r\n\t,;]+/)
      .map(x => x.trim())
      .filter(x => x.length > 0)

    if (settings.sortByRow.sortWithinGroups) {
      idx = groups
        .map(group => {
          // all indices for this group from full table
          const idx = getColIdxFromGroup(sheet, group)

          console.log(group, idx)

          // subset table
          sortDf = sheet.iloc(':', idx)

          console.log(sortDf.shape, 'blob')

          // get the row ids of the gene(s) of interest
          const rowIdx = ids.map(id => sortDf.index.find(id)).flat()

          // get col means
          sortDf = sortDf.iloc(rowIdx, ':')

          //console.log(sortDf.shape)

          const mean = colMean(sortDf)

          let sortedColIdx = argsort(mean)

          // need to map sortedcolidx back to original idx from full table
          sortedColIdx = sortedColIdx.map(i => idx[i]!)

          return sortedColIdx
        })
        .flat()

      // add missing indices that won't be sorted to the end
      const s = new Set(idx)
      const idx2 = range(sheet!.shape[1]).filter(i => !s.has(i))
      idx = idx.concat(idx2)

      const ret = sheet.iloc(':', idx)

      addStep('Sort by row', [ret])

      onSort(ret)
    } else {
      idx = ids.map(id => sheet.index.find(id)).flat()

      // get col means
      const sortDf = sheet.iloc(idx, ':')

      console.log(sortDf.shape, idx.length, 'blob')

      const mean = colMean(sortDf)

      idx = argsort(mean)
      const ret = sheet.iloc(':', idx)

      console.log(sortDf.shape, idx.length, 'blob2')

      addStep('Sort by row', [ret])

      onSort(ret)
    }
  }

  return (
    <OKCancelDialog
      open={open}
      title="Sort By Rows"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel()
        } else {
          sortDataFrame()
        }
      }}
      //contentVariant="glass"
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
      //bodyCls="gap-y-4"
    >
      <Textarea
        id="top-rows"
        value={settings.sortByRow.text}
        onChange={e =>
          updateSettings({
            ...settings,
            sortByRow: {
              ...settings.sortByRow,
              text: e.target.value,
            },
          })
        }
        className="h-32"
        placeholder="Row names to sort on..."
      />

      <VCenterRow className="gap-x-2 justify-between">
        <Checkbox
          checked={settings.sortByRow.sortWithinGroups}
          onCheckedChange={value => {
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
    </OKCancelDialog>
  )
}
