import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { useDialogs } from '@/components/dialogs/dialogs'
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
  const { open: openDialog } = useDialogs()

  function makeSankeyPlot() {
    try {
      const plot = DFToSankeyGraph(sheet as BaseDataFrame)

      onResponse?.(TEXT_OK, plot)
    } catch (e) {
      openDialog({
        type: 'alert',
        payload: {
          title: 'Error creating Sankey Plot',
          content: (e as Error).message,
        },
      })
    }
  }

  return (
    <OKCancelDialog
      open={open}
      title="Sankey"
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
