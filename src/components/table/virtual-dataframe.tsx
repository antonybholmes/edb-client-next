import type { ICell } from '@/interfaces/cell'
import type { IDim } from '@/interfaces/dim'
import type { IPos } from '@/interfaces/pos'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { cellStr } from '@/lib/dataframe/cell'
import type { DataFrame } from '@/lib/dataframe/dataframe'
import { DEFAULT_INDEX_NAME } from '@/lib/dataframe/series'
import { range } from '@/lib/math/range'
import { cn } from '@/lib/shadcn-utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import { produce } from 'immer'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  NO_SELECTION,
  NO_SELECTION_RANGE,
  useSelectionRange,
  type ISelectionRange,
} from '../../providers/selection-range'
import { BaseCol } from '../layout/base-col'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import { Input } from '../shadcn/ui/themed/v2/input'

// Sample data
// const data = [
//   { name: 'John Doe', age: 28, city: 'New York' },
//   { name: 'Jane Smith', age: 34, city: 'Los Angeles' },
//   { name: 'Tom Brown', age: 45, city: 'Chicago' },
//   { name: 'Emily Davis', age: 23, city: 'Houston' },
//   { name: 'Michael Johnson', age: SCROLL_MARGIN_SIZE, city: 'Dallas' },
//   { name: 'Sarah Lee', age: 29, city: 'San Francisco' },
//   // Add more rows as needed
// ]

// Column and row count
// const columnCount = 3 // 3 columns: Name, Age, City
// const rowCount = data.length

// Chrome, at least, supports 16,384px, but we'll use 16,000px as a safe value

const MIN_CELL_WIDTH = 25
const SCROLL_SPEED_MS = 50
const SCROLL_MARGIN_SIZE = 50

const SIZER_CLS = 'invisible bg-black h-px w-px absolute top-0 left-0'

const INDEX_CLS = cn(
  'pr-[1px] border-b border-r border-border justify-center overflow-hidden box-border absolute',
  'data-[checked="primary"]:bg-blue-500 data-[checked="primary"]:text-white data-[checked="primary"]:border-r-blue-500',
  'data-[checked="secondary"]:bg-blue-200 data-[checked="secondary"]:text-blue-700 data-[checked="secondary"]:border-b-blue-300',
  'data-[show-border=true]:border-r-blue-500 data-[show-border=true]:border-r-2 pr-0'
)

const HEADER_CLS = cn(
  'pb-[1px] box-border border-border border-b border-r relative justify-center absolute',
  'data-[checked="primary"]:bg-blue-500 data-[checked="primary"]:text-white data-[checked="primary"]:pb-0',
  'data-[checked="secondary"]:border-r-blue-300 data-[checked="secondary"]:border-b-blue-500',
  'data-[checked="secondary"]:bg-blue-200 data-[checked="secondary"]:text-blue-700 data-[checked="secondary"]:pb-0',
  'data-[show-border=true]:border-b-blue-500 data-[show-border=true]:border-b-2 pb-0'
)

const RESIZE_CLS =
  'absolute w-2 top-0 right-0 bottom-0 cursor-col-resize justify-center translate-x-1/2 opacity-0 hover:opacity-100 data-[resize=true]:opacity-100'

const RESIZE_HANDLE_CLS =
  'h-4/5 w-1.5 rounded-full bg-background border-foreground border pointer-events-none z-20'

const BASE_FONT_SIZE = 0.75

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
  cell?: IDim
  editable?: boolean
  zoom?: number | undefined
}

export function VirtualDataFrame({
  df,
  cell = { w: 72, h: 24 },
  editable = false,
  zoom = 1,
}: IVirtualDataFrameProps) {
  const loopRef = useRef<NodeJS.Timeout>(null) // To store the interval reference

  const startPos = useRef<IPos>({ x: -1, y: -1 })

  const tableRef = useRef<HTMLDivElement>(null)
  const hScrollRef = useRef<HTMLDivElement>(null)
  const vScrollRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const startWidth = useRef(0)
  const [colWidths, setColWidths] = useState<Record<number, number>>({})

  const { selection, updateSelection, clearSelection } = useSelectionRange()

  const [editText, setEditText] = useState('')
  const [selText, setSelectedCellRefText] = useState('')

  const scaledCell: IDim = useMemo(() => {
    return {
      w: cell.w * zoom,
      h: cell.h * zoom,
    }
  }, [cell.w, cell.h, zoom])

  function getColWidth(col: number): number {
    // if column is resized whilst zoomed, then if the scale
    // is changed, column will retain the same width (is this desired?)
    return colWidths[col] ?? scaledCell.w
  }

  // keep track of the offset that the components should
  // be moved to. We use this to calculate where on the
  // virtual canvas we are looking
  const rowVirtualizer = useVirtualizer({
    count: df.shape[0],
    getScrollElement: () => vScrollRef.current,
    estimateSize: () => scaledCell.h,
    overscan: 5,
  })

  // COLUMN VIRTUALIZER (horizontal)
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: df.shape[1],
    getScrollElement: () => hScrollRef.current,
    estimateSize: i => getColWidth(i),
    overscan: 3,
  })

  // determine where to focus the image when dragging the mouse
  // around. This is independent of the selection so the focus
  // can change even when the selected cell does not
  const [currentCell, setCurrentCell] = useState<ICell>(NO_SELECTION)
  const selectionRef = useRef(selection)

  //const [selectionMouseDown, setSelectionMouseDown] = useState(false)
  const [resizenMouseDown, setResizeMouseDown] = useState(-1)

  useEffect(() => {
    currentSelection(NO_SELECTION)

    clearSelection()
  }, [df.id])

  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  const indexWidth = useMemo(
    () => df.rowObs.shape[1] * scaledCell.w,
    [df.rowObs.shape[1], scaledCell.w]
  )

  const headerHeight = useMemo(
    () => df.colVars.shape[1] * scaledCell.h,
    [df.colVars.shape[1], scaledCell.h]
  )

  const fontSize = useMemo(() => `${BASE_FONT_SIZE * zoom}rem`, [zoom])

  const colIndexes = useMemo(() => range(df.shape[1]), [df])

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

  function getColX(col: number) {
    return {
      x: range(col).reduce((a, b) => a + getColWidth(b), 0),
      w: getColWidth(col),
    }
  }

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

      setColWidths(
        produce(colWidths, draft => {
          draft[col] = newWidth
        })
      )

      // trigger layout recalculation
      columnVirtualizer.measure()
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
        moveEvent.clientX - (tableRef.current?.getBoundingClientRect().x ?? 0)

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

        resizeSelection({
          start: { row: -1, col: i1 },
          end: { row: -1, col: i2 },
        })
      }
    }

    //setSelectionMouseDown(true)

    resizeSelection({
      start: { row: -1, col: index },
      end: { row: -1, col: index },
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

  function handleIndexMouseDown(row: number) {
    function onMouseMove(moveEvent: MouseEvent) {
      const newY =
        moveEvent.clientY - (tableRef.current?.getBoundingClientRect().y ?? 0)

      let row2 =
        rowVirtualizer.getVirtualItems()[Math.floor(newY / scaledCell.h)]!

      const i1 = Math.min(row, row2.index)
      const i2 = Math.max(row, row2.index)

      resizeSelection({
        start: { row: i1, col: -1 },
        end: { row: i2, col: -1 },
      })
    }

    //setSelectionMouseDown(true)

    resizeSelection({
      start: { row, col: -1 },
      end: { row, col: -1 },
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

  function handleTableMouseDown(event: MouseEvent | React.MouseEvent) {
    const elementRect = tableRef.current!.getBoundingClientRect()
    const bottomMargin = elementRect.bottom - SCROLL_MARGIN_SIZE // Calculate bottom SCROLL_MARGIN_SIZE pixels of element
    const rightMargin = elementRect.right - SCROLL_MARGIN_SIZE // Calculate bottom SCROLL_MARGIN_SIZE pixels of element

    function onMouseMove(moveEvent: MouseEvent) {
      if (moveEvent.clientY - elementRect.top <= SCROLL_MARGIN_SIZE) {
        if (!loopRef.current) {
          loopRef.current = setInterval(() => {
            if (vScrollRef.current) {
              vScrollRef.current.scrollTop -= scaledCell.h
            }
          }, SCROLL_SPEED_MS) // Trigger action every 500ms
        }
      } else if (moveEvent.clientY >= bottomMargin) {
        if (!loopRef.current) {
          loopRef.current = setInterval(() => {
            if (vScrollRef.current) {
              vScrollRef.current.scrollTop += scaledCell.h
            }
          }, SCROLL_SPEED_MS) // Trigger action every 500ms
        }
      } else if (moveEvent.clientX - elementRect.left <= SCROLL_MARGIN_SIZE) {
        if (!loopRef.current) {
          loopRef.current = setInterval(() => {
            if (hScrollRef.current) {
              hScrollRef.current.scrollLeft -= scaledCell.w
            }
          }, SCROLL_SPEED_MS) // Trigger action every 500ms
        }
      } else if (moveEvent.clientX >= rightMargin) {
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
        moveEvent.clientX -
        elementRect.x +
        (hScrollRef.current?.scrollLeft ?? 0)

      const newY =
        moveEvent.clientY - elementRect.y + (vScrollRef.current?.scrollTop ?? 0)

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

      const c1 = Math.min(index, index2)
      const c2 = Math.max(index, index2)

      const y1 = Math.floor(Math.min(startPos.current.y, newY) / scaledCell.h)
      const y2 = Math.floor(Math.max(startPos.current.y, newY) / scaledCell.h)

      if (index > -1 && index2 > -1 && y1 > -1 && y2 > -1) {
        resizeSelection({
          start: {
            row: y1,
            col: c1,
          },
          end: { row: y2, col: c2 },
        })
      }
    }

    startPos.current = {
      x:
        event.clientX -
        elementRect.left +
        (hScrollRef.current?.scrollLeft ?? 0),
      y: event.clientY - elementRect.top + (vScrollRef.current?.scrollTop ?? 0),
    }

    let x1 = 0

    let col = 0
    let row = Math.floor(startPos.current.y / scaledCell.h)

    for (const i of colIndexes) {
      const x2 = x1 + getColWidth(i)

      if (startPos.current.x >= x1 && startPos.current.x <= x2) {
        col = i
        break
      }

      x1 = x2
    }

    currentSelection({ row, col })

    resizeSelection({
      start: { row, col },
      end: { row, col },
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

  function onKeyDown(e: KeyboardEvent | React.KeyboardEvent) {
    //console.log(e.code, e.shiftKey)

    const d = tableRef.current

    if (!d) {
      return
    }

    // this function is called via window listener so seems to
    // need ref to selection rather than state version otherwise
    // it gets out of sync
    const selection = selectionRef.current

    if (e.ctrlKey) {
      switch (e.code) {
        // ctrl+c copy to clipboard
        case 'KeyC':
          console.log('copy', selection)
          if (
            selection.start !== NO_SELECTION &&
            selection.end !== NO_SELECTION
          ) {
            // first the headings
            const out: string[][] = [
              [
                ...df.rowObs.columns,
                ...range(selection.start.col, selection.end.col + 1).map(
                  col => df.columns[col]!
                ),
              ],

              // now add the selected rows
              ...range(selection.start.row, selection.end.row + 1).map(row => [
                ...(df.rowObs as DataFrame)._data[row]!.map(v => cellStr(v)),
                ...range(selection.start.col, selection.end.col + 1).map(col =>
                  cellStr((df._data as DataFrame)._data[row]![col]!)
                ),
              ]),
            ]

            const s = out.map(r => r.join('\t')).join('\n')

            //console.log(s)

            navigator.clipboard.writeText(s)
          }

          break
      }

      return
    }

    let s1: ICell
    switch (e.code) {
      case 'ArrowLeft':
        if (e.shiftKey) {
          const end = {
            row: selection.start.row,
            col: Math.max(0, selection.end.col - 1),
          }

          resizeSelection({
            start: selection.start,
            end,
          })
          setFocusCell(end)
        } else {
          s1 = {
            row: selection.start.row,
            col: Math.max(0, selection.start.col - 1),
          }

          currentSelection(s1)

          resizeSelection({
            start: s1,
            end: s1,
          })

          setFocusCell(s1)
        }
        break
      case 'Tab':
      case 'ArrowRight':
        if (e.shiftKey && e.ctrlKey) {
          const end = { row: selection.start.row, col: df.shape[1] - 1 }
          resizeSelection({
            start: selection.start,
            end,
          })

          setFocusCell(end)
        } else if (e.shiftKey) {
          const end = {
            row: selection.start.row,
            col: Math.min(df.shape[1] - 1, selection.end.col + 1),
          }
          resizeSelection({
            start: selection.start,
            end,
          })

          setFocusCell(end)
        } else {
          s1 = {
            row: selection.start.row,
            col: Math.min(df.shape[1] - 1, selection.start.col + 1),
          }

          currentSelection(s1)

          resizeSelection({
            start: s1,
            end: s1,
          })

          setFocusCell(s1)
        }
        break
      case 'ArrowUp':
        if (e.shiftKey) {
          const end = {
            row: Math.max(0, selection.end.row - 1),
            col: selection.end.col,
          }

          resizeSelection({
            start: selection.start,
            end,
          })
          setFocusCell(end)
        } else {
          s1 = {
            row: Math.max(0, selection.start.row - 1),
            col: selection.end.col,
          }

          currentSelection(s1)

          resizeSelection({
            start: s1,
            end: s1,
          })

          setFocusCell(s1)
        }
        break
      case 'ArrowDown':
        if (e.shiftKey && e.ctrlKey) {
          const end = { row: df.shape[0] - 1, col: selection.start.col }
          resizeSelection({
            start: selection.start,
            end,
          })
          setFocusCell(end)
        } else if (e.shiftKey) {
          const end = {
            row: Math.min(df.shape[0] - 1, selection.end.row + 1),
            col: selection.end.col,
          }

          resizeSelection({
            start: selection.start,
            end,
          })
          setFocusCell(end)
        } else {
          s1 = {
            row: Math.min(df.shape[0] - 1, selection.start.row + 1),
            col: selection.start.col,
          }

          currentSelection(s1)

          resizeSelection({
            start: s1,
            end: s1,
          })

          setFocusCell(s1)
        }
        break
      case 'PageUp':
        d.scrollTop -= d.clientHeight
        break
      case 'PageDown':
        d.scrollTop += d.clientHeight
        break
      case 'Enter':
        //setEditCell(selection.start)
        break
      case 'Escape':
        currentSelection(NO_SELECTION)
        resizeSelection(NO_SELECTION_RANGE)
        break
      default:
        break
    }

    e.preventDefault()
    //e.stopPropagation()
  }

  function onEditChange(e: ChangeEvent) {
    setEditText((e.target as HTMLInputElement).value)
  }

  function onEditKeyDown(e: React.KeyboardEvent) {
    if (!editable) {
      return
    }

    switch (e.code) {
      case 'Enter':
        if (selection.start.row !== -1) {
          df.at(selection.start.row, selection.start.col, editText)
        }

        resizeSelection({
          start: selection.start,
          end: selection.start,
        })
        //setEditCell(NO_SELECTION)
        break
    }
  }

  function resizeSelection(s: ISelectionRange) {
    updateSelection(s)
  }

  function currentSelection(cell: ICell) {
    if (cell.col !== -1 && cell.row !== -1) {
      setEditText(cellStr((df._data as DataFrame)._data[cell.row]![cell.col]!))

      setSelectedCellRefText(`${cell.row + 1}R x ${cell.col + 1}C`)
    } else {
      setEditText('')
      setSelectedCellRefText('')
    }

    setCurrentCell(cell)
  }

  function handleCellKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
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

      currentSelection(newCell)

      resizeSelection({
        start: newCell,
        end: newCell,
      })
    }
  }

  const selectionPos = useMemo(() => {
    const { x: x1 } = getColX(selection.start.col)

    const { x: x2, w } = getColX(selection.end.col)

    return {
      x1,
      w: x2 + w - x1,
      y1: selection.start.row * scaledCell.h,
      y2: (selection.end.row + 1) * scaledCell.h - 1,
    }
  }, [
    selection.start.col,
    selection.end.col,
    selection.start.row,
    selection.end.row,
    colWidths,
    scaledCell.w,
    scaledCell.h,
  ])

  const currentCellPos: IPos = useMemo(() => {
    //console.log('currentCellPos', selection)

    const { x } = getColX(currentCell.col)

    return { x, y: currentCell.row * scaledCell.h }
  }, [currentCell.col, currentCell.row, colWidths, scaledCell.w, scaledCell.h])

  // const scrollOffset = useMemo(
  //   () => [
  //     scrollLeft - (scrollLeft % scaledCell.w),
  //     scrollTop - (scrollTop % scaledCell.h),
  //   ],
  //   [scrollLeft, scrollTop, scaledCell]
  // )

  // oweing to the edit feature which can direct focus off the table,
  // we need to listen for events globally to cope with arrow keys
  // and cut and paste etc.

  return (
    <BaseCol
      id="dataframe"
      className="gap-y-2 grow"
      tabIndex={0}
      onFocus={() => {
        window.addEventListener('keydown', onKeyDown)
      }}
      onBlur={() => window.removeEventListener('keydown', onKeyDown)}
    >
      <VCenterRow className="gap-x-3 text-sm">
        <label htmlFor="cell-address" className="sr-only">
          Cell address
        </label>
        <Input
          id="cell-address"
          value={selText}
          w="sm"
          className="rounded-theme"
          //readOnly
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

      <BaseRow className="grow text-xs">
        <BaseCol
          id="table-index"
          className="font-semibold mb-4 rounded-l-theme overflow-hidden border-r border-b border-l border-t border-border shrink-0"
          style={{
            width: indexWidth,
          }}
        >
          <BaseRow
            id="table-index-header"
            className="select-none pb-px items-end border-b border-border"
            style={{
              height: headerHeight,
            }}
          >
            {df.rowObs.columns.map((colName, col) => {
              return (
                <VCenterRow
                  key={col}
                  className="justify-center overflow-hidden truncate"
                  style={{
                    width: scaledCell.w,
                    height: scaledCell.h,
                    fontSize,
                  }}
                >
                  {colName !== DEFAULT_INDEX_NAME ? colName : ''}
                </VCenterRow>
              )
            })}
          </BaseRow>

          <BaseCol
            id="table-index-container"
            className="relative overflow-hidden grow select-none"
            style={{
              width: indexWidth,
            }}
            onWheel={e => {
              if (vScrollRef.current) {
                vScrollRef.current.scrollTop += e.deltaY
              }
            }}
          >
            {rowVirtualizer.getVirtualItems().map(row => (
              <VCenterRow
                key={row.key}
                onMouseDown={() => handleIndexMouseDown(row.index)}
                className={INDEX_CLS}
                style={{
                  width: indexWidth,
                  height: scaledCell.h,
                  transform: `translate3d(0, ${row.start - scrollTop}px, 0)`,
                }}
              >
                {range(df.rowObs.shape[1]).map(col => {
                  const v = df.rowObs.get(row.index, col)

                  return (
                    <VCenterRow
                      key={col}
                      className="justify-center p-1 truncate box-border"
                      style={{
                        width: scaledCell.w,
                        height: scaledCell.h,
                        fontSize,
                      }}
                    >
                      {cellStr(v)}
                    </VCenterRow>
                  )
                })}
              </VCenterRow>
            ))}
          </BaseCol>
        </BaseCol>

        <BaseCol className="grow">
          <BaseCol
            className="grow rounded-r-theme overflow-hidden border-t border-b border-r border-border"
            id="table-body"
          >
            <BaseRow
              id="table-header-container"
              className="relative overflow-hidden font-semibold select-none items-end shrink-0"
              style={{
                height: headerHeight,
              }}
              onWheel={e => {
                if (hScrollRef.current) {
                  hScrollRef.current.scrollLeft += e.deltaY
                }
              }}
            >
              {columnVirtualizer.getVirtualItems().map(col => (
                <BaseCol
                  id="table-header"
                  key={col.key}
                  className={HEADER_CLS}
                  style={{
                    width: getColWidth(col.index),
                    height: headerHeight,
                    transform: `translate3d(${col.start - scrollLeft}px, 0, 0)`,
                  }}
                  onMouseDown={() => handleHeaderMouseDown(col.index)}
                >
                  {range(df.colVars.shape[1]).map(metaDataCol => {
                    // const v = (df.colMetaData as DataFrame)._data[col.index]![
                    //   metaDataCol
                    // ]!

                    const v = df.colVars.get(col.index, metaDataCol)

                    return (
                      <VCenterRow
                        key={metaDataCol}
                        className="justify-center p-1 truncate box-border"
                        style={{
                          height: scaledCell.h,
                          fontSize,
                        }}
                      >
                        {cellStr(v)}
                      </VCenterRow>
                    )
                  })}

                  <VCenterRow
                    className={RESIZE_CLS}
                    onMouseDown={e => {
                      // don't want parent thinking we are changing selection
                      e.stopPropagation()
                      e.preventDefault()
                      handleResizeMouseDown(col.index, e)
                    }}
                    data-resize={col.index === resizenMouseDown}
                  >
                    <span className={RESIZE_HANDLE_CLS} />
                  </VCenterRow>
                </BaseCol>
              ))}
            </BaseRow>

            <div
              id="table-data"
              className="relative grow overflow-hidden bg-background"
              ref={tableRef}
              onMouseDown={(e: MouseEvent | React.MouseEvent) => {
                e.stopPropagation()
                e.preventDefault()
                handleTableMouseDown(e)
              }}
              onWheel={e => {
                if (vScrollRef.current) {
                  vScrollRef.current.scrollTop += e.deltaY
                }
                //onScroll({top:scrollPos.top+e.deltaY, left:scrollPos.left})
              }}
            >
              {rowVirtualizer.getVirtualItems().map(row => {
                const rx = row.start - scrollTop

                return columnVirtualizer.getVirtualItems().map(col => {
                  // const v = (df._data as DataFrame)._data[row.index]?.[
                  //   col.index
                  // ]!

                  const v = df.get(row.index, col.index)

                  const isNum = typeof v === 'number'

                  const highlight = highlightCell(
                    row.index,
                    col.index,
                    selection,
                    currentCell
                  )

                  return (
                    <div
                      className={cn(
                        'border-border border-b border-r box-border overflow-hidden truncate p-1 absolute',
                        highlight && 'bg-blue-100 dark:text-background'
                      )}
                      key={`${row.key}:${col.key}`}
                      style={{
                        transform: `translate3d(${col.start - scrollLeft}px, ${rx}px, 0)`,
                        width: col.size,
                        height: scaledCell.h,
                        fontSize,
                        justifyContent: isNum ? 'end' : 'start',
                      }}
                    >
                      {cellStr(v)}
                    </div>
                  )
                })
              })}

              {selection.start.col !== -1 && selection.start.row === -1 && (
                <span
                  style={{
                    //top: 0,
                    //left: selectionPos.x1 - scrollPos.left,
                    transform: `translate3d(${selectionPos.x1 - scrollLeft}px, 0, 0)`,
                    width: selectionPos.w - 1,
                    // height: Math.min(
                    //   scrollSize.h - scrollPos.top,
                    //   tableRef.current?.clientHeight ?? 0
                    // ),
                  }}
                  className="border-r-2 border-l-2 border-b-2 border-blue-500 absolute z-20"
                />
              )}

              {selection.start.col === -1 && selection.start.row !== -1 && (
                <span
                  style={{
                    //top: selectionPos.y1 - scrollPos.top,
                    //left: 0,
                    transform: `translate3d(0, ${selectionPos.y1 - scrollTop}px, 0)`,
                    height: selectionPos.y2 - selectionPos.y1,

                    // width: Math.min(
                    //   scrollSize.w,
                    //   tableRef.current?.clientWidth ?? 0
                    // ),
                  }}
                  className="border-t-2 border-b-2 border-r-2 border-blue-500 absolute z-20"
                />
              )}

              {selection.start.col !== -1 && selection.start.row !== -1 && (
                <span
                  style={{
                    //top: selectionPos.y1 - scrollPos.top,
                    //left: selectionPos.x1 - scrollPos.left,
                    transform: `translate3d(${selectionPos.x1 - scrollLeft}px, ${selectionPos.y1 - scrollTop}px, 0)`,
                    width: selectionPos.w - 1,
                    height: selectionPos.y2 - selectionPos.y1,
                  }}
                  className="border-2 border-blue-500 absolute z-20"
                />
              )}

              <input
                className="resize-none bg-background outline-hidden absolute z-30 m-0.5 p-0.5"
                style={{
                  //top: currentCellPos.y - scrollPos.top,
                  //left: currentCellPos.x - scrollPos.left,
                  transform: `translate3d(${currentCellPos.x - scrollLeft}px, ${currentCellPos.y - scrollTop}px, 0)`,
                  width: getColWidth(currentCell.col) - 5,
                  height: scaledCell.h - 5,
                  visibility: currentCell.row !== -1 ? 'visible' : 'hidden',
                  fontSize,
                  textAlign: !isNaN(parseFloat(editText)) ? 'right' : 'left',
                }}
                value={editText}
                onChange={e => {
                  onEditChange(e)
                }}
                onKeyDown={handleCellKeyDown}
                //onFocus={e => e.target.select()}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                ref={editRef}
              />
            </div>
          </BaseCol>

          <div
            id="table-h-scroll"
            className="relative overflow-x-scroll overflow-y-hidden h-4 custom-scrollbar"
            ref={hScrollRef}
            onScroll={() => setScrollLeft(hScrollRef.current!.scrollLeft)}
          >
            <span
              className={SIZER_CLS}
              style={{
                width: columnVirtualizer.getTotalSize(),
              }}
            />
          </div>
        </BaseCol>

        <div
          id="table-v-scroll"
          className="relative overflow-y-scroll overflow-x-hidden w-4 mb-4 custom-scrollbar"
          ref={vScrollRef}
          onScroll={() => setScrollTop(vScrollRef.current!.scrollTop)}
          style={{ marginTop: scaledCell.h }}
        >
          <span
            className={SIZER_CLS}
            style={{
              height: rowVirtualizer.getTotalSize(),
            }}
          />
        </div>

        {/* <ScrollArea
          //ref={vScrollRef}
          //onScroll={() => setScrollTop(vScrollRef.current!.scrollTop)}
          //style={{ marginTop: scaledCell.h }}
          className="border w-8"
        >
          <div
            className={SIZER_CLS}
            style={{
              width: 10,
              height: rowVirtualizer.getTotalSize(),
            }}
          />
        </ScrollArea> */}
      </BaseRow>
    </BaseCol>
  )
}

// function getColWidth(
//   col: number,
//   colWidths: Map<number, number>,
//   defaultWidth: number
// ): number {
//   return colWidths.has(col) ? colWidths.get(col)! : defaultWidth
// }

// function getColX(
//   col: number,
//   colWidths: Map<number, number>,
//   defaultWidth: number
// ) {
//   return {
//     x: range(col).reduce(
//       (a, b) => a + getColWidth(b, colWidths, defaultWidth),
//       0
//     ),
//     w: getColWidth(col, colWidths, defaultWidth),
//   }
// }

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
  selection: ISelectionRange,
  currentCell: ICell
): boolean {
  return (
    (col >= selection.start.col &&
      col <= selection.end.col &&
      row >= selection.start.row &&
      row <= selection.end.row &&
      (row !== currentCell.row || col !== currentCell.col)) ||
    (col >= selection.start.col &&
      col <= selection.end.col &&
      selection.start.row === -1) ||
    (row >= selection.start.row &&
      row <= selection.end.row &&
      selection.start.col === -1)
  )
}
