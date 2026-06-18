import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { TEXT_SELECT_ALL } from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { useEffect, useState, type ReactNode } from 'react'

interface IProps extends IDivProps {
  selectAll?: boolean
  setSelectAll?: (v: boolean) => void
  multiselect?: boolean
  setMultiselect?: (v: boolean) => void
  selectedChildren?: ReactNode
}

/**
 * Shows a select all checkbox and a button to toggle multiselect mode.
 * When multiselect mode is on, the checkbox is shown and can be used to select
 * or deselect all items. The parent component should manage the state of which
 * items are selected and pass a function to the `select` prop that selects or
 * deselects all items when the checkbox is toggled.
 *
 * @param param0
 * @returns
 */
export function SelectAll({
  selectAll = true,
  setSelectAll,
  multiselect = false,
  setMultiselect,
  selectedChildren,
  className,
  children,
}: IProps) {
  const [_multiselect, _setMultiselect] = useState(false)
  const [_selectAll, _setSelectAll] = useState(true)

  useEffect(() => {
    _setMultiselect?.(multiselect)
  }, [multiselect])

  useEffect(() => {
    _setSelectAll?.(selectAll)
  }, [selectAll])

  function toggleSelectAll(v: boolean) {
    _setSelectAll(v)
    setSelectAll?.(v)
  }

  function toggleMultiselect(v: boolean) {
    _setMultiselect(v)
    setMultiselect?.(v)
  }

  return (
    <VCenterRow className="justify-between gap-x-1">
      <VCenterRow>
        {_multiselect ? (
          <VCenterRow className={cn('gap-x-1', className)}>
            <Checkbox
              checked={_selectAll}
              onCheckedChange={v => {
                toggleSelectAll(v)
              }}
              title={TEXT_SELECT_ALL}
            />
            {selectedChildren}
          </VCenterRow>
        ) : (
          children
        )}
      </VCenterRow>

      <IconButton
        title="Select"
        onClick={() => {
          toggleMultiselect(!_multiselect)
        }}
        checked={_multiselect}
      >
        <MultiSelectIcon checked={_multiselect} />
      </IconButton>
    </VCenterRow>
  )
}
