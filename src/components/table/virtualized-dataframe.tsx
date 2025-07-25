import { useZoom } from '@/providers/zoom-provider'
import type { ICell } from '@interfaces/cell'
import type { IDim } from '@interfaces/dim'
import type { IPos } from '@interfaces/pos'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { cellStr } from '@lib/dataframe/cell'
import type { DataFrame } from '@lib/dataframe/dataframe'
import { DEFAULT_INDEX_NAME } from '@lib/dataframe/series'
import { range } from '@lib/math/range'
import { cn } from '@lib/shadcn-utils'
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
import { Input } from '../shadcn/ui/themed/input'

// // Sample data
// const data = [
//   { name: 'John Doe', age: 28, city: 'New York' },
//   { name: 'Jane Smith', age: 34, city: 'Los Angeles' },
//   { name: 'Tom Brown', age: 45, city: 'Chicago' },
//   { name: 'Emily Davis', age: 23, city: 'Houston' },
//   { name: 'Michael Johnson', age: SCROLL_MARGIN_SIZE, city: 'Dallas' },
//   { name: 'Sarah Lee', age: 29, city: 'San Francisco' },
//   // Add more rows as needed
// ]

// // Column and row count
// const columnCount = 3 // 3 columns: Name, Age, City
// const rowCount = data.length

// Chrome, at least, supports 16,384px, but we'll use 16,000px as a safe value
export const MAX_CANVAS_SIZE = 16000
const MIN_CELL_WIDTH = 25
const SCROLL_SPEED_MS = 50
const SCROLL_MARGIN_SIZE = 50

const SIZER_CLS = 'invisible bg-black absolute left-0 top-0 h-px w-px'

const INDEX_CLS = cn(
  'pr-[1px] border-b border-r border-border justify-center overflow-hidden box-border',
  'data-[checked="primary"]:bg-blue-500 data-[checked="primary"]:text-white data-[checked="primary"]:border-r-blue-500',
  'data-[checked="secondary"]:bg-blue-200 data-[checked="secondary"]:text-blue-700 data-[checked="secondary"]:border-b-blue-300',
  'data-[show-border=true]:border-r-blue-500 data-[show-border=true]:border-r-2 pr-0'
)

const HEADER_CLS = cn(
  'pb-[1px] box-border border-border border-b border-r relative justify-center',
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

type IScrollPos = { top: number; left: number }

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
interface IVirtualizedDataFrameProps {
  df: AnnotationDataFrame
  cell?: IDim
  editable?: boolean
  zoom?: number | undefined
}

export function VirtualizedDataFrame({
  df,
  cell = { w: 72, h: 24 },
  editable = false,
  zoom,
}: IVirtualizedDataFrameProps) {
  const { zoom: globalZoom } = useZoom()

  //const [scrollTop, setScrollTop] = useState(0)
  //const [scrollLeft, setScrollLeft] = useState(0)
  const [visibleRows, setVisibleRows] = useState<number[]>([])
  const [visibleCols, setVisibleCols] = useState<number[]>([])
  const loopRef = useRef<NodeJS.Timeout>(null) // To store the interval reference

  //const ignoreScroll = useRef(false)
  const [visibleItems, setVisibleItems] = useState<{
    rows: number[]
    cols: number[]
  }>({ rows: [], cols: [] })

  const headerRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const hScrollRef = useRef<HTMLDivElement>(null)
  const vScrollRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  // keep track of the offset that the components should
  // be moved to. We use this to calculate where on the
  // virtual canvas we are looking
  const [scrollPos, setScrollPos] = useState<IScrollPos>({ top: 0, left: 0 })

  //const vScrollPos = useRef<IScrollPos>({ top: 0, left: 0 })

  const startPos = useRef<IPos>({ x: 0, y: 0 }) // For tracking mouse start position
  const startWidth = useRef(0)
  const [colWidths, setColWidths] = useState(new Map<number, number>())

  const { selection, updateSelection, clearSelection } = useSelectionRange()

  const [editText, setEditText] = useState('')
  const [selText, setSelectedCellRefText] = useState('')

  // determine where to focus the image when dragging the mouse
  // around. This is independent of the selection so the focus
  // can change even when the selected cell does not
  const [currentCell, setCurrentCell] = useState<ICell>(NO_SELECTION)
  const selectionRef = useRef(selection)

  const [selectionMouseDown, setSelectionMouseDown] = useState(false)
  const [resizenMouseDown, setResizeMouseDown] = useState(-1)

  useEffect(() => {
    currentSelection(NO_SELECTION)

    clearSelection()
  }, [df.id])

  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  const scaledCell: IDim = useMemo(() => {
    const z = zoom !== undefined ? zoom : globalZoom
    return {
      w: cell.w * z,
      h: cell.h * z,
    }
  }, [cell.w, cell.h, zoom, globalZoom])

  const indexWidth = useMemo(
    () => df.rowMetaData.shape[1] * scaledCell.w,
    [df.rowMetaData.shape[1], scaledCell.w]
  )

  const headerHeight = useMemo(
    () => df.colMetaData.shape[1] * scaledCell.h,
    [df.colMetaData.shape[1], scaledCell.h]
  )

  const fontSize = useMemo(
    () => `${BASE_FONT_SIZE * (zoom !== undefined ? zoom : globalZoom)}rem`,
    [zoom, globalZoom]
  )

  const colIndexes = useMemo(() => range(df.shape[1]), [df])

  // cope with columns of different sizes
  const tableSize = useMemo(
    () => ({
      w: range(df.shape[1]).reduce((a, b) => a + getColWidth(b), 0),
      h: df.shape[0] * scaledCell.h,
    }),
    [df, scaledCell, colWidths]
  )

  const scrollSize = useMemo(
    () => ({
      w: Math.min(tableSize.w, MAX_CANVAS_SIZE),
      h: Math.min(tableSize.h, MAX_CANVAS_SIZE),
    }),
    [tableSize]
  )

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

  function updateWidth(scaledCell: IDim) {
    if (tableRef.current) {
      // generate 1 extra row and column for aesthetics
      setVisibleItems({
        rows: range(
          0,
          Math.ceil(tableRef.current.offsetHeight / scaledCell.h) + 1
        ),
        cols: range(
          0,
          Math.ceil(tableRef.current.offsetWidth / scaledCell.w) + 1
        ),
      })
    }
  }

  useEffect(() => {
    updateWidth(scaledCell)
  }, [scaledCell])

  useEffect(() => {
    // Create a new ResizeObserver instance
    const resizeObserver = new ResizeObserver(() => {
      //   if (entries.length > 0) {
      //     // Get the size of the parent element
      //     const parent = entries[0].contentRect
      //     setSize({ width: parent.width, height: parent.height })
      //   }

      updateWidth(scaledCell)
    })

    updateWidth(scaledCell)

    // Observe the parent element
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current)
    }

    // Clean up the ResizeObserver when the component is unmounted
    return () => {
      if (tableRef.current) {
        resizeObserver.unobserve(tableRef.current)
      }
    }
  }, [scaledCell.w, scaledCell.h])

  function getColWidth(col: number): number {
    // if column is resized whilst zoomed, then if the scale
    // is changed, column will retain the same width (is this desired?)
    return colWidths.has(col) ? colWidths.get(col)! : scaledCell.w
  }

  function getColX(col: number) {
    return {
      x: range(col).reduce((a, b) => a + getColWidth(b), 0),
      w: getColWidth(col),
    }
  }

  function getVisibleRows(scrollTop: number): number[] {
    const startRow = Math.max(0, Math.floor(scrollTop / scaledCell.h))
    const endRow = Math.min(startRow + visibleItems.rows.length, df.shape[0])

    return range(startRow, endRow)
  }

  function getVisibleCols(scrollLeft: number): number[] {
    const startCol = Math.max(0, Math.floor(scrollLeft / scaledCell.w))
    const endCol = Math.min(startCol + visibleItems.cols.length, df.shape[1])

    return range(startCol, endCol)
  }

  function onScroll(pos: IScrollPos) {
    // if (ignoreScroll.current) {
    //   return
    // }

    //const vSource = vSourceRef.current
    //const hSource = hSourceRef.current

    //const scrollHeight = vSource.scrollHeight
    //const clientHeight = vSource.clientHeight

    // scroll events occur when the div height exceeds the client height
    // in which case we convert the the scroll position into a normalized
    // value and then calculate the scroll position in the virtual canvas
    // thus we can have a virtual canvas much larger than what the
    // browser actually supports (they seem to have issues beyond 16000px).

    // the real position of the scroll bar as a fraction of the total scroll height
    // since the canvas can be smaller than the table size if the table has a lot of rows

    //pos = { top: Math.max(0, pos.top), left: Math.max(0, pos.left) }

    let scrollDiff = scrollSize.h - tableRef.current!.clientHeight

    const fracScrollTop = scrollDiff > 0 ? pos.top / scrollDiff : 0

    // the virtual scrolltop using the real table height
    const vScrollTop = Math.round(
      fracScrollTop * (tableSize.h - tableRef.current!.clientHeight)
    )

    //setScrollTop(vSource.scrollTop)
    setVisibleRows(getVisibleRows(vScrollTop))

    //const scrollWidth = hSource.scrollWidth // e.currentTarget.scrollHeight
    //const clientWidth = hSource.clientWidth

    scrollDiff = scrollSize.w - tableRef.current!.clientWidth

    const fracScrollLeft = scrollDiff > 0 ? pos.left / scrollDiff : 0

    const vScrollLeft = Math.round(
      fracScrollLeft * (tableSize.w - tableRef.current!.clientWidth)
    )

    //setScrollLeft(hSource.scrollLeft)
    setVisibleCols(getVisibleCols(vScrollLeft))

    setScrollPos(pos)

    //vScrollPos.current = { left: vScrollLeft, top: vScrollTop }

    // if (hSourceRef.current) {
    //   const sl = hSourceRef.current.scrollLeft
    //   setScrollLeft(sl)

    //   setVisibleCols(getVisibleCols(sl))
    // }

    // ignoreScroll.current = true

    // if (targetVRef.length > 0) {
    //   const v = pos.top / scrollSize.h

    //   for (const ref of targetVRef) {
    //     if (ref.current) {
    //       ref.current.scrollTop = v * ref.current.scrollHeight
    //     }
    //   }
    // }

    // if (targetHRef.length > 0) {
    //   const v = pos.left / scrollSize.w

    //   for (const ref of targetHRef) {
    //     if (ref.current) {
    //       ref.current.scrollLeft = v * ref.current.scrollWidth
    //     }
    //   }
    // }

    // ignoreScroll.current = false
  }

  useEffect(() => {
    onScroll(scrollPos)
  }, [visibleItems.rows, visibleItems.cols])

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
        new Map<number, number>([...[...colWidths.entries()], [col, newWidth]])
      )
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

      for (const i of visibleCols) {
        const x2 = x1 + getColWidth(i)

        if (newX >= x1 && newX <= x2) {
          index2 = i
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

    setSelectionMouseDown(true)

    resizeSelection({
      start: { row: -1, col: index },
      end: { row: -1, col: index },
    })

    function onMouseUp() {
      setSelectionMouseDown(false)

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

      let index2 = visibleRows[Math.floor(newY / scaledCell.h)]!

      const i1 = Math.min(row, index2)
      const i2 = Math.max(row, index2)

      resizeSelection({
        start: { row: i1, col: -1 },
        end: { row: i2, col: -1 },
      })
    }

    setSelectionMouseDown(true)

    resizeSelection({
      start: { row, col: -1 },
      end: { row, col: -1 },
    })

    function onMouseUp() {
      setSelectionMouseDown(false)

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

      setSelectionMouseDown(false)
      //document.body.style.cursor = 'default'
      // Remove the event listeners when mouse is released
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    //document.body.style.cursor = 'col-resize'
    setSelectionMouseDown(true)
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
                ...df.rowMetaData.colNames,
                ...range(selection.start.col, selection.end.col + 1).map(
                  col => df.colNames[col]!
                ),
              ],

              // now add the selected rows
              ...range(selection.start.row, selection.end.row + 1).map(row => [
                ...(df.rowMetaData as DataFrame)._data[row]!.map(v =>
                  cellStr(v)
                ),
                ...range(selection.start.col, selection.end.col + 1).map(col =>
                  cellStr((df._dataframe as DataFrame)._data[row]![col]!)
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
          df.set(selection.start.row, selection.start.col, editText)
        }

        resizeSelection({
          start: selection.start,
          end: selection.start,
        })
        //setEditCell(NO_SELECTION)
        break
    }
  }

  // function onCellEditKeyDown(e: KeyboardEvent) {
  //   if (!editable) {
  //     return
  //   }

  //   switch (e.code) {
  //     case 'Enter':
  //       df.set(
  //         selection.start.row,
  //         selection.start.col,
  //         (e.target as HTMLInputElement).value
  //       )

  //       selectionRangeDispatch({
  //         type: 'set',
  //         range: {
  //           start: selection.start,
  //           end: selection.start,
  //         },
  //       })

  //       //setEditCell(NO_SELECTION)

  //       tableRef.current?.focus()

  //       break
  //     case 'Escape':
  //       // reset the text to its original value
  //       setEditText(cellStr(df.get(selection.start.row, selection.start.col)))

  //       // remove the selection
  //       //setEditCell(NO_SELECTION)
  //       break
  //   }

  //   e.stopPropagation()
  // }

  function resizeSelection(s: ISelectionRange) {
    updateSelection(s)
  }

  function currentSelection(cell: ICell) {
    if (cell.col !== -1 && cell.row !== -1) {
      setEditText(
        cellStr((df._dataframe as DataFrame)._data[cell.row]![cell.col]!)
      )

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
        df.set(currentCell.row, currentCell.col, v)
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

  const tableWidth = useMemo(
    () => visibleCols.map(col => getColWidth(col)).reduce((a, b) => a + b, 0),
    [colWidths, visibleCols]
  )

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

  const scrollOffset: IScrollPos = useMemo(() => {
    return {
      left: scrollPos.left % scaledCell.w,
      top: scrollPos.top % scaledCell.h,
    }
  }, [scrollPos.left, scrollPos.top, scaledCell.w, scaledCell.h])

  // oweing to the edit feature which can direct focus off the table,
  // we need to listen for events globally to cope with arrow keys
  // and cut and paste etc.

  const tableCells = useMemo(() => {
    return visibleRows.map(row => {
      return (
        <VCenterRow key={row}>
          {visibleCols.map(col => {
            // use the internal api for speed
            const v = (df._dataframe as DataFrame)._data[row]![col]!

            const isNum = typeof v === 'number'

            const highlight = highlightCell(row, col, selection, currentCell)

            return (
              <VCenterRow
                key={`${row}:${col}`}
                className={cn(
                  'border-border border-b border-r box-border overflow-hidden truncate p-1',
                  highlight && 'bg-blue-100 dark:text-background'
                )}
                style={{
                  width: getColWidth(col),
                  height: scaledCell.h,
                  fontSize,
                  justifyContent: isNum ? 'end' : 'start',
                }}
              >
                {cellStr(v)}
              </VCenterRow>
            )
          })}
        </VCenterRow>
      )
    })
  }, [
    visibleRows,
    visibleCols,
    df,
    selection,
    currentCell,
    getColWidth,
    scaledCell.h,
    fontSize,
  ])

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
        <Input
          id="cell-location"
          value={selText}
          w="w-24"
          className="rounded-theme"
          //readOnly
          aria-label="Cell Location"
        />
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
          className="font-semibold mb-4 rounded-l-theme overflow-hidden border-l border-t border-b border-border"
        >
          <BaseRow
            id="table-index-header"
            className="select-none border-border border-b border-r box-border pb-[1px] items-end"
            style={{
              width: indexWidth,
              height: headerHeight,
            }}
          >
            {df.rowMetaData.colNames.map((colName, col) => {
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
            ref={indexRef}
            onWheel={e => {
              if (vScrollRef.current) {
                vScrollRef.current.scrollTop += e.deltaY
              }
            }}
          >
            <BaseCol
              id="table-index"
              className="absolute"
              style={{
                top: -scrollOffset.top,
                width: indexWidth,
              }}
            >
              {visibleRows.map(row => {
                const selectedCell =
                  row >= selection.start.row && row <= selection.end.row

                const showBorder =
                  selectedCell ||
                  (selection.start.col !== -1 && selection.start.row === -1)

                const primarySelected =
                  selectedCell && selection.start.col === -1

                const secondarySelected =
                  (selectedCell || selection.start.row === -1) &&
                  selection.start.col !== -1

                return (
                  <VCenterRow
                    key={row}
                    onMouseDown={() => handleIndexMouseDown(row)}
                    className={INDEX_CLS}
                    data-show-border={showBorder}
                    data-checked={
                      primarySelected
                        ? 'primary'
                        : secondarySelected
                          ? 'secondary'
                          : 'none'
                    }
                    style={{
                      width: indexWidth,
                      height: scaledCell.h,
                    }}
                  >
                    {range(df.rowMetaData.shape[1]).map(col => {
                      const v = (df._rowMetaData as DataFrame)._data[row]![col]!

                      return (
                        <VCenterRow
                          key={col}
                          className="justify-center p-1 truncate box-border"
                          style={{
                            width: indexWidth,
                            height: scaledCell.h,
                            fontSize,
                          }}
                        >
                          {cellStr(v)}
                        </VCenterRow>
                      )
                    })}
                  </VCenterRow>
                )
              })}
            </BaseCol>
          </BaseCol>
        </BaseCol>

        <BaseCol className="grow">
          <BaseCol
            className="grow rounded-r-theme overflow-hidden border-t border-b border-r border-border"
            id="table-body"
          >
            <BaseRow
              id="table-header-container"
              className="relative overflow-hidden font-semibold select-none items-end"
              style={{
                height: headerHeight,
              }}
              ref={headerRef}
              onWheel={e => {
                if (hScrollRef.current) {
                  hScrollRef.current.scrollLeft += e.deltaY
                }
              }}
            >
              <VCenterRow
                id="table-header"
                className="absolute table-fixed border-collapse"
                style={{
                  left: -scrollOffset.left,
                  width: tableWidth,
                }}
              >
                {visibleCols.map(col => {
                  const selectedCell =
                    col >= selection.start.col && col <= selection.end.col

                  const showBorder =
                    selectedCell ||
                    (selection.start.row !== -1 && selection.start.col === -1)

                  const primarySelected =
                    selectedCell && selection.start.row === -1

                  const secondarySelected =
                    (selectedCell || selection.start.col === -1) &&
                    selection.start.row !== -1

                  //const colName = df.colName(col)

                  return (
                    <BaseCol
                      key={col}
                      className={HEADER_CLS}
                      style={{
                        width: getColWidth(col),
                        height: headerHeight,
                        fontSize,
                      }}
                      onMouseDown={() => handleHeaderMouseDown(col)}
                      data-show-border={showBorder}
                      data-checked={
                        primarySelected
                          ? 'primary'
                          : secondarySelected
                            ? 'secondary'
                            : 'none'
                      }
                    >
                      {range(df.colMetaData.shape[1]).map(metaDataCol => {
                        const v = (df.colMetaData as DataFrame)._data[col]![
                          metaDataCol
                        ]!

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
                          handleResizeMouseDown(col, e)
                        }}
                        data-resize={col === resizenMouseDown}
                      >
                        <span className={RESIZE_HANDLE_CLS} />
                      </VCenterRow>
                    </BaseCol>
                  )
                })}
              </VCenterRow>
            </BaseRow>

            <div
              id="table-container"
              className="relative grow overflow-hidden bg-background"
              ref={tableRef}
              // onScroll={() =>
              //   onScroll(
              //     tableRef,
              //     tableRef,
              //     [indexRef, vScrollRef],
              //     [headerRef, hScrollRef]
              //   )
              // }
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
              <BaseCol
                id="table"
                className="absolute"
                style={{
                  left: -scrollOffset.left,
                  top: -scrollOffset.top,
                  userSelect: selectionMouseDown ? 'none' : 'auto',
                }}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                {tableCells}
              </BaseCol>

              {selection.start.col !== -1 && selection.start.row === -1 && (
                <span
                  style={{
                    top: 0,
                    left: selectionPos.x1 - scrollPos.left,
                    width: selectionPos.w - 1,
                    height: Math.min(
                      scrollSize.h - scrollPos.top,
                      tableRef.current?.clientHeight ?? 0
                    ),
                  }}
                  className="border-r-2 border-l-2 border-b-2 border-blue-500 absolute z-20"
                />
              )}

              {selection.start.col === -1 && selection.start.row !== -1 && (
                <span
                  style={{
                    top: selectionPos.y1 - scrollPos.top,
                    left: 0,
                    height: selectionPos.y2 - selectionPos.y1,

                    width: Math.min(
                      scrollSize.w,
                      tableRef.current?.clientWidth ?? 0
                    ),
                  }}
                  className="border-t-2 border-b-2 border-r-2 border-blue-500 absolute z-20"
                />
              )}

              {selection.start.col !== -1 && selection.start.row !== -1 && (
                <span
                  style={{
                    top: selectionPos.y1 - scrollPos.top,
                    left: selectionPos.x1 - scrollPos.left,
                    width: selectionPos.w - 1,
                    height: selectionPos.y2 - selectionPos.y1,
                  }}
                  className="border-2 border-blue-500 absolute z-20"
                />
              )}

              <input
                className="resize-none bg-background outline-hidden absolute z-30 m-[2px]   p-0.5"
                style={{
                  top: currentCellPos.y - scrollPos.top,
                  left: currentCellPos.x - scrollPos.left,
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
            onScroll={() =>
              onScroll({
                left: hScrollRef.current!.scrollLeft,
                top: scrollPos.top,
              })
            }
          >
            <span
              className={SIZER_CLS}
              style={{
                width: scrollSize.w,
              }}
            />
          </div>
        </BaseCol>

        <div
          id="table-v-scroll"
          className="relative overflow-y-scroll overflow-x-hidden w-4 mb-4 custom-scrollbar"
          ref={vScrollRef}
          onScroll={() =>
            onScroll({
              top: vScrollRef.current!.scrollTop,
              left: scrollPos.left,
            })
          }
          style={{ marginTop: scaledCell.h }}
        >
          <span
            className={SIZER_CLS}
            style={{
              height: scrollSize.h,
            }}
          />
        </div>
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
