import { ExtScrollProvider } from '@/components/ext-scroll-card/ext-scroll-provider'
import {
  ExtHScroll,
  ExtVScroll,
} from '@/components/ext-scroll-card/ext-scrollbars'
import type { IDim } from '@/interfaces/dim'
import { type AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useEffect, useMemo, useRef } from 'react'
import { useSelectionRange } from '../../../providers/selection-range-provider'
import { BaseCol } from '../../layout/base-col'
import { BaseRow } from '../../layout/base-row'
import { VCenterRow } from '../../layout/v-center-row'
import { Input } from '../../shadcn/ui/themed/v2/input'
import { ColHeaderContainer } from './col-header'
import { EditProvider, useEditContext } from './edit-provider'
import { RowIndexContainer } from './row-index'
import { SelectionProvider, useSelectionContext } from './selection-provider'
import { TableData } from './table-data'
import {
  useVirtualDataFrameContext,
  VirtualDataFrameProvider,
} from './virtual-dataframe-provider'

/**
 * Props for the virtualized data frame component.
 *
 * @interface IVirtualizedDataFrameProps
 * @property {AnnotationDataFrame} df - The data frame to display.
 * @property {IDim} [cell] - The dimensions of each cell in the data frame.
 * @property {boolean} [editable] - Whether the data frame is editable.
 * @property {number | undefined} [zoom] - The zoom level for the data frame. If this
 * is not specified, the global zoom level will be used.
 */
interface IVirtualDataFrameProps {
  df: AnnotationDataFrame
  cell?: IDim | undefined
  editable?: boolean | undefined
  zoom?: number | undefined
  dp?: number | undefined
  commas?: boolean | undefined
}

function VirtualDataFrameContent({ editable = false }: IVirtualDataFrameProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  const { clear: clearSelection } = useSelectionRange()

  //const [selText, setSelectedCellRefText] = useState('')

  const { df, scaledCell, copyToClipboard } = useVirtualDataFrameContext()

  const { currentCell } = useSelectionContext()

  const { editText, onEditChange, onEditKeyDown } = useEditContext()

  const selText = useMemo(() => {
    if (!currentCell) return ''
    return `${currentCell.row + 1}R x ${currentCell.col + 1}C`
  }, [currentCell, df.id])

  // keep track of the offset that the components should
  // be moved to. We use this to calculate where on the
  // virtual canvas we are looking

  // determine where to focus the image when dragging the mouse
  // around. This is independent of the selection so the focus
  // can change even when the selected cell does not

  //const selectionRef = useRef(selection)

  // useEffect(() => {
  //   const el = tableRef.current
  //   if (!el) {
  //     return
  //   }

  //   el.addEventListener('keydown', onKeyDown)

  //   return () => {
  //     el.removeEventListener('keydown', onKeyDown)
  //   }
  // }, [])

  useEffect(() => {
    clearSelection()
  }, [df.id])

  // useEffect(() => {
  //   if (currentCell) {
  //     setSelectedCellRefText(
  //       `${currentCell.row + 1}R x ${currentCell.col + 1}C`
  //     )
  //   } else {
  //     setSelectedCellRefText('')
  //   }
  // }, [currentCell])

  // useEffect(() => {
  //   selectionRef.current = selection
  // }, [selection])

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.code) {
      case 'KeyC':
        if (e.ctrlKey || e.metaKey) {
          copyToClipboard()
        }
        break
    }
  }

  // oweing to the edit feature which can direct focus off the table,
  // we need to listen for events globally to cope with arrow keys
  // and cut and paste etc.

  return (
    <BaseCol id="dataframe" className="gap-y-2 grow">
      <VCenterRow className="gap-x-3 text-sm">
        <label htmlFor="cell-address" className="sr-only">
          Cell address
        </label>
        <Input
          id="cell-address"
          value={selText}
          w="sm"
          // Make background consistent with the table cells for
          // a more Excel like look instead of graying it out
          className="bg-background!"
          readOnly
          aria-label="Cell address"
        />
        <label htmlFor="cell-edit-input" className="sr-only">
          Cell value
        </label>
        {editable ? (
          <Input
            id="cell-edit-input"
            aria-label="Cell Edit"
            value={editText}
            className="rounded-theme"
            onChange={onEditChange}
            onKeyDown={onEditKeyDown}
          />
        ) : (
          <Input
            id="cell-edit-input"
            aria-label="Cell Edit"
            value={editText}
            className="rounded-theme"
          />
        )}
      </VCenterRow>

      <BaseRow
        className="grow text-xs"
        ref={tableRef}
        tabIndex={0}
        onKeyDownCapture={onKeyDown}
      >
        <RowIndexContainer />

        <BaseCol className="grow">
          <BaseCol
            className="grow rounded-r-theme overflow-hidden border-t border-b border-r border-border"
            id="table-body"
          >
            <ColHeaderContainer />

            <TableData />
          </BaseCol>

          <ExtHScroll />
        </BaseCol>

        <ExtVScroll className="mb-4" style={{ marginTop: scaledCell.h }} />
      </BaseRow>
    </BaseCol>
  )
}

export function VirtualDataFrame({
  df,
  cell = { w: 72, h: 24 },
  editable = false,
  zoom = 1,
  dp = 4,
  commas = false,
}: IVirtualDataFrameProps) {
  return (
    <ExtScrollProvider>
      <VirtualDataFrameProvider
        df={df}
        cell={cell}
        editable={editable}
        zoom={zoom}
        dp={dp}
        commas={commas}
      >
        <SelectionProvider>
          <EditProvider>
            <VirtualDataFrameContent df={df} />
          </EditProvider>
        </SelectionProvider>
      </VirtualDataFrameProvider>
    </ExtScrollProvider>
  )
}
