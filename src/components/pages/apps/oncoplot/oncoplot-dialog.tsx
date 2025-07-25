import { TEXT_CANCEL } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { VCenterRow } from '@layout/v-center-row'
import { useState } from 'react'

import { Checkbox } from '@themed/check-box'
import { Label } from '@themed/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import type { MultiMode } from './oncoplot-utils'

export type OncoplotType = 'loconcoplot' | 'oncoplot'

export interface IProps {
  open?: boolean
  type: OncoplotType
  onPlot?: (
    type: OncoplotType,
    multi: MultiMode,
    sort: boolean,
    removeEmpty: boolean
  ) => void
  onCancel?: () => void
}

export function OncoPlotDialog({
  open = true,
  type,
  onPlot,
  onCancel,
}: IProps) {
  const [multi, setMulti] = useState<MultiMode>('multi')
  const [sort, setSort] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(false)

  function _onPlot() {
    onPlot?.(type, multi, sort, removeEmpty)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Oncoplot"
      onResponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel?.()
        } else {
          _onPlot()
        }
      }}
      //contentVariant="glass"
      //bodyVariant="card"
    >
      <VCenterRow className="gap-x-4 justify-between">
        <Label>Multi-mode</Label>
        <Select
          defaultValue={multi}
          onValueChange={value => setMulti(value as MultiMode)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multi">Multi</SelectItem>
            <SelectItem value="equalbar">Equal bar</SelectItem>
            <SelectItem value="stackedbar">Stacked bar</SelectItem>
          </SelectContent>
        </Select>
      </VCenterRow>

      <Checkbox checked={sort} onCheckedChange={setSort}>
        <span>Sort rows and columns</span>
      </Checkbox>
      <Checkbox checked={removeEmpty} onCheckedChange={setRemoveEmpty}>
        <span>Remove empty samples</span>
      </Checkbox>
    </OKCancelDialog>
  )
}
