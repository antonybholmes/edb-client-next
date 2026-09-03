import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { zscore } from '@/lib/dataframe/dataframe-utils'
import { vfill, vfill2d } from '@/lib/fill'
import { makeUuid } from '@/lib/id'
import { HCluster, IClusterFrame, IClusterTree } from '@/lib/math/hcluster'
import { makeCombinations, transpose } from '@/lib/math/math'
import { range } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import type { UndefStr } from '@/lib/text/text'
import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import {
  DEFAULT_HEATMAP_PROPS,
  IHeatMapSettings,
} from '../matcalc/apps/heatmap/heatmap-settings-store'
import { newHeatMapPlot } from '../matcalc/history/history-provider/history-factories'
import { useHistory } from '../matcalc/history/history-provider/history-provider'
import { HistoryPlot } from '../matcalc/history/history-provider/history-types'
import { useVennSettings } from './venn-settings-store'

export const VENN_LIST_IDS: string[] = ['1', '2', '3', '4']

export function getItems(text: UndefStr): string[] {
  if (!text) {
    return []
  }

  return textToLines(text, { trim: true })
}

// export type ItemsChange = (label: string, items: string[]) => void

// export interface IVennProvider {
//   values: { label: string; items: string[] }
//   setItems: ItemsChange
// }

// export const VennContext = createContext<IVennProvider>({
//   values: { label: '', items: [] },
//   setItems: () => {},
// })

// interface IProps extends IVennProvider, IDivProps {}

// export function VennProvider({ values, setItems, children }: IProps) {
//   const [_values, setValues] = useState<{ label: string; items: string[] }>({
//     label: '',
//     items: [],
//   })

//   useEffect(() => {
//     setValues(values)
//   }, [values])

//   function _setItems(label: string, items: string[]) {
//     setValues({ label, items })

//     setItems?.(label, items)
//   }

//   return (
//     <VennContext.Provider value={{ values: _values, setItems: _setItems }}>
//       {children}
//     </VennContext.Provider>
//   )
// }

export interface IVennList {
  id: string
  listId: string
  name: string
  //text: string
  items: string[]
  uniqueItems: Map<string, string>
}

export function makeVennList(
  id: string,
  name: string,
  items: string | string[] = []
): IVennList {
  let _items: string[] = []

  if (Array.isArray(items)) {
    _items = items
  } else {
    _items = getItems(items)
  }

  return {
    id: makeUuid(),
    listId: id,
    name: name,
    items: _items,
    uniqueItems: new Map(_items.map((item) => [item.toLowerCase(), item])),
  }
}

export interface IVennOptions {
  selectedItems: { name: string; items: string[] }
  vennLists: IVennList[]
  //vennListsInUse: IVennList[]
  originalNames: Record<string, string>

  combinationNames: Record<string, string>
  /**
   * For each combination stores the item ids in it.
   * e.g. "1:2:3" -> ["itemA", "itemB"] means items A and B are in the combination of lists 1, 2, and 3
   */
  vennElemMap: Record<string, string[]>
  /**
   * Incremented every time a list is changed for determining if the
   * lists have been set from outside or user is making updates
   */
  updateCounter: number
}

// export const COMBINATIONS: readonly number[][] = deepFreeze(
//   makeCombinations(range(1, 5))
// )

const DEFAULT_SETTINGS: IVennOptions = {
  selectedItems: { name: '', items: [] },
  vennLists: VENN_LIST_IDS.map((id) => ({
    id: makeUuid(),
    listId: id,
    name: `List ${id}`,

    items: [],
    uniqueItems: new Map(),
  })),
  originalNames: {},
  combinationNames: {},
  vennElemMap: {},
  //vennListsInUse: [],
  updateCounter: 0,
}

export interface IVennStore extends IVennOptions {
  addList: () => void
  removeList: (id: string) => void
  setSelectedItems: (name: string, items: string[]) => void
  setVennLists: (vennLists: IVennList[]) => void
  updateVennListFromText: (id: string, text: string) => void
  //updateVennElemMap: () => void
  //setVennListsInUse: (ids: Set<string>) => void
}

function makeVennElemMap(vennLists: IVennList[]): Record<string, string[]> {
  const combs = new Map<string, Set<string>>()

  for (const vl of vennLists) {
    for (const item of vl.uniqueItems.keys()) {
      if (!combs.has(item)) {
        combs.set(item, new Set())
      }

      // tag each item with the lists it belongs to
      combs.get(item)!.add(vl.listId)
    }
  }

  const vennElemMap: Record<string, string[]> = {}

  for (const [item, listIds] of combs.entries()) {
    // make an id from all the lists this item belongs to, e.g 1:2:3
    const id = [...listIds].sort().join(':')

    if (!(id in vennElemMap)) {
      vennElemMap[id] = []
    }

    // now we have each set combination and the items in it
    // e.g. 1:2:3 -> [itemA, itemB, itemC] so if three
    // way, these are items shared by all 3 lists,
    // if 1:2, these are items shared by list 1 and 2 but not 3,
    // if 1, these are items unique to list 1 etc.
    vennElemMap[id]!.push(item)
  }

  return vennElemMap
}

export const useVennStore = create<IVennStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  setSelectedItems: (name: string, items: string[]) => {
    set({ selectedItems: { name, items } })
  },
  // updateVennElemMap: () => {
  //   set((state) => ({
  //     vennElemMap: makeVennElemMap(state.vennLists),
  //   }))
  // },
  addList: () => {
    set((state) => {
      const id = (state.vennLists.length + 1).toString()
      const list = makeVennList(id, `List ${id}`)
      const vennLists = [...state.vennLists, list]

      return {
        vennLists,
        vennElemMap: makeVennElemMap(vennLists),
        updateCounter: state.updateCounter + 1,
      }
    })
  },
  removeList: (id: string) => {
    set((state) => {
      const vennLists = state.vennLists.filter(
        (vennList) => vennList.id !== id && vennList.listId !== id
      )

      return {
        vennLists,
        vennElemMap: makeVennElemMap(vennLists),
        updateCounter: state.updateCounter + 1,
      }
    })
  },
  setVennLists: (vennLists: IVennList[]) => {
    const originalNames = Object.fromEntries(
      vennLists
        .flatMap((vennList) => vennList.uniqueItems.entries())
        .map(([key, value]) => [key, value])
    )
    const listIdxCombinations = makeCombinations(range(vennLists.length))
    const combinationNames = Object.fromEntries(
      listIdxCombinations.map((combination) => [
        combination.map((index) => (index + 1).toString()).join(':'),
        combination.map((index) => vennLists[index]!.name).join(' AND '),
      ])
    )

    set({
      vennLists,
      originalNames,
      combinationNames,
      vennElemMap: makeVennElemMap(vennLists),
      updateCounter: 0,
    })
  },
  updateVennListFromText: (id: string, text: string) => {
    set((state) => {
      const items = getItems(text)

      const vennLists = state.vennLists.map((vennList) =>
        vennList.id === id || vennList.listId === id
          ? {
              ...vennList,
              items,
              uniqueItems: new Map(
                items.map((item) => [item.toLowerCase(), item])
              ),
            }
          : vennList
      )
      const originalNames = Object.fromEntries(
        vennLists
          .flatMap((vennList) => vennList.uniqueItems.entries())
          .map(([key, value]) => [key, value])
      )

      return {
        vennLists,
        originalNames,
        vennElemMap: makeVennElemMap(vennLists),
        updateCounter: state.updateCounter + 1,
      }
    })
  },
  // setVennListsInUse: (ids: Set<string>) => {
  //   set({ vennListsInUse: ids })
  // },
}))

export function useVenn(): IVennStore & {
  vennListsInUse: IVennList[]
} {
  const { settings } = useVennSettings()
  const { openFile } = useHistory()
  const addList = useVennStore((state) => state.addList)
  const removeList = useVennStore((state) => state.removeList)
  const selectedItems = useVennStore((state) => state.selectedItems)
  const setSelectedItems = useVennStore((state) => state.setSelectedItems)
  const originalNames = useVennStore((state) => state.originalNames)

  const vennLists = useVennStore((state) => state.vennLists)

  const setVennLists = useVennStore((state) => state.setVennLists)

  const updateCounter = useVennStore((state) => state.updateCounter)

  const updateVennListFromText = useVennStore(
    (state) => state.updateVennListFromText
  )

  const combinationNames = useVennStore((state) => state.combinationNames)

  const vennElemMap = useVennStore((state) => state.vennElemMap)
  //const updateVennElemMap = useVennStore((state) => state.updateVennElemMap)

  const vennListsInUse = useMemo(
    () => vennLists.filter((vl) => vl.items.length > 0),
    [vennLists]
  )

  useEffect(() => {
    // make a dataframe

    if (vennListsInUse.length === 0 || Object.keys(vennElemMap).length === 0) {
      return
    }

    const sortedElementNames = [...Object.keys(vennElemMap)].sort((a, b) =>
      a.length !== b.length ? a.length - b.length : a.localeCompare(b)
    )

    const maxRows = sortedElementNames
      .map((n) => vennElemMap[n]!.length)
      .reduce((a, b) => Math.max(a, b), 0)

    let d = sortedElementNames.map((n) =>
      [...vennElemMap[n]!]
        .sort()
        .concat(vfill('', maxRows - vennElemMap[n]!.length))
    )

    d = transpose(d)

    const df = new AnnotationDataFrame({
      name: 'Venn Sets',
      data: d,
      columns: sortedElementNames.map((n) =>
        n
          .split(':')
          .map((s) => vennListsInUse.find((vl) => vl.listId === s)?.name ?? s)
          .join(' AND ')
      ),
    })

    // lets make an overlap matrix for the Venn sets

    const overlapData = vfill2d(0, {
      rows: vennListsInUse.length,
      cols: vennListsInUse.length,
    })

    const sizeData = vfill2d(0, {
      rows: vennListsInUse.length,
      cols: vennListsInUse.length,
    })

    for (const [i, vlA] of vennListsInUse.entries()) {
      for (const [j, vlB] of vennListsInUse.entries()) {
        if (i === j) {
          continue
        }
        const s1 = new Set(vlA.uniqueItems.keys())
        const s2 = new Set(vlB.uniqueItems.keys())
        const overlap = [...s1].filter((item) => s2.has(item)).length

        const jaccard = overlap / (s1.size + s2.size - overlap)

        overlapData[i]![j] = overlap
        sizeData[i]![j] = jaccard
      }
    }

    console.log(overlapData)

    const dfOverlap = new AnnotationDataFrame({
      name: 'Venn Overlap',
      data: overlapData,
      index: vennListsInUse.map((vl) => vl.name),
      columns: vennListsInUse.map((vl) => vl.name),
    })

    const dfSize = new AnnotationDataFrame({
      name: 'Venn Size',
      data: sizeData,
      index: vennListsInUse.map((vl) => vl.name),
      columns: vennListsInUse.map((vl) => vl.name),
    })

    const dfZ = zscore(dfOverlap)

    const hc = new HCluster()

    const rowC: IClusterTree | undefined = settings.cluster.rows.on
      ? hc.run(dfZ)
      : undefined
    const colC: IClusterTree | undefined = settings.cluster.cols.on
      ? hc.run(dfZ.t)
      : undefined

    const cf: IClusterFrame = {
      id: makeUuid(),
      name: 'Dot Plot Cluster Frame',
      rowTree: rowC,
      colTree: colC,
      df: dfZ as AnnotationDataFrame,
      //secondaryTables: { percent: groupPercentDf },
    }

    let displayOptions: IHeatMapSettings = {
      ...DEFAULT_HEATMAP_PROPS,

      colLabels: { ...DEFAULT_HEATMAP_PROPS.colLabels, width: 50 },
    }

    console.log('whhha', displayOptions)

    const plot: HistoryPlot = newHeatMapPlot(
      'Dot Plot',
      { main: cf, size: dfSize, raw: dfOverlap },
      {
        mode: 'dot',
        props: displayOptions,
      }
    )

    openFile(`Venn Sets`, {
      sheets: [df, dfOverlap],
      plots: [plot],
      mode: 'set',
    })
  }, [vennElemMap, settings])

  return {
    selectedItems,

    vennLists,

    originalNames,
    combinationNames,
    vennElemMap,
    //updateVennElemMap,
    vennListsInUse,
    //setVennListsInUse: useVennStore((state) => state.setVennListsInUse),
    updateCounter,
    addList,
    removeList,
    setSelectedItems,
    setVennLists,
    updateVennListFromText,
  }
}
