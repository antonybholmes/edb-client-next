import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_CANCEL } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { useState } from 'react'

import { DialogBlock } from '@components/dialog-block'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { Label } from '@components/shadcn/ui/themed/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
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
      onReponse={(r) => {
        if (r === TEXT_CANCEL) {
          onCancel?.()
        } else {
          _onPlot()
        }
      }}
      className="w-3/4 md:w-1/2 lg:w-1/3 2xl:w-1/4"
    >
      <DialogBlock>
        <VCenterRow className="gap-x-4 justify-between">
          <Label>Multi-mode</Label>
          <Select
            defaultValue={multi}
            onValueChange={(value) => setMulti(value as MultiMode)}
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
      </DialogBlock>
    </OKCancelDialog>
  )
}
