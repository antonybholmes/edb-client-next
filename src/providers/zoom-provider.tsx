'use client'

import { clamp } from '@/lib/math/clamp'
import { useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const DEFAULT_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 2, 3, 4]

interface IZoomContext {
  zoom: number
  index: number
  levels: number[]
  setZoom: (zoom: number) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
}

interface IZoomChannel {
  id: string
  zoom: number
  index: number
  levels: number[]
}

export const DEFAULT_ZOOM_CHANNEL_NAME = 'default'

export const DEFAULT_ZOOM_CHANNEL: IZoomChannel = {
  id: DEFAULT_ZOOM_CHANNEL_NAME,
  zoom: 1,
  index: 3, // corresponds to 1x zoom in DEFAULT_ZOOM_SCALES
  levels: DEFAULT_ZOOM_LEVELS,
}

export interface IZoomStore {
  zooms: Record<string, IZoomChannel>
  setZoom: (id: string, value: number) => void
  resetZoom: (id: string) => void
  increaseZoom: (id: string) => void
  decreaseZoom: (id: string) => void
  resetAll: () => void
}

export const DEFAULT_ZOOM = 1

export const useZoomStore = create<IZoomStore>()(
  persist(
    (set) => ({
      zooms: {},

      setZoom: (id, value) =>
        set((state) => {
          const zc = state.zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

          // limit range
          value = clamp(value, zc.levels[0]!, zc.levels[zc.levels.length - 1]!)

          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                zoom: value,
                index: zoomToIndex(value, zc.levels),
              },
            },
          }
        }),
      increaseZoom: (id) =>
        set((state) => {
          const zc = state.zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
          const { index, zoom: newZoom } = increaseZoom(zc)

          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, index, zoom: newZoom },
            },
          }
        }),
      decreaseZoom: (id) =>
        set((state) => {
          const zc = state.zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
          const { index, zoom: newZoom } = decreaseZoom(zc)

          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, index, zoom: newZoom },
            },
          }
        }),
      resetZoom: (channel) =>
        set((state) => {
          const zooms = { ...state.zooms }
          delete zooms[channel]

          return { zooms }
        }),

      resetAll: () => set({ zooms: {} }),
    }),
    {
      name: 'zoom-channels:v6',
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
  channel: string = DEFAULT_ZOOM_CHANNEL_NAME,
  defaultZoom: IZoomChannel = DEFAULT_ZOOM_CHANNEL
): IZoomContext {
  const z = useZoomStore(
    useShallow(
      (state) => state.zooms[channel] ?? { ...defaultZoom, id: channel }
    )
  )
  const setZoom = useZoomStore((state) => state.setZoom)
  const resetZoom = useZoomStore((state) => state.resetZoom)
  const increaseZoom = useZoomStore((state) => state.increaseZoom)
  const decreaseZoom = useZoomStore((state) => state.decreaseZoom)

  const setChannelZoom = useCallback(
    (value: number) => setZoom(channel, value),
    [z, channel, setZoom]
  )

  const incrementChannelZoom = useCallback(
    () => increaseZoom(channel),
    [channel, increaseZoom]
  )

  const decrementChannelZoom = useCallback(
    () => decreaseZoom(channel),
    [channel, decreaseZoom]
  )

  const resetChannelZoom = useCallback(
    () => resetZoom(channel),
    [channel, resetZoom]
  )

  return {
    zoom: z.zoom,
    index: z.index,
    levels: [...z.levels],
    increaseZoom: incrementChannelZoom,
    decreaseZoom: decrementChannelZoom,
    setZoom: setChannelZoom,
    resetZoom: resetChannelZoom,
  }
}

// const ZoomContext = createContext<IZoomContext>({
//   zoom: DEFAULT_ZOOM,
//   index: 3,
//   levels: [...DEFAULT_ZOOM_SCALES],
//   setZoom: () => {},
//   resetZoom: () => {},
//   increaseZoom: () => {},
//   decreaseZoom: () => {},
// })

// export function ZoomProvider({ children }: IChildrenProps) {
//   const [zoom, setZoom] = useState(DEFAULT_ZOOM)

//   return (
//     <ZoomContext.Provider
//       value={{
//         zoom,
//         index: 3,
//         levels: [...DEFAULT_ZOOM_SCALES],
//         setZoom,
//         resetZoom: () => setZoom(DEFAULT_ZOOM),
//         increaseZoom: () =>
//           setZoom(prev => Math.min(prev + 1, DEFAULT_ZOOM_SCALES.length - 1)),
//         decreaseZoom: () => setZoom(prev => Math.max(prev - 1, 0)),
//       }}
//     >
//       {children}
//     </ZoomContext.Provider>
//   )
// }

// export function useZoomCtx(): IZoomContext {
//   const context = useContext(ZoomContext)

//   if (!context) {
//     throw new Error('useZoom must be used within a ZoomProvider')
//   }

//   return {
//     zoom: context.zoom,
//     index: context.index,
//     levels: [...context.levels],
//     setZoom: context.setZoom,
//     resetZoom: context.resetZoom,
//     increaseZoom: context.increaseZoom,
//     decreaseZoom: context.decreaseZoom,
//   }
// }

function zoomToIndex(zoom: number, levels: number[]): number {
  for (const [index, level] of levels.slice(0, -1).entries()) {
    if (zoom >= level && zoom <= levels[index + 1]!) {
      // fractional index between level and level + 1
      return index + (zoom - level) / (levels[index + 1]! - level)
    }
  }

  return levels.length - 1
}

/**
 * Find the next zoom level above the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
function increaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
  // find the next zoom level below the current zoom then add
  // one to get the index of the next zoom level above the current zoom
  const newIndex = Math.min(Math.floor(zc.index) + 1, zc.levels.length - 1)

  return { index: newIndex, zoom: zc.levels[newIndex]! }
}

/**
 * Find the next zoom level below the current zoom level and return its index and value.
 * The zoom levels are defined in the zoom channel and are expected to be in ascending order.
 *
 * @param zc
 * @returns
 */
function decreaseZoom(zc: IZoomChannel): { index: number; zoom: number } {
  // find the next zoom level below the current zoom then subtract one to get
  // the index of the next zoom level below the current zoom
  const newIndex = Math.max(Math.floor(zc.index) - 1, 0)

  return { index: newIndex, zoom: zc.levels[newIndex]! }
}
