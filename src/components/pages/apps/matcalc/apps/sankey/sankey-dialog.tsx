import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { sankey } from 'd3-sankey'
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

  const layout = sankey<
    { id: string },
    { source: string; target: string; value: number }
  >()
    .nodeId((d) => d.id) // need to specify id accessor since our nodes are not in the default format
    .nodeWidth(20)
    .nodePadding(10)
    .extent([
      [0, 0],
      [10, 10],
    ])

  const nodes: { id: string }[] = [{ id: 'A' }, { id: 'B' }]

  const links: { source: string; target: string; value: number }[] = [
    { source: 'A', target: 'B', value: 10 },
  ]

  const graph = layout({
    nodes: nodes.map((d) => ({ ...d })),
    links: links.map((d) => ({ ...d })),
  })

  console.log('d3 sankey layout', graph)

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
