import { TEXT_CANCEL } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'

import { Label } from '@/components/shadcn/ui/themed/v2/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import { useOncoplotSettings } from './oncoplot-settings-store'
import type { MultiMode } from './oncoplot-utils'

import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { Checkbox } from '@/themed/v2/check-box'

export type OncoplotType = 'loconcoplot' | 'oncoplot'

export interface IProps {
  open?: boolean
  type: OncoplotType
  onPlot?: (type: OncoplotType) => void
  onCancel?: () => void
}

export function OncoPlotDialog({
  open = true,
  type,
  onPlot,
  onCancel,
}: IProps) {
  const { displayProps, setDisplayProps } = useOncoplotSettings()

  function _onPlot() {
    onPlot?.(type)
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
        <Label htmlFor="plot-mode-select">Plot mode</Label>
        <Select
          defaultValue={displayProps.multi}
          onValueChange={v => {
            setDisplayProps(
              produce(displayProps, draft => {
                draft.multi = v as MultiMode
              })
            )
          }}
        >
          <SelectTrigger className="w-40" id="plot-mode-select">
            <SelectValue data-placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multi">Multi</SelectItem>
            <SelectItem value="equal-bars">Equal bar</SelectItem>
            <SelectItem value="stacked-bars">Stacked bar</SelectItem>
          </SelectContent>
        </Select>
      </VCenterRow>

      {/* <Checkbox
        checked={displayProps.sort}
        onCheckedChange={v => {
          setDisplayProps(
            produce(displayProps, draft => {
              draft.sort = v as boolean
            })
          )
        }}
      >
        <span>Sort rows and columns</span>
      </Checkbox> */}
      <Checkbox
        checked={displayProps.removeEmptySamples}
        onCheckedChange={v => {
          setDisplayProps(
            produce(displayProps, draft => {
              draft.removeEmptySamples = v as boolean
            })
          )
        }}
      >
        <span>No empty samples</span>
      </Checkbox>

      <MenuSeparator />

      {/* <span>Genes to plot</span>

      <ul className="flex flex-col gap-y-1">
        {Object.entries(genesInUse)
          .map(([gene, inUse]) => ({ gene, inUse }))
          .sort((a, b) => a.gene.localeCompare(b.gene))
          .map(({ gene, inUse }, gi) => {
            return (
              <li key={gi}>
                <Checkbox
                  checked={inUse}
                  onCheckedChange={v => {
                    setGenesInUse(
                      produce(genesInUse, draft => {
                        draft[gene] = v as boolean
                      })
                    )
                  }}
                >
                  <span>{gene}</span>
                </Checkbox>
              </li>
            )
          })}
      </ul> */}
    </OKCancelDialog>
  )
}
