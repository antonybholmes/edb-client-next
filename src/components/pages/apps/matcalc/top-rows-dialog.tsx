import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  meanFilter,
  medianFilter,
  stdevFilter,
} from '@/lib/dataframe/dataframe-utils'
import { Input } from '@/themed/v2/input'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { useState } from 'react'
import { useHistory, useSheet } from './history/history-store'

export interface IProps {
  open?: boolean
  //df: BaseDataFrame | null
  onFilter: (df: BaseDataFrame) => void
  onCancel: () => void
}

export function TopRowsDialog({
  open = true,
  //df,
  onFilter,
  onCancel,
}: IProps) {
  const [topRows, setTopRows] = useState(300)
  const [method, setMethod] = useState('Stdev')
  const { addSheets } = useHistory()
  const sheet = useSheet()!

  let df = sheet as BaseDataFrame

  function applyFilter() {
    if (!df) {
      onCancel()
      return
    }

    switch (method) {
      case 'Mean':
        //mean
        //dfMean(df, historyDispatch)

        df = meanFilter(df, topRows)

        break
      case 'Median':
        //dfMedian(df, historyDispatch)

        df = df = medianFilter(df, topRows)
        break
      default:
        // stdev
        //dfStdev(df, historyDispatch)

        df = stdevFilter(df, topRows)
        break
    }

    if (!df) {
      onCancel()
      return
    }

    addSheets([df], { name: 'Top Rows' })

    onFilter(df)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Top Rows"
      onResponse={r => {
        if (r === TEXT_OK) {
          applyFilter()
        } else {
          onCancel()
        }
      }}
      //contentVariant="glass"
      //headerVariant="opaque"
      //bodyVariant="opaque"
    >
      <VCenterRow className="gap-x-2">
        <span>Keep top</span>
        <Input
          id="top-rows"
          value={topRows}
          onChange={e => setTopRows(Number.parseInt(e.target.value))}
          w="md"
          placeholder="Top rows..."
        />
        <span>rows using row</span>
        <SelectList
          value={method}
          onValueChange={v => {
            if (v) {
              setMethod(v as string)
            }
          }}
        >
          <SelectItem value="Stdev">Stdev</SelectItem>
          <SelectItem value="Mean">Mean</SelectItem>
          <SelectItem value="Median">Median</SelectItem>
        </SelectList>
      </VCenterRow>
    </OKCancelDialog>
  )
}
