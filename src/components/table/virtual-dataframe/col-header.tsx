import { useExtScrollContext } from '@/components/ext-scroll-card/ext-scroll-provider'
import { BaseRow } from '@/components/layout/base-row'
import { CenterRow } from '@/components/layout/center-row'
import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { cellStr } from '@/lib/dataframe/cell'
import { range } from '@/lib/math/range'
import { cn } from '@/lib/shadcn-utils'
import { useSelectionRange } from '@/providers/selection-range-provider'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useState } from 'react'
import { useEditContext } from './edit-provider'
import { useSelectionContext } from './selection-provider'
import { useVirtualDataFrameContext } from './virtual-dataframe-provider'

const MIN_CELL_WIDTH = 25

const HEADER_CLS = cn(
  'border-border border-r justify-center absolute',
  'data-[col-selected=true]:text-white',
  'data-[col-selected=false]:data-[in-selection=true]:bg-app-theme/10 data-[col-selected=true]:bg-app-theme/80'
)

const RESIZE_CLS = `absolute w-2 top-0 right-0 bottom-0 cursor-col-resize 
  justify-center translate-x-1/2 opacity-0 hover:opacity-100 
  data-[resize=true]:opacity-100 z-30`

const RESIZE_HANDLE_CLS =
  'h-4/5 w-1.5 rounded-full bg-background border-foreground border pointer-events-none z-50'

export function ColHeader({ col }: { col: VirtualItem }) {
  const {
    df,
    scaledCell,
    columnVirtualizer,
    tableDataRef,
    startPos,
    startWidth,
    scrollOffset,
    getColWidth,
    setColWidth,
  } = useVirtualDataFrameContext()

  const { fontSize } = useEditContext()

  const { selection, update: updateSelection } = useSelectionRange()

  //const [selectionMouseDown, setSelectionMouseDown] = useState(false)
  const [resizenMouseDown, setResizeMouseDown] = useState(-1)

  function handleResizeMouseDown(
    col: number,
    event: MouseEvent | React.MouseEvent
  ) {
    startPos.current = { x: event.clientX, y: -1 }
    startWidth.current = getColWidth(col)

    function onMouseMove(moveEvent: MouseEvent) {
      const newWidth = Math.max(
        startWidth.current + (moveEvent.clientX - startPos.current.x),
        MIN_CELL_WIDTH
      )

      //console.log(index, 'newWidth', newWidth)

      setColWidth(col, newWidth)
    }

    function onMouseUp() {
      setResizeMouseDown(-1)
      document.body.style.cursor = 'default'
      // Remove the event listeners when mouse is released
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    setResizeMouseDown(col)

    document.body.style.cursor = 'col-resize'

    // Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function handleHeaderMouseDown(index: number) {
    function onMouseMove(moveEvent: MouseEvent) {
      const newX =
        moveEvent.clientX -
        (tableDataRef.current?.getBoundingClientRect().x ?? 0)

      let x1 = 0
      let index2 = -1

      for (const col of columnVirtualizer.getVirtualItems()) {
        const x2 = x1 + getColWidth(col.index)

        if (newX >= x1 && newX <= x2) {
          index2 = col.index
          break
        }

        x1 = x2
      }

      if (index2 !== -1) {
        const i1 = Math.min(index, index2)
        const i2 = Math.max(index, index2)

        updateSelection({
          rows: undefined,
          cols: { start: i1, end: i2 },
        })
      }
    }

    //setSelectionMouseDown(true)

    updateSelection({
      rows: undefined,
      cols: { start: index, end: index },
    })

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

  // if there is a selection and no cols, it means
  // a row is highlighted so highlight every col,
  // otherwise if there is a col selection, see
  // if this column falls within it
  const inSelection =
    selection &&
    (!selection.cols ||
      (selection.cols &&
        col.index >= selection.cols.start &&
        col.index <= selection.cols.end))

  const colSelected = inSelection && selection.rows === undefined

  return (
    <HCenterCol
      id={`table-header-${col.index}`}
      key={col.key}
      data-in-selection={inSelection}
      data-col-selected={colSelected}
      className={HEADER_CLS}
      style={{
        width: getColWidth(col.index),

        transform: `translate3d(${col.start - scrollOffset.left}px, 0, 0)`,
      }}
      onMouseDown={() => handleHeaderMouseDown(col.index)}
    >
      {range(df.colVars.shape[1]).map((metaDataCol) => {
        // const v = (df.colMetaData as DataFrame)._data[col.index]![
        //   metaDataCol
        // ]!

        const v = df.colVars.get(col.index, metaDataCol)

        return (
          <CenterRow
            key={metaDataCol}
            className="px-2 py-1 truncate z-20 relative border-border border-b grow w-full shrink-0"
            style={{
              height: scaledCell.h,
              fontSize,
            }}
          >
            {cellStr(v)}
          </CenterRow>
        )
      })}

      <VCenterRow
        className={RESIZE_CLS}
        onMouseDown={(e) => {
          // don't want parent thinking we are changing selection
          e.stopPropagation()
          e.preventDefault()
          handleResizeMouseDown(col.index, e)
        }}
        data-resize={col.index === resizenMouseDown}
      >
        <span className={RESIZE_HANDLE_CLS} />
      </VCenterRow>

      {/* {inSelection && (
        <span
          className="w-full h-full bg-theme absolute bottom-0 left-0 z-10"
          style={{ backgroundColor: accent, opacity: colSelected ? 1 : 0.2 }}
        />
      )} */}
    </HCenterCol>
  )
}

export function ColHeaderContainer() {
  const { columnVirtualizer, headerHeight } = useVirtualDataFrameContext()

  const { hScrollRef, scrollOffset } = useExtScrollContext()

  const { selectionPos } = useSelectionContext()

  return (
    <BaseRow
      id="col-header-container"
      className="relative overflow-hidden font-semibold select-none items-end shrink-0"
      style={{
        // Since this parent does not have borders, it can be precisely sized without extra pixels for the border
        height: headerHeight,
      }}
      onWheel={(e) => {
        if (hScrollRef.current) {
          hScrollRef.current.scrollLeft += e.deltaY
        }
      }}
    >
      {columnVirtualizer.getVirtualItems().map((col) => (
        <ColHeader col={col} key={col.key} />
      ))}

      {selectionPos && (
        <span
          style={{
            transform: `translate3d(${selectionPos.x1 - scrollOffset.left}px, 0, 0)`,
            width: selectionPos.w - 1,
            //backgroundColor: accent,
          }}
          className="w-full h-0.5 absolute z-20 bg-app-theme"
        />
      )}
    </BaseRow>
  )
}
