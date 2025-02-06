import { VCenterRow } from '@/components/layout/v-center-row'
import {
  dfMeanFilter,
  dfMedianFilter,
  dfStdevFilter,
} from '@/components/table/dataframe-ui'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { Input } from '@components/shadcn/ui/themed/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { HistoryContext } from '@providers/history-provider'
import { useContext, useState } from 'react'

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null
  onFilter: (df: BaseDataFrame) => void
  onCancel: () => void
}

export function TopRowsDialog({ open = true, df, onFilter, onCancel }: IProps) {
  const [topRows, setTopRows] = useState(300)
  const [method, setMethod] = useState('Stdev')
  const { historyDispatch } = useContext(HistoryContext)

  function applyFilter() {
    if (!df) {
      onCancel()
      return
    }

    switch (method) {
      case 'Mean':
        //mean
        //dfMean(df, historyDispatch)

        df = dfMeanFilter(df, historyDispatch, topRows)
        break
      case 'Median':
        //dfMedian(df, historyDispatch)

        df = dfMedianFilter(df, historyDispatch, topRows)
        break
      default:
        // stdev
        //dfStdev(df, historyDispatch)

        df = dfStdevFilter(df, historyDispatch, topRows)
        break
    }

    if (!df) {
      onCancel()
      return
    }

    onFilter(df)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Top Rows"
      onReponse={(r) => {
        if (r === TEXT_OK) {
          applyFilter()
        } else {
          onCancel()
        }
      }}
      contentVariant="glass"
      headerVariant="opaque"
      bodyVariant="opaque"
    >
      <VCenterRow className="gap-x-2">
        <span>Keep top</span>
        <Input
          id="top-rows"
          value={topRows}
          onChange={(e) => setTopRows(Number.parseInt(e.target.value))}
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
