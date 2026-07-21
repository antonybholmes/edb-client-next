import {
  useExtScrollContext,
  type IScrollOffset,
} from '@/components/ext-scroll-card/ext-scroll-provider'
import { useSizeObserver } from '@/hooks/resize-observer'
import type { IDim } from '@/interfaces/dim'
import type { IPos } from '@/interfaces/pos'
import {
  DATAFRAME_100x26,
  type AnnotationDataFrame,
} from '@/lib/dataframe/annotation-dataframe'
import { cellStr } from '@/lib/dataframe/cell'
import { range } from '@/lib/math/range'
import { useSelectionRange } from '@/providers/selection-range-provider'
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

interface VirtualDataFrameContextProps {
  df: AnnotationDataFrame
  cell: IDim
  scaledCell: IDim
  colWidths: Record<number, number>
  zoom: number
  dp: number
  editable: boolean
  commas: boolean
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>
  // keep track of where mouse is pressed
  startPos: RefObject<IPos>
  startWidth: RefObject<number>
  tableDataRef: RefObject<HTMLDivElement | null>

  editRef: RefObject<HTMLInputElement | null>

  headerHeight: number
  indexWidth: number

  scrollOffset: IScrollOffset

  getColX: (col: number) => { x: number; w: number }
  getColWidth: (index: number) => number
  setColWidth: (index: number, width: number) => void
  copyToClipboard: () => void
}

const VirtualDataFrameContext = createContext<VirtualDataFrameContextProps>({
  df: DATAFRAME_100x26,
  cell: { w: 0, h: 0 },
  scaledCell: { w: 0, h: 0 },
  colWidths: {},
  zoom: 1,
  dp: 4,
  editable: true,
  commas: true,
  startPos: { current: { x: -1, y: -1 } },
  startWidth: { current: 0 },
  tableDataRef: { current: null },

  editRef: { current: null },
  rowVirtualizer: {} as Virtualizer<HTMLDivElement, Element>,
  columnVirtualizer: {} as Virtualizer<HTMLDivElement, Element>,

  headerHeight: 0,
  indexWidth: 0,

  scrollOffset: { left: 0, top: 0 },

  getColX: () => ({ x: 0, w: 0 }),
  getColWidth: () => 0,
  setColWidth: () => {},
  copyToClipboard: () => {},
})

export function useVirtualDataFrameContext() {
  const ctx = useContext(VirtualDataFrameContext)
  if (!ctx) {
    throw new Error(
      'useVirtualDataFrameContext must be used within a VirtualDataFrameProvider'
    )
  }
  return ctx
}

interface VirtualDataFrameProviderProps {
  df: AnnotationDataFrame
  cell?: IDim | undefined
  zoom?: number | undefined
  editable?: boolean | undefined
  dp?: number | undefined
  commas?: boolean | undefined
  children: ReactNode
}

export function VirtualDataFrameProvider({
  df,
  cell = { w: 0, h: 0 },
  zoom = 1,
  dp = 4,
  commas = true,
  editable = false,
  children,
}: VirtualDataFrameProviderProps) {
  const { hScrollRef, vScrollRef, scrollLeft, scrollTop, setSize } =
    useExtScrollContext()

  const [colWidths, setColWidths] = useState<Record<number, number>>({})

  const { selection, clear: clearSelection } = useSelectionRange()

  const tableDataRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLInputElement | null>(null)

  const startPos = useRef<IPos>({ x: -1, y: -1 })
  const startWidth = useRef(0)

  const [tableScrollableSize, setTableScrollableSize] = useState<IDim>({
    w: 0,
    h: 0,
  })

  const scaledCell: IDim = useMemo(() => {
    return {
      w: cell.w * zoom,
      h: cell.h * zoom,
    }
  }, [cell.w, cell.h, zoom])

  const headerHeight = useMemo(
    () => df.colVars.shape[1] * scaledCell.h,
    [df.colVars.shape[1], scaledCell.h]
  )

  // COLUMN VIRTUALIZER (horizontal)
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: df.shape[1],
    getScrollElement: () => hScrollRef.current,
    estimateSize: (i) => getColWidth(i),
    overscan: 1,
  })

  const rowVirtualizer = useVirtualizer({
    count: df.shape[0],
    getScrollElement: () => vScrollRef.current,
    estimateSize: () => scaledCell.h,
    overscan: 1,
  })

  function setColWidth(index: number, width: number) {
    setColWidths((prev) => ({ ...prev, [index]: width }))

    // trigger layout recalculation
    columnVirtualizer.measure()
  }

  function getColWidth(index: number): number {
    return index in colWidths ? colWidths[index]! : scaledCell.w
  }

  function getColX(col: number) {
    return {
      x: range(col).reduce((a, b) => a + getColWidth(b), 0),
      w: getColWidth(col),
    }
  }

  function copyToClipboard() {
    if (selection) {
      const cols = selection.cols
        ? range(selection.cols.start, selection.cols.end + 1)
        : range(df.shape[1])
      const indexCols = range(df.rowObs.columns.length)
      const rows = selection.rows
        ? range(selection.rows.start, selection.rows.end + 1)
        : range(df.shape[0])

      // first the headings
      const out: string[][] = [
        [...df.rowObs.columns, ...cols.map((col) => df.columns[col]!)],

        // now add the selected rows
        ...rows.map((row) => [
          ...indexCols.map((col) =>
            cellStr(df.rowObs.get(row, col), { dp, commas })
          ),
          ...cols.map((col) =>
            cellStr(df.get(row, col), {
              dp,
              commas,
            })
          ),
        ]),
      ]

      const s = out.map((r) => r.join('\t')).join('\n')

      navigator.clipboard.writeText(s)
    }
  }

  const indexWidth = useMemo(
    () => df.rowObs.shape[1] * scaledCell.w,
    [df.rowObs.shape[1], scaledCell.w]
  )

  useEffect(() => {
    // trigger layout recalculation when props change

    rowVirtualizer.measure()
    columnVirtualizer.measure()
  }, [zoom])

  useEffect(() => {
    setSize({
      w: columnVirtualizer.getTotalSize(),
      h: rowVirtualizer.getTotalSize(),
    })

    setTableScrollableSize({
      w:
        columnVirtualizer.getTotalSize() -
        (tableDataRef.current?.clientWidth ?? 0),
      h:
        rowVirtualizer.getTotalSize() -
        (tableDataRef.current?.clientHeight ?? 0),
    })
  }, [rowVirtualizer, columnVirtualizer])

  //table size needs to be the scroll area, so total size - viewport size
  // we have to calculate this ourselves since the scroll area is separate
  // from the table container and unlike an image,
  // the table doesn't have an intrinsic size that we can use for the scroll area
  useSizeObserver(tableDataRef, (size) => {
    setTableScrollableSize({
      w: columnVirtualizer.getTotalSize() - size.w,
      h: rowVirtualizer.getTotalSize() - size.h,
    })
  })

  const scrollOffset = useMemo<IScrollOffset>(() => {
    return {
      left: scrollLeft.normalized * tableScrollableSize.w,
      top: scrollTop.normalized * tableScrollableSize.h,
    }
  }, [scrollLeft, scrollTop, tableScrollableSize])

  return (
    <VirtualDataFrameContext.Provider
      value={{
        df,
        cell,
        scaledCell,
        colWidths,
        zoom,
        dp,
        commas,
        editable,
        rowVirtualizer,
        columnVirtualizer,
        startPos,
        startWidth,
        tableDataRef,
        editRef,
        headerHeight,
        indexWidth,

        scrollOffset,
        setColWidth,
        getColX,
        getColWidth,
        copyToClipboard,
      }}
    >
      {children}
    </VirtualDataFrameContext.Provider>
  )
}
