// tabStore.ts
import { useCallback } from 'react'
import { create } from 'zustand'
import type { ITabIndicatorPos } from './tab-indicator-provider'
import { DEFAULT_GROUP_ID } from './tab-provider'

const DEFAULT_TAB: ITabIndicatorPos = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  animate: true,
  scale: 1,
  index: 0,
  tabs: 0,
}

function posChanged(
  a: ITabIndicatorPos | undefined,
  b: ITabIndicatorPos | undefined
): boolean {
  // simple reference check first
  if (a === b) {
    return false
  }

  // if one is undefined and the other isn't, they are different
  if (!a || !b) {
    return true
  }

  return (
    a.x !== b.x ||
    a.y !== b.y ||
    a.w !== b.w ||
    a.h !== b.h ||
    a.scale !== b.scale
  )
}

type TabIndicatorStore = {
  tabState: {
    // undefined  means no indicator to show rather than
    // default at 0,0
    hoverTabs: Record<string, ITabIndicatorPos | undefined>
    selectedTabs: Record<string, ITabIndicatorPos | undefined>
  }
  //setTabs: (groupId: string, tabs: ITab[]) => void
  setPosition: (
    groupId: string,
    pos: Partial<ITabIndicatorPos> | undefined
  ) => void
  getPosition: (groupId: string) => ITabIndicatorPos | undefined
  setSelectedPosition: (
    groupId: string,
    pos: Partial<ITabIndicatorPos> | undefined
  ) => void

  getSelectedPosition: (groupId: string) => ITabIndicatorPos | undefined
}

export const useTabIndicatorStore = create<TabIndicatorStore>((set, get) => ({
  tabState: { hoverTabs: {}, selectedTabs: {} },

  setPosition: (groupId, pos) => {
    const prev = get().tabState.hoverTabs[groupId]

    const newPos = pos
      ? prev
        ? { ...prev, ...pos }
        : { ...DEFAULT_TAB, ...pos }
      : undefined

    if (posChanged(prev, newPos)) {
      set((state) => ({
        tabState: {
          ...state.tabState,
          hoverTabs: { ...state.tabState.hoverTabs, [groupId]: newPos },
        },
      }))
    }
  },
  setSelectedPosition: (groupId, pos) => {
    const prev = get().tabState.selectedTabs[groupId]

    const newPos = pos
      ? prev
        ? { ...prev, ...pos }
        : { ...DEFAULT_TAB, ...pos }
      : undefined

    if (posChanged(prev, newPos)) {
      set((state) => ({
        tabState: {
          ...state.tabState,
          selectedTabs: { ...state.tabState.selectedTabs, [groupId]: newPos },
        },
      }))
    }
  },

  getPosition: (groupId) => {
    const pos = get().tabState.hoverTabs[groupId]

    return pos
  },
  getSelectedPosition: (groupId) => {
    const pos = get().tabState.selectedTabs[groupId]

    return pos
  },
}))

export function useTabIndicators(groupId: string) {
  const id = groupId ?? DEFAULT_GROUP_ID

  const selectedPosition = useTabIndicatorStore(
    (s) => s.tabState.selectedTabs[id]
  )
  const position = useTabIndicatorStore((s) => s.tabState.hoverTabs[id])

  const setPosition = useTabIndicatorStore((s) => s.setPosition)
  const setSelectedPosition = useTabIndicatorStore((s) => s.setSelectedPosition)

  const setGroupPosition = useCallback(
    (pos?: Partial<ITabIndicatorPos>) => {
      setPosition(id, pos)
    },
    [id, setPosition]
  )

  const setGroupSelectedPosition = useCallback(
    (pos?: Partial<ITabIndicatorPos>) => {
      setSelectedPosition(id, pos)
    },
    [id, setSelectedPosition]
  )

  return {
    position,
    setPosition: setGroupPosition,
    selectedPosition,
    setSelectedPosition: setGroupSelectedPosition,
  }
}
