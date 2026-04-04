import { produce } from 'immer'

import { config } from '@/config'
import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:slidebars:v6`

// interface ISlideBarMessage {
//   id: string
//   type: 'resize' | 'open' | 'close'
// }

interface IBarProps {
  //initialSize: number

  size: number
  open: boolean
  //previousSize: number
  sideLimits: [number, number]
  //message: ISlideBarMessage | null
}

const DEFAULT_BAR_PROPS: IBarProps = Object.freeze({
  //initialSize: 80,
  //previousSize: 80,
  open: true,
  size: 80,
  sideLimits: [5, 50] as [number, number],
  //message: null,
})

export interface ISlideBarStore {
  barMap: Record<string, IBarProps>
  setBar: (id: string, props: IBarProps) => void
  setInitialSize: (id: string, size: number) => void
  //setPreviousSize: (id: string, size: number) => void
  setSize: (id: string, size: number) => void
  setOpen: (id: string, open: boolean) => void
  setSideLimits: (id: string, sideLimits: [number, number]) => void
  //sendMessage: (id: string, message: ISlideBarMessage) => void
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
      setInitialSize: (id: string, size: number) => {
        set(
          produce(state => {
            if (!(id in state.barMap)) {
              state.barMap[id] = { ...DEFAULT_BAR_PROPS }
            }

            state.barMap[id].initialSize = size
            state.barMap[id].size = size
          })
        )
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
            if (!(id in state.barMap)) {
              state.barMap[id] = { ...DEFAULT_BAR_PROPS }
            }

            state.barMap[id].size = size
          })
        )
      },
      setSideLimits: (id: string, sideLimits: [number, number]) => {
        set(
          produce(state => {
            if (!(id in state.barMap)) {
              state.barMap[id] = { ...DEFAULT_BAR_PROPS }
            }

            state.barMap[id].sideLimits = sideLimits
          })
        )
      },
      setOpen: (id: string, open: boolean) => {
        set(
          produce(state => {
            if (!(id in state.barMap)) {
              state.barMap[id] = { ...DEFAULT_BAR_PROPS }
            }

            state.barMap[id].open = open
          })
        )
      },
      // sendMessage: (id: string, message: ISlideBarMessage) => {
      //   set(
      //     produce(state => {
      //       if (!(id in state.barMap)) {
      //         state.barMap[id] = { ...DEFAULT_BAR_PROPS }
      //       }

      //       state.barMap[id].message = message
      //     })
      //   )
      // },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useSlideBar(id: string) {
  //const barMap = useSlideBarStore(state => state.barMap)
  //const { sendMessage } = useMessages(id)
  const barProps =
    useSlideBarStore(state => state.barMap[id]) ?? DEFAULT_BAR_PROPS
  const setSize = useSlideBarStore(state => state.setSize)
  //const setPreviousSize = useSlideBarStore(state => state.setPreviousSize)
  const setInitialSize = useSlideBarStore(state => state.setInitialSize) // setInitialSize is just setBar with default props
  const setSideLimits = useSlideBarStore(state => state.setSideLimits)
  const setOpen = useSlideBarStore(state => state.setOpen)

  return {
    barProps,
    setInitialSize: useCallback(
      (size: number) => {
        setInitialSize(id, size)
      },
      [id, setInitialSize]
    ),
    // setPreviousSize: useCallback(
    //   (size: number) => {
    //     setPreviousSize(id, size)
    //   },
    //   [id, setPreviousSize]
    // ),
    setSize: useCallback(
      (size: number) => {
        setSize(id, size)
      },
      [id, setSize]
    ),
    setSideLimits: useCallback(
      (sideLimits: [number, number]) => {
        setSideLimits(id, sideLimits)
      },
      [id, setSideLimits]
    ),
    setOpen: useCallback(
      (open: boolean) => {
        setOpen(id, open)
      },
      [id, setOpen]
    ),
    //sendMessage,
  }
}
