import { makeCombinations } from '@/lib/math/math'
import { range } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'
import { create } from 'zustand'

export const LIST_IDS: number[] = [1, 2, 3, 4]

export function getItems(text: string | undefined | null): string[] {
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
  id: number
  name: string
  text: string
  items: string[]
  uniqueItems: string[]
}

export function makeVennList(
  id: number,
  name: string,
  text: string | string[]
): IVennList {
  let items: string[] = []
  let t: string

  if (Array.isArray(text)) {
    items = text
    t = text.join('\n')
  } else {
    items = getItems(text)
    t = text
  }

  return {
    id,
    name: name || `List ${id}`,
    text: t,
    items,
    uniqueItems: [...new Set(items.map((item) => item.toLowerCase()))].sort(),
  }
}

export interface IVennOptions {
  selectedItems: { name: string; items: string[] }
  vennLists: Record<number, IVennList>
  vennListsInUse: number
  originalNames: Record<string, string>

  combinationNames: Record<string, string>
  vennElemMap: Record<string, string[]>
}

export const COMBINATIONS: number[][] = makeCombinations(range(1, 5))

const DEFAULT_SETTINGS: IVennOptions = {
  selectedItems: { name: '', items: [] },
  vennLists: Object.fromEntries(
    LIST_IDS.map((id) => [
      id.toString(),
      {
        id,
        name: `List ${id}`,
        text: '',
        items: [],
        uniqueItems: [],
      },
    ])
  ),
  originalNames: {},
  combinationNames: {},
  vennElemMap: {},
  vennListsInUse: 0,
}

export interface IVennStore extends IVennOptions {
  setSelectedItems: (name: string, items: string[]) => void
  setVennLists: (vennLists: Record<number, IVennList>) => void
  updateVennListText: (id: number, text: string) => void
  setVennElemMap: (vennElemMap: Record<string, string[]>) => void
  setVennListsInUse: (n: number) => void
}

export const useVennStore = create<IVennStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  setSelectedItems: (name: string, items: string[]) => {
    set({ selectedItems: { name, items } })
  },
  setVennLists: (vennLists: Record<number, IVennList>) => {
    set({
      vennLists: { ...get().vennLists, ...vennLists },
      originalNames: Object.fromEntries(
        [
          ...new Set(
            Object.values(vennLists)
              .map((v) => v.items)
              .flat()
          ),
        ].map((v) => [v.toLowerCase(), v])
      ),
      combinationNames: Object.fromEntries(
        COMBINATIONS.map((comb) => [
          comb.join(':'),
          comb.map((i) => vennLists[i]?.name || `List ${i}`).join(' AND '),
        ])
      ),
    })
  },
  updateVennListText: (id: number, text: string) => {
    set(
      produce((state: IVennStore) => {
        if (id in state.vennLists) {
          state.vennLists[id].text = text
          state.vennLists[id].items = getItems(text)
          state.vennLists[id].uniqueItems = [
            ...new Set(state.vennLists[id].items),
          ].sort()

          state.originalNames = {
            ...Object.fromEntries(
              [
                ...new Set(
                  Object.entries(state.vennLists)
                    .filter(([k]) => parseInt(k) !== id)
                    .map(([, v]) => v.items)
                    .flat()
                ),
              ].map((v) => [v.toLowerCase(), v])
            ),
            ...Object.fromEntries(
              state.vennLists[id].items.map((v) => [v.toLowerCase(), v])
            ),
          }
        }
      })
    )
  },
  setVennElemMap: (vennElemMap: Record<string, string[]>) => {
    // ensure unique and sorted items in each set
    set({
      vennElemMap: Object.fromEntries(
        Object.entries(vennElemMap).map(([k, v]) => [k, [...new Set(v)].sort()])
      ),
    })
  },
  setVennListsInUse: (n: number) => {
    set({ vennListsInUse: n })
  },
}))

export function useVenn(): IVennStore {
  const selectedItems = useVennStore((state) => state.selectedItems)
  const setSelectedItems = useVennStore((state) => state.setSelectedItems)
  const originalNames = useVennStore((state) => state.originalNames)

  const vennLists = useVennStore((state) => state.vennLists)

  const setVennLists = useVennStore((state) => state.setVennLists)

  const updateVennListText = useVennStore((state) => state.updateVennListText)

  const combinationNames = useVennStore((state) => state.combinationNames)

  const vennElemMap = useVennStore((state) => state.vennElemMap)
  const setVennElemMap = useVennStore((state) => state.setVennElemMap)

  return {
    selectedItems,
    setSelectedItems,
    vennLists,
    setVennLists,
    updateVennListText,
    originalNames,
    combinationNames,
    vennElemMap,
    setVennElemMap,
    vennListsInUse: useVennStore((state) => state.vennListsInUse),
    setVennListsInUse: useVennStore((state) => state.setVennListsInUse),
  }
}
