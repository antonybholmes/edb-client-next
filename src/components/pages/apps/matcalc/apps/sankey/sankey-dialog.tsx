import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { useRef } from 'react'
import { HistoryPlot } from '../../history/history-provider/history-types'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { DEFAULT_PLOT } from './sankey-provider'

interface IFormInput {
  foldChangeCol: string
  pValueCol: string
  applyLog2ToFoldChange: boolean
  applyLog10ToPValue: boolean
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean

  minThreshold?: number
}

export function SankeyDialog({
  open = true,

  onResponse,
}: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const btnRef = useRef<HTMLButtonElement>(null)

  function makeSankeyPlot() {
    onResponse?.(TEXT_OK, { ...DEFAULT_PLOT })
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
