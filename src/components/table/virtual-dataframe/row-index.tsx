import { useExtScrollContext } from '@/components/ext-scroll-card/ext-scroll-provider'
import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { CenterRow } from '@/components/layout/center-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import { cellStr } from '@/lib/dataframe/cell'
import { DEFAULT_INDEX_NAME } from '@/lib/dataframe/series'
import { rangeMap } from '@/lib/math/range'
import { cn } from '@/lib/shadcn-utils'
import { useSelectionRange } from '@/providers/selection-range-provider'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useEditContext } from './edit-provider'
import { useSelectionContext } from './selection-provider'
import { useVirtualDataFrameContext } from './virtual-dataframe-provider'

const INDEX_CLS = cn(
  'border-b border-border justify-center overflow-hidden absolute',
  'data-[in-selection=true]:data-[row-selected=false]:bg-theme/20',
  'data-[row-selected=true]:bg-theme/50 data-[row-selected=true]:text-white',
  'data-[row-selected=false]:data-[in-selection=true]:bg-app-theme/20 data-[row-selected=true]:bg-app-theme/80'
)

function RowIndex({ row }: { row: VirtualItem }) {
  const {
    df,
    scaledCell,
    dp,
    commas,
    tableDataRef,
    rowVirtualizer,
    scrollOffset,
  } = useVirtualDataFrameContext()

  const { fontSize } = useEditContext()
  const { selection, update: updateSelection } = useSelectionRange()

  function handleIndexMouseDown(row: number) {
    function onMouseMove(moveEvent: MouseEvent) {
      const newY =
        moveEvent.clientY -
        (tableDataRef.current?.getBoundingClientRect().y ?? 0)

      let row2 =
        rowVirtualizer.getVirtualItems()[Math.floor(newY / scaledCell.h)]!

      const i1 = Math.min(row, row2.index)
      const i2 = Math.max(row, row2.index)

      updateSelection({ rows: { start: i1, end: i2 }, cols: undefined })
    }

    //setSelectionMouseDown(true)

    updateSelection({ rows: { start: row, end: row }, cols: undefined })

    function onMouseUp() {
      //setSelectionMouseDown(false)

      //document.body.style.cursor = 'default'
      // Remove the event listeners when mouse is released
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    //document.body.style.cursor = 'col-resize'

    // Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const inSelection =
    selection &&
    (!selection.rows ||
      (selection.rows &&
        row.index >= selection.rows.start &&
        row.index <= selection.rows.end))

  const rowSelected = inSelection && selection.cols === undefined

  return (
    <VCenterRow
      key={row.key}
      onMouseDown={() => handleIndexMouseDown(row.index)}
      data-in-selection={inSelection}
      data-row-selected={rowSelected}
      className={INDEX_CLS}
      style={{
        height: scaledCell.h,
        transform: `translate3d(0, ${row.start - scrollOffset.top}px, 0)`,
        fontSize,
      }}
    >
      {rangeMap((col) => {
        const v = df.rowObs.get(row.index, col)

        return (
          <CenterRow
            key={col}
            className="virtual-dataframe-row-index"
            style={{
              width: scaledCell.w,
              height: scaledCell.h,

              justifyContent: df.rowObs.shape[1] > 1 ? 'center' : 'end',
              //color: inSelection ? accent : undefined,
            }}
          >
            {cellStr(v, { dp, commas })}
          </CenterRow>
        )
      }, df.rowObs.shape[1])}

      {/* {inSelection && (
        <span
          className="w-full h-full bg-theme absolute bottom-0 left-0 z-10"
          style={{ backgroundColor: accent, opacity: rowSelected ? 1 : 0.2 }}
        />
      )} */}
    </VCenterRow>
  )
}

export function RowIndexContainer() {
  const {
    df,
    scaledCell,
    rowVirtualizer,

    headerHeight,
    indexWidth,
    scrollOffset,
  } = useVirtualDataFrameContext()

  const { vScrollRef } = useExtScrollContext()

  const { selectionPos } = useSelectionContext()

  const { fontSize } = useEditContext()

  return (
    <BaseCol
      id="row-index"
      className="font-semibold mb-4 rounded-l-theme overflow-hidden border-t border-b border-l border-border shrink-0"
      style={{
        width: indexWidth + 1,
      }}
    >
      <BaseRow
        id="row-index-header"
        className="select-none items-end border-b border-border"
        style={{
          height: headerHeight,
        }}
      >
        {df.rowObs.columns.map((colName, col) => {
          return (
            <CenterRow
              key={col}
              className="justify-center overflow-hidden truncate border-r border-border shrink-0"
              style={{
                width: scaledCell.w,
                height: headerHeight,
                fontSize,
              }}
            >
              {colName !== DEFAULT_INDEX_NAME ? colName : ''}
            </CenterRow>
          )
        })}
      </BaseRow>

      <BaseCol
        id="row-index-container"
        className="relative overflow-hidden grow select-none"
        style={{
          width: indexWidth,
        }}
        onWheel={(e) => {
          // the independent scroll refs
          if (vScrollRef.current) {
            vScrollRef.current.scrollTop += e.deltaY
          }
        }}
      >
        {rowVirtualizer.getVirtualItems().map((row) => (
          <RowIndex row={row} key={row.key} />
        ))}

        {selectionPos && (
          <span
            style={{
              transform: `translate3d(0, ${selectionPos.y1 - scrollOffset.top}px, 0)`,
              height: selectionPos.y2 - selectionPos.y1,
              //backgroundColor: accent,
            }}
            className="absolute z-20 w-0.5 right-px bg-app-theme"
          />
        )}
      </BaseCol>
    </BaseCol>
  )
}
