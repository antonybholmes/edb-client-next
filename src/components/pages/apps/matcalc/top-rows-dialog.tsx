import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { VCenterRow } from '@layout/v-center-row'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  meanFilter,
  medianFilter,
  stdevFilter,
} from '@lib/dataframe/dataframe-utils'
import { Input } from '@themed/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import { useState } from 'react'
import { useCurrentSheet, useHistory } from './history/history-store'

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
  const { addStep } = useHistory()

  const sheet = useCurrentSheet()
  let df = sheet

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

    addStep(df.name, [df])

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
          className="w-16 rounded-theme"
          placeholder="Top rows..."
        />
        <span>rows using row</span>
        <Select defaultValue={method} onValueChange={setMethod}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Select a statistic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Stdev">Stdev</SelectItem>
            <SelectItem value="Mean">Mean</SelectItem>
            <SelectItem value="Median">Median</SelectItem>
          </SelectContent>
        </Select>
      </VCenterRow>
    </OKCancelDialog>
  )
}
