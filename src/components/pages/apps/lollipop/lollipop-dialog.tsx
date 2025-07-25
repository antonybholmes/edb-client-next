import { BaseCol } from '@layout/base-col'

import { TEXT_CANCEL } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { VCenterRow } from '@layout/v-center-row'
import { useState } from 'react'

import { Checkbox } from '@themed/check-box'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import type { MultiMode } from '../oncoplot/oncoplot-utils'

export type OncoplotType = 'loconcoplot' | 'oncoplot'

export interface IProps {
  open: boolean
  type: OncoplotType
  onPlot?: (
    type: string,
    multi: MultiMode,
    sort: boolean,
    removeEmpty: boolean
  ) => void
  onCancel?: () => void
}

export function LollipopDialog({ open, type, onPlot, onCancel }: IProps) {
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
      className="w-3/4 md:w-1/2 lg:w-1/3 2xl:w-1/4"
    >
      <BaseCol className="gap-y-2 text-sm">
        <VCenterRow className="gap-x-4">
          <span>Multi-mode</span>
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
      </BaseCol>
    </OKCancelDialog>
  )
}
