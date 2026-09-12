'use client'

import { clamp } from '@/lib/math/clamp'
import { numSort } from '@/lib/math/math'
import { findNearest } from '@/lib/search'

import { useCallback, useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export const DEFAULT_ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 2, 3, 4]

interface IZoomContext {
  index: number
  //index: number
  levels: number[]
  setZoom: (zoom: number) => void
  setZoomLevel: (index: number) => void
  setZoomLevels: (levels: number[]) => void
  increaseZoom: () => void
  decreaseZoom: () => void
  resetZoom: () => void
}

interface IZoomChannel {
  id: string
  //zoom: number
  index: number
  levels: number[]
}

const STORAGE_KEY = 'zoom-channels:v8'

export const DEFAULT_ZOOM_CHANNEL_NAME = 'default'

export const DEFAULT_ZOOM_CHANNEL: IZoomChannel = {
  id: DEFAULT_ZOOM_CHANNEL_NAME,
  //zoom: 1,
  index: 3, // corresponds to 1x zoom in DEFAULT_ZOOM_SCALES
  levels: DEFAULT_ZOOM_LEVELS,
}

export interface IZoomStore {
  zooms: Record<string, IZoomChannel>
  //initializeZoom: (id: string, defaults?: IZoomChannel) => void
  setZoom: (id: string, value: number) => { index: number; zoom: number }
  setZoomLevel: (id: string, index: number) => void
  setZoomLevels: (id: string, levels: number[]) => void
  resetZoom: (id: string) => void
  increaseZoom: (id: string) => { index: number; zoom: number }
  decreaseZoom: (id: string) => { index: number; zoom: number }
  resetAll: () => void
}

export const DEFAULT_ZOOM = 1

export const useZoomStore = create<IZoomStore>()(
  persist(
    (set, get) => ({
      zooms: { [DEFAULT_ZOOM_CHANNEL_NAME]: { ...DEFAULT_ZOOM_CHANNEL } },

      setZoom: (id, value) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        const index = findZoomLevel(zc, value)

        if (index === zc.index) {
          return { zoom: zc.levels[zc.index], index: zc.index }
        }

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                index,
              },
            },
          }
        })

        return { zoom: zc.levels[index], index }
      },
      setZoomLevel: (id, index) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        index = clamp(index, { min: 0, max: zc.levels.length - 1 })

        if (index === zc.index) {
          return { zoom: zc.levels[zc.index], index: zc.index }
        }

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                index,
              },
            },
          }
        })

        return { zoom: zc.levels[index], index }
      },
      setZoomLevels: (id, levels) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        levels = numSort(levels)

        const index = clamp(zc.index, { min: 0, max: levels.length - 1 })

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: {
                ...zc,
                index,
                levels: numSort(levels),
              },
            },
          }
        })
      },
      increaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }

        const index = Math.min(zc.index + 1, zc.levels.length - 1)

        if (index === zc.index) {
          return { index: zc.index, zoom: zc.levels[zc.index] }
        }

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, index },
            },
          }
        })

        return { index, zoom: zc.levels[index] }
      },
      decreaseZoom: (id) => {
        const zc = get().zooms[id] ?? { ...DEFAULT_ZOOM_CHANNEL, id }
        const index = Math.max(zc.index - 1, 0)

        if (index === zc.index) {
          return { index: zc.index, zoom: zc.levels[zc.index] }
        }

        set((state) => {
          return {
            zooms: {
              ...state.zooms,
              [id]: { ...zc, index },
            },
          }
        })

        return { index, zoom: zc.levels[index] }
      },
      resetZoom: (channel) => {
        set((state) => {
          const zooms = { ...state.zooms }
          delete zooms[channel]

          return { zooms }
        })
      },
      resetAll: () =>
        set({
          zooms: {},
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
)

interface IZoomOpts {
  channel?: string
  defaultZoom?: IZoomChannel
  onChange?: ({ zoom }: { zoom: number }) => void
}

/**
 * A hook for accessing a zoom channel from a zoom store.
 * This is to allow for multiple independent zoom levels for different parts of the application.
 *
 * @param channel The zoom channel to access.
 * @returns An object containing the current zoom value and a function to set the zoom value for the specified channel.
 */
export function useZoom(opts: IZoomOpts = {}): IZoomContext & { zoom: number } {
  const {
    channel = DEFAULT_ZOOM_CHANNEL_NAME,
    defaultZoom = DEFAULT_ZOOM_CHANNEL,
    onChange,
  } = opts

  //const { settings } = useEdbSettings()

  const z = useZoomStore(
    useShallow(
      (state) => state.zooms[channel] ?? { ...defaultZoom, id: channel }
    )
  )

  const setZoom = useZoomStore((state) => state.setZoom)
  const setZoomLevel = useZoomStore((state) => state.setZoomLevel)
  const setZoomLevels = useZoomStore((state) => state.setZoomLevels)
  const resetZoom = useZoomStore((state) => state.resetZoom)
  const increaseZoom = useZoomStore((state) => state.increaseZoom)
  const decreaseZoom = useZoomStore((state) => state.decreaseZoom)

  const zoom = useMemo(() => z.levels[z.index], [z.index, z.levels])

  // useEffect(() => {
  //   initializeZoom(channel, { ...defaultZoom, id: channel })
  // }, [channel, defaultZoom, initializeZoom])

  const setChannelZoom = useCallback(
    (value: number) => {
      setZoom(channel, value)
    },
    [channel, setZoom]
  )

  const setChannelZoomLevel = useCallback(
    (index: number) => {
      setZoomLevel(channel, index)
    },
    [channel, setZoomLevel]
  )

  const setChannelZoomLevels = useCallback(
    (levels: number[]) => {
      setZoomLevels(channel, levels)
    },
    [channel, setZoomLevels]
  )

  const incrementChannelZoom = useCallback(() => {
    increaseZoom(channel)
  }, [channel, increaseZoom])

  const decrementChannelZoom = useCallback(() => {
    decreaseZoom(channel)
  }, [channel, decreaseZoom])

  const resetChannelZoom = useCallback(
    () => resetZoom(channel),
    [channel, resetZoom]
  )

  useEffect(() => {
    return useZoomStore.subscribe((state, previousState) => {
      const nextIndex = state.zooms[channel]?.index
      const previousIndex = previousState.zooms[channel]?.index

      if (nextIndex !== previousIndex && nextIndex !== undefined) {
        const zoom = state.zooms[channel]?.levels[nextIndex]
        onChange?.({ zoom })
      }
    })
  }, [channel, onChange])

  return {
    zoom,
    index: z.index,
    levels: z.levels,
    increaseZoom: incrementChannelZoom,
    decreaseZoom: decrementChannelZoom,
    setZoom: setChannelZoom,
    setZoomLevel: setChannelZoomLevel,
    setZoomLevels: setChannelZoomLevels,
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

// function zoomToIndex(zoom: number, levels: number[]): number {
//   for (const [index, level] of levels.slice(0, -1).entries()) {
//     if (zoom >= level && zoom <= levels[index + 1]!) {
//       // fractional index between level and level + 1
//       return index + (zoom - level) / (levels[index + 1]! - level)
//     }
//   }

//   return levels.length - 1
// }

function findZoomLevel(zc: IZoomChannel, zoom: number) {
  const { index } = findNearest(zoom, zc.levels)

  return index
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
  const newIndex = Math.min(zc.index + 1, zc.levels.length - 1)

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
  const newIndex = Math.max(zc.index - 1, 0)

  return { index: newIndex, zoom: zc.levels[newIndex]! }
}
