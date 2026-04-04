// 'use client'

import type { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useCallback, useContext, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

// interface IGlobalState {
//   zoom: number
//   listeners: Array<(zoom: number) => void>
// }

// const globalState: IGlobalState = {
//   zoom: 1,
//   listeners: [],
// }

// export function zoomDispatch(zoom: number) {
//   globalState.zoom = zoom
//   for (const listener of globalState.listeners) {
//     listener(zoom)
//   }
// }

// export function addListener(listener: (zoom: number) => void) {
//   globalState.listeners.push(listener)
//   // Return a function to remove the listener
//   return () => {
//     globalState.listeners = globalState.listeners.filter(l => l !== listener)
//   }
// }

// export function useZoom(): {
//   zoom: number
//   setZoom: (zoom: number) => void
// } {
//   const [zoom, setZoom] = useState(globalState.zoom)

//   useEffect(() => {
//     // Add this component as a listener to the global state
//     const removeListener = addListener((zoom: number) => {
//       //console.log(id, messages)

//       // By using the spread operator ([...]), you're ensuring that you're not mutating
//       // the original array (newMessages). Instead, you're creating a new array. This
//       // new array has a new reference, and React can detect that the state has changed.
//       setZoom(zoom)
//     })

//     // Clean up the listener when the component is unmounted
//     return () => {
//       removeListener()
//     }
//   }, [])

//   return {
//     zoom,
//     setZoom: zoomDispatch,
//   }
// }

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

interface IZoomContext {
  zoom: number
  setZoom: (zoom: number) => void
  resetZoom: () => void
}

export interface IZoomStore {
  zooms: Record<string, number>
  setZoom: (id: string, value: number) => void
  resetZoom: (id: string) => void
  resetAll: () => void
}

export const DEFAULT_ZOOM = 1
export const DEFAULT_ZOOM_CHANNEL = 'default'

export const useZoomStore = create<IZoomStore>()(
  persist(
    (set) => ({
      zooms: {},

      setZoom: (id, value) =>
        set((state) => ({
          zooms: {
            ...state.zooms,
            [id]: value,
          },
        })),

      resetZoom: (channel) =>
        set((state) => {
          const zooms = { ...state.zooms }
          delete zooms[channel]

          return { zooms }
        }),

      resetAll: () => set({ zooms: {} }),
    }),
    {
      name: 'zoom-channels:v4',
    }
  )
)

/**
 * A hook for accessing a zoom channel from a zoom store.
 * This is to allow for multiple independent zoom levels for different parts of the application.
 *
 * @param channel The zoom channel to access.
 * @returns An object containing the current zoom value and a function to set the zoom value for the specified channel.
 */
export function useZoom(
  channel: string = DEFAULT_ZOOM_CHANNEL,
  defaultZoom: number = DEFAULT_ZOOM
): IZoomContext {
  const zoom = useZoomStore(
    useShallow((state) => state.zooms[channel] ?? defaultZoom)
  )
  const setZoom = useZoomStore((state) => state.setZoom)
  const resetZoom = useZoomStore((state) => state.resetZoom)

  const setChannelZoom = useCallback(
    (value: number) => {
      setZoom(channel, value)
    },
    [channel, setZoom]
  )

  const resetChannelZoom = useCallback(
    () => resetZoom(channel),
    [channel, resetZoom]
  )

  return { zoom, setZoom: setChannelZoom, resetZoom: resetChannelZoom }
}

const ZoomContext = createContext<IZoomContext>({
  zoom: DEFAULT_ZOOM,
  setZoom: () => {},
  resetZoom: () => {},
})

export function ZoomProvider({ children }: IChildrenProps) {
  // const [zoom, setZoom] = useState(() => {
  //   const stored = localStorage.getItem('zoom')
  //   return stored ? JSON.parse(stored) : DEFAULT_ZOOM
  // })

  // useEffect(() => {
  //   localStorage.setItem('zoom', JSON.stringify(zoom))
  // }, [zoom])

  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  return (
    <ZoomContext.Provider
      value={{ zoom, setZoom, resetZoom: () => setZoom(DEFAULT_ZOOM) }}
    >
      {children}
    </ZoomContext.Provider>
  )
}

export function useZoomCtx(): IZoomContext {
  const context = useContext(ZoomContext)

  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider')
  }

  return {
    zoom: context.zoom,
    setZoom: context.setZoom,
    resetZoom: context.resetZoom,
  }
}
