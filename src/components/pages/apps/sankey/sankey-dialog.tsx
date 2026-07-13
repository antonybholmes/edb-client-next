import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import {
  DialogCard,
  DialogCardContent,
  DialogCardHeader,
} from '@/components/dialogs/card/dialog-card'
import { useDialogs } from '@/components/dialogs/dialogs'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { produce } from 'immer'
import { useState } from 'react'
import { DFColSelect } from '../matcalc/df-col-select'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import { DFToSankeyGraph } from './sankey-parser'
import { ISankeyPlot } from './sankey-provider'
import { useSankeySettings } from './sankey-settings-store'

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
  const { settings, updateSettings } = useSankeySettings()

  const [sourceCol, setSourceCol] = useState('source')
  const [sourceColCol, setSourceColCol] = useState('source column')
  const [targetCol, setTargetCol] = useState('target')
  const [targetColCol, setTargetColCol] = useState('target column')
  const [valueCol, setValueCol] = useState('value')

  const [sourceColorCol, setSourceColorCol] = useState('source color')
  const [targetColorCol, setTargetColorCol] = useState('target color')
  const [linkColorCol, setLinkColorCol] = useState('link color')

  const [accordionValues, setAccordionValues] = useState<string[]>([
    'required',
    'optional',
  ])

  function makeSankeyPlot() {
    try {
      const plot = DFToSankeyGraph(sheet as BaseDataFrame, {
        sourceCol,
        sourceColCol,
        targetCol,
        targetColCol,
        valueCol,
        sourceColorCol,
        targetColorCol,
        linkColorCol,
      })

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
      bodyCls="gap-y-3"
    >
      <DialogCard>
        <DialogCardHeader title="Required headings" />

        <DialogCardContent>
          <PropRow title="Source">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={sourceCol}
              onChange={({ value }) => setSourceCol(value)}
            />
          </PropRow>
          <PropRow title="Source column">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={sourceColCol}
              onChange={({ value }) => setSourceColCol(value)}
            />
          </PropRow>
          <PropRow title="Target">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={targetCol}
              onChange={({ value }) => setTargetCol(value)}
            />
          </PropRow>
          <PropRow title="Target column">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={targetColCol}
              onChange={({ value }) => setTargetColCol(value)}
            />
          </PropRow>
          <PropRow title="Value">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={valueCol}
              onChange={({ value }) => setValueCol(value)}
            />
          </PropRow>
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardHeader title="Optional headings" />

        <DialogCardContent>
          <PropRow title="Source color">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={sourceColorCol}
              onChange={({ value }) => setSourceColorCol(value)}
            />
          </PropRow>
          <PropRow title="Target color">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={targetColorCol}
              onChange={({ value }) => setTargetColorCol(value)}
            />
          </PropRow>
          <PropRow title="Link color">
            <DFColSelect
              df={sheet as BaseDataFrame}
              value={linkColorCol}
              onChange={({ value }) => setLinkColorCol(value)}
            />
          </PropRow>
        </DialogCardContent>
      </DialogCard>

      <NumericalPropRow
        title="Node gap"
        limit={[0, 1000]}
        value={settings.nodes.gap}
        onNumChange={(value) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.nodes.gap = value
            })
          )
        }}
      />
    </OKCancelDialog>
  )
}
