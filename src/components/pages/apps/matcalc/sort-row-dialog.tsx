import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { TEXT_CANCEL, TEXT_CLEAR, TEXT_OK } from '@/consts'
import type { ISelectionRange } from '@/providers/selection-range'
import { Checkbox } from '@/themed/v2/check-box'

import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { colMean, getColIdxFromGroup } from '@/lib/dataframe/dataframe-utils'
import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'

import { VCenterRow } from '@/layout/v-center-row'
import { Textarea } from '@/themed/textarea'
import { Button } from '@/themed/v2/button'
import { useEffect } from 'react'

import {
  useCurrentGroups,
  useCurrentSheets,
} from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'
import { useMatcalcSettings } from './settings/matcalc-settings'

export interface IProps extends IModalProps<BaseDataFrame> {
  open?: boolean
  selection: ISelectionRange
}

export function SortRowDialog({ open = true, selection, onResponse }: IProps) {
  //const [withinGroups, setWithinGroups] = useState(false)
  //const [text, setText] = useState<string>("")
  const { settings, updateSettings } = useMatcalcSettings()
  const { addSheets } = useHistory()
  const { sheet } = useCurrentSheets()
  const { groups } = useCurrentGroups()

  const df = sheet as BaseDataFrame

  useEffect(() => {
    if (sheet && selection.rows && selection.rows.start > -1) {
      updateSettings({
        ...settings,
        sortByRow: {
          ...settings.sortByRow,
          text: range(selection.rows.start, selection.rows.end + 1)
            .map((i) => df.index.str(i))
            .join(', '),
        },
      })
    }
  }, [selection])

  function sortDataFrame() {
    if (!sheet) {
      onResponse?.(TEXT_CANCEL, undefined)
      return
    }

    let idx: number[]
    let sortDf: BaseDataFrame

    const ids = settings.sortByRow.text
      .split(/[\r\n\t,;]+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0)

    if (settings.sortByRow.sortWithinGroups) {
      idx = groups
        .map((group) => {
          // all indices for this group from full table
          const idx = getColIdxFromGroup(df, group)

          console.log(group, idx)

          // subset table
          sortDf = df.iloc({ cols: idx }) as BaseDataFrame

          // get the row ids of the gene(s) of interest
          const rowIdx = ids.map((id) => sortDf.index.find(id)).flat()

          sortDf = sortDf.iloc({ rows: rowIdx }) as BaseDataFrame

          // get col means
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

      const ret = df.iloc({ cols: idx }) as BaseDataFrame

      addSheets([ret], { name: 'Sort by row (within groups)' })

      onResponse?.(TEXT_OK, ret)
    } else {
      idx = ids.map((id) => df.index.find(id)).flat()

      // get col means
      const sortDf = df.iloc({ rows: idx }) as BaseDataFrame

      console.log(sortDf.shape, idx.length, 'blob')

      const mean = colMean(sortDf)

      idx = argsort(mean)
      const ret = df.iloc({ cols: idx }) as BaseDataFrame

      console.log(sortDf.shape, idx.length, 'blob2')

      addSheets([ret], { name: 'Sort by row' })

      onResponse?.(TEXT_OK, ret)
    }
  }

  return (
    <OKCancelDialog
      open={open}
      title="Sort By Rows"
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(TEXT_CANCEL, undefined)
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
        onChange={(e) =>
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
          //size="sm"
          // ripple={false}
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
