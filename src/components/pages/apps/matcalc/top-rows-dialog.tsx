import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  meanFilter,
  medianFilter,
  stdevFilter,
} from '@/lib/dataframe/dataframe-utils'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { useState } from 'react'
import { useCurrentSheets } from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'

export function TopRowsDialog({
  //df,
  onResponse,
}: IModalProps<BaseDataFrame>) {
  const [topRows, setTopRows] = useState(300)
  const [method, setMethod] = useState('Stdev')
  const { addSheets } = useHistory()
  const { sheet } = useCurrentSheets()

  let df = sheet as BaseDataFrame

  function applyFilter() {
    if (!df) {
      onResponse?.(TEXT_CANCEL)
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
      onResponse?.(TEXT_CANCEL)
      return
    }

    addSheets([df], { name: 'Top Rows' })

    onResponse?.(TEXT_OK, df)
  }

  return (
    <OKCancelDialog
      title="Top Rows"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          applyFilter()
        } else {
          onResponse?.(TEXT_CANCEL)
        }
      }}
      //contentVariant="glass"
      //headerVariant="opaque"
      //bodyVariant="opaque"
    >
      <VCenterRow className="gap-x-3">
        <span>Keep top</span>
        <NumericalInput
          id="top-rows"
          value={topRows}
          limit={[1, Number.MAX_SAFE_INTEGER]}
          step={1}
          onChange={(e) => setTopRows(Number.parseInt(e.target.value))}
          w="xs"
          placeholder="Top rows..."
        />
        <span>rows using row</span>
        <SelectList
          value={method}
          onValueChange={(v) => {
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
