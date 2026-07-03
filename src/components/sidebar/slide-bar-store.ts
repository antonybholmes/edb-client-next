import { produce } from 'immer'

import { config } from '@/config'
import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:slidebars:v8`

interface IBarProps {
  size: number
  open: boolean
  sideLimits: [number, number]
}

const DEFAULT_BAR_PROPS: IBarProps = Object.freeze({
  open: true,
  size: 80,
  sideLimits: [5, 50] as [number, number],
})

/**
 * Ensures that a bar with the given ID exists in the state.
 * If it doesn't exist, it creates one with the default properties.
 * Returns the bar properties for the given ID.
 * @param state
 * @param id
 * @returns
 */
function ensureBar(state: ISlideBarStore, id: string): IBarProps {
  if (!state.barMap[id]) {
    state.barMap[id] = { ...DEFAULT_BAR_PROPS }
  }
  return state.barMap[id]
}

export interface ISlideBarStore {
  barMap: Record<string, IBarProps>
  setBar: (id: string, props: IBarProps) => void
  setSize: (id: string, size: number) => void
  setOpen: (id: string, open: boolean) => void
  setSideLimits: (id: string, sideLimits: [number, number]) => void
}

export const useSlideBarStore = create<ISlideBarStore>()(
  persist(
    set => ({
      barMap: {},
      setBar: (id: string, props: IBarProps) => {
        set(state => ({
          barMap: {
            ...state.barMap,
            [id]: props,
          },
        }))
      },

      // setPreviousSize: (id: string, size: number) => {
      //   set(
      //     produce(state => {
      //       if (!(id in state.barMap)) {
      //         state.barMap[id] = { ...DEFAULT_BAR_PROPS }
      //       }

      //       state.barMap[id].previousSize = Math.min(
      //         100 - state.barMap[id].sideLimits[0],
      //         size
      //       )
      //     })
      //   )
      // },
      setSize: (id: string, size: number) => {
        set(
          produce(state => {
            const bar = ensureBar(state, id)

            bar.size = size
          })
        )
      },
      setSideLimits: (id: string, sideLimits: [number, number]) => {
        set(
          produce(state => {
            const bar = ensureBar(state, id)

            bar.sideLimits = sideLimits
          })
        )
      },
      setOpen: (id: string, open: boolean) => {
        set(
          produce(state => {
            const bar = ensureBar(state, id)

            bar.open = open
          })
        )
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useSlideBar(
  id: string,
  opts: {
    defaultOpen?: boolean
    defaultSize?: number
    defaultSideLimits?: [number, number]
  } = {}
) {
  const {
    defaultOpen = true,
    defaultSize = DEFAULT_BAR_PROPS.size,
    defaultSideLimits = DEFAULT_BAR_PROPS.sideLimits,
  } = opts

  const size = useSlideBarStore(state => state.barMap[id]?.size ?? defaultSize)
  const open = useSlideBarStore(state => state.barMap[id]?.open ?? defaultOpen)
  const sideLimits = useSlideBarStore(
    state => state.barMap[id]?.sideLimits ?? defaultSideLimits
  )

  const setSize = useSlideBarStore(state => state.setSize)
  //const setPreviousSize = useSlideBarStore(state => state.setPreviousSize)
  //const setInitialSize = useSlideBarStore(state => state.setInitialSize) // setInitialSize is just setBar with default props
  const setSideLimits = useSlideBarStore(state => state.setSideLimits)
  const setOpen = useSlideBarStore(state => state.setOpen)

  const setSizeCallback = useCallback(
    (size: number) => {
      setSize(id, size)
    },
    [id, setSize]
  )

  const setSideLimitsCallback = useCallback(
    (sideLimits: [number, number]) => {
      setSideLimits(id, sideLimits)
    },
    [id, setSideLimits]
  )

  const setOpenCallback = useCallback(
    (open: boolean) => {
      setOpen(id, open)
    },
    [id, setOpen]
  )

  return {
    open,
    size,
    sideLimits,
    setSize: setSizeCallback,
    setSideLimits: setSideLimitsCallback,
    setOpen: setOpenCallback,
  }
}
