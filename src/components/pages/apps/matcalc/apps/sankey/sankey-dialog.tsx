import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { DFToSankeyGraph } from './sankey-parser'
import { ISankeyPlot } from './sankey-provider'

interface IFormInput {
  foldChangeCol: string
  pValueCol: string
  applyLog2ToFoldChange: boolean
  applyLog10ToPValue: boolean
}

export interface IProps extends IModalProps<ISankeyPlot> {
  open?: boolean

  minThreshold?: number
}

export function SankeyDialog({
  open = true,

  onResponse,
}: IProps) {
  const { sheet } = useCurrentSheets()

  function makeSankeyPlot() {
    const plot = DFToSankeyGraph(sheet as BaseDataFrame)

    console.log('Generated sankey plot', plot)

    onResponse?.(TEXT_OK, plot)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Sankey Plot"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          makeSankeyPlot()
        } else {
          onResponse?.(r, undefined)
        }
      }}
      //contentVariant="glass"
    ></OKCancelDialog>
  )
}
