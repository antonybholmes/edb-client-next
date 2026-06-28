import { useExtScrollContext } from '@/components/ext-scroll-card/ext-scroll-provider'
import { CenterRow } from '@/components/layout/center-row'
import { useWindowListener } from '@/hooks/window-listener'
import type { ICell } from '@/interfaces/cell'
import { cellStr } from '@/lib/dataframe/cell'
import { clamp } from '@/lib/math/clamp'
import { range } from '@/lib/math/range'
import {
  useSelectionRange,
  type ISelectionRange,
} from '@/providers/selection-range-provider'
import { useEffect, useMemo, useRef } from 'react'
import { useEditContext } from './edit-provider'
import { useSelectionContext, type ISelectionPos } from './selection-provider'
import { useVirtualDataFrameContext } from './virtual-dataframe-provider'

const SCROLL_SPEED_MS = 50
const SCROLL_MARGIN_SIZE = 50

/**
 * Returns true if table cell should be highlighted in light blue.
 *
 * @param row
 * @param col
 * @param selection
 * @param currentCell
 * @returns
 */
function highlightCell(
  row: number,
  col: number,
  selection: ISelectionRange | undefined,
  currentCell: ICell | undefined
): boolean {
  if (!selection) {
    return false
  }

  const isCurrent = row === currentCell?.row && col == currentCell?.col

  if (isCurrent) {
    return false
  }

  if (selection.rows && selection.cols) {
    return (
      row >= selection.rows.start &&
      row <= selection.rows.end &&
      col >= selection.cols.start &&
      col <= selection.cols.end
    )
  } else if (selection.cols) {
    return col >= selection.cols.start && col <= selection.cols.end
  } else if (selection.rows) {
    return row >= selection.rows.start && row <= selection.rows.end
  } else {
    return false
  }

  // return (
  //   (col >= selection.cols.start &&
  //     col <= selection.cols.end &&
  //     row >= selection.rows.start &&
  //     row <= selection.rows.end &&
  //     (row !== currentCell.row || col !== currentCell.col)) ||
  //   (col >= selection.cols.start &&
  //     col <= selection.cols.end &&
  //     selection.rows.start === -1) ||
  //   (row >= selection.rows.start &&
  //     row <= selection.rows.end &&
  //     selection.cols.start === -1)
  // )
}

function SelectionRect({
  selectionPos,
  scrollLeft,
  scrollTop,
}: {
  selectionPos: ISelectionPos
  scrollLeft: number
  scrollTop: number
}) {
  return (
    <>
      <span
        id="cell-selection"
        style={{
          transform: `translate3d(${selectionPos.x1 - scrollLeft - 1}px, ${selectionPos.y1 - scrollTop - 1}px, 0)`,
          width: selectionPos.w + 2,
          height: selectionPos.h + 2,
          //borderColor: accent,
        }}
        className="border-2 border-app-theme absolute z-20"
      />
      <span
        id="cell-selection-rect"
        style={{
          transform: `translate3d(${selectionPos.x2 - scrollLeft - 4}px, ${selectionPos.y2 - scrollTop - 4}px, 0)`,
        }}
        className="cursor-grab border border-background bg-app-theme aspect-square w-2 h-2 shrink-0 absolute z-30"
      />
    </>
  )
}

export function TableData() {
  const {
    editRef,
    tableDataRef,
    rowVirtualizer,
    columnVirtualizer,
    df,
    scaledCell,
    dp,
    commas,
    startPos,
    editable,
    scrollOffset,
    getColWidth,
    getColX,
  } = useVirtualDataFrameContext()

  const { hScrollRef, vScrollRef } = useExtScrollContext()

  const { currentCell, currentCellPos, selectionPos, setCurrentCell } =
    useSelectionContext()

  const { editText, fontSize, setEditText, onEditChange } = useEditContext()

  const {
    selection,
    update: updateSelection,
    clear: clearSelection,
  } = useSelectionRange()

  useWindowListener('mousedown', handleMouseDown)

  const loopRef = useRef<NodeJS.Timeout>(null) // To store the interval reference
  const colIndexes = useMemo(() => range(df.shape[1]), [df])

  useEffect(() => {
    if (currentCell) {
      setEditText(
        cellStr(df.get(currentCell.row, currentCell.col), {
          dp,
          commas,
        })
      )
    } else {
      setEditText('')
    }
  }, [currentCell, df, dp, commas])

  function setFocusCell(focusCell: ICell) {
    const dl = hScrollRef.current!
    const dt = vScrollRef.current!

    const { x: x1, w } = getColX(focusCell.col)

    const x2 = x1 + w

    const y1 = focusCell.row * scaledCell.h
    const y2 = y1 + scaledCell.h

    if (x1 < dl.scrollLeft) {
      dl.scrollLeft = x1
    }

    if (x2 > dl.clientWidth + dl.scrollLeft) {
      dl.scrollLeft = x2 - dl.clientWidth
    }

    if (y1 < dt.scrollTop) {
      dt.scrollTop = y1
    }

    if (y2 > dt.clientHeight + dt.scrollTop) {
      dt.scrollTop = y2 - dt.clientHeight
    }
  }

  function onMouseMove(e: MouseEvent) {
    const elementRect = tableDataRef.current!.getBoundingClientRect()
    const bottomMargin = elementRect.bottom - SCROLL_MARGIN_SIZE // Calculate bottom SCROLL_MARGIN_SIZE pixels of element
    const rightMargin = elementRect.right - SCROLL_MARGIN_SIZE // Calculate bottom SCROLL_MARGIN_SIZE pixels of element

    if (e.clientY - elementRect.top <= SCROLL_MARGIN_SIZE) {
      if (!loopRef.current) {
        loopRef.current = setInterval(() => {
          if (vScrollRef.current) {
            vScrollRef.current.scrollTop -= scaledCell.h
          }
        }, SCROLL_SPEED_MS) // Trigger action every 500ms
      }
    } else if (e.clientY >= bottomMargin) {
      if (!loopRef.current) {
        loopRef.current = setInterval(() => {
          if (vScrollRef.current) {
            vScrollRef.current.scrollTop += scaledCell.h
          }
        }, SCROLL_SPEED_MS) // Trigger action every 500ms
      }
    } else if (e.clientX - elementRect.left <= SCROLL_MARGIN_SIZE) {
      if (!loopRef.current) {
        loopRef.current = setInterval(() => {
          if (hScrollRef.current) {
            hScrollRef.current.scrollLeft -= scaledCell.w
          }
        }, SCROLL_SPEED_MS) // Trigger action every 500ms
      }
    } else if (e.clientX >= rightMargin) {
      if (!loopRef.current) {
        loopRef.current = setInterval(() => {
          if (hScrollRef.current) {
            hScrollRef.current!.scrollLeft += scaledCell.w
          }
        }, SCROLL_SPEED_MS) // Trigger action every 500ms
      }
    } else {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
    }

    const newX =
      e.clientX - elementRect.x + (hScrollRef.current?.scrollLeft ?? 0)

    const newY =
      e.clientY - elementRect.y + (vScrollRef.current?.scrollTop ?? 0)

    let x1 = 0
    let index = -1

    for (const i of colIndexes) {
      const x2 = x1 + getColWidth(i)

      if (startPos.current.x >= x1 && startPos.current.x <= x2) {
        index = i
        break
      }

      x1 = x2
    }

    x1 = 0
    let index2 = -1

    for (const i of colIndexes) {
      const x2 = x1 + getColWidth(i)

      if (newX >= x1 && newX <= x2) {
        index2 = i
        break
      }

      x1 = x2
    }

    const maxCol = df.shape[1] - 1
    const c1 = clamp(Math.min(index, index2), 0, maxCol)
    const c2 = clamp(Math.max(index, index2), 0, maxCol)

    const maxRow = df.shape[0] - 1
    const r1 = clamp(
      Math.floor(Math.min(startPos.current.y, newY) / scaledCell.h),
      0,
      maxRow
    )
    const r2 = clamp(
      Math.floor(Math.max(startPos.current.y, newY) / scaledCell.h),
      0,
      maxRow
    )

    updateSelection({
      rows: { start: r1, end: r2 },
      cols: { start: c1, end: c2 },
    })
    //}
  }

  function handleMouseDown(event: Event) {
    if (!tableDataRef.current?.contains(event.target as Node)) {
      return
    }

    const elementRect = tableDataRef.current!.getBoundingClientRect()

    startPos.current = {
      x:
        (event as MouseEvent).clientX -
        elementRect.left +
        (hScrollRef.current?.scrollLeft ?? 0),
      y:
        (event as MouseEvent).clientY -
        elementRect.top +
        (vScrollRef.current?.scrollTop ?? 0),
    }

    let row = clamp(
      Math.floor(startPos.current.y / scaledCell.h),
      0,
      df.shape[0] - 1
    )

    let x1 = 0
    let col = 0
    for (const i of colIndexes) {
      const x2 = x1 + getColWidth(i)

      if (startPos.current.x >= x1 && startPos.current.x <= x2) {
        col = i
        break
      }

      x1 = x2
    }

    // stop user selecting something outside the table dimensions
    col = clamp(col, 0, df.shape[1] - 1)

    setCurrentCell({ row, col })

    updateSelection({
      rows: { start: row, end: row },
      cols: { start: col, end: col },
    })

    function onMouseUp() {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }

      //setSelectionMouseDown(false)
      //document.body.style.cursor = 'default'
      // Remove the event listeners when mouse is released
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    //document.body.style.cursor = 'col-resize'
    //setSelectionMouseDown(true)
    // Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  function onDataKeyDown(e: KeyboardEvent | React.KeyboardEvent) {
    const d = tableDataRef.current

    if (!d) {
      return
    }

    switch (e.code) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Tab':
        if (selection && selection.cols) {
          const dir = e.code === 'ArrowLeft' ? -1 : 1

          const row = selection.rows
            ? selection.rows.end
            : rowVirtualizer.getVirtualItems()?.[0]?.index || 0

          const col = dir === 1 ? df.shape[1] - 1 : 0

          if (e.shiftKey && e.ctrlKey) {
            updateSelection({
              rows: selection.rows,
              cols:
                dir === 1
                  ? { start: selection.cols.start, end: col }
                  : { start: col, end: selection.cols.start },
            })
            setFocusCell({ row, col })
          } else if (e.shiftKey) {
            updateSelection({
              rows: selection.rows,
              cols: { start: col, end: col },
            })

            setCurrentCell({ row, col })
            setFocusCell({ row, col })
          } else {
            const col =
              dir === 1
                ? Math.min(selection.cols.start + 1, df.shape[1] - 1)
                : Math.max(0, selection.cols.start - 1)

            updateSelection({
              rows: { start: row, end: row },
              cols: { start: col, end: col },
            })

            const s1 = {
              row,
              col,
            }

            setCurrentCell(s1)

            setFocusCell(s1)
          }
        }
        break

      case 'ArrowUp':
      case 'ArrowDown':
        if (selection && selection.rows) {
          const dir = e.code === 'ArrowUp' ? -1 : 1

          const row = dir === 1 ? df.shape[0] - 1 : 0

          const col = selection.cols
            ? selection.cols.end
            : columnVirtualizer.getVirtualItems()?.[0]?.index || 0

          if (e.shiftKey && e.ctrlKey) {
            updateSelection({
              cols: selection.cols,
              rows:
                dir === 1
                  ? { start: selection.rows.start, end: row }
                  : { start: row, end: selection.rows.start },
            })
            setFocusCell({ row, col })
          } else if (e.shiftKey) {
            updateSelection({
              cols: selection.cols,
              rows: { start: row, end: row },
            })

            setCurrentCell({ row, col })
            setFocusCell({ row, col })
          } else {
            const row =
              dir === 1
                ? Math.min(selection.rows.start + 1, df.shape[0] - 1)
                : Math.max(0, selection.rows.start - 1)

            updateSelection({
              cols: selection.cols,
              rows: { start: row, end: row },
            })

            const s1 = {
              row,
              col,
            }

            setCurrentCell(s1)

            setFocusCell(s1)
          }
        }
        break
      case 'PageUp':
        vScrollRef.current!.scrollTop -= d.clientHeight
        break
      case 'PageDown':
        vScrollRef.current!.scrollTop += d.clientHeight
        break
      case 'Enter':
        //setEditCell(selection.start)
        break
      case 'Escape':
        setCurrentCell(undefined)
        clearSelection()
        break
      default:
        break
    }

    e.preventDefault()
    //e.stopPropagation()
  }

  function handleCellKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && currentCell) {
      const v = e.currentTarget.value

      if (editable) {
        df.at(currentCell.row, currentCell.col, v)
      }

      const newCell = {
        row: Math.max(
          0,
          Math.min(
            df.shape[1],
            currentCell.row < df.shape[0] - 1
              ? currentCell.row + 1
              : currentCell.row - 1
          )
        ),
        col: currentCell.col,
      }

      setCurrentCell(newCell)

      updateSelection({
        rows: { start: newCell.row, end: newCell.row },
        cols: { start: newCell.col, end: newCell.col },
      })
    }

    e.stopPropagation()
  }

  return (
    <div
      id="table-data"
      className="relative grow overflow-hidden bg-background outline-none"
      ref={tableDataRef}
 
      onKeyDown={onDataKeyDown}
      onWheel={(e) => {
        if (vScrollRef.current) {
          vScrollRef.current.scrollTop += e.deltaY
        }
      }}
      tabIndex={0}
    >
      {rowVirtualizer.getVirtualItems().map((row) => {
        const ry = row.start - scrollOffset.top

        return columnVirtualizer.getVirtualItems().map((col) => {
          const rx = col.start - scrollOffset.left

          const v = df.get(row.index, col.index)

          const isNum = typeof v === 'number'

          const highlight = highlightCell(
            row.index,
            col.index,
            selection,
            currentCell
          )

          return (
            <CenterRow
              data-highlight={highlight}
              className="border-border border-b border-r select-none overflow-hidden truncate px-2 py-1 absolute data-[highlight=true]:bg-app-theme/10"
              key={`${row.key}:${col.key}`}
              style={{
                transform: `translate3d(${rx}px, ${ry}px, 0)`,
                width: col.size,
                height: scaledCell.h,
                fontSize,
                justifyContent: isNum ? 'end' : 'start',
              }}
            >
              {cellStr(v, { dp, commas })}
            </CenterRow>
          )
        })
      })}

      {selectionPos && (
        <SelectionRect
          selectionPos={selectionPos}
          scrollLeft={scrollOffset.left}
          scrollTop={scrollOffset.top}
        />
      )}

      {currentCellPos && (
        <input
          className="resize-none bg-background outline-hidden absolute z-30 m-0.5 px-1.5"
          style={{
            transform: currentCellPos
              ? `translate3d(${currentCellPos.x - scrollOffset.left}px, ${currentCellPos.y - scrollOffset.top}px, 0)`
              : undefined,
            width: currentCell ? getColWidth(currentCell.col) - 5 : undefined,
            height: scaledCell.h - 5,
            fontSize,
            textAlign: !isNaN(parseFloat(editText)) ? 'right' : 'left',
            //userSelect: showTextCell ? 'auto' : 'none',
            //pointerEvents: showTextCell ? 'auto' : 'none',
          }}
          value={editText}
          onChange={(e) => {
            onEditChange(e)
            e.stopPropagation()
          }}
          onKeyDown={handleCellKeyDown}
 
          ref={editRef}
        />
      )}
    </div>
  )
}
