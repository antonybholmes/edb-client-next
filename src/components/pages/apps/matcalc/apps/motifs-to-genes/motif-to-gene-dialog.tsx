import { BaseCol } from '@/layout/base-col'

import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import type { ISelectionRange } from '@/providers/selection-range'

import { DataFrame } from '@/lib/dataframe/dataframe'

import { useEffect, useState } from 'react'

import { RunningIndicator } from '@/components/toolbar/running-indicator'

import { PropRow } from '@/components/dialogs/prop-row'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { SeriesData } from '@/lib/dataframe/series-data'
import { DFColSelect } from '../../df-col-select'
import { useHistory, useSheet } from '../../history/history-store'
import { useMotifsToGenesWorker } from './motifs-to-genes-worker'

export interface IProps extends IModalProps<BaseDataFrame> {
  selection: ISelectionRange
}

export function MotifToGeneDialog({ selection, onResponse }: IProps) {
  //const [useIndex, setUseIndex] = useState(false)
  //const [useColumns, setUseColumns] = useState(true)

  const [col, setCol] = useState(0)

  const { addSheets } = useHistory()
  const { run: runMotifsToGenes } = useMotifsToGenesWorker()
  const sheet = useSheet()

  const [indicatorMessage, setIndicatorMessage] = useState<string | null>(null)

  const df = sheet as DataFrame

  useEffect(() => {
    //setUseIndex(selection.start.col === -1)
    //setUseColumns(selection.start.col !== -1)

    if (selection && selection.cols && selection.cols.start) {
      setCol(selection.cols.start)
    }
  }, [selection])

  function convert() {
    if (!df || df.size === 0) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    setIndicatorMessage('Converting motifs to genes...')

    let ids: string[] = df.col(col)!.strs

    runMotifsToGenes({ ids }, result => {
      const { genes } = result

      const table: SeriesData[][] = []

      for (const [ri, row] of df.values.entries()) {
        table.push([...row, genes[ri]!.genes.sort().join(',')])
      }

      console.log(table, 'table')

      const header: string[] = [...df.columns, 'Motif to gene']

      const df_out = new AnnotationDataFrame({
        data: table,
        index: df.index,
        columns: header,
        name: 'Motif to gene',
      })

      console.log(df)
      console.log(df_out.shape)

      addSheets([df_out])

      setIndicatorMessage(null)
      onResponse?.(TEXT_OK, df_out)
    })
  }

  return (
    <OKCancelDialog
      title="Motif To Gene"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onResponse?.(TEXT_CANCEL)
        } else {
          convert()
        }
      }}
      leftFooterChildren={<RunningIndicator message={indicatorMessage} />}
    >
      <BaseCol className="gap-y-2 text-sm">
        <PropRow title="Motif column">
          <DFColSelect df={sheet as DataFrame} value={col} onChange={setCol} />
        </PropRow>
      </BaseCol>
    </OKCancelDialog>
  )
}
